
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sql, poolPromise } = require('./db');
const {
    getServices,
    updateServices,
    getEducationModule,
    updateEducationModule,
    getEmploymentModule,
    updateEmploymentModule,
    getFacilitiesModule,
    updateFacilitiesModule,
    getBusinesses,
    getBusinessCategories,
    getBusinessBySlug,
    getBusinessById,
    createBusiness,
    updateBusiness,
    deleteBusiness,
    updateBusinessProducts,
    getBusinessTabs,
    getBusinessTabBySlug,
    getBusinessTabById,
    createBusinessTab,
    updateBusinessTab,
    deleteBusinessTab,
    reorderBusinessTabs
} = require('./db-helpers');
const { provisionStarterContent } = require('./starter-content');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
const ADMIN_REGISTRATION_SECRET = process.env.ADMIN_REGISTRATION_SECRET || 'admin-secret';
// Platform-level super-admin — manages the list of villages itself. Separate
// from per-village admins (Users table), which are scoped to one village.
const SUPER_ADMIN_USERNAME = process.env.SUPER_ADMIN_USERNAME || 'superadmin';
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD || 'superadmin';
const SUPER_ADMIN_TOKEN = 'super-admin-dummy-token';

const app = express();
const port = process.env.PORT || 5000;

// Render (and most PaaS hosts) terminate TLS at a proxy and forward plain
// HTTP internally — without this, req.protocol always reads 'http', so
// every uploaded file's URL (fileUrl() below) would be saved as http://
// even though the site is actually served over https.
app.set('trust proxy', 1);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Tenant resolution ───────────────────────────────────────────
// Every village site is one row in the Village table, identified by a
// unique `slug` (its subdomain, e.g. 'sayla' for sayla.panchayatsuvidha.in).
// In production the slug comes from the Host header's subdomain. Locally
// (no real subdomains) it falls back to an X-Village-Slug header or a
// ?village= query param, which the frontend sets from a dev village switcher.
const TENANT_EXEMPT_PREFIXES = ['/super-admin', '/uploads', '/villages'];

function extractSlugFromHost(hostname) {
    if (!hostname) return null;
    const parts = hostname.split('.');
    const isLocalHostLike = hostname === 'localhost' || hostname === '127.0.0.1' || parts[parts.length - 1] === 'localhost';
    if (isLocalHostLike) {
        // e.g. 'shayala.localhost' -> 'shayala'; plain 'localhost' -> none
        return parts.length > 1 ? parts[0] : null;
    }
    // e.g. 'shayala.panchayatsuvidha.in' -> 'shayala'; 'panchayatsuvidha.in' -> none
    return parts.length > 2 ? parts[0] : null;
}

async function resolveTenant(req, res, next) {
    if (TENANT_EXEMPT_PREFIXES.some(prefix => req.path.startsWith(prefix))) {
        return next();
    }

    try {
        const slug = req.get('X-Village-Slug') || req.query.village || extractSlugFromHost(req.hostname);

        if (!slug) {
            return res.status(400).json({ error: 'Village not specified. Provide a subdomain, X-Village-Slug header, or ?village= query param.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('slug', sql.NVarChar, slug)
            .query('SELECT * FROM Village WHERE slug = @slug AND is_active = 1');

        const village = result.recordset[0];
        if (!village) {
            return res.status(404).json({ error: `Village '${slug}' not found or inactive` });
        }

        req.village = village;
        next();
    } catch (err) {
        console.error('Tenant resolution failed:', err);
        res.status(500).json({ error: 'Failed to resolve village' });
    }
}

app.use(resolveTenant);

function requireSuperAdmin(req, res, next) {
    const authHeader = req.get('Authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    if (token !== SUPER_ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Super-admin authentication required' });
    }
    next();
}

// Verifies the JWT issued by /auth/login and attaches the decoded payload
// as req.user ({ id, username, role, villageId }).
function requireAuth(req, res, next) {
    const authHeader = req.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

// requireAuth + must be an admin of the exact village this request is
// scoped to (req.village, resolved by resolveTenant) — a valid token from
// village A can never write to village B, even by swapping the tenant header.
function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }
        if (req.user.villageId !== req.village.id) {
            return res.status(403).json({ message: 'This account does not administer this village' });
        }
        next();
    });
}

// Configure Multer for File Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        fs.ensureDirSync(uploadPath);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

function fileUrl(req, filename) {
    return `${req.protocol}://${req.get('host')}/uploads/${filename}`;
}

// ── Super-admin: manage the list of villages (platform level) ──────
app.post('/super-admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === SUPER_ADMIN_USERNAME && password === SUPER_ADMIN_PASSWORD) {
        return res.json({ token: SUPER_ADMIN_TOKEN });
    }
    res.status(401).json({ message: 'Invalid super-admin credentials' });
});

app.get('/super-admin/villages', requireSuperAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Village ORDER BY id DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Live slug-availability check for the "New Village" wizard
app.get('/super-admin/villages/check-slug/:slug', requireSuperAdmin, async (req, res) => {
    try {
        const slug = String(req.params.slug || '').toLowerCase();
        const valid = /^[a-z0-9-]{2,50}$/.test(slug);
        if (!valid) {
            return res.json({ available: false, reason: 'Slug must be 2-50 characters: lowercase letters, numbers, and hyphens only.' });
        }
        const pool = await poolPromise;
        const result = await pool.request()
            .input('slug', sql.NVarChar, slug)
            .query('SELECT id FROM Village WHERE slug = @slug');
        res.json({ available: result.recordset.length === 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const VALID_THEMES = ['classic', 'modern-minimal', 'heritage'];

app.post('/super-admin/villages', requireSuperAdmin, async (req, res) => {
    try {
        const { slug, name, taluka, district, state, area, total_households, description, theme } = req.body;
        if (!slug || !name) {
            return res.status(400).json({ error: 'slug and name are required' });
        }
        if (!/^[a-z0-9-]{2,50}$/.test(slug)) {
            return res.status(400).json({ error: 'Slug must be 2-50 characters: lowercase letters, numbers, and hyphens only.' });
        }
        const finalTheme = VALID_THEMES.includes(theme) ? theme : 'classic';

        const pool = await poolPromise;
        const result = await pool.request()
            .input('slug', sql.NVarChar, slug)
            .input('name', sql.NVarChar, name)
            .input('theme', sql.NVarChar, finalTheme)
            .input('taluka', sql.NVarChar, taluka ?? '')
            .input('district', sql.NVarChar, district ?? '')
            .input('state', sql.NVarChar, state ?? '')
            .input('area', sql.NVarChar, area ?? '')
            .input('households', sql.NVarChar, total_households ?? '')
            .input('desc', sql.NVarChar, description ?? '')
            .query(`
                INSERT INTO Village (slug, name, theme, taluka, district, state, area, total_households, description)
                VALUES (@slug, @name, @theme, @taluka, @district, @state, @area, @households, @desc);
                SELECT * FROM Village WHERE id = last_insert_rowid();
            `);

        const village = result.recordset[0];
        const { adminUsername, adminPassword } = await provisionStarterContent({ sql, poolPromise }, village.id);

        res.json({ ...village, adminUsername, adminPassword });
    } catch (err) {
        if (String(err.message).includes('UNIQUE')) {
            return res.status(409).json({ error: `Slug '${req.body.slug}' is already taken` });
        }
        res.status(500).json({ error: err.message });
    }
});

app.put('/super-admin/villages/:id', requireSuperAdmin, async (req, res) => {
    try {
        const { slug, name, is_active } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('slug', sql.NVarChar, slug)
            .input('name', sql.NVarChar, name)
            .input('is_active', sql.Int, is_active === undefined ? 1 : (is_active ? 1 : 0))
            .query('UPDATE Village SET slug = @slug, name = @name, is_active = @is_active WHERE id = @id');
        res.json({ message: 'Village updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Permanently deletes a village and all of its data (cascades via FK).
// Meant for cleaning up test/mistaken villages, not routine use.
app.delete('/super-admin/villages/:id', requireSuperAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Village WHERE id = @id');
        res.json({ message: 'Village deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /villages — public, minimal directory of active villages (slug/name/
// location only) so the login page can offer a village picker without
// requiring super-admin auth. Tenant-exempt: not scoped to req.village.
app.get('/villages', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query("SELECT slug, name, taluka, district, state FROM Village WHERE is_active = 1 ORDER BY name");
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Public APIs (tenant-scoped via req.village) ─────────────────
app.get('/village', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('vid', sql.Int, req.village.id)
            .query(`
                SELECT * FROM VillageImages WHERE village_id = @vid;
                SELECT * FROM Achievements WHERE village_id = @vid;
                SELECT * FROM SpecialPersonalities WHERE village_id = @vid;
            `);

        const orderedImages = (result.recordsets[0] || []).sort((a, b) => a.id - b.id);
        const images = orderedImages.map(img => img.image_url);
        const villageImages = orderedImages.map((img) => ({ id: img.id, url: img.image_url }));
        const achievements = result.recordsets[1];
        const special_persons = result.recordsets[2];

        res.json({
            ...req.village,
            images,
            villageImages,
            achievements,
            special_persons,
            history: {
                english: req.village.history_en,
                gujarati: req.village.history_gu
            }
        });
    } catch (err) {
        console.error('SQL Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/census', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('vid', sql.Int, req.village.id)
            .query('SELECT * FROM Census WHERE village_id = @vid');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/panchayat', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('vid', sql.Int, req.village.id)
            .query('SELECT * FROM PanchayatMembers WHERE village_id = @vid');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: add a new Panchayat member (max 3)
app.post('/panchayat/member/add', requireAdmin, async (req, res) => {
    try {
        const { role, name, email, mobile, address, description, photo_url } = req.body;
        if (!name || !role) return res.status(400).json({ error: 'name and role are required' });

        const pool = await poolPromise;
        const vid = req.village.id;

        // Enforce 3-member limit
        const countRes = await pool.request()
            .input('vid', sql.Int, vid)
            .query('SELECT COUNT(*) AS cnt FROM PanchayatMembers WHERE village_id = @vid');
        const count = countRes.recordset[0]?.cnt ?? 0;
        if (count >= 3) return res.status(400).json({ error: 'Maximum 3 members allowed' });

        const result = await pool.request()
            .input('village_id', sql.Int, vid)
            .input('role', sql.NVarChar, role ?? '')
            .input('name', sql.NVarChar, name ?? '')
            .input('email', sql.NVarChar, email ?? '')
            .input('mobile', sql.NVarChar, mobile ?? '')
            .input('address', sql.NVarChar, address ?? '')
            .input('desc', sql.NVarChar, description ?? '')
            .input('photo', sql.NVarChar, photo_url ?? '')
            .query(`
                INSERT INTO PanchayatMembers (village_id, role, name, email, mobile, address, description, photo_url)
                VALUES (@village_id, @role, @name, @email, @mobile, @address, @desc, @photo)
            `);

        res.json({ message: 'Member added', id: result.lastInsertRowid });
    } catch (err) {
        console.error('Add member error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: update a Panchayat member
app.post('/panchayat/member/update', requireAdmin, async (req, res) => {
    try {
        const {
            id,
            role,
            name,
            email,
            mobile,
            address,
            description,
            photo_url
        } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Missing member id' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('vid', sql.Int, req.village.id)
            .input('role', sql.NVarChar, role ?? '')
            .input('name', sql.NVarChar, name ?? '')
            .input('email', sql.NVarChar, email ?? '')
            .input('mobile', sql.NVarChar, mobile ?? '')
            .input('address', sql.NVarChar, address ?? '')
            .input('desc', sql.NVarChar, description ?? '')
            .input('photo', sql.NVarChar, photo_url ?? '')
            .query(`
                UPDATE PanchayatMembers SET
                    role = @role,
                    name = @name,
                    email = @email,
                    mobile = @mobile,
                    address = @address,
                    description = @desc,
                    photo_url = @photo
                WHERE id = @id AND village_id = @vid
            `);

        if (result.rowsAffected && result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Member not found' });
        }

        res.json({ message: 'Member updated successfully' });
    } catch (err) {
        console.error('Member update error:', err);
        res.status(500).json({ message: 'Member update failed', error: err.message });
    }
});

// Public APIs for Village Services (editable by Admin)
app.get('/services', async (req, res) => {
    try {
        const services = await getServices(req.village.id);
        res.json(services);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.json([]);
    }
});

// Admin API to update all services data
// Expected body: { services: [...] } (or just an array)
app.post('/services/update', requireAdmin, async (req, res) => {
    try {
        const incoming = req.body?.services ?? req.body;
        const services = Array.isArray(incoming) ? incoming : [];
        await updateServices(req.village.id, services);
        res.json({ message: 'Services updated successfully' });
    } catch (err) {
        console.error('Error updating services:', err);
        res.status(500).json({ error: 'Failed to update services' });
    }
});

app.get('/education/modules/:moduleId', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const moduleData = await getEducationModule(req.village.id, moduleId);
        if (!moduleData) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json(moduleData);
    } catch (err) {
        console.error('Error fetching education module:', err);
        res.status(500).json({ error: 'Failed to fetch module data' });
    }
});

app.post('/education/modules/:moduleId/update', requireAdmin, async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const data = req.body?.data ?? req.body;
        await updateEducationModule(req.village.id, moduleId, data);
        res.json({ message: 'Module updated successfully' });
    } catch (err) {
        console.error('Error updating education module:', err);
        res.status(500).json({ error: 'Failed to update module' });
    }
});

app.post('/education/modules/:moduleId/upload-photo', requireAdmin, upload.single('photo'), async (req, res) => {
    try {
        const moduleId = String(req.params?.moduleId ?? '');

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const recordId = String(req.body?.recordId ?? '');
        const photoUrl = fileUrl(req, req.file.filename);
        res.json({
            message: 'Photo uploaded successfully',
            moduleId,
            recordId,
            photo_url: photoUrl
        });
    } catch (err) {
        console.error('Education module photo upload failed:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/employment/modules/:moduleId', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const moduleData = await getEmploymentModule(req.village.id, moduleId);
        if (!moduleData) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json(moduleData);
    } catch (err) {
        console.error('Error fetching employment module:', err);
        res.status(500).json({ error: 'Failed to fetch module data' });
    }
});

app.post('/employment/modules/:moduleId/update', requireAdmin, async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const data = req.body?.data ?? req.body;
        await updateEmploymentModule(req.village.id, moduleId, data);
        res.json({ message: 'Module updated successfully' });
    } catch (err) {
        console.error('Error updating employment module:', err);
        res.status(500).json({ error: 'Failed to update module' });
    }
});

app.post('/employment/modules/:moduleId/upload-file', requireAdmin, upload.single('file'), async (req, res) => {
    try {
        const moduleId = String(req.params?.moduleId ?? '');
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileLink = fileUrl(req, req.file.filename);
        res.json({
            message: 'File uploaded successfully',
            moduleId,
            file_url: fileLink
        });
    } catch (err) {
        console.error('Employment module file upload failed:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/facilities/modules/:moduleId', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const moduleData = await getFacilitiesModule(req.village.id, moduleId);
        if (!moduleData) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json(moduleData);
    } catch (err) {
        console.error('Error fetching facilities module:', err);
        res.status(500).json({ error: 'Failed to fetch module data' });
    }
});

app.post('/facilities/modules/:moduleId/update', requireAdmin, async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const data = req.body?.data ?? req.body;
        await updateFacilitiesModule(req.village.id, moduleId, data);
        res.json({ message: 'Module updated successfully' });
    } catch (err) {
        console.error('Error updating facilities module:', err);
        res.status(500).json({ error: 'Failed to update module' });
    }
});

// Public API: Primary School details page data (redirects to module endpoint)
app.get('/education/primary-school', async (req, res) => {
    try {
        const moduleData = await getEducationModule(req.village.id, 'primary-school');
        if (!moduleData) {
            return res.status(404).json({ error: 'Primary school data not found' });
        }
        // Transform to match old format (records -> staff)
        res.json({
            basicInfo: moduleData.basicInfo,
            staff: moduleData.records,
            announcements: moduleData.announcements,
            map: moduleData.map
        });
    } catch (err) {
        console.error('Error fetching primary school data:', err);
        res.status(500).json({ error: 'Failed to fetch primary school data' });
    }
});

// Admin API: Update all Primary School details
app.post('/education/primary-school/update', requireAdmin, async (req, res) => {
    try {
        const data = req.body?.data ?? req.body;
        // Transform staff -> records for storage
        const moduleData = {
            basicInfo: data.basicInfo,
            records: data.staff || data.records,
            announcements: data.announcements,
            map: data.map
        };
        await updateEducationModule(req.village.id, 'primary-school', moduleData);
        res.json({ message: 'Primary school details updated successfully' });
    } catch (err) {
        console.error('Primary school update failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin API: Upload teacher photo for Primary School page
app.post('/education/primary-school/upload-photo', requireAdmin, upload.single('photo'), async (req, res) => {
    try {
        const teacherId = String(req.body?.teacherId ?? '');
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const photoUrl = fileUrl(req, req.file.filename);
        res.json({
            message: 'Teacher photo uploaded successfully',
            teacherId,
            photo_url: photoUrl
        });
    } catch (err) {
        console.error('Primary school teacher photo upload failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin APIs
app.post('/village/update', requireAdmin, async (req, res) => {
    try {
        const { name, taluka, district, state, area, total_households, description, history_en, history_gu, theme } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('vid', sql.Int, req.village.id)
            .input('name', sql.NVarChar, name)
            .input('taluka', sql.NVarChar, taluka)
            .input('district', sql.NVarChar, district)
            .input('state', sql.NVarChar, state)
            .input('area', sql.NVarChar, area)
            .input('households', sql.NVarChar, total_households)
            .input('desc', sql.NVarChar, description)
            .input('hen', sql.NVarChar, history_en)
            .input('hgu', sql.NVarChar, history_gu)
            .input('theme', sql.NVarChar, VALID_THEMES.includes(theme) ? theme : req.village.theme)
            .query(`
                UPDATE Village SET
                name = @name, taluka = @taluka, district = @district, state = @state,
                area = @area, total_households = @households, description = @desc,
                history_en = @hen, history_gu = @hgu, theme = @theme
                WHERE id = @vid
            `);
        res.json({ message: 'Village updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/village/upload-image', requireAdmin, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imageUrl = fileUrl(req, req.file.filename);
        const pool = await poolPromise;

        // Add to VillageImages table
        await pool.request()
            .input('vId', sql.Int, req.village.id)
            .input('url', sql.NVarChar, imageUrl)
            .query('INSERT INTO VillageImages (village_id, image_url) VALUES (@vId, @url)');

        res.json({ message: 'Image uploaded successfully', imageUrl });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/panchayat/member/upload-photo', requireAdmin, upload.single('photo'), async (req, res) => {
    try {
        const memberId = parseInt(req.body.memberId, 10);

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        if (Number.isNaN(memberId)) {
            return res.status(400).json({ message: 'Invalid member ID' });
        }

        const photoUrl = fileUrl(req, req.file.filename);
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, memberId)
            .input('vid', sql.Int, req.village.id)
            .input('photo', sql.NVarChar, photoUrl)
            .query('UPDATE PanchayatMembers SET photo_url = @photo WHERE id = @id AND village_id = @vid');

        if (result.rowsAffected && result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Member not found for photo update' });
        }

        res.json({ message: 'Member photo uploaded', photo_url: photoUrl });
    } catch (err) {
        console.error('Member photo upload error:', err);
        res.status(500).json({ message: 'Member photo upload failed', error: err.message });
    }
});

app.delete('/village/image/:id', requireAdmin, async (req, res) => {
    try {
        const imageId = parseInt(req.params.id, 10);
        if (Number.isNaN(imageId)) {
            return res.status(400).json({ error: 'Invalid image ID' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, imageId)
            .input('vid', sql.Int, req.village.id)
            .query('SELECT image_url FROM VillageImages WHERE id = @id AND village_id = @vid');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const imageUrl = result.recordset[0].image_url;
        const fileName = path.basename(imageUrl);
        const filePath = path.join(__dirname, 'uploads', fileName);

        // Delete from DB
        await pool.request()
            .input('id', sql.Int, imageId)
            .input('vid', sql.Int, req.village.id)
            .query('DELETE FROM VillageImages WHERE id = @id AND village_id = @vid');

        // Delete local file if exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: 'Image deleted successfully' });
    } catch (err) {
        console.error('Image delete error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: add a village achievement
app.post('/achievements/add', requireAdmin, async (req, res) => {
    try {
        const { title, awarded_by } = req.body;
        if (!title) return res.status(400).json({ error: 'title is required' });
        const pool = await poolPromise;
        await pool.request()
            .input('vid', sql.Int, req.village.id)
            .input('title', sql.NVarChar, title)
            .input('awarded', sql.NVarChar, awarded_by ?? '')
            .query('INSERT INTO Achievements (village_id, title, awarded_by) VALUES (@vid, @title, @awarded)');
        res.json({ message: 'Achievement added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/achievements/:id', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('vid', sql.Int, req.village.id)
            .query('DELETE FROM Achievements WHERE id = @id AND village_id = @vid');
        res.json({ message: 'Achievement deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: add a special personality
app.post('/special-persons/add', requireAdmin, async (req, res) => {
    try {
        const { name, achievement, role } = req.body;
        if (!name) return res.status(400).json({ error: 'name is required' });
        const pool = await poolPromise;
        await pool.request()
            .input('vid', sql.Int, req.village.id)
            .input('name', sql.NVarChar, name)
            .input('ach', sql.NVarChar, achievement ?? '')
            .input('role', sql.NVarChar, role ?? '')
            .query('INSERT INTO SpecialPersonalities (village_id, name, achievement, role) VALUES (@vid, @name, @ach, @role)');
        res.json({ message: 'Special personality added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/special-persons/:id', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('vid', sql.Int, req.village.id)
            .query('DELETE FROM SpecialPersonalities WHERE id = @id AND village_id = @vid');
        res.json({ message: 'Special personality deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/census/add', requireAdmin, async (req, res) => {
    try {
        const { category, total, male, female } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('vid', sql.Int, req.village.id)
            .input('cat', sql.NVarChar, category)
            .input('total', sql.Int, total)
            .input('male', sql.Int, male)
            .input('female', sql.Int, female)
            .query('INSERT INTO Census (village_id, category, total, male, female) VALUES (@vid, @cat, @total, @male, @female)');
        res.json({ message: 'Census added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: update census record
app.post('/census/update', requireAdmin, async (req, res) => {
    try {
        const { id, category, total, male, female } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Missing census id' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
            .input('vid', sql.Int, req.village.id)
            .input('cat', sql.NVarChar, category ?? '')
            .input('total', sql.Int, total)
            .input('male', sql.Int, male)
            .input('female', sql.Int, female)
            .query(`
                UPDATE Census SET
                    category = @cat,
                    total = @total,
                    male = @male,
                    female = @female
                WHERE id = @id AND village_id = @vid
            `);

        res.json({ message: 'Census updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/census/:id', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('vid', sql.Int, req.village.id)
            .query('DELETE FROM Census WHERE id = @id AND village_id = @vid');
        res.json({ message: 'Census deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/auth/register', async (req, res) => {
    try {
        const { username, password, email, role = 'user', adminSecret } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters.' });
        }

        let finalRole = 'user';
        if (role === 'admin') {
            if (adminSecret !== ADMIN_REGISTRATION_SECRET) {
                return res.status(403).json({ message: 'Invalid admin registration secret.' });
            }
            finalRole = 'admin';
        }

        const pool = await poolPromise;
        const vid = req.village.id;
        const existing = await pool.request()
            .input('vid', sql.Int, vid)
            .input('username', sql.NVarChar, username)
            .query('SELECT id FROM Users WHERE village_id = @vid AND username = @username');

        if (existing.recordset.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        await pool.request()
            .input('vid', sql.Int, vid)
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, passwordHash)
            .input('email', sql.NVarChar, email || null)
            .input('role', sql.NVarChar, finalRole)
            .query('INSERT INTO Users (village_id, username, password, email, role) VALUES (@vid, @username, @password, @email, @role)');

        res.json({ message: `${finalRole === 'admin' ? 'Admin' : 'User'} registered successfully` });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        const pool = await poolPromise;
        const vid = req.village.id;

        const result = await pool.request()
            .input('vid', sql.Int, vid)
            .input('username', sql.NVarChar, username)
            .query('SELECT id, username, password, role FROM Users WHERE village_id = @vid AND username = @username');

        const user = result.recordset[0];
        if (!user) {
            return res.status(401).json({ message: 'User not found. Please register first.' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        // The requested login tab can only restrict, never grant — the DB's
        // stored role is always the source of truth for what a token allows.
        if (role === 'admin' && user.role !== 'admin') {
            return res.status(403).json({ message: 'This account does not have admin access.' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, villageId: vid },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, role: user.role, user: { id: user.id, username: user.username } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});

// ── Page Builder APIs ──────────────────────────────────────────
app.get('/pages', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('vid', sql.Int, req.village.id)
            .query('SELECT id, title, slug, status, created_at FROM Pages WHERE village_id = @vid ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/pages/:slug', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('vid', sql.Int, req.village.id)
            .input('slug', sql.NVarChar, req.params.slug)
            .query('SELECT * FROM Pages WHERE village_id = @vid AND slug = @slug');
        if (!result.recordset[0]) return res.status(404).json({ error: 'Page not found' });
        const page = result.recordset[0];
        page.content_json = page.content_json ? JSON.parse(page.content_json) : [];
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/pages', requireAdmin, async (req, res) => {
    const { title, slug, content_json, status } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'title and slug required' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('vid', sql.Int, req.village.id)
            .input('title', sql.NVarChar, title)
            .input('slug', sql.NVarChar, slug)
            .input('content_json', sql.NVarChar, JSON.stringify(content_json || []))
            .input('status', sql.NVarChar, status || 'draft')
            .query(`
                INSERT INTO Pages (village_id, title, slug, content_json, status) VALUES (@vid, @title, @slug, @content_json, @status);
                SELECT * FROM Pages WHERE id = last_insert_rowid();
            `);
        const page = result.recordset[0];
        page.content_json = JSON.parse(page.content_json);
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/pages/:id', requireAdmin, async (req, res) => {
    const { title, slug, content_json, status } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('vid', sql.Int, req.village.id)
            .input('title', sql.NVarChar, title)
            .input('slug', sql.NVarChar, slug)
            .input('content_json', sql.NVarChar, JSON.stringify(content_json || []))
            .input('status', sql.NVarChar, status || 'draft')
            .query('UPDATE Pages SET title=@title, slug=@slug, content_json=@content_json, status=@status WHERE id=@id AND village_id=@vid');
        res.json({ message: 'Page updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/pages/:id', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('vid', sql.Int, req.village.id)
            .query('DELETE FROM Pages WHERE id=@id AND village_id=@vid');
        res.json({ message: 'Page deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Navigation (menu / submenu) APIs ────────────────────────────
// GET /navigation — public, returns the nested menu tree for the Navbar
app.get('/navigation', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('vid', sql.Int, req.village.id)
            .query('SELECT * FROM NavigationItems WHERE village_id = @vid ORDER BY display_order');

        const rows = result.recordset;
        const byId = new Map(rows.map(r => [r.id, { ...r, children: [] }]));
        const tree = [];
        for (const row of rows) {
            const node = byId.get(row.id);
            if (row.parent_id && byId.has(row.parent_id)) {
                byId.get(row.parent_id).children.push(node);
            } else {
                tree.push(node);
            }
        }
        res.json(tree);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /navigation — replace the entire menu tree for this village (admin only)
// Body: { items: [ { label_en, label_gu, link_type, link_value, icon_url, children: [...] } ] }
app.put('/navigation', requireAdmin, async (req, res) => {
    const items = req.body?.items;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

    try {
        const pool = await poolPromise;
        const vid = req.village.id;

        await pool.request().input('vid', sql.Int, vid).query('DELETE FROM NavigationItems WHERE village_id = @vid');

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const result = await pool.request()
                .input('vid', sql.Int, vid)
                .input('label_en', sql.NVarChar, item.label_en || '')
                .input('label_gu', sql.NVarChar, item.label_gu || '')
                .input('link_type', sql.NVarChar, item.link_type || 'page')
                .input('link_value', sql.NVarChar, item.link_value || '')
                .input('icon_url', sql.NVarChar, item.icon_url || '')
                .input('display_order', sql.Int, i)
                .query(`
                    INSERT INTO NavigationItems (village_id, label_en, label_gu, link_type, link_value, icon_url, display_order)
                    VALUES (@vid, @label_en, @label_gu, @link_type, @link_value, @icon_url, @display_order)
                `);
            const parentId = result.lastInsertRowid;

            const children = Array.isArray(item.children) ? item.children : [];
            for (let j = 0; j < children.length; j++) {
                const child = children[j];
                await pool.request()
                    .input('vid', sql.Int, vid)
                    .input('parent_id', sql.Int, parentId)
                    .input('label_en', sql.NVarChar, child.label_en || '')
                    .input('label_gu', sql.NVarChar, child.label_gu || '')
                    .input('link_type', sql.NVarChar, child.link_type || 'page')
                    .input('link_value', sql.NVarChar, child.link_value || '')
                    .input('icon_url', sql.NVarChar, child.icon_url || '')
                    .input('display_order', sql.Int, j)
                    .query(`
                        INSERT INTO NavigationItems (village_id, parent_id, label_en, label_gu, link_type, link_value, icon_url, display_order)
                        VALUES (@vid, @parent_id, @label_en, @label_gu, @link_type, @link_value, @icon_url, @display_order)
                    `);
            }
        }

        res.json({ message: 'Navigation saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /navigation/upload-icon — upload a small icon/image for a nav item
app.post('/navigation/upload-icon', requireAdmin, upload.single('icon'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ icon_url: fileUrl(req, req.file.filename) });
});

// ═══════════════════════════════════════════════════════════════════════════════
// BUSINESS DIRECTORY ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /business — public, searchable/filterable listing (published only)
app.get('/business', async (req, res) => {
    try {
        const { q, category } = req.query;
        const businesses = await getBusinesses(req.village.id, { q, category });
        res.json(businesses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /business/categories — public, distinct categories for the filter dropdown
app.get('/business/categories', async (req, res) => {
    try {
        const categories = await getBusinessCategories(req.village.id);
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /business/admin — admin, includes unpublished listings
app.get('/business/admin', requireAdmin, async (req, res) => {
    try {
        const businesses = await getBusinesses(req.village.id, { includeUnpublished: true });
        res.json(businesses);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /business/admin/:id — admin, fetch one by id (including unpublished + products) for editing
app.get('/business/admin/:id', requireAdmin, async (req, res) => {
    try {
        const business = await getBusinessById(req.village.id, req.params.id);
        if (!business) return res.status(404).json({ error: 'Business not found' });
        res.json(business);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /business/:slug — public detail page (published only)
app.get('/business/:slug', async (req, res) => {
    try {
        const business = await getBusinessBySlug(req.village.id, req.params.slug);
        if (!business) return res.status(404).json({ error: 'Business not found' });
        res.json(business);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /business — admin, create a listing
app.post('/business', requireAdmin, async (req, res) => {
    try {
        if (!req.body.name) return res.status(400).json({ error: 'Business name is required' });
        const business = await createBusiness(req.village.id, req.body);
        res.json(business);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /business/:id — admin, update a listing
app.put('/business/:id', requireAdmin, async (req, res) => {
    try {
        await updateBusiness(req.village.id, req.params.id, req.body);
        res.json({ message: 'Business updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /business/:id — admin, delete a listing (cascades products)
app.delete('/business/:id', requireAdmin, async (req, res) => {
    try {
        await deleteBusiness(req.village.id, req.params.id);
        res.json({ message: 'Business deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /business/:id/products — admin, replace the whole product/portfolio list
app.put('/business/:id/products', requireAdmin, async (req, res) => {
    try {
        const products = Array.isArray(req.body?.products) ? req.body.products : [];
        await updateBusinessProducts(req.village.id, req.params.id, products);
        res.json({ message: 'Products updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Business Tabs (custom, Page-Builder-style pages on a business profile) ──
// GET /business/:slug/tabs — public, list of tabs (id/title/slug) for a published business
app.get('/business/:slug/tabs', async (req, res) => {
    try {
        const business = await getBusinessBySlug(req.village.id, req.params.slug);
        if (!business) return res.status(404).json({ error: 'Business not found' });
        res.json(business.tabs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /business/:slug/tabs/:tabSlug — public, one tab's block content
app.get('/business/:slug/tabs/:tabSlug', async (req, res) => {
    try {
        const business = await getBusinessBySlug(req.village.id, req.params.slug);
        if (!business) return res.status(404).json({ error: 'Business not found' });
        const tab = await getBusinessTabBySlug(req.village.id, business.id, req.params.tabSlug);
        if (!tab) return res.status(404).json({ error: 'Tab not found' });
        res.json(tab);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /business/admin/:id/tabs — admin, list tabs for editing
app.get('/business/admin/:id/tabs', requireAdmin, async (req, res) => {
    try {
        const tabs = await getBusinessTabs(req.village.id, req.params.id);
        res.json(tabs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /business/admin/:id/tabs/:tabId — admin, fetch one tab's blocks for editing
app.get('/business/admin/:id/tabs/:tabId', requireAdmin, async (req, res) => {
    try {
        const tab = await getBusinessTabById(req.village.id, req.params.id, req.params.tabId);
        if (!tab) return res.status(404).json({ error: 'Tab not found' });
        res.json(tab);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /business/admin/:id/tabs — admin, create a new tab
app.post('/business/admin/:id/tabs', requireAdmin, async (req, res) => {
    try {
        if (!req.body?.title) return res.status(400).json({ error: 'Tab title is required' });
        const tab = await createBusinessTab(req.village.id, req.params.id, req.body);
        res.json(tab);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /business/admin/:id/tabs/:tabId — admin, update a tab's title/blocks
app.put('/business/admin/:id/tabs/:tabId', requireAdmin, async (req, res) => {
    try {
        await updateBusinessTab(req.village.id, req.params.id, req.params.tabId, req.body);
        res.json({ message: 'Tab updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /business/admin/:id/tabs/:tabId — admin, delete a tab
app.delete('/business/admin/:id/tabs/:tabId', requireAdmin, async (req, res) => {
    try {
        await deleteBusinessTab(req.village.id, req.params.id, req.params.tabId);
        res.json({ message: 'Tab deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /business/admin/:id/tabs-order — admin, reorder tabs
app.put('/business/admin/:id/tabs-order', requireAdmin, async (req, res) => {
    try {
        const orderedIds = Array.isArray(req.body?.orderedIds) ? req.body.orderedIds : [];
        await reorderBusinessTabs(req.village.id, req.params.id, orderedIds);
        res.json({ message: 'Tab order saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Image uploads for business logo / cover / product photos
app.post('/business/upload-logo', requireAdmin, upload.single('logo'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: fileUrl(req, req.file.filename) });
});
app.post('/business/upload-cover', requireAdmin, upload.single('cover'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: fileUrl(req, req.file.filename) });
});
app.post('/business/upload-product-image', requireAdmin, upload.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({ url: fileUrl(req, req.file.filename) });
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /contact/info — get contact details
app.get('/contact/info', async (req, res) => {
    try {
        const contactPath = path.join(__dirname, 'uploads', `contact-info-${req.village.id}.json`);
        const contactData = await fs.readJson(contactPath).catch(() => ({
            phone: '+91 12345 67890',
            email: 'support@panchayatsuvidha.in',
            address: `Panchayat Office, ${req.village.name}`,
            hours: '9:00 AM - 6:00 PM, Monday - Saturday'
        }));
        res.json(contactData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /contact/info — update contact details (admin only)
app.put('/contact/info', requireAdmin, async (req, res) => {
    try {
        const { phone, email, address, hours } = req.body;
        const contactData = { phone, email, address, hours };
        const contactPath = path.join(__dirname, 'uploads', `contact-info-${req.village.id}.json`);
        await fs.writeJson(contactPath, contactData, { spaces: 2 });
        res.json({ message: 'Contact info updated', data: contactData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /contact/message — submit a contact message
app.post('/contact/message', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: 'Name, email, and message are required' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('vid', sql.Int, req.village.id)
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('message', sql.NVarChar, message)
            .query(`
                INSERT INTO ContactMessages (village_id, name, email, message, created_at)
                VALUES (@vid, @name, @email, @message, CURRENT_TIMESTAMP)
            `);

        res.json({ message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /contact/messages — get all contact messages (admin only)
app.get('/contact/messages', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('vid', sql.Int, req.village.id)
            .query(`
                SELECT id, name, email, message, created_at, is_read
                FROM ContactMessages
                WHERE village_id = @vid
                ORDER BY created_at DESC
            `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /contact/messages/:id/read — mark message as read (admin only)
app.put('/contact/messages/:id/read', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('vid', sql.Int, req.village.id)
            .query('UPDATE ContactMessages SET is_read = 1 WHERE id = @id AND village_id = @vid');
        res.json({ message: 'Message marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /contact/messages/:id — delete a message (admin only)
app.delete('/contact/messages/:id', requireAdmin, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('vid', sql.Int, req.village.id)
            .query('DELETE FROM ContactMessages WHERE id = @id AND village_id = @vid');
        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

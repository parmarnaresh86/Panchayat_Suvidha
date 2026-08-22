
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { sql, poolPromise } = require('./db');
const {
    getServices,
    updateServices,
    getEducationModule,
    updateEducationModule,
    getEmploymentModule,
    updateEmploymentModule,
    getFacilitiesModule,
    updateFacilitiesModule
} = require('./db-helpers');

dotenv.config({ path: path.resolve(__dirname, '.env') });

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password';
const ADMIN_REGISTRATION_SECRET = process.env.ADMIN_REGISTRATION_SECRET || 'admin-secret';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure Users table exists for user registration/login
const initializeDatabase = async () => {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
            CREATE TABLE Users (
                id INT PRIMARY KEY IDENTITY(1,1),
                username NVARCHAR(255) UNIQUE NOT NULL,
                password NVARCHAR(255) NOT NULL,
                email NVARCHAR(255),
                role NVARCHAR(50) NOT NULL DEFAULT 'user'
            );
        `);
        console.log('Users table ready');
    } catch (err) {
        console.error('Failed to initialize Users table:', err);
    }
};
initializeDatabase();

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

// Fallback dummy data
const villageData = {
    id: 1,
    name: 'sayla',
    taluka: 'Sayla',
    district: 'Surendranagar',
    state: 'Gujarat',
    area: '658',
    total_households: '165',
    description: 'A historical and progressive village located in the Surendranagar district of Gujarat. Known for its rich heritage and community spirit.',
    images: [
        '/images/Loc_Sayla_1567329861.jpg',
        '/images/sayla-gujarat-1.jpg',
        '/images/Stepwell-Dhandhalpar-sayla.jpg'
    ],
    history: {
        english: 'Sayla was historically a princely state in the Kathiawar region. It has a long history of traditional craftsmanship and agriculture. The village is known for its beautiful temples and ancient architecture.',
        gujarati: 'સાયલા ઐતિહાસિક રીતે કાઠિયાવાડ વિસ્તારમાં એક રજવાડું હતું. તે પરંપરાગત હસ્તકલા અને ખેતીનો લાંબો ઇતિહાસ ધરાવે છે. ગામ તેના સુંદર મંદિરો અને પ્રાચીન સ્થાપત્ય માટે જાણીતું છે.'
    },
    special_persons: [
        { name: 'Dr. Vikram Sarabhai (Sample)', achievement: 'Progressive Farmer', role: 'Community Leader' },
        { name: 'Smt. Anuben Thakkar (Sample)', achievement: 'Social Worker', role: 'Educationist' }
    ],
    achievements: [
        { title: 'Best Clean Village 2024', awarded_by: 'Gujarat Government' },
        { title: 'Digital Village Award', awarded_by: 'District Panchayat' }
    ]
};

const censusData = [
    { id: 1, village_id: 1, category: 'Total Population', total: 10000, male: 5200, female: 4800 },
    { id: 4, village_id: 1, category: 'Literates', total: 7000, male: 4000, female: 3000 },
    { id: 5, village_id: 1, category: 'Illiterates', total: 3000, male: 1200, female: 1800 },
    { id: 6, village_id: 1, category: 'Workers', total: 4000, male: 3000, female: 1000 },
    { id: 7, village_id: 1, category: 'Non-workers', total: 6000, male: 2200, female: 3800 },
];

const panchayatMembers = [
    {
        id: 1,
        village_id: 1,
        role: 'Sarpanch',
        name: 'John Doe',
        email: 'sarpanch@example.com',
        mobile: '1234567890',
        address: '123, Village Main Road',
        description: 'Elected Sarpanch of the village.',
        photo_url: ''
    },
    {
        id: 2,
        village_id: 1,
        role: 'Secretary',
        name: 'Jane Smith',
        email: 'secretary@example.com',
        mobile: '0987654321',
        address: '456, Panchayat Office',
        description: 'Appointed Secretary of the Panchayat.',
        photo_url: ''
    }
];

// Public APIs
app.get('/village', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                SELECT TOP 1 * FROM Village;
                SELECT * FROM VillageImages WHERE village_id = (SELECT TOP 1 id FROM Village);
                SELECT * FROM Achievements WHERE village_id = (SELECT TOP 1 id FROM Village);
                SELECT * FROM SpecialPersonalities WHERE village_id = (SELECT TOP 1 id FROM Village);
            `);
        
        const village = result.recordsets[0][0];
        if (!village) {
            // Fallback to dummy data if DB is empty
            return res.json(villageData);
        }

        const orderedImages = (result.recordsets[1] || []).sort((a, b) => a.id - b.id);
        const images = orderedImages.map(img => img.image_url);
        const villageImages = orderedImages.map((img) => ({ id: img.id, url: img.image_url }));
        const achievements = result.recordsets[2];
        const special_persons = result.recordsets[3];

        res.json({
            ...village,
            images,
            villageImages,
            achievements,
            special_persons,
            history: {
                english: village.history_en,
                gujarati: village.history_gu
            }
        });
    } catch (err) {
        console.error('SQL Error:', err);
        res.json(villageData); // Fallback on error
    }
});

app.get('/census', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM Census WHERE village_id = (SELECT TOP 1 id FROM Village)');
        
        if (result.recordset.length === 0) {
            return res.json(censusData);
        }
        res.json(result.recordset);
    } catch (err) {
        res.json(censusData);
    }
});

app.get('/panchayat', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query('SELECT * FROM PanchayatMembers WHERE village_id = (SELECT TOP 1 id FROM Village)');
        
        if (result.recordset.length === 0) {
            return res.json(panchayatMembers);
        }
        res.json(result.recordset);
    } catch (err) {
        res.json(panchayatMembers);
    }
});

// Admin: add a new Panchayat member (max 3)
app.post('/panchayat/member/add', async (req, res) => {
    try {
        const { role, name, email, mobile, address, description, photo_url } = req.body;
        if (!name || !role) return res.status(400).json({ error: 'name and role are required' });

        const pool = await poolPromise;

        // Enforce 3-member limit
        const countRes = await pool.request()
            .query('SELECT COUNT(*) AS cnt FROM PanchayatMembers WHERE village_id = (SELECT TOP 1 id FROM Village)');
        const count = countRes.recordset[0]?.cnt ?? 0;
        if (count >= 3) return res.status(400).json({ error: 'Maximum 3 members allowed' });

        const result = await pool.request()
            .input('village_id', sql.Int, 1)
            .input('role', sql.NVarChar, role ?? '')
            .input('name', sql.NVarChar, name ?? '')
            .input('email', sql.NVarChar, email ?? '')
            .input('mobile', sql.NVarChar, mobile ?? '')
            .input('address', sql.NVarChar, address ?? '')
            .input('desc', sql.NVarChar, description ?? '')
            .input('photo', sql.NVarChar, photo_url ?? '')
            .query(`
                INSERT INTO PanchayatMembers (village_id, role, name, email, mobile, address, description, photo_url)
                OUTPUT INSERTED.id
                VALUES ((SELECT TOP 1 id FROM Village), @role, @name, @email, @mobile, @address, @desc, @photo)
            `);

        res.json({ message: 'Member added', id: result.recordset[0]?.id });
    } catch (err) {
        console.error('Add member error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin: update a Panchayat member
app.post('/panchayat/member/update', async (req, res) => {
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

        console.log('Update member request:', { id, role, name, email, mobile, address, photo_url });

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, id)
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
                WHERE id = @id
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
        const services = await getServices();
        res.json(services);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.json([]);
    }
});

// Admin API to update all services data
// Expected body: { services: [...] } (or just an array)
app.post('/services/update', async (req, res) => {
    try {
        const incoming = req.body?.services ?? req.body;
        const services = Array.isArray(incoming) ? incoming : [];
        await updateServices(services);
        res.json({ message: 'Services updated successfully' });
    } catch (err) {
        console.error('Error updating services:', err);
        res.status(500).json({ error: 'Failed to update services' });
    }
});

app.get('/education/modules/:moduleId', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const moduleData = await getEducationModule(moduleId);
        if (!moduleData) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json(moduleData);
    } catch (err) {
        console.error('Error fetching education module:', err);
        res.status(500).json({ error: 'Failed to fetch module data' });
    }
});

app.post('/education/modules/:moduleId/update', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const data = req.body?.data ?? req.body;
        await updateEducationModule(moduleId, data);
        res.json({ message: 'Module updated successfully' });
    } catch (err) {
        console.error('Error updating education module:', err);
        res.status(500).json({ error: 'Failed to update module' });
    }
});

app.post('/education/modules/:moduleId/upload-photo', upload.single('photo'), async (req, res) => {
    try {
        const moduleId = toSafeString(req.params?.moduleId);
        if (!EDUCATION_MODULE_IDS.includes(moduleId)) {
            return res.status(404).json({ error: 'Education module not found' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const recordId = toSafeString(req.body?.recordId);
        const photoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
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
        const moduleData = await getEmploymentModule(moduleId);
        if (!moduleData) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json(moduleData);
    } catch (err) {
        console.error('Error fetching employment module:', err);
        res.status(500).json({ error: 'Failed to fetch module data' });
    }
});

app.post('/employment/modules/:moduleId/update', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const data = req.body?.data ?? req.body;
        await updateEmploymentModule(moduleId, data);
        res.json({ message: 'Module updated successfully' });
    } catch (err) {
        console.error('Error updating employment module:', err);
        res.status(500).json({ error: 'Failed to update module' });
    }
});

app.post('/employment/modules/:moduleId/upload-file', upload.single('file'), async (req, res) => {
    try {
        const moduleId = toSafeString(req.params?.moduleId);
        if (!EMPLOYMENT_MODULE_IDS.includes(moduleId)) {
            return res.status(404).json({ error: 'Employment module not found' });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        res.json({
            message: 'File uploaded successfully',
            moduleId,
            file_url: fileUrl
        });
    } catch (err) {
        console.error('Employment module file upload failed:', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/facilities/modules/:moduleId', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const moduleData = await getFacilitiesModule(moduleId);
        if (!moduleData) {
            return res.status(404).json({ error: 'Module not found' });
        }
        res.json(moduleData);
    } catch (err) {
        console.error('Error fetching facilities module:', err);
        res.status(500).json({ error: 'Failed to fetch module data' });
    }
});

app.post('/facilities/modules/:moduleId/update', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const data = req.body?.data ?? req.body;
        await updateFacilitiesModule(moduleId, data);
        res.json({ message: 'Module updated successfully' });
    } catch (err) {
        console.error('Error updating facilities module:', err);
        res.status(500).json({ error: 'Failed to update module' });
    }
});

// Public API: Primary School details page data (redirects to module endpoint)
app.get('/education/primary-school', async (req, res) => {
    try {
        const moduleData = await getEducationModule('primary-school');
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
app.post('/education/primary-school/update', async (req, res) => {
    try {
        const data = req.body?.data ?? req.body;
        // Transform staff -> records for storage
        const moduleData = {
            basicInfo: data.basicInfo,
            records: data.staff || data.records,
            announcements: data.announcements,
            map: data.map
        };
        await updateEducationModule('primary-school', moduleData);
        res.json({ message: 'Primary school details updated successfully' });
    } catch (err) {
        console.error('Primary school update failed:', err);
        res.status(500).json({ error: err.message });
    }
});

// Admin API: Upload teacher photo for Primary School page
app.post('/education/primary-school/upload-photo', upload.single('photo'), async (req, res) => {
    try {
        const teacherId = toSafeString(req.body?.teacherId);
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const photoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
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

// Admin APIs (to be implemented with authentication)
app.post('/village/update', async (req, res) => {
    try {
        const { name, taluka, district, state, area, total_households, description, history_en, history_gu } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('taluka', sql.NVarChar, taluka)
            .input('district', sql.NVarChar, district)
            .input('state', sql.NVarChar, state)
            .input('area', sql.NVarChar, area)
            .input('households', sql.NVarChar, total_households)
            .input('desc', sql.NVarChar, description)
            .input('hen', sql.NVarChar, history_en)
            .input('hgu', sql.NVarChar, history_gu)
            .query(`
                UPDATE Village SET 
                name = @name, taluka = @taluka, district = @district, state = @state, 
                area = @area, total_households = @households, description = @desc,
                history_en = @hen, history_gu = @hgu
                WHERE id = (SELECT TOP 1 id FROM Village)
            `);
        res.json({ message: 'Village updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/village/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        const pool = await poolPromise;
        
        // Add to VillageImages table
        await pool.request()
            .input('vId', sql.Int, 1) // Using 1 for now as we have one village
            .input('url', sql.NVarChar, imageUrl)
            .query('INSERT INTO VillageImages (village_id, image_url) VALUES (@vId, @url)');
            
        res.json({ message: 'Image uploaded successfully', imageUrl });
    } catch (err) {
        console.error('Upload Error:', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/panchayat/member/upload-photo', upload.single('photo'), async (req, res) => {
    try {
        const memberId = parseInt(req.body.memberId, 10);
        console.log('Upload member photo:', { memberId, filename: req.file?.filename });

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        if (Number.isNaN(memberId)) {
            return res.status(400).json({ message: 'Invalid member ID' });
        }

        const photoUrl = `http://localhost:5000/uploads/${req.file.filename}`;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('id', sql.Int, memberId)
            .input('photo', sql.NVarChar, photoUrl)
            .query('UPDATE PanchayatMembers SET photo_url = @photo WHERE id = @id');

        if (result.rowsAffected && result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Member not found for photo update' });
        }

        res.json({ message: 'Member photo uploaded', photo_url: photoUrl });
    } catch (err) {
        console.error('Member photo upload error:', err);
        res.status(500).json({ message: 'Member photo upload failed', error: err.message });
    }
});

app.delete('/village/image/:id', async (req, res) => {
    try {
        const imageId = parseInt(req.params.id, 10);
        if (Number.isNaN(imageId)) {
            return res.status(400).json({ error: 'Invalid image ID' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, imageId)
            .query('SELECT image_url FROM VillageImages WHERE id = @id');

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Image not found' });
        }

        const imageUrl = result.recordset[0].image_url;
        const fileName = path.basename(imageUrl);
        const filePath = path.join(__dirname, 'uploads', fileName);

        // Delete from DB
        await pool.request()
            .input('id', sql.Int, imageId)
            .query('DELETE FROM VillageImages WHERE id = @id');

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

app.post('/census/add', async (req, res) => {
    try {
        const { category, total, male, female } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('cat', sql.NVarChar, category)
            .input('total', sql.Int, total)
            .input('male', sql.Int, male)
            .input('female', sql.Int, female)
            .query('INSERT INTO Census (village_id, category, total, male, female) VALUES ((SELECT TOP 1 id FROM Village), @cat, @total, @male, @female)');
        res.json({ message: 'Census added successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Admin: update census record
app.post('/census/update', async (req, res) => {
    try {
        const { id, category, total, male, female } = req.body;

        if (!id) {
            return res.status(400).json({ error: 'Missing census id' });
        }

        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, id)
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
                WHERE id = @id
            `);

        res.json({ message: 'Census updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/census/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Census WHERE id = @id');
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

        if (username === ADMIN_USERNAME && role !== 'admin') {
            return res.status(400).json({ message: 'The admin username is reserved and cannot be registered as a user.' });
        }

        let finalRole = 'user';
        if (role === 'admin') {
            if (adminSecret !== ADMIN_REGISTRATION_SECRET) {
                return res.status(403).json({ message: 'Invalid admin registration secret.' });
            }
            finalRole = 'admin';
        }

        const pool = await poolPromise;
        const existing = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT id FROM Users WHERE username = @username');

        if (existing.recordset.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .input('email', sql.NVarChar, email || null)
            .input('role', sql.NVarChar, finalRole)
            .query('INSERT INTO Users (username, password, email, role) VALUES (@username, @password, @email, @role)');

        res.json({ message: `${finalRole === 'admin' ? 'Admin' : 'User'} registered successfully` });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Registration failed', error: err.message });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { username, password, role = 'user' } = req.body;
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        if (role === 'admin') {
            if (!ADMIN_PASSWORD) {
                return res.status(500).json({ message: 'Admin password not configured on server.' });
            }

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                return res.json({ token: 'admin-dummy-token', role: 'admin', user: { username: ADMIN_USERNAME } });
            }

            const pool = await poolPromise;

            // Support admin users stored in DB (optional)
            const result = await pool.request()
                .input('username', sql.NVarChar, username)
                .input('password', sql.NVarChar, password)
                .query("SELECT id, username, role FROM Users WHERE username = @username AND password = @password AND role = 'admin'");

            if (result.recordset.length > 0) {
                const adminUser = result.recordset[0];
                return res.json({ token: 'admin-dummy-token', role: 'admin', user: { id: adminUser.id, username: adminUser.username } });
            }

            return res.status(401).json({ message: 'Invalid admin credentials.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.NVarChar, password)
            .query('SELECT id, username, role FROM Users WHERE username = @username AND password = @password');

        if (result.recordset.length === 0) {
            const existing = await pool.request()
                .input('username', sql.NVarChar, username)
                .query('SELECT id FROM Users WHERE username = @username');

            if (existing.recordset.length === 0) {
                return res.status(401).json({ message: 'User not found. Please register first.' });
            }
            return res.status(401).json({ message: 'Incorrect password.' });
        }

        const user = result.recordset[0];
        // Always return 'user' role for non-admin login, regardless of what's in the database
        res.json({ token: 'user-dummy-token', role: 'user', user: { id: user.id, username: user.username } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed', error: err.message });
    }
});

// Maintain compatibility with old login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        res.json({ token: 'dummy-jwt-token', role: 'admin' });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

// ── Page Builder APIs ──────────────────────────────────────────
app.get('/pages', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT id, title, slug, status, created_at FROM Pages ORDER BY created_at DESC');
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/pages/:slug', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('slug', sql.NVarChar, req.params.slug)
            .query('SELECT * FROM Pages WHERE slug = @slug');
        if (!result.recordset[0]) return res.status(404).json({ error: 'Page not found' });
        const page = result.recordset[0];
        page.content_json = page.content_json ? JSON.parse(page.content_json) : [];
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/pages', async (req, res) => {
    const { title, slug, content_json, status } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'title and slug required' });
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('title', sql.NVarChar, title)
            .input('slug', sql.NVarChar, slug)
            .input('content_json', sql.NVarChar, JSON.stringify(content_json || []))
            .input('status', sql.NVarChar, status || 'draft')
            .query('INSERT INTO Pages (title, slug, content_json, status) OUTPUT INSERTED.* VALUES (@title, @slug, @content_json, @status)');
        const page = result.recordset[0];
        page.content_json = JSON.parse(page.content_json);
        res.json(page);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/pages/:id', async (req, res) => {
    const { title, slug, content_json, status } = req.body;
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('title', sql.NVarChar, title)
            .input('slug', sql.NVarChar, slug)
            .input('content_json', sql.NVarChar, JSON.stringify(content_json || []))
            .input('status', sql.NVarChar, status || 'draft')
            .query('UPDATE Pages SET title=@title, slug=@slug, content_json=@content_json, status=@status WHERE id=@id');
        res.json({ message: 'Page updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/pages/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Pages WHERE id=@id');
        res.json({ message: 'Page deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── Live Page Editor APIs ──────────────────────────────────────
// Auto-create PageContent table if missing
const initPageContentTable = async () => {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='PageContent' AND xtype='U')
            CREATE TABLE PageContent (
                id           INT PRIMARY KEY IDENTITY(1,1),
                page_name    NVARCHAR(100) UNIQUE NOT NULL,
                content_json NVARCHAR(MAX),
                updated_at   DATETIME DEFAULT GETDATE()
            );
        `);
    } catch (err) {
        console.error('Failed to init PageContent table:', err);
    }
};
initPageContentTable();

const initContactMessagesTable = async () => {
    try {
        const pool = await poolPromise;
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ContactMessages' AND xtype='U')
            CREATE TABLE ContactMessages (
                id         INT PRIMARY KEY IDENTITY(1,1),
                name       NVARCHAR(200) NOT NULL,
                email      NVARCHAR(200) NOT NULL,
                message    NVARCHAR(MAX) NOT NULL,
                is_read    BIT DEFAULT 0,
                created_at DATETIME DEFAULT GETDATE()
            );
        `);
    } catch (err) {
        console.error('Failed to init ContactMessages table:', err);
    }
};
initContactMessagesTable();

// GET /page-content/:pageName — load saved section layout
app.get('/page-content/:pageName', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('pageName', sql.NVarChar, req.params.pageName)
            .query('SELECT content_json FROM PageContent WHERE page_name = @pageName');
        if (!result.recordset[0]) return res.status(404).json({ error: 'No saved layout' });
        const sections = JSON.parse(result.recordset[0].content_json || '[]');
        res.json({ sections });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /page-content/:pageName — save section layout (admin only)
app.put('/page-content/:pageName', async (req, res) => {
    const { sections } = req.body;
    if (!Array.isArray(sections)) return res.status(400).json({ error: 'sections array required' });
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('pageName', sql.NVarChar, req.params.pageName)
            .input('json', sql.NVarChar, JSON.stringify(sections))
            .query(`
                MERGE PageContent AS target
                USING (SELECT @pageName AS page_name) AS source ON target.page_name = source.page_name
                WHEN MATCHED THEN
                    UPDATE SET content_json = @json, updated_at = GETDATE()
                WHEN NOT MATCHED THEN
                    INSERT (page_name, content_json) VALUES (@pageName, @json);
            `);
        res.json({ message: 'Layout saved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// CONTACT ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /contact/info — get contact details
app.get('/contact/info', async (req, res) => {
    try {
        const contactData = await fs.readJson(path.join(__dirname, 'contact-info.json')).catch(() => ({
            phone: '+91 12345 67890',
            email: 'support@panchayatsuvidha.in',
            address: 'Panchayat Office, Sayla',
            hours: '9:00 AM - 6:00 PM, Monday - Saturday'
        }));
        res.json(contactData);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /contact/info — update contact details (admin only)
app.put('/contact/info', async (req, res) => {
    try {
        const { phone, email, address, hours } = req.body;
        const contactData = { phone, email, address, hours };
        await fs.writeJson(path.join(__dirname, 'contact-info.json'), contactData, { spaces: 2 });
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
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .input('message', sql.NVarChar, message)
            .query(`
                INSERT INTO ContactMessages (name, email, message, created_at)
                VALUES (@name, @email, @message, GETDATE())
            `);

        res.json({ message: 'Message sent successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /contact/messages — get all contact messages (admin only)
app.get('/contact/messages', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT id, name, email, message, created_at, is_read
            FROM ContactMessages
            ORDER BY created_at DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /contact/messages/:id/read — mark message as read (admin only)
app.put('/contact/messages/:id/read', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('UPDATE ContactMessages SET is_read = 1 WHERE id = @id');
        res.json({ message: 'Message marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /contact/messages/:id — delete a message (admin only)
app.delete('/contact/messages/:id', async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM ContactMessages WHERE id = @id');
        res.json({ message: 'Message deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

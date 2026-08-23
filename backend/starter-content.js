// Starter content provisioned for every newly created village, so a new
// site is immediately functional (like a WordPress starter template)
// instead of a blank page. Block type strings must match the frontend's
// BlockRenderer (frontend/src/components/pagebuilder/BlockRenderer.jsx).

const crypto = require('crypto');
const bcrypt = require('bcryptjs');

function generatePassword() {
    return crypto.randomBytes(6).toString('hex'); // 12 chars, e.g. 'a3f9c1b2e7d4'
}

const DEFAULT_HOME_BLOCKS = [
    { id: 'home-1', type: 'village-banner', props: {} },
    { id: 'home-2', type: 'village-gallery', props: {} },
    { id: 'home-3', type: 'panchayat-members', props: { headingEn: 'Panchayat Members', headingGu: 'પંચાયતના સભ્યો' } },
    { id: 'home-4', type: 'village-map', props: { headingEn: 'Explore Our Village', headingGu: 'અમારું ગામ જુઓ' } },
    { id: 'home-5', type: 'village-history', props: {} },
    { id: 'home-6', type: 'village-achievements', props: { headingEn: 'Achievements', headingGu: 'ગામની સિદ્ધિઓ' } },
    { id: 'home-7', type: 'special-personalities', props: { headingEn: 'Special Personalities', headingGu: 'વિશેષ વ્યક્તિઓ' } },
    { id: 'home-8', type: 'contact-info', props: {} },
    { id: 'home-9', type: 'census-table', props: { headingEn: 'Census Data', headingGu: 'વસ્તી ગણતરી ડેટા', year: '2021' } },
];

const DEFAULT_SERVICES = [
    {
        id: 'admin', title: 'Admin', guTitle: 'વહીવટ', cardTo: '/services/admin',
        items: [
            { id: 'gram-panchayat-detail', label: 'ગ્રામપંચાયત વિગત', to: '/panchayat', department: 'પંચાયત વિભાગ', eligibility: '', description: 'ગ્રામપંચાયત સંબંધિત માહિતી માટે.', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
            { id: 'sarpanch-gps', label: 'સરપંચ (GPS)', to: '/services/admin/sarpanch-gps', department: 'પંચાયત વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
            { id: 'form-download-center', label: 'ફોર્મ ડાઉનલોડ સેન્ટર', to: '/services/admin/form-download-center', department: 'પંચાયત વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
            { id: 'staff-attendance', label: 'સ્ટાફ હાજરી', to: '/services/admin/staff-attendance', department: 'પંચાયત વિભાગ', eligibility: '', description: 'દૈનિક સ્ટાફ હાજરી ટ્રેક કરો.', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
        ]
    },
    {
        id: 'employment', title: 'Employment', guTitle: 'રોજગાર', cardTo: '/services/employment',
        items: [
            { id: 'animal-husbandry-and-dairy', label: 'પશુપાલન અને ડેરી', to: '/services/employment/animal-husbandry-and-dairy', department: 'પશુપાલન અને ડેરી વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
            { id: 'employment-board', label: 'રોજગાર બોર્ડ', to: '/services/employment/employment-board', department: 'રોજગાર વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
            { id: 'market-yard', label: 'માર્કેટ યર્ડ', to: '/services/employment/market-yard', department: 'કૃષિ બજાર/માર્કેટ યાર્ડ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
        ]
    },
    {
        id: 'facilities', title: 'Facilities', guTitle: 'સુવિધાઓ', cardTo: '/services/facilities',
        items: [
            { id: 'pgvcl-electric-service', label: 'PGVCL વીજ સેવા', to: '/services/facilities/pgvcl-electric-service', department: 'વિજળી વિભાગ (PGVCL)', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
            { id: 'st-bus-timetable', label: 'એસ.ટી. બસ સમયપત્રક', to: '/services/facilities/st-bus-timetable', department: 'એસ.ટી. વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
            { id: 'water-supply', label: 'પાણી પુરવઠો', to: '/services/facilities/water-supply', department: 'પાણી પુરવઠો વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
            { id: 'health-center', label: 'આરોગ્ય કેન્દ્ર', to: '/services/facilities/health-center', department: 'આરોગ્ય વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
        ]
    },
    {
        id: 'education', title: 'Education', guTitle: 'શિક્ષણ', cardTo: '/services/education',
        items: [
            { id: 'primary-school', label: 'પ્રાથમિક શાળા', to: '/services/education/primary-school', department: 'શિક્ષણ વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
            { id: 'anganwadi', label: 'આંગણવાડી', to: '/services/education/anganwadi', department: 'આંગણવાડી વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
            { id: 'library', label: 'લાઇબ્રેરી', to: '/services/education/library', department: 'લાઇબ્રેરી/શિક્ષણ વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
        ]
    },
];

const DEFAULT_NAV_ITEMS = [
    { label_en: 'Home', label_gu: 'હોમ', link_type: 'page', link_value: 'home' },
    { label_en: 'Services', label_gu: 'સેવાઓ', link_type: 'builtin', link_value: '/services' },
    { label_en: 'Business Directory', label_gu: 'બિઝનેસ ડિરેક્ટરી', link_type: 'builtin', link_value: '/business' },
    { label_en: 'Contact', label_gu: 'સંપર્ક', link_type: 'builtin', link_value: '/contact' },
];

// Provisions the home page, standard services catalog, default nav menu,
// and a default admin account for a brand-new village. Best-effort for the
// content (logs but does not throw, so a partial failure never blocks
// village creation itself), but the admin account creation is awaited and
// its credentials returned so the super-admin can hand them to whoever
// will run the site — without it, nobody could ever log in as that
// village's admin.
async function provisionStarterContent({ sql, poolPromise }, villageId) {
    const pool = await poolPromise;

    const adminUsername = 'admin';
    const adminPassword = generatePassword();
    try {
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        await pool.request()
            .input('vid', sql.Int, villageId)
            .input('username', sql.NVarChar, adminUsername)
            .input('password', sql.NVarChar, passwordHash)
            .input('role', sql.NVarChar, 'admin')
            .query('INSERT INTO Users (village_id, username, password, role) VALUES (@vid, @username, @password, @role)');
    } catch (err) {
        console.error(`Failed to provision admin account for village ${villageId}:`, err.message);
    }

    try {
        await pool.request()
            .input('vid', sql.Int, villageId)
            .input('title', sql.NVarChar, 'Home')
            .input('slug', sql.NVarChar, 'home')
            .input('content_json', sql.NVarChar, JSON.stringify(DEFAULT_HOME_BLOCKS))
            .input('status', sql.NVarChar, 'published')
            .query('INSERT INTO Pages (village_id, title, slug, content_json, status) VALUES (@vid, @title, @slug, @content_json, @status)');
    } catch (err) {
        console.error(`Failed to provision home page for village ${villageId}:`, err.message);
    }

    try {
        for (let i = 0; i < DEFAULT_NAV_ITEMS.length; i++) {
            const item = DEFAULT_NAV_ITEMS[i];
            await pool.request()
                .input('vid', sql.Int, villageId)
                .input('label_en', sql.NVarChar, item.label_en)
                .input('label_gu', sql.NVarChar, item.label_gu)
                .input('link_type', sql.NVarChar, item.link_type)
                .input('link_value', sql.NVarChar, item.link_value)
                .input('display_order', sql.Int, i)
                .query(`
                    INSERT INTO NavigationItems (village_id, label_en, label_gu, link_type, link_value, display_order)
                    VALUES (@vid, @label_en, @label_gu, @link_type, @link_value, @display_order)
                `);
        }
    } catch (err) {
        console.error(`Failed to provision navigation for village ${villageId}:`, err.message);
    }

    try {
        for (let i = 0; i < DEFAULT_SERVICES.length; i++) {
            const service = DEFAULT_SERVICES[i];
            await pool.request()
                .input('vid', sql.Int, villageId)
                .input('id', sql.NVarChar(100), service.id)
                .input('title', sql.NVarChar(255), service.title)
                .input('guTitle', sql.NVarChar(255), service.guTitle)
                .input('cardTo', sql.NVarChar(500), service.cardTo)
                .input('display_order', sql.Int, i)
                .query('INSERT INTO Services (village_id, id, title, guTitle, cardTo, display_order) VALUES (@vid, @id, @title, @guTitle, @cardTo, @display_order)');

            for (let j = 0; j < service.items.length; j++) {
                const item = service.items[j];
                await pool.request()
                    .input('vid', sql.Int, villageId)
                    .input('id', sql.NVarChar(100), item.id)
                    .input('service_id', sql.NVarChar(100), service.id)
                    .input('label', sql.NVarChar(500), item.label)
                    .input('to_path', sql.NVarChar(500), item.to)
                    .input('department', sql.NVarChar(500), item.department)
                    .input('eligibility', sql.NVarChar(sql.MAX), item.eligibility)
                    .input('description', sql.NVarChar(sql.MAX), item.description)
                    .input('documents', sql.NVarChar(sql.MAX), JSON.stringify(item.documents))
                    .input('procedure', sql.NVarChar(sql.MAX), item.procedure)
                    .input('fees', sql.NVarChar(500), item.fees)
                    .input('contact', sql.NVarChar(500), item.contact)
                    .input('helpline', sql.NVarChar(500), item.helpline)
                    .input('officialLink', sql.NVarChar(500), item.officialLink)
                    .input('display_order', sql.Int, j)
                    .query('INSERT INTO ServiceItems (village_id, id, service_id, label, to_path, department, eligibility, description, documents, [procedure], fees, contact, helpline, officialLink, display_order) VALUES (@vid, @id, @service_id, @label, @to_path, @department, @eligibility, @description, @documents, @procedure, @fees, @contact, @helpline, @officialLink, @display_order)');
            }
        }
    } catch (err) {
        console.error(`Failed to provision services for village ${villageId}:`, err.message);
    }

    return { adminUsername, adminPassword };
}

module.exports = { provisionStarterContent };

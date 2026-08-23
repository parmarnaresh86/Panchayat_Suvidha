const { sql, poolPromise } = require('./db');

const seedDatabase = async () => {
    try {
        const pool = await poolPromise;
        console.log('Seeding database...');

        // 1. Clear existing data
        await pool.request().query(`
            DELETE FROM ServiceItems;
            DELETE FROM Services;
            DELETE FROM VillageImages;
            DELETE FROM Achievements;
            DELETE FROM SpecialPersonalities;
            DELETE FROM Census;
            DELETE FROM PanchayatMembers;
            DELETE FROM Village;
        `);

        // 2. Insert Village (tenant #1 — sayla.panchayatsuvidha.in)
        const villageResult = await pool.request()
            .input('slug', sql.NVarChar, 'sayla')
            .input('name', sql.NVarChar, 'Sayla')
            .input('taluka', sql.NVarChar, 'Sayla')
            .input('district', sql.NVarChar, 'Surendranagar')
            .input('state', sql.NVarChar, 'Gujarat')
            .input('area', sql.NVarChar, '658')
            .input('total_households', sql.NVarChar, '165')
            .input('description', sql.NVarChar, 'A historical and progressive village located in the Surendranagar district of Gujarat. Known for its rich heritage and community spirit.')
            .input('history_en', sql.NVarChar, 'Sayla was historically a princely state in the Kathiawar region. It has a long history of traditional craftsmanship and agriculture. The village is known for its beautiful temples and ancient architecture.')
            .input('history_gu', sql.NVarChar, 'સાયલા ઐતિહાસિક રીતે કાઠિયાવાડ વિસ્તારમાં એક રજવાડું હતું. તે પરંપરાગત હસ્તકલા અને ખેતીનો લાંબો ઇતિહાસ ધરાવે છે. ગામ તેના સુંદર મંદિરો અને પ્રાચીન સ્થાપત્ય માટે જાણીતું છે.')
            .query(`
                INSERT INTO Village (slug, name, taluka, district, state, area, total_households, description, history_en, history_gu)
                VALUES (@slug, @name, @taluka, @district, @state, @area, @total_households, @description, @history_en, @history_gu);
                SELECT last_insert_rowid() AS id;
            `);

        const villageId = villageResult.recordset[0].id;

        // 3. Insert Images
        const images = [
            '/images/Loc_Sayla_1567329861.jpg',
            '/images/sayla-gujarat-1.jpg',
            '/images/Stepwell-Dhandhalpar-sayla.jpg'
        ];
        for (const url of images) {
            await pool.request()
                .input('vId', sql.Int, villageId)
                .input('url', sql.NVarChar, url)
                .query('INSERT INTO VillageImages (village_id, image_url) VALUES (@vId, @url)');
        }

        // 4. Insert Achievements
        const achievements = [
            { title: 'Best Clean Village 2024', awarded_by: 'Gujarat Government' },
            { title: 'Digital Village Award', awarded_by: 'District Panchayat' }
        ];
        for (const ach of achievements) {
            await pool.request()
                .input('vId', sql.Int, villageId)
                .input('title', sql.NVarChar, ach.title)
                .input('awarded', sql.NVarChar, ach.awarded_by)
                .query('INSERT INTO Achievements (village_id, title, awarded_by) VALUES (@vId, @title, @awarded)');
        }

        // 5. Insert Special Personalities
        const persons = [
            { name: 'Dr. Vikram Sarabhai (Sample)', achievement: 'Progressive Farmer', role: 'Community Leader' },
            { name: 'Smt. Anuben Thakkar (Sample)', achievement: 'Social Worker', role: 'Educationist' }
        ];
        for (const p of persons) {
            await pool.request()
                .input('vId', sql.Int, villageId)
                .input('name', sql.NVarChar, p.name)
                .input('ach', sql.NVarChar, p.achievement)
                .input('role', sql.NVarChar, p.role)
                .query('INSERT INTO SpecialPersonalities (village_id, name, achievement, role) VALUES (@vId, @name, @ach, @role)');
        }

        // 6. Insert Census Data
        const census = [
            { category: 'Total Population', total: 10000, male: 5200, female: 4800 },
            { category: 'Literates', total: 7000, male: 4000, female: 3000 },
            { category: 'Illiterates', total: 3000, male: 1200, female: 1800 },
            { category: 'Workers', total: 4000, male: 3000, female: 1000 },
            { category: 'Non-workers', total: 6000, male: 2200, female: 3800 }
        ];
        for (const c of census) {
            await pool.request()
                .input('vId', sql.Int, villageId)
                .input('cat', sql.NVarChar, c.category)
                .input('total', sql.Int, c.total)
                .input('male', sql.Int, c.male)
                .input('female', sql.Int, c.female)
                .query('INSERT INTO Census (village_id, category, total, male, female) VALUES (@vId, @cat, @total, @male, @female)');
        }

        // 7. Insert Panchayat Members
        const members = [
            { role: 'Sarpanch', name: 'John Doe', email: 'sarpanch@example.com', mobile: '1234567890', address: '123, Village Main Road', description: 'Elected Sarpanch of the village.' },
            { role: 'Secretary', name: 'Jane Smith', email: 'secretary@example.com', mobile: '0987654321', address: '456, Panchayat Office', description: 'Appointed Secretary of the Panchayat.' }
        ];
        for (const m of members) {
            await pool.request()
                .input('vId', sql.Int, villageId)
                .input('role', sql.NVarChar, m.role)
                .input('name', sql.NVarChar, m.name)
                .input('email', sql.NVarChar, m.email)
                .input('mobile', sql.NVarChar, m.mobile)
                .input('addr', sql.NVarChar, m.address)
                .input('desc', sql.NVarChar, m.description)
                .query('INSERT INTO PanchayatMembers (village_id, role, name, email, mobile, address, description) VALUES (@vId, @role, @name, @email, @mobile, @addr, @desc)');
        }

        // 8. Insert Services and Service Items
        const services = [
            {
                id: 'admin',
                title: 'Admin',
                guTitle: 'વહીવટ',
                cardTo: '/services/admin',
                display_order: 0,
                items: [
                    { id: 'gram-panchayat-detail', label: 'ગ્રામપંચાયત વિગત', to: '/panchayat', department: 'પંચાયત વિભાગ', eligibility: '', description: 'ગ્રામપંચાયત સંબંધિત માહિતી માટે.', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
                    { id: 'sarpanch-gps', label: 'સરપંચ (GPS)', to: '/services/admin/sarpanch-gps', department: 'પંચાયત વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
                    { id: 'form-download-center', label: 'ફોર્મ ડાઉનલોડ સેન્ટર', to: '/services/admin/form-download-center', department: 'પંચાયત વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
                    { id: 'staff-attendance', label: 'સ્ટાફ હાજરી', to: '/services/admin/staff-attendance', department: 'પંચાયત વિભાગ', eligibility: '', description: 'દૈનિક સ્ટાફ હાજરી ટ્રેક કરો (સરપંચ, સેક્રેટરી, મોડી પ્રવેશ, રિપોર્ટ).', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' }
                ]
            },
            {
                id: 'employment',
                title: 'Employment',
                guTitle: 'રોજગાર',
                cardTo: '/services/employment',
                display_order: 1,
                items: [
                    { id: 'animal-husbandry-and-dairy', label: 'પશુપાલન અને ડેરી', to: '/services/employment/animal-husbandry-and-dairy', department: 'પશુપાલન અને ડેરી વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
                    { id: 'employment-board', label: 'રોજગાર બોર્ડ', to: '/services/employment/employment-board', department: 'રોજગાર વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
                    { id: 'market-yard', label: 'માર્કેટ યર્ડ', to: '/services/employment/market-yard', department: 'કૃષિ બજાર/માર્કેટ યાર્ડ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' }
                ]
            },
            {
                id: 'facilities',
                title: 'Facilities',
                guTitle: 'સુવિધાઓ',
                cardTo: '/services/facilities',
                display_order: 2,
                items: [
                    { id: 'pgvcl-electric-service', label: 'PGVCL વીજ સેવા', to: '/services/facilities/pgvcl-electric-service', department: 'વિજળી વિભાગ (PGVCL)', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
                    { id: 'st-bus-timetable', label: 'એસ.ટી. બસ સમયપત્રક', to: '/services/facilities/st-bus-timetable', department: 'એસ.ટી. વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
                    { id: 'water-supply', label: 'પાણી પુરવઠો', to: '/services/facilities/water-supply', department: 'પાણી પુરવઠો વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
                    { id: 'health-center', label: 'આરોગ્ય કેન્દ્ર', to: '/services/facilities/health-center', department: 'આરોગ્ય વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' }
                ]
            },
            {
                id: 'education',
                title: 'Education',
                guTitle: 'શિક્ષણ',
                cardTo: '/services/education',
                display_order: 3,
                items: [
                    { id: 'primary-school', label: 'પ્રાથમિક શાળા', to: '/services/education/primary-school', department: 'શિક્ષણ વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
                    { id: 'anganwadi', label: 'આંગણવાડી', to: '/services/education/anganwadi', department: 'આંગણવાડી વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' },
                    { id: 'library', label: 'લાઇબ્રેરી', to: '/services/education/library', department: 'લાઇબ્રેરી/શિક્ષણ વિભાગ', eligibility: '', description: '', documents: [], procedure: '', fees: '', contact: '', helpline: '', officialLink: '' }
                ]
            }
        ];

        for (const service of services) {
            await pool.request()
                .input('vId', sql.Int, villageId)
                .input('id', sql.NVarChar(100), service.id)
                .input('title', sql.NVarChar(255), service.title)
                .input('guTitle', sql.NVarChar(255), service.guTitle)
                .input('cardTo', sql.NVarChar(500), service.cardTo)
                .input('display_order', sql.Int, service.display_order)
                .query('INSERT INTO Services (village_id, id, title, guTitle, cardTo, display_order) VALUES (@vId, @id, @title, @guTitle, @cardTo, @display_order)');

            for (let j = 0; j < service.items.length; j++) {
                const item = service.items[j];
                await pool.request()
                    .input('vId', sql.Int, villageId)
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
                    .query('INSERT INTO ServiceItems (village_id, id, service_id, label, to_path, department, eligibility, description, documents, [procedure], fees, contact, helpline, officialLink, display_order) VALUES (@vId, @id, @service_id, @label, @to_path, @department, @eligibility, @description, @documents, @procedure, @fees, @contact, @helpline, @officialLink, @display_order)');
            }
        }

        // 9. Insert a second, mostly-empty village (tenant #2) to prove
        // multi-tenant isolation — demo.panchayatsuvidha.in.
        const demoResult = await pool.request()
            .input('slug', sql.NVarChar, 'demo')
            .input('name', sql.NVarChar, 'Demo Village')
            .input('taluka', sql.NVarChar, 'Demo Taluka')
            .input('district', sql.NVarChar, 'Demo District')
            .input('state', sql.NVarChar, 'Gujarat')
            .input('area', sql.NVarChar, '')
            .input('total_households', sql.NVarChar, '')
            .input('description', sql.NVarChar, 'A freshly created village site — ready for the admin to fill in.')
            .input('history_en', sql.NVarChar, '')
            .input('history_gu', sql.NVarChar, '')
            .query(`
                INSERT INTO Village (slug, name, taluka, district, state, area, total_households, description, history_en, history_gu)
                VALUES (@slug, @name, @taluka, @district, @state, @area, @total_households, @description, @history_en, @history_gu);
                SELECT last_insert_rowid() AS id;
            `);
        const demoVillageId = demoResult.recordset[0].id;

        await pool.request()
            .input('vId', sql.Int, demoVillageId)
            .input('role', sql.NVarChar, 'Sarpanch')
            .input('name', sql.NVarChar, 'Demo Sarpanch')
            .input('email', sql.NVarChar, 'sarpanch@demo.example.com')
            .input('mobile', sql.NVarChar, '9999999999')
            .input('addr', sql.NVarChar, 'Demo Village Panchayat Office')
            .input('desc', sql.NVarChar, 'Elected Sarpanch of Demo Village.')
            .query('INSERT INTO PanchayatMembers (village_id, role, name, email, mobile, address, description) VALUES (@vId, @role, @name, @email, @mobile, @addr, @desc)');

        console.log(`Database seeded successfully! Villages: sayla (id=${villageId}), demo (id=${demoVillageId})`);
        process.exit(0);
    } catch (err) {
        console.error('Seeding Failed:', err);
        process.exit(1);
    }
};

seedDatabase();

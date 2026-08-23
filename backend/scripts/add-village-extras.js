// One-off, additive helper: inserts VillageImages/Achievements/SpecialPersonalities
// for a single village by slug, without touching any other tenant's data.
// Usage: node scripts/add-village-extras.js <slug>
const path = require('path');
const { sql, poolPromise } = require('../db');

const slug = process.argv[2];
if (!slug) {
    console.error('Usage: node scripts/add-village-extras.js <slug>');
    process.exit(1);
}

const DATA = {
    kukavav: {
        images: [
            '/images/kukavav-village-1.jpg',
            '/images/kukavav-farmland.jpg',
            '/images/kukavav-panchayat-office.jpg'
        ],
        achievements: [
            { title: 'Swachh Gram Award (Sample)', awarded_by: 'Amreli District Panchayat' },
            { title: 'ODF (Open Defecation Free) Certified Village', awarded_by: 'Government of Gujarat' }
        ],
        specialPersonalities: [
            { name: 'Shri Ramjibhai Vaghela (Sample)', achievement: 'Progressive Farmer', role: 'Agricultural Community Leader' },
            { name: 'Smt. Kokilaben Parmar (Sample)', achievement: 'Self-Help Group Founder', role: 'Women Empowerment Worker' }
        ]
    }
};

(async () => {
    const entry = DATA[slug];
    if (!entry) {
        console.error(`No extras data defined for slug '${slug}'`);
        process.exit(1);
    }

    const pool = await poolPromise;
    const villageRes = await pool.request()
        .input('slug', sql.NVarChar, slug)
        .query('SELECT id FROM Village WHERE slug = @slug');

    const village = villageRes.recordset[0];
    if (!village) {
        console.error(`Village '${slug}' not found`);
        process.exit(1);
    }
    const vid = village.id;

    for (const url of entry.images) {
        await pool.request()
            .input('vId', sql.Int, vid)
            .input('url', sql.NVarChar, url)
            .query('INSERT INTO VillageImages (village_id, image_url) VALUES (@vId, @url)');
    }

    for (const ach of entry.achievements) {
        await pool.request()
            .input('vId', sql.Int, vid)
            .input('title', sql.NVarChar, ach.title)
            .input('awarded', sql.NVarChar, ach.awarded_by)
            .query('INSERT INTO Achievements (village_id, title, awarded_by) VALUES (@vId, @title, @awarded)');
    }

    for (const p of entry.specialPersonalities) {
        await pool.request()
            .input('vId', sql.Int, vid)
            .input('name', sql.NVarChar, p.name)
            .input('ach', sql.NVarChar, p.achievement)
            .input('role', sql.NVarChar, p.role)
            .query('INSERT INTO SpecialPersonalities (village_id, name, achievement, role) VALUES (@vId, @name, @ach, @role)');
    }

    console.log(`Added extras for '${slug}' (village_id=${vid}): ${entry.images.length} images, ${entry.achievements.length} achievements, ${entry.specialPersonalities.length} notable persons.`);
    process.exit(0);
})().catch(err => {
    console.error(err);
    process.exit(1);
});

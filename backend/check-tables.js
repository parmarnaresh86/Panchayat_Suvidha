const {poolPromise} = require('./db');

async function checkTables() {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT name FROM sys.tables 
            WHERE name IN (
                'Services', 'ServiceItems', 
                'EducationModules', 'EducationRecords', 'EducationAnnouncements',
                'EmploymentModules', 'EmploymentRecords',
                'FacilitiesModules', 'FacilitiesRecords'
            ) 
            ORDER BY name
        `);
        
        const existingTables = result.recordset.map(r => r.name);
        console.log('Existing migration tables:', existingTables.length > 0 ? existingTables.join(', ') : 'None');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

checkTables();

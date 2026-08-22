/**
 * Verification script to check if migration was successful
 * Run this after completing the migration to verify all data is in SQL
 */

const { poolPromise } = require('./db');

async function verifyMigration() {
    console.log('Verifying migration...\n');
    
    let allPassed = true;

    try {
        const pool = await poolPromise;

        // Check Services table
        console.log('Checking Services...');
        const servicesResult = await pool.request().query('SELECT COUNT(*) as count FROM Services');
        const servicesCount = servicesResult.recordset[0].count;
        console.log(`  ✓ Found ${servicesCount} services`);
        if (servicesCount === 0) {
            console.log('  ⚠ Warning: No services found. Did migration run?');
            allPassed = false;
        }

        // Check ServiceItems table
        const serviceItemsResult = await pool.request().query('SELECT COUNT(*) as count FROM ServiceItems');
        const serviceItemsCount = serviceItemsResult.recordset[0].count;
        console.log(`  ✓ Found ${serviceItemsCount} service items\n`);

        // Check EducationModules table
        console.log('Checking Education Modules...');
        const educationModulesResult = await pool.request().query('SELECT COUNT(*) as count FROM EducationModules');
        const educationModulesCount = educationModulesResult.recordset[0].count;
        console.log(`  ✓ Found ${educationModulesCount} education modules`);
        
        const educationRecordsResult = await pool.request().query('SELECT COUNT(*) as count FROM EducationRecords');
        const educationRecordsCount = educationRecordsResult.recordset[0].count;
        console.log(`  ✓ Found ${educationRecordsCount} education records`);
        
        const educationAnnouncementsResult = await pool.request().query('SELECT COUNT(*) as count FROM EducationAnnouncements');
        const educationAnnouncementsCount = educationAnnouncementsResult.recordset[0].count;
        console.log(`  ✓ Found ${educationAnnouncementsCount} education announcements\n`);

        // Check EmploymentModules table
        console.log('Checking Employment Modules...');
        const employmentModulesResult = await pool.request().query('SELECT COUNT(*) as count FROM EmploymentModules');
        const employmentModulesCount = employmentModulesResult.recordset[0].count;
        console.log(`  ✓ Found ${employmentModulesCount} employment modules`);
        
        const employmentRecordsResult = await pool.request().query('SELECT COUNT(*) as count FROM EmploymentRecords');
        const employmentRecordsCount = employmentRecordsResult.recordset[0].count;
        console.log(`  ✓ Found ${employmentRecordsCount} employment records\n`);

        // Check FacilitiesModules table
        console.log('Checking Facilities Modules...');
        const facilitiesModulesResult = await pool.request().query('SELECT COUNT(*) as count FROM FacilitiesModules');
        const facilitiesModulesCount = facilitiesModulesResult.recordset[0].count;
        console.log(`  ✓ Found ${facilitiesModulesCount} facilities modules`);
        
        const facilitiesRecordsResult = await pool.request().query('SELECT COUNT(*) as count FROM FacilitiesRecords');
        const facilitiesRecordsCount = facilitiesRecordsResult.recordset[0].count;
        console.log(`  ✓ Found ${facilitiesRecordsCount} facilities records\n`);

        // Check specific modules exist
        console.log('Checking specific modules...');
        const moduleIds = [
            'primary-school', 'anganwadi', 'library',
            'animal-husbandry-and-dairy', 'employment-board', 'market-yard',
            'pgvcl-electric-service', 'st-bus-timetable', 'water-supply', 'health-center'
        ];

        for (const moduleId of moduleIds) {
            let found = false;
            
            // Check in education modules
            const eduResult = await pool.request()
                .input('module_id', moduleId)
                .query('SELECT COUNT(*) as count FROM EducationModules WHERE module_id = @module_id');
            if (eduResult.recordset[0].count > 0) {
                found = true;
            }
            
            // Check in employment modules
            const empResult = await pool.request()
                .input('module_id', moduleId)
                .query('SELECT COUNT(*) as count FROM EmploymentModules WHERE module_id = @module_id');
            if (empResult.recordset[0].count > 0) {
                found = true;
            }
            
            // Check in facilities modules
            const facResult = await pool.request()
                .input('module_id', moduleId)
                .query('SELECT COUNT(*) as count FROM FacilitiesModules WHERE module_id = @module_id');
            if (facResult.recordset[0].count > 0) {
                found = true;
            }

            if (found) {
                console.log(`  ✓ Module '${moduleId}' exists`);
            } else {
                console.log(`  ⚠ Module '${moduleId}' not found`);
                allPassed = false;
            }
        }

        console.log('\n' + '='.repeat(50));
        if (allPassed) {
            console.log('✓ Migration verification PASSED');
            console.log('All tables have data and modules are present.');
        } else {
            console.log('⚠ Migration verification FAILED');
            console.log('Some data may be missing. Check warnings above.');
        }
        console.log('='.repeat(50));

        process.exit(allPassed ? 0 : 1);

    } catch (err) {
        console.error('\n✗ Verification failed with error:', err);
        console.log('\nPossible issues:');
        console.log('1. Database connection failed - check .env file');
        console.log('2. Tables do not exist - run schema.sql first');
        console.log('3. Migration script not run - run migrate-json-to-sql.js');
        process.exit(1);
    }
}

verifyMigration();

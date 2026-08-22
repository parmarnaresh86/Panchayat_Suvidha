const fs = require('fs-extra');
const path = require('path');
const { sql, poolPromise } = require('./db');

const SERVICES_DATA_PATH = path.join(__dirname, 'services-data.json');
const EDUCATION_MODULES_DATA_PATH = path.join(__dirname, 'education-modules-data.json');
const EMPLOYMENT_MODULES_DATA_PATH = path.join(__dirname, 'employment-modules-data.json');
const FACILITIES_MODULES_DATA_PATH = path.join(__dirname, 'facilities-modules-data.json');

async function migrateServices() {
    console.log('Migrating services data...');
    try {
        const servicesData = await fs.readJson(SERVICES_DATA_PATH);
        const pool = await poolPromise;

        for (let i = 0; i < servicesData.services.length; i++) {
            const service = servicesData.services[i];
            
            // Insert service
            await pool.request()
                .input('id', sql.NVarChar(100), service.id)
                .input('title', sql.NVarChar(255), service.title)
                .input('guTitle', sql.NVarChar(255), service.guTitle || '')
                .input('cardTo', sql.NVarChar(500), service.cardTo || '')
                .input('display_order', sql.Int, i)
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM Services WHERE id = @id)
                    INSERT INTO Services (id, title, guTitle, cardTo, display_order)
                    VALUES (@id, @title, @guTitle, @cardTo, @display_order)
                `);

            // Insert service items
            if (service.items && Array.isArray(service.items)) {
                for (let j = 0; j < service.items.length; j++) {
                    const item = service.items[j];
                    await pool.request()
                        .input('id', sql.NVarChar(100), item.id)
                        .input('service_id', sql.NVarChar(100), service.id)
                        .input('label', sql.NVarChar(500), item.label || '')
                        .input('to_path', sql.NVarChar(500), item.to || '')
                        .input('department', sql.NVarChar(500), item.department || '')
                        .input('eligibility', sql.NVarChar(sql.MAX), item.eligibility || '')
                        .input('description', sql.NVarChar(sql.MAX), item.description || '')
                        .input('documents', sql.NVarChar(sql.MAX), JSON.stringify(item.documents || []))
                        .input('procedure', sql.NVarChar(sql.MAX), item.procedure || '')
                        .input('fees', sql.NVarChar(500), item.fees || '')
                        .input('contact', sql.NVarChar(500), item.contact || '')
                        .input('helpline', sql.NVarChar(500), item.helpline || '')
                        .input('officialLink', sql.NVarChar(500), item.officialLink || '')
                        .input('display_order', sql.Int, j)
                        .query(`
                            IF NOT EXISTS (SELECT 1 FROM ServiceItems WHERE id = @id)
                            INSERT INTO ServiceItems (id, service_id, label, to_path, department, eligibility, description, documents, [procedure], fees, contact, helpline, officialLink, display_order)
                            VALUES (@id, @service_id, @label, @to_path, @department, @eligibility, @description, @documents, @procedure, @fees, @contact, @helpline, @officialLink, @display_order)
                        `);
                }
            }
        }
        console.log('✓ Services migrated successfully');
    } catch (err) {
        console.error('Error migrating services:', err);
    }
}

async function migrateEducationModules() {
    console.log('Migrating education modules...');
    try {
        const educationData = await fs.readJson(EDUCATION_MODULES_DATA_PATH);
        const pool = await poolPromise;

        for (const [moduleId, moduleData] of Object.entries(educationData.modules)) {
            // Insert module
            await pool.request()
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('basic_info', sql.NVarChar(sql.MAX), JSON.stringify(moduleData.basicInfo || {}))
                .input('map_info', sql.NVarChar(sql.MAX), JSON.stringify(moduleData.map || {}))
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM EducationModules WHERE module_id = @module_id)
                    INSERT INTO EducationModules (module_id, basic_info, map_info)
                    VALUES (@module_id, @basic_info, @map_info)
                `);

            // Insert records
            if (moduleData.records && Array.isArray(moduleData.records)) {
                for (const record of moduleData.records) {
                    await pool.request()
                        .input('id', sql.NVarChar(100), record.id)
                        .input('module_id', sql.NVarChar(100), moduleId)
                        .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                        .query(`
                            IF NOT EXISTS (SELECT 1 FROM EducationRecords WHERE id = @id)
                            INSERT INTO EducationRecords (id, module_id, record_data)
                            VALUES (@id, @module_id, @record_data)
                        `);
                }
            }

            // Insert announcements
            if (moduleData.announcements && Array.isArray(moduleData.announcements)) {
                for (const announcement of moduleData.announcements) {
                    await pool.request()
                        .input('id', sql.NVarChar(100), announcement.id)
                        .input('module_id', sql.NVarChar(100), moduleId)
                        .input('type', sql.NVarChar(100), announcement.type || '')
                        .input('date', sql.NVarChar(50), announcement.date || '')
                        .input('message', sql.NVarChar(sql.MAX), announcement.message || '')
                        .query(`
                            IF NOT EXISTS (SELECT 1 FROM EducationAnnouncements WHERE id = @id)
                            INSERT INTO EducationAnnouncements (id, module_id, type, date, message)
                            VALUES (@id, @module_id, @type, @date, @message)
                        `);
                }
            }
        }
        console.log('✓ Education modules migrated successfully');
    } catch (err) {
        console.error('Error migrating education modules:', err);
    }
}

async function migrateEmploymentModules() {
    console.log('Migrating employment modules...');
    try {
        const employmentData = await fs.readJson(EMPLOYMENT_MODULES_DATA_PATH);
        const pool = await poolPromise;

        for (const [moduleId, moduleData] of Object.entries(employmentData.modules)) {
            // Insert module
            await pool.request()
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('basic_info', sql.NVarChar(sql.MAX), JSON.stringify(moduleData.basicInfo || moduleData))
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM EmploymentModules WHERE module_id = @module_id)
                    INSERT INTO EmploymentModules (module_id, basic_info)
                    VALUES (@module_id, @basic_info)
                `);

            // Insert records based on module type
            if (moduleId === 'animal-husbandry-and-dairy' && moduleData.livestockDetails) {
                for (const record of moduleData.livestockDetails) {
                    await pool.request()
                        .input('id', sql.NVarChar(100), record.id)
                        .input('module_id', sql.NVarChar(100), moduleId)
                        .input('record_type', sql.NVarChar(100), 'livestockDetails')
                        .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                        .query(`
                            IF NOT EXISTS (SELECT 1 FROM EmploymentRecords WHERE id = @id)
                            INSERT INTO EmploymentRecords (id, module_id, record_type, record_data)
                            VALUES (@id, @module_id, @record_type, @record_data)
                        `);
                }
            }

            if (moduleId === 'employment-board') {
                if (moduleData.jobListings) {
                    for (const record of moduleData.jobListings) {
                        await pool.request()
                            .input('id', sql.NVarChar(100), record.id)
                            .input('module_id', sql.NVarChar(100), moduleId)
                            .input('record_type', sql.NVarChar(100), 'jobListings')
                            .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                            .query(`
                                IF NOT EXISTS (SELECT 1 FROM EmploymentRecords WHERE id = @id)
                                INSERT INTO EmploymentRecords (id, module_id, record_type, record_data)
                                VALUES (@id, @module_id, @record_type, @record_data)
                            `);
                    }
                }
                if (moduleData.governmentJobs) {
                    for (const record of moduleData.governmentJobs) {
                        await pool.request()
                            .input('id', sql.NVarChar(100), record.id)
                            .input('module_id', sql.NVarChar(100), moduleId)
                            .input('record_type', sql.NVarChar(100), 'governmentJobs')
                            .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                            .query(`
                                IF NOT EXISTS (SELECT 1 FROM EmploymentRecords WHERE id = @id)
                                INSERT INTO EmploymentRecords (id, module_id, record_type, record_data)
                                VALUES (@id, @module_id, @record_type, @record_data)
                            `);
                    }
                }
            }

            if (moduleId === 'market-yard') {
                const recordTypes = ['cropPrices', 'farmerListings', 'buyersTraders', 'transactions', 'governmentSchemes'];
                for (const recordType of recordTypes) {
                    if (moduleData[recordType] && Array.isArray(moduleData[recordType])) {
                        for (const record of moduleData[recordType]) {
                            await pool.request()
                                .input('id', sql.NVarChar(100), record.id)
                                .input('module_id', sql.NVarChar(100), moduleId)
                                .input('record_type', sql.NVarChar(100), recordType)
                                .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                                .query(`
                                    IF NOT EXISTS (SELECT 1 FROM EmploymentRecords WHERE id = @id)
                                    INSERT INTO EmploymentRecords (id, module_id, record_type, record_data)
                                    VALUES (@id, @module_id, @record_type, @record_data)
                                `);
                        }
                    }
                }
            }
        }
        console.log('✓ Employment modules migrated successfully');
    } catch (err) {
        console.error('Error migrating employment modules:', err);
    }
}

async function migrateFacilitiesModules() {
    console.log('Migrating facilities modules...');
    try {
        const facilitiesData = await fs.readJson(FACILITIES_MODULES_DATA_PATH);
        const pool = await poolPromise;

        for (const [moduleId, moduleData] of Object.entries(facilitiesData.modules)) {
            // Insert module
            await pool.request()
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('basic_info', sql.NVarChar(sql.MAX), JSON.stringify(moduleData))
                .query(`
                    IF NOT EXISTS (SELECT 1 FROM FacilitiesModules WHERE module_id = @module_id)
                    INSERT INTO FacilitiesModules (module_id, basic_info)
                    VALUES (@module_id, @basic_info)
                `);

            // Insert records based on module type
            if (moduleId === 'st-bus-timetable' && moduleData.busRoutes) {
                for (const record of moduleData.busRoutes) {
                    await pool.request()
                        .input('id', sql.NVarChar(100), record.id)
                        .input('module_id', sql.NVarChar(100), moduleId)
                        .input('record_type', sql.NVarChar(100), 'busRoutes')
                        .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                        .query(`
                            IF NOT EXISTS (SELECT 1 FROM FacilitiesRecords WHERE id = @id)
                            INSERT INTO FacilitiesRecords (id, module_id, record_type, record_data)
                            VALUES (@id, @module_id, @record_type, @record_data)
                        `);
                }
            }

            if (moduleId === 'water-supply' && moduleData.supplySchedule) {
                for (const record of moduleData.supplySchedule) {
                    await pool.request()
                        .input('id', sql.NVarChar(100), record.id)
                        .input('module_id', sql.NVarChar(100), moduleId)
                        .input('record_type', sql.NVarChar(100), 'supplySchedule')
                        .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                        .query(`
                            IF NOT EXISTS (SELECT 1 FROM FacilitiesRecords WHERE id = @id)
                            INSERT INTO FacilitiesRecords (id, module_id, record_type, record_data)
                            VALUES (@id, @module_id, @record_type, @record_data)
                        `);
                }
            }
        }
        console.log('✓ Facilities modules migrated successfully');
    } catch (err) {
        console.error('Error migrating facilities modules:', err);
    }
}

async function runMigration() {
    console.log('Starting JSON to SQL migration...\n');
    
    try {
        await migrateServices();
        await migrateEducationModules();
        await migrateEmploymentModules();
        await migrateFacilitiesModules();
        
        console.log('\n✓ All data migrated successfully!');
        console.log('\nYou can now safely backup and remove the following JSON files:');
        console.log('  - services-data.json');
        console.log('  - education-modules-data.json');
        console.log('  - employment-modules-data.json');
        console.log('  - facilities-modules-data.json');
        console.log('  - primary-school-data.json (data is in education-modules-data.json)');
        
        process.exit(0);
    } catch (err) {
        console.error('\n✗ Migration failed:', err);
        process.exit(1);
    }
}

runMigration();

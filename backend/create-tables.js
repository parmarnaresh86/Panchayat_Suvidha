const {poolPromise} = require('./db');

async function createTables() {
    console.log('Creating migration tables...\n');
    
    try {
        const pool = await poolPromise;
        
        // Create Services table
        console.log('Creating Services table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='Services')
            CREATE TABLE Services (
                id NVARCHAR(100) PRIMARY KEY,
                title NVARCHAR(255) NOT NULL,
                guTitle NVARCHAR(255),
                cardTo NVARCHAR(500),
                display_order INT DEFAULT 0
            );
        `);
        console.log('✓ Services table ready');

        // Create ServiceItems table
        console.log('Creating ServiceItems table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='ServiceItems')
            CREATE TABLE ServiceItems (
                id NVARCHAR(100) PRIMARY KEY,
                service_id NVARCHAR(100) NOT NULL,
                label NVARCHAR(500),
                to_path NVARCHAR(500),
                department NVARCHAR(500),
                eligibility NVARCHAR(MAX),
                description NVARCHAR(MAX),
                documents NVARCHAR(MAX),
                [procedure] NVARCHAR(MAX),
                fees NVARCHAR(500),
                contact NVARCHAR(500),
                helpline NVARCHAR(500),
                officialLink NVARCHAR(500),
                display_order INT DEFAULT 0,
                FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
            );
        `);
        console.log('✓ ServiceItems table ready');

        // Create EducationModules table
        console.log('Creating EducationModules table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='EducationModules')
            CREATE TABLE EducationModules (
                module_id NVARCHAR(100) PRIMARY KEY,
                basic_info NVARCHAR(MAX),
                map_info NVARCHAR(MAX)
            );
        `);
        console.log('✓ EducationModules table ready');

        // Create EducationRecords table
        console.log('Creating EducationRecords table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='EducationRecords')
            CREATE TABLE EducationRecords (
                id NVARCHAR(100) PRIMARY KEY,
                module_id NVARCHAR(100) NOT NULL,
                record_data NVARCHAR(MAX),
                FOREIGN KEY (module_id) REFERENCES EducationModules(module_id) ON DELETE CASCADE
            );
        `);
        console.log('✓ EducationRecords table ready');

        // Create EducationAnnouncements table
        console.log('Creating EducationAnnouncements table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='EducationAnnouncements')
            CREATE TABLE EducationAnnouncements (
                id NVARCHAR(100) PRIMARY KEY,
                module_id NVARCHAR(100) NOT NULL,
                type NVARCHAR(100),
                date NVARCHAR(50),
                message NVARCHAR(MAX),
                FOREIGN KEY (module_id) REFERENCES EducationModules(module_id) ON DELETE CASCADE
            );
        `);
        console.log('✓ EducationAnnouncements table ready');

        // Create EmploymentModules table
        console.log('Creating EmploymentModules table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='EmploymentModules')
            CREATE TABLE EmploymentModules (
                module_id NVARCHAR(100) PRIMARY KEY,
                basic_info NVARCHAR(MAX)
            );
        `);
        console.log('✓ EmploymentModules table ready');

        // Create EmploymentRecords table
        console.log('Creating EmploymentRecords table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='EmploymentRecords')
            CREATE TABLE EmploymentRecords (
                id NVARCHAR(100) PRIMARY KEY,
                module_id NVARCHAR(100) NOT NULL,
                record_type NVARCHAR(100),
                record_data NVARCHAR(MAX),
                FOREIGN KEY (module_id) REFERENCES EmploymentModules(module_id) ON DELETE CASCADE
            );
        `);
        console.log('✓ EmploymentRecords table ready');

        // Create FacilitiesModules table
        console.log('Creating FacilitiesModules table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='FacilitiesModules')
            CREATE TABLE FacilitiesModules (
                module_id NVARCHAR(100) PRIMARY KEY,
                basic_info NVARCHAR(MAX)
            );
        `);
        console.log('✓ FacilitiesModules table ready');

        // Create FacilitiesRecords table
        console.log('Creating FacilitiesRecords table...');
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name='FacilitiesRecords')
            CREATE TABLE FacilitiesRecords (
                id NVARCHAR(100) PRIMARY KEY,
                module_id NVARCHAR(100) NOT NULL,
                record_type NVARCHAR(100),
                record_data NVARCHAR(MAX),
                FOREIGN KEY (module_id) REFERENCES FacilitiesModules(module_id) ON DELETE CASCADE
            );
        `);
        console.log('✓ FacilitiesRecords table ready');

        console.log('\n✓ All tables created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('\n✗ Error creating tables:', err);
        process.exit(1);
    }
}

createTables();

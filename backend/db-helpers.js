const { sql, poolPromise } = require('./db');

// Services helpers
async function getServices() {
    const pool = await poolPromise;
    const servicesResult = await pool.request().query(`
        SELECT * FROM Services ORDER BY display_order
    `);
    const itemsResult = await pool.request().query(`
        SELECT * FROM ServiceItems ORDER BY display_order
    `);

    const services = servicesResult.recordset.map(service => ({
        id: service.id,
        title: service.title,
        guTitle: service.guTitle,
        cardTo: service.cardTo,
        items: itemsResult.recordset
            .filter(item => item.service_id === service.id)
            .map(item => ({
                id: item.id,
                label: item.label,
                to: item.to_path,
                department: item.department,
                eligibility: item.eligibility,
                description: item.description,
                documents: item.documents ? JSON.parse(item.documents) : [],
                procedure: item.procedure,
                fees: item.fees,
                contact: item.contact,
                helpline: item.helpline,
                officialLink: item.officialLink
            }))
    }));

    return services;
}

async function updateServices(services) {
    const pool = await poolPromise;
    
    // Delete all existing services and items (cascade will handle items)
    await pool.request().query('DELETE FROM Services');
    
    // Insert new services and items
    for (let i = 0; i < services.length; i++) {
        const service = services[i];
        await pool.request()
            .input('id', sql.NVarChar(100), service.id)
            .input('title', sql.NVarChar(255), service.title)
            .input('guTitle', sql.NVarChar(255), service.guTitle || '')
            .input('cardTo', sql.NVarChar(500), service.cardTo || '')
            .input('display_order', sql.Int, i)
            .query(`
                INSERT INTO Services (id, title, guTitle, cardTo, display_order)
                VALUES (@id, @title, @guTitle, @cardTo, @display_order)
            `);

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
                        INSERT INTO ServiceItems (id, service_id, label, to_path, department, eligibility, description, documents, [procedure], fees, contact, helpline, officialLink, display_order)
                        VALUES (@id, @service_id, @label, @to_path, @department, @eligibility, @description, @documents, @procedure, @fees, @contact, @helpline, @officialLink, @display_order)
                    `);
            }
        }
    }
}

// Education modules helpers
async function getEducationModule(moduleId) {
    const pool = await poolPromise;
    
    const moduleResult = await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM EducationModules WHERE module_id = @module_id');
    
    if (moduleResult.recordset.length === 0) {
        return null;
    }

    const module = moduleResult.recordset[0];
    const recordsResult = await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM EducationRecords WHERE module_id = @module_id');
    
    const announcementsResult = await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM EducationAnnouncements WHERE module_id = @module_id');

    return {
        basicInfo: JSON.parse(module.basic_info),
        records: recordsResult.recordset.map(r => JSON.parse(r.record_data)),
        announcements: announcementsResult.recordset.map(a => ({
            id: a.id,
            type: a.type,
            date: a.date,
            message: a.message
        })),
        map: JSON.parse(module.map_info)
    };
}

async function updateEducationModule(moduleId, data) {
    const pool = await poolPromise;
    
    // Update or insert module
    await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .input('basic_info', sql.NVarChar(sql.MAX), JSON.stringify(data.basicInfo || {}))
        .input('map_info', sql.NVarChar(sql.MAX), JSON.stringify(data.map || {}))
        .query(`
            IF EXISTS (SELECT 1 FROM EducationModules WHERE module_id = @module_id)
                UPDATE EducationModules SET basic_info = @basic_info, map_info = @map_info WHERE module_id = @module_id
            ELSE
                INSERT INTO EducationModules (module_id, basic_info, map_info) VALUES (@module_id, @basic_info, @map_info)
        `);

    // Delete and re-insert records
    await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('DELETE FROM EducationRecords WHERE module_id = @module_id');
    
    if (data.records && Array.isArray(data.records)) {
        for (const record of data.records) {
            await pool.request()
                .input('id', sql.NVarChar(100), record.id)
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                .query('INSERT INTO EducationRecords (id, module_id, record_data) VALUES (@id, @module_id, @record_data)');
        }
    }

    // Delete and re-insert announcements
    await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('DELETE FROM EducationAnnouncements WHERE module_id = @module_id');
    
    if (data.announcements && Array.isArray(data.announcements)) {
        for (const announcement of data.announcements) {
            await pool.request()
                .input('id', sql.NVarChar(100), announcement.id)
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('type', sql.NVarChar(100), announcement.type || '')
                .input('date', sql.NVarChar(50), announcement.date || '')
                .input('message', sql.NVarChar(sql.MAX), announcement.message || '')
                .query('INSERT INTO EducationAnnouncements (id, module_id, type, date, message) VALUES (@id, @module_id, @type, @date, @message)');
        }
    }
}

// Employment modules helpers
async function getEmploymentModule(moduleId) {
    const pool = await poolPromise;
    
    const moduleResult = await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM EmploymentModules WHERE module_id = @module_id');
    
    if (moduleResult.recordset.length === 0) {
        return null;
    }

    const module = moduleResult.recordset[0];
    const basicInfo = JSON.parse(module.basic_info);
    
    const recordsResult = await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM EmploymentRecords WHERE module_id = @module_id');

    const result = { basicInfo };

    // Group records by type
    for (const record of recordsResult.recordset) {
        const recordData = JSON.parse(record.record_data);
        if (!result[record.record_type]) {
            result[record.record_type] = [];
        }
        result[record.record_type].push(recordData);
    }

    // Handle mgnrega special case for employment-board
    if (moduleId === 'employment-board' && basicInfo.mgnrega) {
        result.mgnrega = basicInfo.mgnrega;
    }

    // Handle marketInfo special case for market-yard
    if (moduleId === 'market-yard' && basicInfo.marketInfo) {
        result.marketInfo = basicInfo.marketInfo;
    }

    return result;
}

async function updateEmploymentModule(moduleId, data) {
    const pool = await poolPromise;
    
    // Update or insert module
    await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .input('basic_info', sql.NVarChar(sql.MAX), JSON.stringify(data.basicInfo || data))
        .query(`
            IF EXISTS (SELECT 1 FROM EmploymentModules WHERE module_id = @module_id)
                UPDATE EmploymentModules SET basic_info = @basic_info WHERE module_id = @module_id
            ELSE
                INSERT INTO EmploymentModules (module_id, basic_info) VALUES (@module_id, @basic_info)
        `);

    // Delete and re-insert records
    await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('DELETE FROM EmploymentRecords WHERE module_id = @module_id');
    
    // Insert records based on module type
    if (moduleId === 'animal-husbandry-and-dairy' && data.livestockDetails) {
        for (const record of data.livestockDetails) {
            await pool.request()
                .input('id', sql.NVarChar(100), record.id)
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('record_type', sql.NVarChar(100), 'livestockDetails')
                .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                .query('INSERT INTO EmploymentRecords (id, module_id, record_type, record_data) VALUES (@id, @module_id, @record_type, @record_data)');
        }
    }

    if (moduleId === 'employment-board') {
        if (data.jobListings) {
            for (const record of data.jobListings) {
                await pool.request()
                    .input('id', sql.NVarChar(100), record.id)
                    .input('module_id', sql.NVarChar(100), moduleId)
                    .input('record_type', sql.NVarChar(100), 'jobListings')
                    .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                    .query('INSERT INTO EmploymentRecords (id, module_id, record_type, record_data) VALUES (@id, @module_id, @record_type, @record_data)');
            }
        }
        if (data.governmentJobs) {
            for (const record of data.governmentJobs) {
                await pool.request()
                    .input('id', sql.NVarChar(100), record.id)
                    .input('module_id', sql.NVarChar(100), moduleId)
                    .input('record_type', sql.NVarChar(100), 'governmentJobs')
                    .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                    .query('INSERT INTO EmploymentRecords (id, module_id, record_type, record_data) VALUES (@id, @module_id, @record_type, @record_data)');
            }
        }
    }

    if (moduleId === 'market-yard') {
        const recordTypes = ['cropPrices', 'farmerListings', 'buyersTraders', 'transactions', 'governmentSchemes'];
        for (const recordType of recordTypes) {
            if (data[recordType] && Array.isArray(data[recordType])) {
                for (const record of data[recordType]) {
                    await pool.request()
                        .input('id', sql.NVarChar(100), record.id)
                        .input('module_id', sql.NVarChar(100), moduleId)
                        .input('record_type', sql.NVarChar(100), recordType)
                        .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                        .query('INSERT INTO EmploymentRecords (id, module_id, record_type, record_data) VALUES (@id, @module_id, @record_type, @record_data)');
                }
            }
        }
    }
}

// Facilities modules helpers
async function getFacilitiesModule(moduleId) {
    const pool = await poolPromise;
    
    const moduleResult = await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM FacilitiesModules WHERE module_id = @module_id');
    
    if (moduleResult.recordset.length === 0) {
        return null;
    }

    const module = moduleResult.recordset[0];
    const result = JSON.parse(module.basic_info);
    
    const recordsResult = await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM FacilitiesRecords WHERE module_id = @module_id');

    // Group records by type
    for (const record of recordsResult.recordset) {
        const recordData = JSON.parse(record.record_data);
        if (!result[record.record_type]) {
            result[record.record_type] = [];
        }
        result[record.record_type].push(recordData);
    }

    return result;
}

async function updateFacilitiesModule(moduleId, data) {
    const pool = await poolPromise;
    
    // Update or insert module
    await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .input('basic_info', sql.NVarChar(sql.MAX), JSON.stringify(data))
        .query(`
            IF EXISTS (SELECT 1 FROM FacilitiesModules WHERE module_id = @module_id)
                UPDATE FacilitiesModules SET basic_info = @basic_info WHERE module_id = @module_id
            ELSE
                INSERT INTO FacilitiesModules (module_id, basic_info) VALUES (@module_id, @basic_info)
        `);

    // Delete and re-insert records
    await pool.request()
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('DELETE FROM FacilitiesRecords WHERE module_id = @module_id');
    
    // Insert records based on module type
    if (moduleId === 'st-bus-timetable' && data.busRoutes) {
        for (const record of data.busRoutes) {
            await pool.request()
                .input('id', sql.NVarChar(100), record.id)
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('record_type', sql.NVarChar(100), 'busRoutes')
                .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                .query('INSERT INTO FacilitiesRecords (id, module_id, record_type, record_data) VALUES (@id, @module_id, @record_type, @record_data)');
        }
    }

    if (moduleId === 'water-supply' && data.supplySchedule) {
        for (const record of data.supplySchedule) {
            await pool.request()
                .input('id', sql.NVarChar(100), record.id)
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('record_type', sql.NVarChar(100), 'supplySchedule')
                .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                .query('INSERT INTO FacilitiesRecords (id, module_id, record_type, record_data) VALUES (@id, @module_id, @record_type, @record_data)');
        }
    }
}

module.exports = {
    getServices,
    updateServices,
    getEducationModule,
    updateEducationModule,
    getEmploymentModule,
    updateEmploymentModule,
    getFacilitiesModule,
    updateFacilitiesModule
};

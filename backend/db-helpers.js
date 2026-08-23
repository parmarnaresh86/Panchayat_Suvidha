const { sql, poolPromise } = require('./db');

// Services helpers
async function getServices(villageId) {
    const pool = await poolPromise;
    const servicesResult = await pool.request()
        .input('vid', sql.Int, villageId)
        .query('SELECT * FROM Services WHERE village_id = @vid ORDER BY display_order');
    const itemsResult = await pool.request()
        .input('vid', sql.Int, villageId)
        .query('SELECT * FROM ServiceItems WHERE village_id = @vid ORDER BY display_order');

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

async function updateServices(villageId, services) {
    const pool = await poolPromise;

    // Delete this village's existing services and items (cascade will handle items)
    await pool.request()
        .input('vid', sql.Int, villageId)
        .query('DELETE FROM Services WHERE village_id = @vid');

    // Insert new services and items
    for (let i = 0; i < services.length; i++) {
        const service = services[i];
        await pool.request()
            .input('vid', sql.Int, villageId)
            .input('id', sql.NVarChar(100), service.id)
            .input('title', sql.NVarChar(255), service.title)
            .input('guTitle', sql.NVarChar(255), service.guTitle || '')
            .input('cardTo', sql.NVarChar(500), service.cardTo || '')
            .input('display_order', sql.Int, i)
            .query(`
                INSERT INTO Services (village_id, id, title, guTitle, cardTo, display_order)
                VALUES (@vid, @id, @title, @guTitle, @cardTo, @display_order)
            `);

        if (service.items && Array.isArray(service.items)) {
            for (let j = 0; j < service.items.length; j++) {
                const item = service.items[j];
                await pool.request()
                    .input('vid', sql.Int, villageId)
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
                        INSERT INTO ServiceItems (village_id, id, service_id, label, to_path, department, eligibility, description, documents, [procedure], fees, contact, helpline, officialLink, display_order)
                        VALUES (@vid, @id, @service_id, @label, @to_path, @department, @eligibility, @description, @documents, @procedure, @fees, @contact, @helpline, @officialLink, @display_order)
                    `);
            }
        }
    }
}

// Education modules helpers
async function getEducationModule(villageId, moduleId) {
    const pool = await poolPromise;

    const moduleResult = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM EducationModules WHERE village_id = @vid AND module_id = @module_id');

    if (moduleResult.recordset.length === 0) {
        return null;
    }

    const module = moduleResult.recordset[0];
    const recordsResult = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM EducationRecords WHERE village_id = @vid AND module_id = @module_id');

    const announcementsResult = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM EducationAnnouncements WHERE village_id = @vid AND module_id = @module_id');

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

async function updateEducationModule(villageId, moduleId, data) {
    const pool = await poolPromise;

    // Update or insert module
    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .input('basic_info', sql.NVarChar(sql.MAX), JSON.stringify(data.basicInfo || {}))
        .input('map_info', sql.NVarChar(sql.MAX), JSON.stringify(data.map || {}))
        .query(`
            INSERT INTO EducationModules (village_id, module_id, basic_info, map_info)
            VALUES (@vid, @module_id, @basic_info, @map_info)
            ON CONFLICT(village_id, module_id) DO UPDATE SET basic_info = @basic_info, map_info = @map_info
        `);

    // Delete and re-insert records
    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('DELETE FROM EducationRecords WHERE village_id = @vid AND module_id = @module_id');

    if (data.records && Array.isArray(data.records)) {
        for (const record of data.records) {
            await pool.request()
                .input('vid', sql.Int, villageId)
                .input('id', sql.NVarChar(100), record.id)
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                .query('INSERT INTO EducationRecords (village_id, id, module_id, record_data) VALUES (@vid, @id, @module_id, @record_data)');
        }
    }

    // Delete and re-insert announcements
    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('DELETE FROM EducationAnnouncements WHERE village_id = @vid AND module_id = @module_id');

    if (data.announcements && Array.isArray(data.announcements)) {
        for (const announcement of data.announcements) {
            await pool.request()
                .input('vid', sql.Int, villageId)
                .input('id', sql.NVarChar(100), announcement.id)
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('type', sql.NVarChar(100), announcement.type || '')
                .input('date', sql.NVarChar(50), announcement.date || '')
                .input('message', sql.NVarChar(sql.MAX), announcement.message || '')
                .query('INSERT INTO EducationAnnouncements (village_id, id, module_id, type, date, message) VALUES (@vid, @id, @module_id, @type, @date, @message)');
        }
    }
}

// Employment modules helpers
async function getEmploymentModule(villageId, moduleId) {
    const pool = await poolPromise;

    const moduleResult = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM EmploymentModules WHERE village_id = @vid AND module_id = @module_id');

    if (moduleResult.recordset.length === 0) {
        return null;
    }

    const module = moduleResult.recordset[0];
    const basicInfo = JSON.parse(module.basic_info);

    const recordsResult = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM EmploymentRecords WHERE village_id = @vid AND module_id = @module_id');

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

async function updateEmploymentModule(villageId, moduleId, data) {
    const pool = await poolPromise;

    // Update or insert module
    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .input('basic_info', sql.NVarChar(sql.MAX), JSON.stringify(data.basicInfo || data))
        .query(`
            INSERT INTO EmploymentModules (village_id, module_id, basic_info)
            VALUES (@vid, @module_id, @basic_info)
            ON CONFLICT(village_id, module_id) DO UPDATE SET basic_info = @basic_info
        `);

    // Delete and re-insert records
    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('DELETE FROM EmploymentRecords WHERE village_id = @vid AND module_id = @module_id');

    // Insert records based on module type
    if (moduleId === 'animal-husbandry-and-dairy' && data.livestockDetails) {
        for (const record of data.livestockDetails) {
            await pool.request()
                .input('vid', sql.Int, villageId)
                .input('id', sql.NVarChar(100), record.id)
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('record_type', sql.NVarChar(100), 'livestockDetails')
                .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                .query('INSERT INTO EmploymentRecords (village_id, id, module_id, record_type, record_data) VALUES (@vid, @id, @module_id, @record_type, @record_data)');
        }
    }

    if (moduleId === 'employment-board') {
        if (data.jobListings) {
            for (const record of data.jobListings) {
                await pool.request()
                    .input('vid', sql.Int, villageId)
                    .input('id', sql.NVarChar(100), record.id)
                    .input('module_id', sql.NVarChar(100), moduleId)
                    .input('record_type', sql.NVarChar(100), 'jobListings')
                    .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                    .query('INSERT INTO EmploymentRecords (village_id, id, module_id, record_type, record_data) VALUES (@vid, @id, @module_id, @record_type, @record_data)');
            }
        }
        if (data.governmentJobs) {
            for (const record of data.governmentJobs) {
                await pool.request()
                    .input('vid', sql.Int, villageId)
                    .input('id', sql.NVarChar(100), record.id)
                    .input('module_id', sql.NVarChar(100), moduleId)
                    .input('record_type', sql.NVarChar(100), 'governmentJobs')
                    .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                    .query('INSERT INTO EmploymentRecords (village_id, id, module_id, record_type, record_data) VALUES (@vid, @id, @module_id, @record_type, @record_data)');
            }
        }
    }

    if (moduleId === 'market-yard') {
        const recordTypes = ['cropPrices', 'farmerListings', 'buyersTraders', 'transactions', 'governmentSchemes'];
        for (const recordType of recordTypes) {
            if (data[recordType] && Array.isArray(data[recordType])) {
                for (const record of data[recordType]) {
                    await pool.request()
                        .input('vid', sql.Int, villageId)
                        .input('id', sql.NVarChar(100), record.id)
                        .input('module_id', sql.NVarChar(100), moduleId)
                        .input('record_type', sql.NVarChar(100), recordType)
                        .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                        .query('INSERT INTO EmploymentRecords (village_id, id, module_id, record_type, record_data) VALUES (@vid, @id, @module_id, @record_type, @record_data)');
                }
            }
        }
    }
}

// Facilities modules helpers
async function getFacilitiesModule(villageId, moduleId) {
    const pool = await poolPromise;

    const moduleResult = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM FacilitiesModules WHERE village_id = @vid AND module_id = @module_id');

    if (moduleResult.recordset.length === 0) {
        return null;
    }

    const module = moduleResult.recordset[0];
    const result = JSON.parse(module.basic_info);

    const recordsResult = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('SELECT * FROM FacilitiesRecords WHERE village_id = @vid AND module_id = @module_id');

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

async function updateFacilitiesModule(villageId, moduleId, data) {
    const pool = await poolPromise;

    // Update or insert module
    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .input('basic_info', sql.NVarChar(sql.MAX), JSON.stringify(data))
        .query(`
            INSERT INTO FacilitiesModules (village_id, module_id, basic_info)
            VALUES (@vid, @module_id, @basic_info)
            ON CONFLICT(village_id, module_id) DO UPDATE SET basic_info = @basic_info
        `);

    // Delete and re-insert records
    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('module_id', sql.NVarChar(100), moduleId)
        .query('DELETE FROM FacilitiesRecords WHERE village_id = @vid AND module_id = @module_id');

    // Insert records based on module type
    if (moduleId === 'st-bus-timetable' && data.busRoutes) {
        for (const record of data.busRoutes) {
            await pool.request()
                .input('vid', sql.Int, villageId)
                .input('id', sql.NVarChar(100), record.id)
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('record_type', sql.NVarChar(100), 'busRoutes')
                .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                .query('INSERT INTO FacilitiesRecords (village_id, id, module_id, record_type, record_data) VALUES (@vid, @id, @module_id, @record_type, @record_data)');
        }
    }

    if (moduleId === 'water-supply' && data.supplySchedule) {
        for (const record of data.supplySchedule) {
            await pool.request()
                .input('vid', sql.Int, villageId)
                .input('id', sql.NVarChar(100), record.id)
                .input('module_id', sql.NVarChar(100), moduleId)
                .input('record_type', sql.NVarChar(100), 'supplySchedule')
                .input('record_data', sql.NVarChar(sql.MAX), JSON.stringify(record))
                .query('INSERT INTO FacilitiesRecords (village_id, id, module_id, record_type, record_data) VALUES (@vid, @id, @module_id, @record_type, @record_data)');
        }
    }
}

// Business Directory helpers
function slugify(name) {
    return String(name || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80) || 'business';
}

async function generateUniqueBusinessSlug(villageId, name, excludeId) {
    const pool = await poolPromise;
    const base = slugify(name);
    let candidate = base;
    let n = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const req = pool.request()
            .input('vid', sql.Int, villageId)
            .input('slug', sql.NVarChar, candidate);
        let query = 'SELECT id FROM Businesses WHERE village_id = @vid AND slug = @slug';
        if (excludeId) {
            req.input('excludeId', sql.Int, excludeId);
            query += ' AND id != @excludeId';
        }
        const result = await req.query(query);
        if (result.recordset.length === 0) return candidate;
        n += 1;
        candidate = `${base}-${n}`;
    }
}

async function getBusinesses(villageId, { q, category, includeUnpublished = false } = {}) {
    const pool = await poolPromise;
    const req = pool.request().input('vid', sql.Int, villageId);
    let query = 'SELECT * FROM Businesses WHERE village_id = @vid';

    if (!includeUnpublished) query += ' AND is_published = 1';
    if (category) {
        req.input('category', sql.NVarChar, category);
        query += ' AND category = @category';
    }
    if (q) {
        req.input('q', sql.NVarChar, `%${q.toLowerCase()}%`);
        query += ' AND (LOWER(name) LIKE @q OR LOWER(IFNULL(name_gu,\'\')) LIKE @q OR LOWER(IFNULL(category,\'\')) LIKE @q OR LOWER(IFNULL(description,\'\')) LIKE @q)';
    }
    query += ' ORDER BY name';

    const result = await req.query(query);
    return result.recordset;
}

async function getBusinessCategories(villageId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('vid', sql.Int, villageId)
        .query("SELECT DISTINCT category FROM Businesses WHERE village_id = @vid AND is_published = 1 AND category IS NOT NULL AND category != '' ORDER BY category");
    return result.recordset.map(r => r.category);
}

async function getBusinessProducts(villageId, businessId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('bid', sql.Int, businessId)
        .query('SELECT * FROM BusinessProducts WHERE village_id = @vid AND business_id = @bid ORDER BY display_order');
    return result.recordset;
}

async function getBusinessBySlug(villageId, slug, { includeUnpublished = false } = {}) {
    const pool = await poolPromise;
    const req = pool.request()
        .input('vid', sql.Int, villageId)
        .input('slug', sql.NVarChar, slug);
    let query = 'SELECT * FROM Businesses WHERE village_id = @vid AND slug = @slug';
    if (!includeUnpublished) query += ' AND is_published = 1';

    const result = await req.query(query);
    const business = result.recordset[0];
    if (!business) return null;

    business.products = await getBusinessProducts(villageId, business.id);
    business.tabs = await getBusinessTabs(villageId, business.id);
    return business;
}

async function getBusinessById(villageId, id) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('id', sql.Int, id)
        .query('SELECT * FROM Businesses WHERE village_id = @vid AND id = @id');
    const business = result.recordset[0];
    if (!business) return null;

    business.products = await getBusinessProducts(villageId, business.id);
    return business;
}

async function createBusiness(villageId, data) {
    const pool = await poolPromise;
    const slug = await generateUniqueBusinessSlug(villageId, data.name);

    const result = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('slug', sql.NVarChar, slug)
        .input('name', sql.NVarChar, data.name || '')
        .input('name_gu', sql.NVarChar, data.name_gu || '')
        .input('category', sql.NVarChar, data.category || '')
        .input('description', sql.NVarChar, data.description || '')
        .input('description_gu', sql.NVarChar, data.description_gu || '')
        .input('owner_name', sql.NVarChar, data.owner_name || '')
        .input('phone', sql.NVarChar, data.phone || '')
        .input('email', sql.NVarChar, data.email || '')
        .input('address', sql.NVarChar, data.address || '')
        .input('website', sql.NVarChar, data.website || '')
        .input('logo_url', sql.NVarChar, data.logo_url || '')
        .input('cover_url', sql.NVarChar, data.cover_url || '')
        .input('is_published', sql.Int, data.is_published === false ? 0 : 1)
        .query(`
            INSERT INTO Businesses (village_id, slug, name, name_gu, category, description, description_gu, owner_name, phone, email, address, website, logo_url, cover_url, is_published)
            VALUES (@vid, @slug, @name, @name_gu, @category, @description, @description_gu, @owner_name, @phone, @email, @address, @website, @logo_url, @cover_url, @is_published);
            SELECT * FROM Businesses WHERE id = last_insert_rowid();
        `);

    return result.recordset[0];
}

async function updateBusiness(villageId, id, data) {
    const pool = await poolPromise;
    const slug = await generateUniqueBusinessSlug(villageId, data.name, id);

    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('id', sql.Int, id)
        .input('slug', sql.NVarChar, slug)
        .input('name', sql.NVarChar, data.name || '')
        .input('name_gu', sql.NVarChar, data.name_gu || '')
        .input('category', sql.NVarChar, data.category || '')
        .input('description', sql.NVarChar, data.description || '')
        .input('description_gu', sql.NVarChar, data.description_gu || '')
        .input('owner_name', sql.NVarChar, data.owner_name || '')
        .input('phone', sql.NVarChar, data.phone || '')
        .input('email', sql.NVarChar, data.email || '')
        .input('address', sql.NVarChar, data.address || '')
        .input('website', sql.NVarChar, data.website || '')
        .input('logo_url', sql.NVarChar, data.logo_url || '')
        .input('cover_url', sql.NVarChar, data.cover_url || '')
        .input('is_published', sql.Int, data.is_published === false ? 0 : 1)
        .query(`
            UPDATE Businesses SET
                slug = @slug, name = @name, name_gu = @name_gu, category = @category,
                description = @description, description_gu = @description_gu,
                owner_name = @owner_name, phone = @phone, email = @email, address = @address,
                website = @website, logo_url = @logo_url, cover_url = @cover_url, is_published = @is_published
            WHERE village_id = @vid AND id = @id
        `);
}

async function deleteBusiness(villageId, id) {
    const pool = await poolPromise;
    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('id', sql.Int, id)
        .query('DELETE FROM Businesses WHERE village_id = @vid AND id = @id');
}

async function updateBusinessProducts(villageId, businessId, products) {
    const pool = await poolPromise;

    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('bid', sql.Int, businessId)
        .query('DELETE FROM BusinessProducts WHERE village_id = @vid AND business_id = @bid');

    for (let i = 0; i < products.length; i++) {
        const item = products[i];
        await pool.request()
            .input('vid', sql.Int, villageId)
            .input('bid', sql.Int, businessId)
            .input('name', sql.NVarChar, item.name || '')
            .input('name_gu', sql.NVarChar, item.name_gu || '')
            .input('description', sql.NVarChar, item.description || '')
            .input('price', sql.NVarChar, item.price || '')
            .input('image_url', sql.NVarChar, item.image_url || '')
            .input('display_order', sql.Int, i)
            .query(`
                INSERT INTO BusinessProducts (village_id, business_id, name, name_gu, description, price, image_url, display_order)
                VALUES (@vid, @bid, @name, @name_gu, @description, @price, @image_url, @display_order)
            `);
    }
}

// Business Tabs helpers — custom, Page-Builder-style tabs on a business's
// profile (in addition to the built-in Overview/Products/Contact tabs).
async function generateUniqueBusinessTabSlug(villageId, businessId, title, excludeId) {
    const pool = await poolPromise;
    const base = slugify(title);
    let candidate = base;
    let n = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const req = pool.request()
            .input('vid', sql.Int, villageId)
            .input('bid', sql.Int, businessId)
            .input('slug', sql.NVarChar, candidate);
        let query = 'SELECT id FROM BusinessPages WHERE village_id = @vid AND business_id = @bid AND slug = @slug';
        if (excludeId) {
            req.input('excludeId', sql.Int, excludeId);
            query += ' AND id != @excludeId';
        }
        const result = await req.query(query);
        if (result.recordset.length === 0) return candidate;
        n += 1;
        candidate = `${base}-${n}`;
    }
}

async function getBusinessTabs(villageId, businessId) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('bid', sql.Int, businessId)
        .query('SELECT id, title, slug, display_order FROM BusinessPages WHERE village_id = @vid AND business_id = @bid ORDER BY display_order');
    return result.recordset;
}

async function getBusinessTabBySlug(villageId, businessId, slug) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('bid', sql.Int, businessId)
        .input('slug', sql.NVarChar, slug)
        .query('SELECT * FROM BusinessPages WHERE village_id = @vid AND business_id = @bid AND slug = @slug');
    const tab = result.recordset[0];
    if (!tab) return null;
    tab.content_json = tab.content_json ? JSON.parse(tab.content_json) : [];
    return tab;
}

async function getBusinessTabById(villageId, businessId, id) {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('bid', sql.Int, businessId)
        .input('id', sql.Int, id)
        .query('SELECT * FROM BusinessPages WHERE village_id = @vid AND business_id = @bid AND id = @id');
    const tab = result.recordset[0];
    if (!tab) return null;
    tab.content_json = tab.content_json ? JSON.parse(tab.content_json) : [];
    return tab;
}

async function createBusinessTab(villageId, businessId, data) {
    const pool = await poolPromise;
    const slug = await generateUniqueBusinessTabSlug(villageId, businessId, data.title);

    const countRes = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('bid', sql.Int, businessId)
        .query('SELECT COUNT(*) AS cnt FROM BusinessPages WHERE village_id = @vid AND business_id = @bid');
    const order = countRes.recordset[0]?.cnt ?? 0;

    const result = await pool.request()
        .input('vid', sql.Int, villageId)
        .input('bid', sql.Int, businessId)
        .input('title', sql.NVarChar, data.title || 'New Tab')
        .input('slug', sql.NVarChar, slug)
        .input('content_json', sql.NVarChar, JSON.stringify(data.content_json || []))
        .input('display_order', sql.Int, order)
        .query(`
            INSERT INTO BusinessPages (village_id, business_id, title, slug, content_json, display_order)
            VALUES (@vid, @bid, @title, @slug, @content_json, @display_order);
            SELECT * FROM BusinessPages WHERE id = last_insert_rowid();
        `);

    const tab = result.recordset[0];
    tab.content_json = JSON.parse(tab.content_json);
    return tab;
}

async function updateBusinessTab(villageId, businessId, id, data) {
    const pool = await poolPromise;
    const slug = await generateUniqueBusinessTabSlug(villageId, businessId, data.title, id);

    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('bid', sql.Int, businessId)
        .input('id', sql.Int, id)
        .input('title', sql.NVarChar, data.title || 'New Tab')
        .input('slug', sql.NVarChar, slug)
        .input('content_json', sql.NVarChar, JSON.stringify(data.content_json || []))
        .query(`
            UPDATE BusinessPages SET title = @title, slug = @slug, content_json = @content_json
            WHERE village_id = @vid AND business_id = @bid AND id = @id
        `);
}

async function deleteBusinessTab(villageId, businessId, id) {
    const pool = await poolPromise;
    await pool.request()
        .input('vid', sql.Int, villageId)
        .input('bid', sql.Int, businessId)
        .input('id', sql.Int, id)
        .query('DELETE FROM BusinessPages WHERE village_id = @vid AND business_id = @bid AND id = @id');
}

async function reorderBusinessTabs(villageId, businessId, orderedIds) {
    const pool = await poolPromise;
    for (let i = 0; i < orderedIds.length; i++) {
        await pool.request()
            .input('vid', sql.Int, villageId)
            .input('bid', sql.Int, businessId)
            .input('id', sql.Int, orderedIds[i])
            .input('order', sql.Int, i)
            .query('UPDATE BusinessPages SET display_order = @order WHERE village_id = @vid AND business_id = @bid AND id = @id');
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
};

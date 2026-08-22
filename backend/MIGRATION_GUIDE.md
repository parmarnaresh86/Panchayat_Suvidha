# Migration Guide: JSON to SQL Database

This guide explains how to migrate from JSON file storage to SQL Server database for all module data.

## Overview

The project currently uses a hybrid approach:
- **Primary Database (SQL Server)**: Village, Census, Panchayat data
- **Secondary Storage (JSON files)**: Services, Education, Employment, Facilities modules

This migration moves ALL data to SQL Server, eliminating JSON file dependencies.

## Step 1: Update Database Schema

Run the updated `schema.sql` file against your SQL Server database. The new tables include:

- `Services` - Service categories
- `ServiceItems` - Individual service items
- `EducationModules` - Education module basic info
- `EducationRecords` - Staff, students, books records
- `EducationAnnouncements` - Announcements per module
- `EmploymentModules` - Employment module basic info
- `EmploymentRecords` - Jobs, livestock, market data
- `FacilitiesModules` - Facilities module basic info
- `FacilitiesRecords` - Bus routes, water supply schedules

```bash
# Run the schema against your database
sqlcmd -S your_server -d your_database -i backend/schema.sql
```

## Step 2: Migrate Existing Data

Run the migration script to move data from JSON files to SQL:

```bash
cd backend
node migrate-json-to-sql.js
```

This script will:
1. Read all JSON files (services-data.json, education-modules-data.json, etc.)
2. Insert data into the new SQL tables
3. Preserve all existing data

## Step 3: Update server.js

The `server.js` file needs to be updated to use SQL queries instead of JSON file operations.

### Key Changes Required:

#### 1. Add db-helpers import (already done)
```javascript
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
```

#### 2. Remove JSON file loading code
Delete lines 54-742 (all the JSON loading, normalization functions, and in-memory data)

#### 3. Update Services Routes

**GET /services** (line ~984)
```javascript
// OLD:
app.get('/services', async (req, res) => {
    try {
        res.json(servicesData?.services ?? []);
    } catch (err) {
        res.json([]);
    }
});

// NEW:
app.get('/services', async (req, res) => {
    try {
        const services = await getServices();
        res.json(services);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.json([]);
    }
});
```

**POST /services/update** (line ~993)
```javascript
// OLD:
app.post('/services/update', async (req, res) => {
    try {
        const incoming = req.body?.services ?? req.body;
        // ... normalization code ...
        servicesData = { services: normalized };
        await fs.outputJson(SERVICES_DATA_PATH, servicesData, { spaces: 2 });
        res.json({ message: 'Services updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update services' });
    }
});

// NEW:
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
```

#### 4. Update Education Module Routes

**GET /education/modules/:moduleId** (line ~1024)
```javascript
// OLD:
app.get('/education/modules/:moduleId', async (req, res) => {
    try {
        const moduleId = toSafeString(req.params?.moduleId);
        const moduleData = educationModulesData.modules[moduleId] || getDefaultEducationModuleData(moduleId);
        res.json(moduleData);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch module data' });
    }
});

// NEW:
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
```

**POST /education/modules/:moduleId/update** (line ~1036)
```javascript
// OLD:
app.post('/education/modules/:moduleId/update', async (req, res) => {
    try {
        const moduleId = toSafeString(req.params?.moduleId);
        const incoming = req.body?.data ?? req.body;
        const normalized = normalizeEducationModuleData(moduleId, incoming);
        educationModulesData.modules[moduleId] = normalized;
        await fs.outputJson(EDUCATION_MODULES_DATA_PATH, educationModulesData, { spaces: 2 });
        res.json({ message: 'Module updated successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update module' });
    }
});

// NEW:
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
```

#### 5. Update Employment Module Routes

**GET /employment/modules/:moduleId** (line ~1079)
```javascript
// NEW:
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
```

**POST /employment/modules/:moduleId/update** (line ~1091)
```javascript
// NEW:
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
```

#### 6. Update Facilities Module Routes

**GET /facilities/modules/:moduleId** (line ~1131)
```javascript
// NEW:
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
```

**POST /facilities/modules/:moduleId/update** (line ~1143)
```javascript
// NEW:
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
```

#### 7. Remove Primary School Routes (Deprecated)

The `/education/primary-school` routes (lines ~1162-1204) can be removed as primary school is now handled through `/education/modules/primary-school`.

## Step 4: Test the Migration

1. Start the server:
```bash
cd backend
npm start
```

2. Test each endpoint:
```bash
# Test services
curl http://localhost:5000/services

# Test education modules
curl http://localhost:5000/education/modules/primary-school
curl http://localhost:5000/education/modules/anganwadi
curl http://localhost:5000/education/modules/library

# Test employment modules
curl http://localhost:5000/employment/modules/animal-husbandry-and-dairy
curl http://localhost:5000/employment/modules/employment-board
curl http://localhost:5000/employment/modules/market-yard

# Test facilities modules
curl http://localhost:5000/facilities/modules/pgvcl-electric-service
curl http://localhost:5000/facilities/modules/st-bus-timetable
curl http://localhost:5000/facilities/modules/water-supply
curl http://localhost:5000/facilities/modules/health-center
```

## Step 5: Clean Up

After verifying everything works:

1. Backup JSON files:
```bash
mkdir backend/json-backup
mv backend/*.json backend/json-backup/
```

2. Remove unused dependencies from package.json (optional):
   - `fs-extra` is still used for file uploads, so keep it

3. Update documentation

## Rollback Plan

If you need to rollback:

1. Restore `server.js` from backup:
```bash
cp backend/server.js.backup backend/server.js
```

2. Restore JSON files:
```bash
cp backend/json-backup/*.json backend/
```

3. Restart the server

## Benefits of This Migration

1. **Single Source of Truth**: All data in SQL Server
2. **Better Data Integrity**: Foreign key constraints, transactions
3. **Improved Performance**: SQL queries vs file I/O
4. **Easier Backup**: Single database backup instead of multiple files
5. **Better Scalability**: SQL Server handles concurrent access better
6. **Simpler Deployment**: No need to manage JSON file state

## Notes

- The migration script uses `IF NOT EXISTS` checks, so it's safe to run multiple times
- All existing data is preserved during migration
- The frontend requires no changes - API contracts remain the same
- File uploads (photos, documents) still use the filesystem (`backend/uploads/`)

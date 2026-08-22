/**
 * This script automatically updates server.js to use SQL database instead of JSON files
 * Run this after:
 * 1. Running the updated schema.sql
 * 2. Running migrate-json-to-sql.js
 */

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, 'server.js');
const backupPath = path.join(__dirname, 'server.js.backup');

console.log('Starting server.js migration to SQL...\n');

// Read the current server.js
let content = fs.readFileSync(serverPath, 'utf-8');

// Create backup if it doesn't exist
if (!fs.existsSync(backupPath)) {
    fs.writeFileSync(backupPath, content);
    console.log('✓ Created backup at server.js.backup');
}

// 1. Add db-helpers import after the db import
const dbImportRegex = /const { sql, poolPromise } = require\('\.\/db'\);/;
const dbHelpersImport = `const { sql, poolPromise } = require('./db');
const {
    getServices,
    updateServices,
    getEducationModule,
    updateEducationModule,
    getEmploymentModule,
    updateEmploymentModule,
    getFacilitiesModule,
    updateFacilitiesModule
} = require('./db-helpers');`;

content = content.replace(dbImportRegex, dbHelpersImport);
console.log('✓ Added db-helpers import');

// 2. Remove JSON file loading code (from PRIMARY_SCHOOL_DATA_PATH to before multer config)
const jsonLoadingStart = /const PRIMARY_SCHOOL_DATA_PATH = path\.join\(__dirname, 'primary-school-data\.json'\);/;
const jsonLoadingEnd = /\/\/ Configure Multer for File Uploads/;

const startMatch = content.match(jsonLoadingStart);
const endMatch = content.match(jsonLoadingEnd);

if (startMatch && endMatch) {
    const startIndex = content.indexOf(startMatch[0]);
    const endIndex = content.indexOf(endMatch[0]);
    
    // Keep only the multer comment and everything after
    content = content.substring(0, startIndex) + content.substring(endIndex);
    console.log('✓ Removed JSON file loading code');
}

// 3. Update GET /services route
content = content.replace(
    /app\.get\('\/services', async \(req, res\) => \{[\s\S]*?try \{[\s\S]*?res\.json\(servicesData\?\.services \?\? \[\]\);[\s\S]*?\} catch[\s\S]*?\}\s*\}\);/,
    `app.get('/services', async (req, res) => {
    try {
        const services = await getServices();
        res.json(services);
    } catch (err) {
        console.error('Error fetching services:', err);
        res.json([]);
    }
});`
);
console.log('✓ Updated GET /services route');

// 4. Update POST /services/update route
const servicesUpdateRegex = /app\.post\('\/services\/update',[\s\S]*?try \{[\s\S]*?servicesData = \{ services: normalized \};[\s\S]*?await fs\.outputJson\(SERVICES_DATA_PATH[\s\S]*?\);[\s\S]*?res\.json\(\{ message: 'Services updated successfully' \}\);[\s\S]*?\} catch[\s\S]*?\}\s*\}\);/;

content = content.replace(
    servicesUpdateRegex,
    `app.post('/services/update', async (req, res) => {
    try {
        const incoming = req.body?.services ?? req.body;
        const services = Array.isArray(incoming) ? incoming : [];
        await updateServices(services);
        res.json({ message: 'Services updated successfully' });
    } catch (err) {
        console.error('Error updating services:', err);
        res.status(500).json({ error: 'Failed to update services' });
    }
});`
);
console.log('✓ Updated POST /services/update route');

// 5. Update GET /education/modules/:moduleId route
content = content.replace(
    /app\.get\('\/education\/modules\/:moduleId', async \(req, res\) => \{[\s\S]*?const moduleData = educationModulesData\.modules\[moduleId\][\s\S]*?res\.json\(moduleData\);[\s\S]*?\} catch[\s\S]*?\}\s*\}\);/,
    `app.get('/education/modules/:moduleId', async (req, res) => {
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
});`
);
console.log('✓ Updated GET /education/modules/:moduleId route');

// 6. Update POST /education/modules/:moduleId/update route
content = content.replace(
    /app\.post\('\/education\/modules\/:moduleId\/update', async \(req, res\) => \{[\s\S]*?educationModulesData\.modules\[moduleId\] = normalized;[\s\S]*?await fs\.outputJson\(EDUCATION_MODULES_DATA_PATH[\s\S]*?\);[\s\S]*?res\.json\(\{ message: 'Module updated successfully' \}\);[\s\S]*?\} catch[\s\S]*?\}\s*\}\);/,
    `app.post('/education/modules/:moduleId/update', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const data = req.body?.data ?? req.body;
        await updateEducationModule(moduleId, data);
        res.json({ message: 'Module updated successfully' });
    } catch (err) {
        console.error('Error updating education module:', err);
        res.status(500).json({ error: 'Failed to update module' });
    }
});`
);
console.log('✓ Updated POST /education/modules/:moduleId/update route');

// 7. Update GET /employment/modules/:moduleId route
content = content.replace(
    /app\.get\('\/employment\/modules\/:moduleId', async \(req, res\) => \{[\s\S]*?const moduleData = employmentModulesData\.modules\[moduleId\][\s\S]*?res\.json\(moduleData\);[\s\S]*?\} catch[\s\S]*?\}\s*\}\);/,
    `app.get('/employment/modules/:moduleId', async (req, res) => {
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
});`
);
console.log('✓ Updated GET /employment/modules/:moduleId route');

// 8. Update POST /employment/modules/:moduleId/update route
content = content.replace(
    /app\.post\('\/employment\/modules\/:moduleId\/update', async \(req, res\) => \{[\s\S]*?employmentModulesData\.modules\[moduleId\] = normalized;[\s\S]*?await fs\.outputJson\(EMPLOYMENT_MODULES_DATA_PATH[\s\S]*?\);[\s\S]*?res\.json\(\{ message: 'Module updated successfully' \}\);[\s\S]*?\} catch[\s\S]*?\}\s*\}\);/,
    `app.post('/employment/modules/:moduleId/update', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const data = req.body?.data ?? req.body;
        await updateEmploymentModule(moduleId, data);
        res.json({ message: 'Module updated successfully' });
    } catch (err) {
        console.error('Error updating employment module:', err);
        res.status(500).json({ error: 'Failed to update module' });
    }
});`
);
console.log('✓ Updated POST /employment/modules/:moduleId/update route');

// 9. Update GET /facilities/modules/:moduleId route
content = content.replace(
    /app\.get\('\/facilities\/modules\/:moduleId', async \(req, res\) => \{[\s\S]*?const moduleData = facilitiesModulesData\.modules\[moduleId\][\s\S]*?res\.json\(moduleData\);[\s\S]*?\} catch[\s\S]*?\}\s*\}\);/,
    `app.get('/facilities/modules/:moduleId', async (req, res) => {
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
});`
);
console.log('✓ Updated GET /facilities/modules/:moduleId route');

// 10. Update POST /facilities/modules/:moduleId/update route
content = content.replace(
    /app\.post\('\/facilities\/modules\/:moduleId\/update', async \(req, res\) => \{[\s\S]*?facilitiesModulesData\.modules\[moduleId\] = normalized;[\s\S]*?await fs\.outputJson\(FACILITIES_MODULES_DATA_PATH[\s\S]*?\);[\s\S]*?res\.json\(\{ message: 'Module updated successfully' \}\);[\s\S]*?\} catch[\s\S]*?\}\s*\}\);/,
    `app.post('/facilities/modules/:moduleId/update', async (req, res) => {
    try {
        const moduleId = req.params.moduleId;
        const data = req.body?.data ?? req.body;
        await updateFacilitiesModule(moduleId, data);
        res.json({ message: 'Module updated successfully' });
    } catch (err) {
        console.error('Error updating facilities module:', err);
        res.status(500).json({ error: 'Failed to update module' });
    }
});`
);
console.log('✓ Updated POST /facilities/modules/:moduleId/update route');

// Write the updated content
fs.writeFileSync(serverPath, content);

console.log('\n✓ Migration complete!');
console.log('\nNext steps:');
console.log('1. Review the changes in server.js');
console.log('2. Test the server: npm start');
console.log('3. If issues occur, restore from server.js.backup');

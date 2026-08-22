# JSON to SQL Migration

This directory contains everything needed to migrate from JSON file storage to SQL Server database.

## Quick Start

Follow these steps in order:

### 1. Update Database Schema

```bash
# Connect to your SQL Server and run the schema
sqlcmd -S your_server -d your_database -U your_user -P your_password -i schema.sql
```

Or use SQL Server Management Studio to execute `schema.sql`.

### 2. Migrate Data

```bash
cd backend
node migrate-json-to-sql.js
```

This will:
- Read all JSON files (services-data.json, education-modules-data.json, etc.)
- Insert data into SQL Server tables
- Preserve all existing data
- Show progress and completion status

### 3. Update Server Code

**Option A: Automatic (Recommended)**
```bash
node apply-sql-migration.js
```

This script automatically updates `server.js` to use SQL queries instead of JSON files.

**Option B: Manual**
Follow the detailed instructions in `MIGRATION_GUIDE.md`.

### 4. Test

```bash
npm start
```

Test all endpoints to ensure data is being read from SQL correctly.

### 5. Backup and Clean Up

```bash
# Create backup directory
mkdir json-backup

# Move JSON files to backup
mv *.json json-backup/
# Keep package.json and package-lock.json
mv json-backup/package*.json .
```

## Files

- `schema.sql` - Updated database schema with new tables
- `migrate-json-to-sql.js` - Data migration script
- `apply-sql-migration.js` - Automatic server.js updater
- `db-helpers.js` - Database helper functions
- `MIGRATION_GUIDE.md` - Detailed migration guide
- `MIGRATION_README.md` - This file

## New Database Tables

### Services
- `Services` - Service categories (education, employment, facilities, admin)
- `ServiceItems` - Individual service items within each category

### Education Modules
- `EducationModules` - Basic info and map data for each module
- `EducationRecords` - Staff, students, books (depending on module)
- `EducationAnnouncements` - Announcements per module

### Employment Modules
- `EmploymentModules` - Basic info for each module
- `EmploymentRecords` - Jobs, livestock, market data (typed by record_type)

### Facilities Modules
- `FacilitiesModules` - Basic info for each module
- `FacilitiesRecords` - Bus routes, water schedules (typed by record_type)

## API Changes

**None!** The API contracts remain exactly the same. The frontend requires no changes.

## Rollback

If you need to rollback:

```bash
# Restore server.js
cp server.js.backup server.js

# Restore JSON files
cp json-backup/*.json .

# Restart server
npm start
```

## Benefits

1. **Single Source of Truth** - All data in SQL Server
2. **Data Integrity** - Foreign key constraints, transactions
3. **Better Performance** - SQL queries vs file I/O
4. **Easier Backup** - Single database backup
5. **Better Scalability** - Handles concurrent access better
6. **Simpler Deployment** - No JSON file state management

## Troubleshooting

### Migration script fails
- Check database connection in `.env`
- Ensure schema.sql was run successfully
- Check SQL Server permissions

### Server won't start after migration
- Check for syntax errors in server.js
- Restore from server.js.backup if needed
- Check console for error messages

### Data is missing
- Verify migration script completed successfully
- Check SQL Server tables have data
- Restore JSON files from backup if needed

### API returns 404 or empty data
- Check module IDs match expected values
- Verify data was migrated correctly
- Check database helper functions are imported

## Support

For issues or questions, refer to:
1. `MIGRATION_GUIDE.md` for detailed instructions
2. `db-helpers.js` for database function implementations
3. Server logs for error messages

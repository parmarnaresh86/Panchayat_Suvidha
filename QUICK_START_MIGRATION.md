# Quick Start: JSON to SQL Migration

## What This Does

Migrates your PanchayatSuvidha project from using JSON files for module data to storing everything in SQL Server database.

## Why Migrate?

- ✅ Single source of truth (all data in SQL)
- ✅ Better data integrity (foreign keys, transactions)
- ✅ Improved performance (SQL queries vs file I/O)
- ✅ Easier backups (one database backup)
- ✅ Better scalability (concurrent access)
- ✅ Simpler deployment (no JSON file management)

## Before You Start

1. **Backup everything**
   ```bash
   # Backup database
   # Use SQL Server Management Studio or:
   sqlcmd -S your_server -Q "BACKUP DATABASE your_database TO DISK='backup.bak'"
   
   # Backup JSON files
   cd backend
   mkdir json-backup
   cp *.json json-backup/
   ```

2. **Verify database connection**
   ```bash
   cd backend
   node -e "require('./db').poolPromise.then(() => console.log('✓ Connected')).catch(e => console.error('✗ Failed:', e))"
   ```

## Migration (3 Simple Steps)

### Step 1: Update Database Schema (1 minute)

```bash
cd backend
sqlcmd -S your_server -d your_database -U your_user -P your_password -i schema.sql
```

Or open `backend/schema.sql` in SQL Server Management Studio and execute it.

### Step 2: Migrate Data (1 minute)

```bash
npm run migrate:data
```

This reads your JSON files and inserts data into SQL Server.

### Step 3: Update Server Code (1 minute)

```bash
npm run migrate:server
```

This automatically updates `server.js` to use SQL queries instead of JSON files.

## Test (2 minutes)

```bash
# Start backend
npm start

# In another terminal, start frontend
cd ../frontend
npm run dev
```

Visit http://localhost:5173 and test:
- Browse services
- View education modules
- Check employment modules
- Test facilities modules
- Try admin dashboard (if you have admin access)

## Verify (30 seconds)

```bash
npm run migrate:verify
```

This checks that all data was migrated successfully.

## Done! 🎉

If everything works:
1. Keep using the application normally
2. After a few days, move JSON files to backup:
   ```bash
   cd backend
   mkdir json-backup
   mv *.json json-backup/
   mv json-backup/package*.json .
   ```

## If Something Goes Wrong

**Rollback in 30 seconds:**

```bash
cd backend
cp server.js.backup server.js
cp json-backup/*.json .
npm start
```

Then check `backend/MIGRATION_CHECKLIST.md` for troubleshooting.

## All-in-One Command

If you're feeling confident:

```bash
cd backend
npm run migrate:all
```

This runs all three steps automatically.

## Need More Details?

- **Quick reference**: `backend/MIGRATION_README.md`
- **Detailed guide**: `backend/MIGRATION_GUIDE.md`
- **Step-by-step checklist**: `backend/MIGRATION_CHECKLIST.md`
- **Technical summary**: `MIGRATION_SUMMARY.md`

## What Changed?

### Before
```
Data Storage:
├── SQL Server (village, census, panchayat)
└── JSON Files (services, education, employment, facilities)
```

### After
```
Data Storage:
└── SQL Server (everything!)
```

### API
No changes! All endpoints work exactly the same.

### Frontend
No changes needed!

## Support

If you encounter issues:
1. Check the detailed guides in `backend/`
2. Review server logs for errors
3. Use the rollback procedure above
4. Check database connection and permissions

## Files Created

- `backend/schema.sql` - Updated with new tables
- `backend/migrate-json-to-sql.js` - Data migration script
- `backend/db-helpers.js` - Database helper functions
- `backend/apply-sql-migration.js` - Server updater
- `backend/verify-migration.js` - Verification script
- `backend/server.js.backup` - Original server.js
- Documentation files (guides, checklists, etc.)

## Time Required

- **Preparation**: 5 minutes
- **Migration**: 3 minutes
- **Testing**: 5 minutes
- **Total**: ~15 minutes

## Risk Level

**Low** - Automatic backup created, easy rollback, no frontend changes.

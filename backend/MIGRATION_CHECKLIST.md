# Migration Checklist

Use this checklist to ensure a smooth migration from JSON to SQL storage.

## Pre-Migration

- [ ] Backup your database
- [ ] Backup all JSON files
  ```bash
  mkdir json-backup
  cp *.json json-backup/
  ```
- [ ] Ensure `.env` file has correct database credentials
- [ ] Test database connection
  ```bash
  node -e "require('./db').poolPromise.then(() => console.log('✓ Connected')).catch(e => console.error('✗ Failed:', e))"
  ```

## Migration Steps

### Step 1: Update Database Schema
- [ ] Review `schema.sql` for new tables
- [ ] Run schema against your database
  ```bash
  sqlcmd -S your_server -d your_database -U your_user -P your_password -i schema.sql
  ```
  Or use SQL Server Management Studio
- [ ] Verify tables were created
  ```sql
  SELECT name FROM sys.tables WHERE name IN (
    'Services', 'ServiceItems', 
    'EducationModules', 'EducationRecords', 'EducationAnnouncements',
    'EmploymentModules', 'EmploymentRecords',
    'FacilitiesModules', 'FacilitiesRecords'
  )
  ```

### Step 2: Migrate Data
- [ ] Run migration script
  ```bash
  npm run migrate:data
  ```
  Or:
  ```bash
  node migrate-json-to-sql.js
  ```
- [ ] Check for errors in output
- [ ] Verify data was migrated
  ```bash
  npm run migrate:verify
  ```
  Or:
  ```bash
  node verify-migration.js
  ```

### Step 3: Update Server Code
- [ ] Review `apply-sql-migration.js` to understand changes
- [ ] Run automatic migration
  ```bash
  npm run migrate:server
  ```
  Or:
  ```bash
  node apply-sql-migration.js
  ```
- [ ] Verify `server.js.backup` was created
- [ ] Review changes in `server.js`

### Step 4: Test
- [ ] Start the server
  ```bash
  npm start
  ```
- [ ] Check for startup errors
- [ ] Test each endpoint:

#### Services
- [ ] GET http://localhost:5000/services
- [ ] POST http://localhost:5000/services/update (admin)

#### Education Modules
- [ ] GET http://localhost:5000/education/modules/primary-school
- [ ] GET http://localhost:5000/education/modules/anganwadi
- [ ] GET http://localhost:5000/education/modules/library
- [ ] POST http://localhost:5000/education/modules/primary-school/update (admin)

#### Employment Modules
- [ ] GET http://localhost:5000/employment/modules/animal-husbandry-and-dairy
- [ ] GET http://localhost:5000/employment/modules/employment-board
- [ ] GET http://localhost:5000/employment/modules/market-yard
- [ ] POST http://localhost:5000/employment/modules/employment-board/update (admin)

#### Facilities Modules
- [ ] GET http://localhost:5000/facilities/modules/pgvcl-electric-service
- [ ] GET http://localhost:5000/facilities/modules/st-bus-timetable
- [ ] GET http://localhost:5000/facilities/modules/water-supply
- [ ] GET http://localhost:5000/facilities/modules/health-center
- [ ] POST http://localhost:5000/facilities/modules/water-supply/update (admin)

### Step 5: Frontend Testing
- [ ] Start frontend
  ```bash
  cd ../frontend
  npm run dev
  ```
- [ ] Test all pages load correctly
- [ ] Test admin dashboard
- [ ] Test editing modules
- [ ] Test file uploads
- [ ] Test all service pages

### Step 6: Clean Up
- [ ] Verify everything works for at least 24 hours
- [ ] Move JSON files to backup
  ```bash
  mkdir json-backup
  mv *.json json-backup/
  # Keep package.json
  mv json-backup/package*.json .
  ```
- [ ] Update deployment scripts if needed
- [ ] Update documentation

## Rollback (If Needed)

If something goes wrong:

- [ ] Stop the server
- [ ] Restore server.js
  ```bash
  cp server.js.backup server.js
  ```
- [ ] Restore JSON files
  ```bash
  cp json-backup/*.json .
  ```
- [ ] Restart server
  ```bash
  npm start
  ```
- [ ] Investigate issues
- [ ] Fix and retry migration

## Post-Migration

- [ ] Monitor server logs for errors
- [ ] Monitor database performance
- [ ] Update team documentation
- [ ] Update deployment procedures
- [ ] Schedule regular database backups
- [ ] Remove `server.js.backup` after 1 week of stable operation
- [ ] Remove `json-backup/` directory after 1 month

## Troubleshooting

### Migration script fails
- Check database connection in `.env`
- Ensure schema.sql was run successfully
- Check SQL Server permissions
- Check JSON files exist and are valid

### Server won't start
- Check for syntax errors in server.js
- Restore from server.js.backup
- Check console for error messages
- Verify db-helpers.js exists

### Data is missing
- Run verify-migration.js
- Check SQL Server tables have data
- Re-run migration script (safe to run multiple times)

### API returns 404 or empty data
- Check module IDs match expected values
- Verify data was migrated correctly
- Check database helper functions are imported
- Check SQL Server connection

### Frontend shows errors
- Check browser console for errors
- Verify API endpoints return correct data structure
- Check network tab for failed requests
- Verify CORS is configured correctly

## Success Criteria

✓ All tables created successfully
✓ All data migrated from JSON to SQL
✓ Server starts without errors
✓ All API endpoints return correct data
✓ Frontend loads and functions correctly
✓ Admin can edit modules
✓ File uploads work
✓ No console errors

## Support

For help:
1. Check `MIGRATION_GUIDE.md` for detailed instructions
2. Check `MIGRATION_README.md` for quick reference
3. Review server logs for specific errors
4. Check database connection and permissions

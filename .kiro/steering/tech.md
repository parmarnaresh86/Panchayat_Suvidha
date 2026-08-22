# Tech Stack

## Frontend
- React 19.2.4 with Vite 8.0.1
- React Router DOM v7.13.1 (client-side routing)
- Tailwind CSS v4.2.2 (via `@tailwindcss/vite` plugin — no separate postcss config needed)
- Axios v1.13.6 for HTTP requests (configured instance at `frontend/src/api/axios.js`)
- lucide-react v0.577.0 — primary icon set
- react-icons v5.6.0 — supplementary icons
- @dnd-kit/core v6.3.1, @dnd-kit/sortable v10.0.0, @dnd-kit/utilities v3.2.2 — drag and drop (Live Page Editor)
- ESM modules (`"type": "module"`)

## Backend
- Node.js with Express 5.2.1 (CommonJS modules — `"type": "commonjs"`)
- Microsoft SQL Server via `mssql` v12.2.1 — connection pool via `backend/db.js`
- `jsonwebtoken` v9.0.3 for auth (currently dummy tokens, wired for real JWT)
- `multer` v2.1.1 for file uploads (stored in `backend/uploads/`)
- `fs-extra` v11.3.4 for JSON file-based data storage
- `cors` v2.8.6 — allows frontend (port 5173) to call backend (port 5000)
- `dotenv` v17.3.1 for environment config
- `nodemon` v3.1.14 for dev auto-restart

## Database
- Microsoft SQL Server (MSSQL) — connection pool via `backend/db.js`
- Core Tables: Village, VillageImages, Census, PanchayatMembers, Achievements, SpecialPersonalities, Users, Pages, PageContent
- Module Tables: Services, ServiceItems, EducationModules, EducationRecords, EducationAnnouncements, EmploymentModules, EmploymentRecords, FacilitiesModules, FacilitiesRecords
- All data is stored in SQL Server — no JSON file dependencies for module data

## Environment Variables
- `backend/.env`: `DB_USER`, `DB_PASSWORD`, `DB_SERVER`, `DB_NAME`, `DB_PORT`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `ADMIN_REGISTRATION_SECRET`, `PORT`
- `frontend/.env`: `VITE_API_URL` (defaults to `http://localhost:5000`)

## Common Commands

### Frontend
```bash
cd frontend
npm run dev        # Start dev server (port 5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

### Backend
```bash
cd backend
npm start          # Start with nodemon (auto-restart, port 5000)
```

### Database
- Schema is defined in `backend/schema.sql` — run manually against your MSSQL instance
- Seed data via `backend/seed.js`

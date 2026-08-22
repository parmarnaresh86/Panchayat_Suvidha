# Project Structure

```
/
├── backend/                        # Express API server
│   ├── server.js                   # Main server, all API routes defined here
│   ├── db.js                       # MSSQL connection pool
│   ├── db-helpers.js               # Database helper functions for modules
│   ├── schema.sql                  # Database schema (run manually)
│   ├── seed.js                     # DB seed script
│   ├── migrate-json-to-sql.js      # Migration script from JSON to SQL
│   ├── .env                        # Backend environment variables
│   └── uploads/                    # Multer file upload destination
│
└── frontend/                       # React + Vite SPA
    ├── index.html
    ├── vite.config.js
    ├── public/                     # Static assets (images, icons, logo)
    └── src/
        ├── App.jsx                 # Root component, all routes defined here
        ├── main.jsx                # React entry point (wraps app in LanguageProvider + PageEditProvider)
        ├── index.css / App.css
        ├── api/
        │   └── axios.js            # Configured Axios instance (baseURL from VITE_API_URL)
        ├── components/             # Shared/reusable UI components
        │   └── editor/             # Live Page Editor components
        │       ├── EditableSection.jsx   # dnd-kit sortable wrapper with drag handle
        │       ├── EditPanel.jsx         # Right sidebar with per-section field editors
        │       └── LivePageEditor.jsx    # Edit/Save/Save & Exit/Exit toolbar
        ├── context/
        │   ├── LanguageContext.jsx # Global EN/GU language toggle
        │   └── PageEditContext.jsx # Global edit mode state, section order, save/load
        ├── data/                   # Static config/data for modules
        │   ├── educationModulesConfig.js
        │   └── servicesData.js
        └── pages/                  # One file per route/page
```

## Conventions

### Frontend
- All routes are defined in `App.jsx`; add new routes there
- Pages live in `src/pages/`, reusable UI in `src/components/`
- Use the `useLanguage()` hook and `t(english, gujarati)` helper for all user-facing text
- API calls use the shared Axios instance from `src/api/axios.js`
- Auth state is stored in `localStorage` (`token`, `role`); admin routes use the `ProtectedRoute` wrapper
- Lazy-load heavy pages with `React.lazy()` + `Suspense`
- Tailwind utility classes for all styling — no separate CSS files per component
- Live Page Editor: wrap pages with `<LivePageEditor>`, `<EditPanel>`, and `<EditableSection>` using `usePageEdit()` hook

### Backend
- All routes are in `server.js` (monolithic route file)
- All data is stored in SQL Server database
- Database helper functions in `db-helpers.js` handle CRUD operations for modules
- SQL DB stores: Village, Census, PanchayatMembers, VillageImages, Achievements, SpecialPersonalities, Users, Pages, PageContent, Services, ServiceItems, EducationModules, EducationRecords, EducationAnnouncements, EmploymentModules, EmploymentRecords, FacilitiesModules, FacilitiesRecords
- Each module category has a defined set of IDs:
  - Education: `primary-school`, `anganwadi`, `library`
  - Employment: `animal-husbandry-and-dairy`, `employment-board`, `market-yard`
  - Facilities: `pgvcl-electric-service`, `st-bus-timetable`, `water-supply`, `health-center`
- Module data is stored as JSON in NVARCHAR(MAX) columns for flexibility
- File uploads served statically from `/uploads`
- Fallback dummy data is used when DB tables are empty

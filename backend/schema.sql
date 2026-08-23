-- Village table — this IS the tenant table. One row per village site.
CREATE TABLE IF NOT EXISTS Village (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,           -- subdomain, e.g. 'sayla' -> sayla.panchayatsuvidha.in
    is_active INTEGER NOT NULL DEFAULT 1,
    theme TEXT NOT NULL DEFAULT 'classic', -- 'classic' | 'modern-minimal' | 'heritage'
    name TEXT NOT NULL,
    taluka TEXT,
    district TEXT,
    state TEXT,
    area TEXT,
    total_households TEXT,
    description TEXT,
    history_en TEXT,
    history_gu TEXT
);

-- Achievements table
CREATE TABLE IF NOT EXISTS Achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    awarded_by TEXT
);

-- SpecialPersonalities table
CREATE TABLE IF NOT EXISTS SpecialPersonalities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    achievement TEXT,
    role TEXT
);

-- VillageImages table
CREATE TABLE IF NOT EXISTS VillageImages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL
);

-- Census table
CREATE TABLE IF NOT EXISTS Census (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    total INTEGER,
    male INTEGER,
    female INTEGER
);

-- PanchayatMembers table
CREATE TABLE IF NOT EXISTS PanchayatMembers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'Sarpanch' or 'Secretary'
    name TEXT NOT NULL,
    email TEXT,
    mobile TEXT,
    address TEXT,
    description TEXT,
    photo_url TEXT
);

-- Pages table (Page Builder — every page, including the homepage at slug
-- 'home', per village)
CREATE TABLE IF NOT EXISTS Pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content_json TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(village_id, slug)
);

-- Services table
CREATE TABLE IF NOT EXISTS Services (
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    title TEXT NOT NULL,
    guTitle TEXT,
    cardTo TEXT,
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (village_id, id)
);

-- ServiceItems table
CREATE TABLE IF NOT EXISTS ServiceItems (
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    service_id TEXT NOT NULL,
    label TEXT,
    to_path TEXT,
    department TEXT,
    eligibility TEXT,
    description TEXT,
    documents TEXT,
    [procedure] TEXT,
    fees TEXT,
    contact TEXT,
    helpline TEXT,
    officialLink TEXT,
    display_order INTEGER DEFAULT 0,
    PRIMARY KEY (village_id, id),
    FOREIGN KEY (village_id, service_id) REFERENCES Services(village_id, id) ON DELETE CASCADE
);

-- EducationModules table
CREATE TABLE IF NOT EXISTS EducationModules (
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    basic_info TEXT,
    map_info TEXT,
    PRIMARY KEY (village_id, module_id)
);

-- EducationRecords table (staff, children, books, etc.)
CREATE TABLE IF NOT EXISTS EducationRecords (
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    record_data TEXT,
    PRIMARY KEY (village_id, id),
    FOREIGN KEY (village_id, module_id) REFERENCES EducationModules(village_id, module_id) ON DELETE CASCADE
);

-- EducationAnnouncements table
CREATE TABLE IF NOT EXISTS EducationAnnouncements (
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    type TEXT,
    date TEXT,
    message TEXT,
    PRIMARY KEY (village_id, id),
    FOREIGN KEY (village_id, module_id) REFERENCES EducationModules(village_id, module_id) ON DELETE CASCADE
);

-- EmploymentModules table
CREATE TABLE IF NOT EXISTS EmploymentModules (
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    basic_info TEXT,
    PRIMARY KEY (village_id, module_id)
);

-- EmploymentRecords table (livestock, jobs, crop prices, etc.)
CREATE TABLE IF NOT EXISTS EmploymentRecords (
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    record_type TEXT,
    record_data TEXT,
    PRIMARY KEY (village_id, id),
    FOREIGN KEY (village_id, module_id) REFERENCES EmploymentModules(village_id, module_id) ON DELETE CASCADE
);

-- FacilitiesModules table
CREATE TABLE IF NOT EXISTS FacilitiesModules (
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    basic_info TEXT,
    PRIMARY KEY (village_id, module_id)
);

-- FacilitiesRecords table (bus routes, water supply schedule, etc.)
CREATE TABLE IF NOT EXISTS FacilitiesRecords (
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    record_type TEXT,
    record_data TEXT,
    PRIMARY KEY (village_id, id),
    FOREIGN KEY (village_id, module_id) REFERENCES FacilitiesModules(village_id, module_id) ON DELETE CASCADE
);

-- Users table (registration/login) — scoped to a village (per-village admin/user accounts).
-- The platform super-admin (manages the Village list itself) is not a row here —
-- it authenticates via SUPER_ADMIN_USERNAME/PASSWORD env vars (see server.js).
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    UNIQUE(village_id, username)
);

-- NavigationItems table — per-village menu/submenu items shown in the Navbar.
-- link_type: 'builtin' (e.g. link_value='/services'), 'page' (link_value=a
-- Pages.slug, rendered at /p/:slug, or 'home' for the homepage), or 'url'
-- (external link_value). parent_id nesting supports one level of submenu.
CREATE TABLE IF NOT EXISTS NavigationItems (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id    INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    parent_id     INTEGER REFERENCES NavigationItems(id) ON DELETE CASCADE,
    label_en      TEXT NOT NULL,
    label_gu      TEXT,
    link_type     TEXT NOT NULL DEFAULT 'page',
    link_value    TEXT,
    icon_url      TEXT,
    display_order INTEGER DEFAULT 0
);

-- Businesses table — the village's Digital Business Directory. Each row is
-- one business listing; searchable/browsable by anyone, managed by the
-- village admin.
CREATE TABLE IF NOT EXISTS Businesses (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id      INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    slug            TEXT NOT NULL,
    name            TEXT NOT NULL,
    name_gu         TEXT,
    category        TEXT,
    description     TEXT,
    description_gu  TEXT,
    owner_name      TEXT,
    phone           TEXT,
    email           TEXT,
    address         TEXT,
    website         TEXT,
    logo_url        TEXT,
    cover_url       TEXT,
    is_published    INTEGER NOT NULL DEFAULT 1,
    created_at      TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(village_id, slug)
);

-- BusinessProducts table — a business's product/service portfolio, shown
-- on its profile page.
CREATE TABLE IF NOT EXISTS BusinessProducts (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id    INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    business_id   INTEGER NOT NULL REFERENCES Businesses(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    name_gu       TEXT,
    description   TEXT,
    price         TEXT,
    image_url     TEXT,
    display_order INTEGER DEFAULT 0
);

-- BusinessPages table — custom, Page-Builder-style tabs a business's profile
-- can have in addition to the built-in Overview/Products/Contact tabs (e.g.
-- "Our Story", "Gallery", "Certifications"). content_json is a block array,
-- same shape and BlockRenderer as the site-wide Pages table.
CREATE TABLE IF NOT EXISTS BusinessPages (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id    INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    business_id   INTEGER NOT NULL REFERENCES Businesses(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    slug          TEXT NOT NULL,
    content_json  TEXT,
    display_order INTEGER DEFAULT 0,
    created_at    TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(business_id, slug)
);

-- ContactMessages table
CREATE TABLE IF NOT EXISTS ContactMessages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    village_id INTEGER NOT NULL REFERENCES Village(id) ON DELETE CASCADE,
    name       TEXT NOT NULL,
    email      TEXT NOT NULL,
    message    TEXT NOT NULL,
    is_read    INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);


-- Create Village table
CREATE TABLE Village (
    id INT PRIMARY KEY IDENTITY(1,1),
    name NVARCHAR(255) NOT NULL,
    taluka NVARCHAR(255),
    district NVARCHAR(255),
    state NVARCHAR(255),
    area NVARCHAR(100),
    total_households NVARCHAR(100),
    description NVARCHAR(MAX),
    history_en NVARCHAR(MAX),
    history_gu NVARCHAR(MAX)
);

-- Create Achievements table
CREATE TABLE Achievements (
    id INT PRIMARY KEY IDENTITY(1,1),
    village_id INT FOREIGN KEY REFERENCES Village(id),
    title NVARCHAR(255) NOT NULL,
    awarded_by NVARCHAR(255)
);

-- Create SpecialPersonalities table
CREATE TABLE SpecialPersonalities (
    id INT PRIMARY KEY IDENTITY(1,1),
    village_id INT FOREIGN KEY REFERENCES Village(id),
    name NVARCHAR(255) NOT NULL,
    achievement NVARCHAR(255),
    role NVARCHAR(255)
);

-- Create VillageImages table
CREATE TABLE VillageImages (
    id INT PRIMARY KEY IDENTITY(1,1),
    village_id INT FOREIGN KEY REFERENCES Village(id),
    image_url NVARCHAR(MAX) NOT NULL
);

-- Create Census table
CREATE TABLE Census (
    id INT PRIMARY KEY IDENTITY(1,1),
    village_id INT FOREIGN KEY REFERENCES Village(id),
    category NVARCHAR(255) NOT NULL,
    total INT,
    male INT,
    female INT
);

-- Create PanchayatMembers table
CREATE TABLE PanchayatMembers (
    id INT PRIMARY KEY IDENTITY(1,1),
    village_id INT FOREIGN KEY REFERENCES Village(id),
    role NVARCHAR(255) NOT NULL, -- 'Sarpanch' or 'Secretary'
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255),
    mobile NVARCHAR(20),
    address NVARCHAR(MAX),
    description NVARCHAR(MAX),
    photo_url NVARCHAR(MAX)
);

-- Create PageContent table (for Live Page Editor — section layout per page)
CREATE TABLE PageContent (
    id          INT PRIMARY KEY IDENTITY(1,1),
    page_name   NVARCHAR(100) UNIQUE NOT NULL,
    content_json NVARCHAR(MAX),
    updated_at  DATETIME DEFAULT GETDATE()
);

-- Create Pages table (for Page Builder)
CREATE TABLE Pages (
    id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    slug NVARCHAR(255) UNIQUE NOT NULL,
    content_json NVARCHAR(MAX),
    status NVARCHAR(20) NOT NULL DEFAULT 'draft',
    created_at DATETIME DEFAULT GETDATE()
);

-- Create Services table
CREATE TABLE Services (
    id NVARCHAR(100) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    guTitle NVARCHAR(255),
    cardTo NVARCHAR(500),
    display_order INT DEFAULT 0
);

-- Create ServiceItems table
CREATE TABLE ServiceItems (
    id NVARCHAR(100) PRIMARY KEY,
    service_id NVARCHAR(100) NOT NULL,
    label NVARCHAR(500),
    to_path NVARCHAR(500),
    department NVARCHAR(500),
    eligibility NVARCHAR(MAX),
    description NVARCHAR(MAX),
    documents NVARCHAR(MAX),
    [procedure] NVARCHAR(MAX),
    fees NVARCHAR(500),
    contact NVARCHAR(500),
    helpline NVARCHAR(500),
    officialLink NVARCHAR(500),
    display_order INT DEFAULT 0,
    FOREIGN KEY (service_id) REFERENCES Services(id) ON DELETE CASCADE
);

-- Create EducationModules table
CREATE TABLE EducationModules (
    module_id NVARCHAR(100) PRIMARY KEY,
    basic_info NVARCHAR(MAX),
    map_info NVARCHAR(MAX)
);

-- Create EducationRecords table (staff, children, books, etc.)
CREATE TABLE EducationRecords (
    id NVARCHAR(100) PRIMARY KEY,
    module_id NVARCHAR(100) NOT NULL,
    record_data NVARCHAR(MAX),
    FOREIGN KEY (module_id) REFERENCES EducationModules(module_id) ON DELETE CASCADE
);

-- Create EducationAnnouncements table
CREATE TABLE EducationAnnouncements (
    id NVARCHAR(100) PRIMARY KEY,
    module_id NVARCHAR(100) NOT NULL,
    type NVARCHAR(100),
    date NVARCHAR(50),
    message NVARCHAR(MAX),
    FOREIGN KEY (module_id) REFERENCES EducationModules(module_id) ON DELETE CASCADE
);

-- Create EmploymentModules table
CREATE TABLE EmploymentModules (
    module_id NVARCHAR(100) PRIMARY KEY,
    basic_info NVARCHAR(MAX)
);

-- Create EmploymentRecords table (livestock, jobs, crop prices, etc.)
CREATE TABLE EmploymentRecords (
    id NVARCHAR(100) PRIMARY KEY,
    module_id NVARCHAR(100) NOT NULL,
    record_type NVARCHAR(100),
    record_data NVARCHAR(MAX),
    FOREIGN KEY (module_id) REFERENCES EmploymentModules(module_id) ON DELETE CASCADE
);

-- Create FacilitiesModules table
CREATE TABLE FacilitiesModules (
    module_id NVARCHAR(100) PRIMARY KEY,
    basic_info NVARCHAR(MAX)
);

-- Create FacilitiesRecords table (bus routes, water supply schedule, etc.)
CREATE TABLE FacilitiesRecords (
    id NVARCHAR(100) PRIMARY KEY,
    module_id NVARCHAR(100) NOT NULL,
    record_type NVARCHAR(100),
    record_data NVARCHAR(MAX),
    FOREIGN KEY (module_id) REFERENCES FacilitiesModules(module_id) ON DELETE CASCADE
);

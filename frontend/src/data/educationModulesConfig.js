const educationModulesConfig = {
    'primary-school': {
        title: 'Primary School',
        titleGu: 'પ્રાથમિક શાળા',
        description: 'School education services and student support details.',
        basicInfoTitle: 'School Basic Information',
        basicFields: [
            { key: 'schoolName', label: 'School Name' },
            { key: 'address', label: 'Address' },
            { key: 'udiseCode', label: 'UDISE Code' },
            { key: 'contactNumber', label: 'Contact Number' },
            { key: 'headmasterName', label: 'Headmaster Name' }
        ],
        recordsTitle: 'Staff Details',
        recordsColumns: [
            { key: 'name', label: 'Name' },
            { key: 'subject', label: 'Subject' },
            { key: 'qualification', label: 'Qualification' },
            { key: 'contact', label: 'Contact' }
        ],
        recordsPhotoKey: 'photoUrl',
        announcementsTitle: 'Announcements / Notices',
        announcementTypes: ['Holiday', 'Exam', 'Event'],
        mapTitle: 'Map Location',
        showMap: true
    },
    anganwadi: {
        title: 'Anganwadi',
        titleGu: 'આંગણવાડી',
        description: 'Child development (0-6 years), nutrition, and health tracking.',
        basicInfoTitle: 'Anganwadi Basic Information',
        basicFields: [
            { key: 'centerName', label: 'Center Name' },
            { key: 'workerName', label: 'Worker Name (AWW)' },
            { key: 'helperName', label: 'Helper Name' },
            { key: 'contactNumber', label: 'Contact Number' },
            { key: 'location', label: 'Location' }
        ],
        recordsTitle: 'Nutrition + Health Tracking',
        recordsColumns: [
            { key: 'childName', label: 'Child Name' },
            { key: 'age', label: 'Age' },
            { key: 'nutritionStatus', label: 'Nutrition Status' },
            { key: 'healthStatus', label: 'Health Status' },
            { key: 'lastCheckDate', label: 'Last Check Date', inputType: 'date' }
        ],
        announcementsTitle: 'Announcements',
        announcementTypes: ['Health Camp', 'Nutrition Program', 'Event'],
        mapTitle: 'Map Location',
        showMap: false
    },
    library: {
        title: 'Library',
        titleGu: 'લાઇબ્રેરી',
        description: 'Village knowledge center with books and digital learning.',
        basicInfoTitle: 'Library Basic Information',
        basicFields: [
            { key: 'libraryName', label: 'Library Name' },
            { key: 'location', label: 'Location' },
            { key: 'timings', label: 'Timings' },
            { key: 'librarianName', label: 'Librarian Name' }
        ],
        recordsTitle: 'Books + Digital Learning',
        recordsColumns: [
            { key: 'title', label: 'Title' },
            { key: 'type', label: 'Type (Book/Digital)' },
            { key: 'authorSource', label: 'Author/Source' },
            { key: 'availability', label: 'Availability' }
        ],
        announcementsTitle: 'Announcements',
        announcementTypes: ['New Books', 'Digital Session', 'Event'],
        mapTitle: 'Map Location',
        showMap: false
    }
};

export const getEducationModuleConfig = (moduleId) => educationModulesConfig[moduleId];

export const getDefaultEducationModuleData = (moduleId) => {
    const config = getEducationModuleConfig(moduleId);
    if (!config) {
        return {
            basicInfo: {},
            records: [],
            announcements: [],
            map: {
                embedUrl: '',
                locationUrl: ''
            }
        };
    }

    const basicInfo = {};
    config.basicFields.forEach((field) => {
        basicInfo[field.key] = '';
    });

    return {
        basicInfo,
        records: [],
        announcements: [],
        map: {
            embedUrl: '',
            locationUrl: ''
        }
    };
};


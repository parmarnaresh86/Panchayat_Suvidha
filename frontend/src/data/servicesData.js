const servicesData = [
    {
        id: 'admin',
        title: 'Admin',
        guTitle: 'વહીવટ',
        cardTo: '/services/admin',
        items: [
            { 
                id: 'gram-panchayat-detail',
                label: 'ગ્રામપંચાયત વિગત',
                to: '/panchayat',
                department: 'પંચાયત વિભાગ',
                eligibility: '',
                description: 'ગ્રામપંચાયત સંબંધિત માહિતી માટે.',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            },
            { 
                id: 'sarpanch-gps',
                label: 'સરપંચ (GPS)',
                to: '/services/admin/sarpanch-gps',
                department: 'પંચાયત વિભાગ',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            },
            { 
                id: 'form-download-center',
                label: 'ફોર્મ ડાઉનલોડ સેન્ટર',
                to: '/services/admin/form-download-center',
                department: 'પંચાયત વિભાગ',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''            },
            { 
                id: 'staff-attendance',
                label: 'સ્ટાફ હાજરી',
                to: '/services/admin/staff-attendance',
                department: 'પંચાયત વિભાગ',
                eligibility: '',
                description: 'દૈનિક સ્ટાફ હાજરી ટ્રેક કરો (સરપંચ, સેક્રેટરી, મોડી પ્રવેશ, રિપોર્ટ).',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''            }
        ]
    },
    {
        id: 'employment',
        title: 'Employment',
        guTitle: 'રોજગાર',
        cardTo: '/services/employment',
        items: [
            { 
                id: 'animal-husbandry-and-dairy',
                label: 'પશુપાલન અને ડેરી',
                to: '/services/employment/animal-husbandry-and-dairy',
                department: 'પશુપાલન અને ડેરી વિભાગ',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            },
            { 
                id: 'employment-board',
                label: 'રોજગાર બોર્ડ',
                to: '/services/employment/employment-board',
                department: 'રોજગાર વિભાગ',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            },
            { 
                id: 'market-yard',
                label: 'માર્કેટ યર્ડ',
                to: '/services/employment/market-yard',
                department: 'કૃષિ બજાર/માર્કેટ યાર્ડ',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            }
        ]
    },
    {
        id: 'facilities',
        title: 'Facilities',
        guTitle: 'સુવિધાઓ',
        cardTo: '/services/facilities',
        items: [
            { 
                id: 'pgvcl-electric-service',
                label: 'PGVCL વીજ સેવા',
                to: '/services/facilities/pgvcl-electric-service',
                department: 'વિજળી વિભાગ (PGVCL)',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            },
            { 
                id: 'st-bus-timetable',
                label: 'એસ.ટી. બસ સમયપત્રક',
                to: '/services/facilities/st-bus-timetable',
                department: 'એસ.ટી. વિભાગ',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            },
            { 
                id: 'water-supply',
                label: 'પાણી પુરવઠો',
                to: '/services/facilities/water-supply',
                department: 'પાણી પુરવઠો વિભાગ',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            },
            { 
                id: 'health-center',
                label: 'આરોગ્ય કેન્દ્ર',
                to: '/services/facilities/health-center',
                department: 'આરોગ્ય વિભાગ',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            }
        ]
    },
    {
        id: 'education',
        title: 'Education',
        guTitle: 'શિક્ષણ',
        cardTo: '/services/education',
        items: [
            { 
                id: 'primary-school',
                label: 'પ્રાથમિક શાળા',
                to: '/services/education/primary-school',
                department: 'શિક્ષણ વિભાગ',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            },
            { 
                id: 'anganwadi',
                label: 'આંગણવાડી',
                to: '/services/education/anganwadi',
                department: 'આંગણવાડી વિભાગ',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            },
            { 
                id: 'library',
                label: 'લાઇબ્રેરી',
                to: '/services/education/library',
                department: 'લાઇબ્રેરી/શિક્ષણ વિભાગ',
                eligibility: '',
                description: '',
                documents: [],
                procedure: '',
                fees: '',
                contact: '',
                helpline: '',
                officialLink: ''
            }
        ]
    }
];

export default servicesData;


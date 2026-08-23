import React from 'react';
import Card from '../components/Card';
import GovServiceCard from '../components/GovServiceCard';
import { Link } from 'react-router-dom';
import { FaGlobe, FaProjectDiagram, FaIdBadge, FaMoneyBillWave, FaDownload } from 'react-icons/fa';
import { GiFarmTractor } from 'react-icons/gi';

const FormDownloadPage = () => {
    const governmentServices = [
        { id: 'digital-gujarat', icon: FaGlobe, title: 'Digital Gujarat', description: 'Government services portal', url: 'https://www.digitalgujarat.gov.in' },
        { id: 'egram-swaraj', icon: FaProjectDiagram, title: 'eGram Swaraj', description: 'Panchayat reports & planning', url: 'https://egramswaraj.gov.in' },
        { id: 'uidai', icon: FaIdBadge, title: 'UIDAI (Aadhaar)', description: 'Aadhaar services', url: 'https://uidai.gov.in' },
        { id: 'pmkisan', icon: GiFarmTractor, title: 'PM Kisan', description: 'Farmer support scheme', url: 'https://pmkisan.gov.in' },
        { id: 'gst', icon: FaMoneyBillWave, title: 'GST Portal', description: 'Tax related services', url: 'https://www.gst.gov.in' },
        { id: 'form-download-center', icon: FaDownload, title: 'Form Download Center', description: 'પંચાયત ફોર્મ ડાઉનલોડ', url: 'https://www.example.com/form1.pdf' }
    ];

    

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">ફોર્મ ડાઉનલોડ સેન્ટર</h1>
                <Link to="/services" className="text-primary-500 hover:text-primary-700 font-semibold">
                    ← Back to Services
                </Link>
            </div>
            <Card className="p-6 mb-8">
                <h2 className="text-2xl font-bold mb-3">Government Services</h2>
                <p className="text-gray-600 mb-4">Use these official links to open service portals directly.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {governmentServices.map((service) => (
                        <GovServiceCard
                            key={service.id}
                            icon={service.icon}
                            title={service.title}
                            description={service.description}
                            actionText={service.id === 'form-download-center' ? 'Open' : 'Visit'}
                            url={service.url}
                        />
                    ))}
                </div>
            </Card>

           
        </div>
    );
};

export default FormDownloadPage;

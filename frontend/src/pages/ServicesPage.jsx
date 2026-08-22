import React from 'react';
import ServicesSection from '../components/ServicesSection';
import { useLanguage } from '../context/LanguageContext';

const ServicesPage = () => {
    const { t } = useLanguage();

    return (
        <div className="container mx-auto p-6 space-y-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{t('All Village Services', 'બધી ગામની સેવાઓ')}</h1>
            <p className="text-gray-600">{t('Browse all services offered by the Gram Panchayat.', 'ગ્રામ પંચાયત દ્વારા પ્રદાન કરવામાં આવતા તમામ સેવાઓ બ્રાઉઝ કરો.')}</p>
            <ServicesSection />
        </div>
    );
};

export default ServicesPage;
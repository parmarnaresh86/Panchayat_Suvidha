
import React, { useEffect, useMemo, useState } from 'react';
import axios from '../api/axios';
import { User, Briefcase, Droplets, GraduationCap, Landmark } from 'lucide-react';
import ServiceCard from './ServiceCard';
import { useLanguage } from '../context/LanguageContext';
import servicesDataFallback from '../data/servicesData';

const ServicesSection = () => {
    const { t } = useLanguage();
    const [services, setServices] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        axios
            .get('/services')
            .then((res) => {
                if (!mounted) return;
                setServices(res.data);
                setError(null);
            })
            .catch(() => {
                if (!mounted) return;
                setError(t('Failed to load services, using fallback.', 'સેવાઓ લોડ કરવામાં નિષ્ફળ, ફૉલબેક ઉપયોગ કરી રહ્યા છીએ.'));
                setServices(servicesDataFallback);
            });
        return () => {
            mounted = false;
        };
    }, [t]);

    const iconMap = {
        admin: User,
        employment: Briefcase,
        facilities: Droplets,
        education: GraduationCap
    };

    const sortedServices = useMemo(() => {
        if (!services) return [];
        return [...services].sort((a, b) => a.title.localeCompare(b.title));
    }, [services]);

    if (!services) {
        return (
            <section className="mt-12 bg-linear-to-r from-white via-orange-50 to-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-pulse">
                <div className="text-gray-600 font-semibold mb-6">{t('Loading services...', 'સેવાઓ લોડ થાય છે...')}</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, idx) => (
                        <div key={idx} className="h-72 rounded-2xl bg-white p-5 border border-gray-200 shadow-sm"></div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section id="village-services" className="mt-12 bg-linear-to-r from-white via-orange-50 to-white p-8 rounded-3xl border border-slate-200 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-gray-200 pb-4">
                <h2 className="text-3xl font-extrabold text-slate-900 flex items-center">
                    <span className="mr-3 inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-700">
                        <Landmark size={24} aria-hidden="true" />
                    </span>
                    {t('Village Services', 'ગામની સેવાઓ')}
                </h2>
                <div className="h-1 grow mx-6 bg-linear-to-r from-blue-200 to-transparent rounded-full hidden sm:block"></div>
            </div>
            
            {error && (
                <div className="mb-4 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-700">
                    {error}
                </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {sortedServices.map((service) => (
                    <ServiceCard
                        id={`service-${service.id}`}
                        key={service.id}
                        icon={iconMap[service.id]}
                        title={service.title}
                        guTitle={service.guTitle}
                        items={service.items}
                        cardTo={service.cardTo}
                    />
                ))}
            </div>


        </section>
    );
};

export default ServicesSection;

import { useState } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const midAds = [
    {
        tag: 'Central Scheme',
        title: 'PM Kisan Samman Nidhi',
        desc: 'Eligible farmers receive ₹6,000/year directly to their bank account.',
        cta: 'Check Status',
        url: 'https://pmkisan.gov.in',
        icon: '🌾',
        color: 'border-green-200 bg-green-50',
        tagColor: 'bg-green-100 text-green-700',
        btnColor: 'bg-green-600 hover:bg-green-700',
    },
    {
        tag: 'e-Governance',
        title: 'Gram Swaraj Portal',
        desc: 'Track Gram Panchayat funds, plans, and development activities transparently.',
        cta: 'Explore',
        url: 'https://egramswaraj.gov.in',
        icon: '📊',
        color: 'border-blue-200 bg-blue-50',
        tagColor: 'bg-blue-100 text-blue-700',
        btnColor: 'bg-blue-600 hover:bg-blue-700',
    },
    {
        tag: 'Local Business',
        title: 'Sayla Kirana Store',
        desc: 'Daily essentials, groceries & household items. Home delivery available.',
        cta: 'Contact',
        url: '#',
        icon: '🛒',
        color: 'border-primary-200 bg-primary-50',
        tagColor: 'bg-primary-100 text-primary-700',
        btnColor: 'bg-primary-500 hover:bg-primary-600',
    },
];

// ── Top full-width banner ad ──


// ── Mid section 3-card ad row ──
export const MidAdRow = () => {
    const { t } = useLanguage();

    return (
        <div className="space-y-3">
            {/* Label */}
            <p className="text-[10px] font-bold tracking-widest text-gray-300 uppercase text-center">
                {t('Sponsored', 'પ્રાયોજિત')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {midAds.map((ad) => (
                    <div
                        key={ad.title}
                        className={`rounded-2xl border ${ad.color} p-4 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200`}
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl">{ad.icon}</span>
                                <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full ${ad.tagColor}`}>
                                    {ad.tag}
                                </span>
                            </div>
                            <span className="text-[9px] font-semibold text-gray-300 uppercase tracking-widest flex-shrink-0">
                                {t('Ad', 'જા.')}
                            </span>
                        </div>

                        <div>
                            <p className="font-bold text-gray-800 text-sm leading-tight">{ad.title}</p>
                            <p className="text-gray-500 text-xs mt-1 line-clamp-2">{ad.desc}</p>
                        </div>

                        <a
                            href={ad.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center justify-center gap-1.5 ${ad.btnColor} text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors duration-200 mt-auto`}
                        >
                            {t(ad.cta, 'જુઓ')}
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

import { MapPin, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const VillageMap = ({ villageName }) => {
    const { t } = useLanguage();

    const mapQuery = `${villageName || 'Sayla'}, Surendranagar, Gujarat`;
    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;

    return (
        <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-gray-100">

            {/* Map iframe */}
            <iframe
                title={t('Village Map', 'ગામ નકશો')}
                src={mapUrl}
                width="100%"
                height="420"
                frameBorder="0"
                allowFullScreen
                style={{ border: 0, display: 'block' }}
            />

            {/* Gram Panchayat Office — floating card bottom-left */}
            <div className="absolute bottom-4 left-4">
                <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-md border border-orange-100 rounded-2xl px-4 py-3 shadow-lg">
                    <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">
                            {t('Gram Panchayat Office', 'ગ્રામ પંચાયત કચેરી')}
                        </p>
                        <span className="text-[10px] font-bold text-orange-500 tracking-widest uppercase">
                            {t('Admin', 'વહીવટ')}
                        </span>
                    </div>
                </div>
            </div>

            {/* Top-right: map label */}
            <div className="absolute top-4 right-4">
                <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl px-3 py-1.5 shadow-md">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-xs font-semibold text-gray-700">
                        {villageName || 'Sayla'}, Gujarat
                    </span>
                </div>
            </div>
        </div>
    );
};

export default VillageMap;

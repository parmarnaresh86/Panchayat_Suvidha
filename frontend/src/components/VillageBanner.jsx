import { useNavigate } from 'react-router-dom';
import { MapPin, Users, Building2, ArrowRight, Phone, Landmark } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const VillageBanner = ({ villageName, taluka, district }) => {
    const navigate = useNavigate();
    const { t, language } = useLanguage();
    const gu = language === 'gu';

    const name = villageName
        ? villageName.charAt(0).toUpperCase() + villageName.slice(1)
        : 'Sayla';

    const stats = [
        { icon: Users,     en: 'Population', gu: 'વસ્તી',     value: '~10,000' },
        { icon: MapPin,    en: 'Taluka',      gu: 'તાલુકો',    value: taluka    || 'Sayla' },
        { icon: Building2, en: 'District',    gu: 'જિલ્લો',    value: district  || 'Surendranagar' },
        { icon: Landmark,  en: 'GP Status',   gu: 'GP સ્થિતિ', value: t('Active', 'સક્રિય') },
    ];

    return (
        <div
            className="relative w-full overflow-hidden rounded-3xl shadow-2xl mb-6 flex flex-col"
            style={{ height: 'calc(100vh - 80px)' }}  /* 80px = navbar height */
        >
            {/* Background */}
            <div
                className="absolute inset-0 bg-cover bg-center animate-slow-zoom"
                style={{ backgroundImage: "url('/images/Loc_Sayla_1567329861.jpg')" }}
            />
            {/* Overlay */}
            <div className="absolute inset-0" style={{
                background: 'linear-gradient(170deg, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.58) 40%, rgba(80,25,0,0.85) 100%)'
            }} />
            {/* Orange glow */}
            <div className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full pointer-events-none opacity-15 blur-3xl"
                style={{ background: 'radial-gradient(circle, #f97316, transparent 70%)' }} />
            {/* Floating rings */}
            <div className="absolute top-6 left-6 w-28 h-28 rounded-full border border-orange-400/10 animate-float pointer-events-none" />
            <div className="absolute bottom-20 right-10 w-16 h-16 rounded-full border border-orange-300/10 animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
            {/* Inset border */}
            <div className="absolute inset-3 rounded-2xl border border-white/10 pointer-events-none" />

            {/* ── MAIN CONTENT — fills remaining height ── */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center flex-1 px-6 sm:px-16 py-6 gap-3">

                {/* Badge */}
                <div className="animate-fade-up inline-flex items-center gap-2 rounded-full px-4 py-1.5 border border-orange-400/30 bg-orange-500/10 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse flex-shrink-0" />
                    <span className="font-gujarati text-orange-300 text-xs font-semibold tracking-[0.2em] uppercase">
                        {t('Digital Gram Panchayat', 'ડિજિટલ ગ્રામ પંચાયત')}
                    </span>
                </div>

                {/* Village name */}
                <h1
                    className="animate-fade-up-delay1 font-black text-white leading-none tracking-tight"
                    style={{
                        fontSize: 'clamp(3.5rem, 11vw, 8rem)',
                        textShadow: '0 8px 60px rgba(0,0,0,0.8)',
                        letterSpacing: '-0.03em',
                    }}
                >
                    {name}
                </h1>

                {/* Gujarati subtitle */}
                <p
                    className="font-gujarati animate-fade-up-delay2 font-bold text-orange-300 leading-tight"
                    style={{
                        fontSize: 'clamp(1.3rem, 3.5vw, 2.4rem)',
                        textShadow: '0 4px 24px rgba(0,0,0,0.6)',
                        letterSpacing: '0.04em',
                        marginTop: '0.6rem',
                    }}
                >
                    ગ્રામ પંચાયત
                </p>

                {/* Divider */}
                <div className="animate-fade-up-delay2 flex items-center gap-3" style={{ width: '160px', margin: '0.5rem 0' }}>
                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to right, transparent, rgba(251,146,60,0.6))' }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400/70" />
                    <div className="w-2 h-2 rounded-full bg-orange-500 shadow-md shadow-orange-500/60" />
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400/70" />
                    <div className="flex-1 h-px" style={{ background: 'linear-gradient(to left, transparent, rgba(251,146,60,0.6))' }} />
                </div>

                {/* Location */}
                <p
                    className="font-gujarati animate-fade-up-delay2 text-white/85 font-semibold tracking-[0.18em] uppercase text-sm sm:text-base"
                    style={{ textShadow: '0 2px 12px rgba(0,0,0,0.7)' }}
                >
                    તા. {taluka || 'Sayla'}&nbsp;&nbsp;•&nbsp;&nbsp;જી. {district || 'Surendranagar'}
                </p>

                {/* CTA Buttons */}
                <div className="animate-fade-up-delay3 flex flex-wrap items-center justify-center gap-3 mt-2">
                    <button
                        onClick={() => {
                            const el = document.getElementById('village-profile-details');
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                        className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-200 text-sm"
                    >
                        {t('Village Profile', 'ગ્રામ પ્રોફાઇલ')}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => navigate('/services')}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/18 active:scale-95 backdrop-blur-md border border-white/20 hover:border-orange-400/50 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm"
                    >
                        {t('Explore Services', 'સેવાઓ જુઓ')}
                    </button>
                    <button
                        onClick={() => navigate('/contact')}
                        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/18 active:scale-95 backdrop-blur-md border border-white/20 hover:border-orange-400/50 text-white font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 text-sm"
                    >
                        <Phone className="w-4 h-4 text-orange-300" />
                        {t('Contact Panchayat', 'સંપર્ક')}
                    </button>
                </div>
            </div>

            {/* ── Stats strip — pinned to bottom ── */}
            <div className="relative z-10 w-full border-t border-white/10 bg-black/40 backdrop-blur-md flex-shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-4">
                    {stats.map(({ icon: Icon, en, gu: guLabel, value }, i) => (
                        <div
                            key={en}
                            className={`flex flex-col items-center justify-center gap-1 py-3 px-4 hover:bg-white/5 transition-colors duration-200
                                ${i < 3 ? 'sm:border-r border-white/10' : ''}
                                ${i === 2 ? 'border-t sm:border-t-0 border-white/10' : ''}
                                ${i === 3 ? 'border-t sm:border-t-0 border-white/10' : ''}
                            `}
                        >
                            <Icon className="w-3.5 h-3.5 text-orange-400" />
                            <span className="text-white font-bold text-sm leading-tight">{value}</span>
                            <span className="font-gujarati text-white/45 text-[10px] tracking-widest uppercase">
                                {gu ? guLabel : en}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default VillageBanner;

import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useLanguage } from '../../context/LanguageContext';
import Card from '../Card';
import Table from '../Table';
import VillageBanner from '../VillageBanner';
import VillageGallery from '../VillageGallery';
import VillageMap from '../VillageMap';

const Skeleton = ({ height = 160 }) => (
    <div className="bg-gray-100 animate-pulse rounded-2xl" style={{ height }} />
);

// ── Smart, data-bound village widgets ──────────────────────────
// Each fetches its own data (already scoped to the current village by the
// axios tenant interceptor), so the same block works on the homepage or any
// custom page without needing data threaded down from a parent.

const VillageBannerBlock = () => {
    const [village, setVillage] = useState(null);
    useEffect(() => { axios.get('/village').then(r => setVillage(r.data)).catch(() => {}); }, []);
    if (!village) return <Skeleton height={480} />;
    return <VillageBanner villageName={village.name} taluka={village.taluka} district={village.district} />;
};

const VillageGalleryBlock = () => {
    const [village, setVillage] = useState(null);
    useEffect(() => { axios.get('/village').then(r => setVillage(r.data)).catch(() => {}); }, []);
    if (!village) return <Skeleton height={300} />;
    return <VillageGallery images={village.images} />;
};

const VillageMapBlock = ({ props: s }) => {
    const { t } = useLanguage();
    const [village, setVillage] = useState(null);
    useEffect(() => { axios.get('/village').then(r => setVillage(r.data)).catch(() => {}); }, []);
    if (!village) return <Skeleton height={420} />;
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-gray-900 border-l-8 border-primary-500 pl-4 py-2 bg-primary-50 rounded-r-2xl">
                {t(s.headingEn || 'Explore Our Village', s.headingGu || 'અમારું ગામ જુઓ')}
            </h2>
            <VillageMap villageName={village.name} />
        </div>
    );
};

const PanchayatMembersBlock = ({ props: s }) => {
    const { t } = useLanguage();
    const [members, setMembers] = useState(null);
    useEffect(() => { axios.get('/panchayat').then(r => setMembers(r.data)).catch(() => setMembers([])); }, []);
    if (members === null) return <Skeleton height={220} />;
    if (members.length === 0) return null;
    return (
        <section className="space-y-6">
            <div>
                <span className="text-xs font-bold tracking-widest text-primary-500 uppercase">{t('Leadership', 'નેતૃત્વ')}</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                    {t(s.headingEn || 'Panchayat Members', s.headingGu || 'પંચાયતના સભ્યો')}
                </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {members.map(member => (
                    <div key={member.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                        <div className="bg-gradient-to-br from-primary-50 to-primary-100 px-6 pt-8 pb-4 flex flex-col items-center text-center">
                            <img src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f97316&color=fff&size=128`} alt={member.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-3" />
                            <h3 className="font-bold text-gray-900 text-lg leading-tight">{member.name}</h3>
                            <span className="mt-1.5 inline-block bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                                {t(member.role, member.role === 'Sarpanch' ? 'સરપંચ' : 'તલાટી મંત્રી')}
                            </span>
                        </div>
                        <div className="px-6 py-4 space-y-2 text-sm text-gray-600">
                            {member.mobile && <p className="flex items-center gap-2"><span className="text-primary-400">📞</span>{member.mobile}</p>}
                            {member.email && <p className="flex items-center gap-2 truncate"><span className="text-primary-400">✉️</span>{member.email}</p>}
                            {member.address && <p className="flex items-start gap-2"><span className="text-primary-400 mt-0.5">📍</span><span>{member.address}</span></p>}
                            {member.description && <p className="text-gray-400 italic text-xs pt-1 border-t border-gray-100">{member.description}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

const VillageHistoryBlock = () => {
    const { t } = useLanguage();
    const [village, setVillage] = useState(null);
    useEffect(() => { axios.get('/village').then(r => setVillage(r.data)).catch(() => {}); }, []);
    if (!village) return <Skeleton height={160} />;
    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4 text-primary-700 flex items-center"><span className="mr-2">🏛️</span>{t('Village History & Pride', 'ગામનો ઇતિહાસ અને ગૌરવ')}</h2>
            <div className="prose prose-primary max-w-none text-gray-700 leading-relaxed">
                <p className="text-lg italic mb-4 border-l-4 border-primary-500 pl-4 bg-primary-50 py-2">
                    {t(village.history?.english, village.history?.gujarati)}
                </p>
            </div>
        </Card>
    );
};

const VillageAchievementsBlock = ({ props: s }) => {
    const { t } = useLanguage();
    const [village, setVillage] = useState(null);
    useEffect(() => { axios.get('/village').then(r => setVillage(r.data)).catch(() => {}); }, []);
    if (!village) return <Skeleton height={160} />;
    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4 text-primary-700 flex items-center"><span className="mr-2">🏆</span>{t(s.headingEn || 'Achievements', s.headingGu || 'ગામની સિદ્ધિઓ')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {village.achievements?.map((ach, idx) => (
                    <div key={idx} className="bg-primary-50 p-4 rounded-xl border border-primary-100 flex items-start">
                        <div className="bg-primary-500 text-white p-2 rounded-lg mr-4">🥇</div>
                        <div><h3 className="font-bold text-gray-800">{ach.title}</h3><p className="text-sm text-gray-600">{ach.awarded_by}</p></div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const SpecialPersonalitiesBlock = ({ props: s }) => {
    const { t } = useLanguage();
    const [village, setVillage] = useState(null);
    useEffect(() => { axios.get('/village').then(r => setVillage(r.data)).catch(() => {}); }, []);
    if (!village) return <Skeleton height={160} />;
    return (
        <Card>
            <h2 className="text-2xl font-bold mb-4 text-primary-700 flex items-center"><span className="mr-2">🌟</span>{t(s.headingEn || 'Special Personalities', s.headingGu || 'વિશેષ વ્યક્તિઓ')}</h2>
            <div className="space-y-4">
                {village.special_persons?.map((person, idx) => (
                    <div key={idx} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold mr-4">{person.name.charAt(0)}</div>
                        <div>
                            <h3 className="font-bold text-gray-800">{person.name}</h3>
                            <p className="text-xs text-primary-600 font-medium uppercase">{person.achievement}</p>
                            <p className="text-xs text-gray-500">{person.role}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const ContactInfoBlock = () => {
    const { t } = useLanguage();
    const [info, setInfo] = useState(null);
    useEffect(() => { axios.get('/contact/info').then(r => setInfo(r.data)).catch(() => setInfo({})); }, []);
    if (!info) return <Skeleton height={160} />;
    return (
        <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-100">
            <h2 className="text-xl font-bold mb-4">{t('Quick Contact', 'ઝડપી સંપર્ક')}</h2>
            <div className="space-y-3 text-sm font-medium">
                <p className="flex items-center gap-2"><span>📞</span>{info.phone || '+91 12345 67890'}</p>
                <p className="flex items-center gap-2"><span>✉️</span>{info.email || 'support@panchayatsuvidha.in'}</p>
                <p className="flex items-center gap-2"><span>📍</span>{info.address || 'Panchayat Office'}</p>
                {info.hours && <p className="flex items-center gap-2"><span>⏰</span>{info.hours}</p>}
            </div>
        </Card>
    );
};

const CensusTableBlock = ({ props: s }) => {
    const { t } = useLanguage();
    const [census, setCensus] = useState(null);
    useEffect(() => { axios.get('/census').then(r => setCensus(r.data)).catch(() => setCensus([])); }, []);

    const headers = [t('Category', 'કેટેગરી'), t('Total', 'કુલ'), t('Male', 'પુરુષ'), t('Female', 'સ્ત્રી')];
    const renderRow = (item, index) => (
        <tr key={item.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-primary-100`}>
            <td className="py-3 px-4">{t(item.category, item.category)}</td>
            <td className="py-3 px-4">{item.total}</td>
            <td className="py-3 px-4">{item.male}</td>
            <td className="py-3 px-4">{item.female}</td>
        </tr>
    );

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-primary-700 flex items-center"><span className="mr-2">📊</span>{t(s.headingEn || 'Census Data', s.headingGu || 'વસ્તી ગણતરી ડેટા')}</h2>
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded font-bold tracking-widest">YEAR: {s.year || '2021'}</span>
            </div>
            {census === null
                ? <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />)}</div>
                : <Table headers={headers} data={census} renderRow={renderRow} />
            }
        </Card>
    );
};

// ── Renders a single block by type ──────────────────────────────
const BlockRenderer = ({ block }) => {
    const s = block.props || {};

    switch (block.type) {
        case 'heading':
            return <h2 style={{ fontSize: s.fontSize || '2rem', color: s.color || '#111', fontWeight: 'bold', textAlign: s.align || 'left' }}>{s.text || 'Heading'}</h2>;
        case 'text':
            return <p style={{ fontSize: s.fontSize || '1rem', color: s.color || '#444', textAlign: s.align || 'left', lineHeight: 1.7 }}>{s.text || 'Text block'}</p>;
        case 'button':
            return (
                <div style={{ textAlign: s.align || 'left' }}>
                    <a href={s.url || '#'} style={{ display: 'inline-block', background: s.bg || '#f97316', color: s.color || '#fff', padding: '10px 28px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: s.fontSize || '1rem' }}>
                        {s.text || 'Click Here'}
                    </a>
                </div>
            );
        case 'image':
            return s.src
                ? <img src={s.src} alt={s.alt || ''} style={{ width: s.width || '100%', borderRadius: s.rounded ? '12px' : '0', objectFit: 'cover' }} />
                : <div style={{ background: '#f3f4f6', height: '200px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>No image selected</div>;
        case 'divider':
            return <hr style={{ border: 'none', borderTop: `${s.thickness || 1}px solid ${s.color || '#e5e7eb'}`, margin: '8px 0' }} />;
        case 'spacer':
            return <div style={{ height: `${s.height || 32}px` }} />;
        case 'card':
            return (
                <div style={{ background: s.bg || '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    {s.title && <h3 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#111' }}>{s.title}</h3>}
                    <p style={{ color: '#555' }}>{s.text || 'Card content'}</p>
                </div>
            );
        case 'alert':
            return (
                <div style={{ background: s.bg || '#fff7ed', border: `1px solid ${s.border || '#fed7aa'}`, borderRadius: '10px', padding: '14px 18px', color: s.color || '#9a3412' }}>
                    {s.text || 'Alert message'}
                </div>
            );
        case 'html':
            return s.html
                ? <div dangerouslySetInnerHTML={{ __html: s.html }} />
                : <div style={{ background: '#f3f4f6', height: '80px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>No HTML content yet</div>;

        // ── Village widgets ──
        case 'village-banner':        return <VillageBannerBlock />;
        case 'village-gallery':       return <VillageGalleryBlock />;
        case 'village-map':           return <VillageMapBlock props={s} />;
        case 'panchayat-members':     return <PanchayatMembersBlock props={s} />;
        case 'village-history':       return <VillageHistoryBlock />;
        case 'village-achievements':  return <VillageAchievementsBlock props={s} />;
        case 'special-personalities': return <SpecialPersonalitiesBlock props={s} />;
        case 'contact-info':          return <ContactInfoBlock />;
        case 'census-table':          return <CensusTableBlock props={s} />;

        default:
            return null;
    }
};

export default BlockRenderer;

import { useState, useEffect } from 'react';
import {
    DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    SortableContext, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';

import axios from '../api/axios';
import Card from '../components/Card';
import Table from '../components/Table';
import VillageBanner from '../components/VillageBanner';
import VillageGallery from '../components/VillageGallery';
import { MidAdRow } from '../components/AdBanner';
import VillageMap from '../components/VillageMap';
import { useLanguage } from '../context/LanguageContext';
import { usePageEdit } from '../context/PageEditContext';
import EditableSection from '../components/editor/EditableSection';
import LivePageEditor from '../components/editor/LivePageEditor';
import EditPanel from '../components/editor/EditPanel';

// Renders custom blocks added via the block palette in edit mode
const CustomBlock = ({ type, content: c }) => {
    switch (type) {
        case 'heading':
            return <h2 style={{ fontSize: c.fontSize || '2rem', color: c.color || '#111', textAlign: c.align || 'left', fontWeight: 'bold', margin: 0 }}>{c.text || 'Heading'}</h2>;
        case 'text':
            return <p style={{ fontSize: c.fontSize || '1rem', color: c.color || '#444', textAlign: c.align || 'left', lineHeight: 1.7, margin: 0 }}>{c.text || 'Text block'}</p>;
        case 'button':
            return (
                <div style={{ textAlign: c.align || 'center' }}>
                    <a href={c.url || '#'} style={{ display: 'inline-block', background: c.bg || '#f97316', color: c.color || '#fff', padding: '10px 28px', borderRadius: '10px', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem' }}>
                        {c.text || 'Click Here'}
                    </a>
                </div>
            );
        case 'image':
            return c.src
                ? <img src={c.src} alt={c.alt || ''} style={{ width: c.width || '100%', borderRadius: c.rounded ? '12px' : '0', objectFit: 'cover', display: 'block' }} />
                : <div style={{ background: '#f3f4f6', height: '160px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', fontSize: '0.875rem' }}>No image URL set</div>;
        case 'card':
            return (
                <div style={{ background: c.bg || '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                    {c.title && <h3 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#111', fontSize: '1.125rem' }}>{c.title}</h3>}
                    <p style={{ color: '#555', margin: 0 }}>{c.text || 'Card content'}</p>
                </div>
            );
        case 'alert':
            return (
                <div style={{ background: c.bg || '#fff7ed', border: `1px solid ${c.border || '#fed7aa'}`, borderRadius: '10px', padding: '14px 18px', color: c.color || '#9a3412' }}>
                    {c.text || 'Alert message'}
                </div>
            );
        case 'divider':
            return <hr style={{ border: 'none', borderTop: `${c.thickness || 1}px solid ${c.color || '#e5e7eb'}`, margin: '4px 0' }} />;
        case 'spacer':
            return <div style={{ height: `${c.height || 32}px` }} />;
        default:
            return null;
    }
};

const DEFAULT_SECTIONS = [
    { id: 'banner',        type: 'banner',        label: 'Village Banner',        content: {} },
    { id: 'gallery',       type: 'gallery',        label: 'Photo Gallery',         content: {} },
    { id: 'members',       type: 'members',        label: 'Panchayat Members',     content: {} },
    { id: 'map',           type: 'map',            label: 'Village Map',           content: {} },
    { id: 'history',       type: 'history',        label: 'History & Pride',       content: {} },
    { id: 'achievements',  type: 'achievements',   label: 'Achievements',          content: {} },
    { id: 'personalities', type: 'personalities',  label: 'Special Personalities', content: {} },
    { id: 'contact',       type: 'contact',        label: 'Quick Contact',         content: {} },
    { id: 'census',        type: 'census',         label: 'Census Data',           content: {} },
];

const SIDEBAR_TYPES = new Set(['personalities', 'contact']);
const GRID_TYPES    = new Set(['history', 'achievements', 'personalities', 'contact']);

const VillageProfile = () => {
    const [village, setVillage]   = useState(null);
    const [census,  setCensus]    = useState(null);
    const [members, setMembers]   = useState([]);
    const { t }                   = useLanguage();
    const { isEditMode, sections, reorderSections } = usePageEdit();

    useEffect(() => {
        axios.get('/village').then(r  => setVillage(r.data));
        axios.get('/census').then(r   => setCensus(r.data));
        axios.get('/panchayat').then(r => setMembers(r.data));
    }, []);

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    const handleDragEnd = ({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIdx = sections.findIndex(s => s.id === active.id);
        const newIdx = sections.findIndex(s => s.id === over.id);
        reorderSections(arrayMove(sections, oldIdx, newIdx));
    };

    if (!village) return <div className="text-center p-10">{t('Loading...', 'લોડ થઈ રહ્યું છે...')}</div>;

    const getContent = (id) => sections?.find(s => s.id === id)?.content ?? {};

    const censusHeaders = [
        t('Category', 'કેટેગરી'), t('Total', 'કુલ'), t('Male', 'પુરુષ'), t('Female', 'સ્ત્રી'),
    ];
    const renderCensusRow = (item, index) => (
        <tr key={item.id} className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-orange-100`}>
            <td className="py-3 px-4">{t(item.category, item.category)}</td>
            <td className="py-3 px-4">{item.total}</td>
            <td className="py-3 px-4">{item.male}</td>
            <td className="py-3 px-4">{item.female}</td>
        </tr>
    );

    const renderSection = (sec) => {
        const c = getContent(sec.id);
        switch (sec.type) {
            case 'banner':
                return <VillageBanner villageName={c.villageName || village.name} taluka={village.taluka} district={village.district} />;
            case 'gallery':
                return <VillageGallery images={village.images} />;
            case 'members':
                return members.length > 0 ? (
                    <section className="space-y-6">
                        <div>
                            <span className="text-xs font-bold tracking-widest text-orange-500 uppercase">{t('Leadership', 'નેતૃત્વ')}</span>
                            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                                {t(c.headingEn || 'Panchayat Members', c.headingGu || 'પંચાયતના સભ્યો')}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {members.map(member => (
                                <div key={member.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 px-6 pt-8 pb-4 flex flex-col items-center text-center">
                                        <img src={member.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=f97316&color=fff&size=128`} alt={member.name} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md mb-3" />
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{member.name}</h3>
                                        <span className="mt-1.5 inline-block bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wide">
                                            {t(member.role, member.role === 'Sarpanch' ? 'સરપંચ' : 'તલાટી મંત્રી')}
                                        </span>
                                    </div>
                                    <div className="px-6 py-4 space-y-2 text-sm text-gray-600">
                                        {member.mobile    && <p className="flex items-center gap-2"><span className="text-orange-400">📞</span>{member.mobile}</p>}
                                        {member.email     && <p className="flex items-center gap-2 truncate"><span className="text-orange-400">✉️</span>{member.email}</p>}
                                        {member.address   && <p className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">📍</span><span>{member.address}</span></p>}
                                        {member.description && <p className="text-gray-400 italic text-xs pt-1 border-t border-gray-100">{member.description}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : null;
            case 'map':
                return (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-extrabold text-gray-900 border-l-8 border-orange-500 pl-4 py-2 bg-orange-50 rounded-r-2xl">
                            {t(c.headingEn || 'Explore Our Village', c.headingGu || 'અમારું ગામ જુઓ')}
                        </h2>
                        <VillageMap villageName={village.name} />
                    </div>
                );
            case 'history':
                return (
                    <Card>
                        <h2 className="text-2xl font-bold mb-4 text-orange-700 flex items-center"><span className="mr-2">🏛️</span>{t('Village History & Pride', 'ગામનો ઇતિહાસ અને ગૌરવ')}</h2>
                        <div className="prose prose-orange max-w-none text-gray-700 leading-relaxed">
                            <p className="text-lg italic mb-4 border-l-4 border-orange-500 pl-4 bg-orange-50 py-2">
                                {t(c.historyEn || village.history?.english, c.historyGu || village.history?.gujarati)}
                            </p>
                        </div>
                    </Card>
                );
            case 'achievements':
                return (
                    <Card>
                        <h2 className="text-2xl font-bold mb-4 text-orange-700 flex items-center"><span className="mr-2">🏆</span>{t(c.headingEn || 'Achievements', c.headingGu || 'ગામની સિદ્ધિઓ')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {village.achievements?.map((ach, idx) => (
                                <div key={idx} className="bg-orange-50 p-4 rounded-xl border border-orange-100 flex items-start">
                                    <div className="bg-orange-500 text-white p-2 rounded-lg mr-4">🥇</div>
                                    <div><h3 className="font-bold text-gray-800">{ach.title}</h3><p className="text-sm text-gray-600">{ach.awarded_by}</p></div>
                                </div>
                            ))}
                        </div>
                    </Card>
                );
            case 'personalities':
                return (
                    <Card>
                        <h2 className="text-2xl font-bold mb-4 text-orange-700 flex items-center"><span className="mr-2">🌟</span>{t(c.headingEn || 'Special Personalities', c.headingGu || 'વિશેષ વ્યક્તિઓ')}</h2>
                        <div className="space-y-4">
                            {village.special_persons?.map((person, idx) => (
                                <div key={idx} className="flex items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold mr-4">{person.name.charAt(0)}</div>
                                    <div>
                                        <h3 className="font-bold text-gray-800">{person.name}</h3>
                                        <p className="text-xs text-orange-600 font-medium uppercase">{person.achievement}</p>
                                        <p className="text-xs text-gray-500">{person.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                );
            case 'contact':
                return (
                    <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-100">
                        <h2 className="text-xl font-bold mb-4">{t('Quick Contact', 'ઝડપી સંપર્ક')}</h2>
                        <div className="space-y-3 text-sm font-medium">
                            <p className="flex items-center gap-2"><span>📞</span>{c.phone   || '+91 12345 67890'}</p>
                            <p className="flex items-center gap-2"><span>✉️</span>{c.email   || 'support@panchayatsuvidha.in'}</p>
                            <p className="flex items-center gap-2"><span>📍</span>{c.address || 'Panchayat Office, Sayla'}</p>
                            {c.hours && <p className="flex items-center gap-2"><span>⏰</span>{c.hours}</p>}
                        </div>
                    </Card>
                );
            case 'census':
                return (
                    <Card>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-orange-700 flex items-center"><span className="mr-2">📊</span>{t(c.headingEn || 'Census Data', c.headingGu || 'વસ્તી ગણતરી ડેટા')}</h2>
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded font-bold tracking-widest">YEAR: {c.year || '2021'}</span>
                        </div>
                        {census
                            ? <Table headers={censusHeaders} data={census} renderRow={renderCensusRow} />
                            : <div className="grid grid-cols-1 md:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-lg" />)}</div>
                        }
                    </Card>
                );
            default:
                // Custom blocks added via the block palette
                if (sec.isCustom) {
                    return <CustomBlock type={sec.type} content={c} />;
                }
                return null;
        }
    };

    const activeSections = (isEditMode && sections) ? sections : DEFAULT_SECTIONS;
    const soloSections   = activeSections.filter(s => !GRID_TYPES.has(s.type) || s.isCustom);
    const gridSections   = activeSections.filter(s => GRID_TYPES.has(s.type) && !s.isCustom);

    const wrap = (sec) => {
        const rendered = renderSection(sec);
        if (!rendered) return null;
        if (!isEditMode) return <div key={sec.id}>{rendered}</div>;
        return <EditableSection key={sec.id} id={sec.id} label={sec.label}>{rendered}</EditableSection>;
    };

    const pageContent = (
        <div className={`container mx-auto p-6 space-y-8 transition-all duration-300 ${isEditMode ? 'pr-80' : ''}`}>
            {soloSections.map(sec => {
                if (sec.type === 'gallery') {
                    return (
                        <div key={sec.id} className="space-y-8">
                            {wrap(sec)}
                            <MidAdRow />
                        </div>
                    );
                }
                return wrap(sec);
            })}

            {gridSections.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {gridSections.filter(s => s.type === 'history').map(wrap)}
                        {gridSections.filter(s => s.type === 'achievements').map(wrap)}
                    </div>
                    <div className="space-y-8">
                        {gridSections.filter(s => SIDEBAR_TYPES.has(s.type)).map(wrap)}
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <>
            <LivePageEditor pageName="village-profile" defaultSections={DEFAULT_SECTIONS} />
            <EditPanel />
            {isEditMode ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={activeSections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        {pageContent}
                    </SortableContext>
                </DndContext>
            ) : pageContent}
        </>
    );
};

export default VillageProfile;

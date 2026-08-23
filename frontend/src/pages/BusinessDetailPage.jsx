import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, Phone, Mail, MapPin, Globe, ArrowLeft, Package } from 'lucide-react';
import axios from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import Card from '../components/Card';
import BlockRenderer from '../components/pagebuilder/BlockRenderer';

const BusinessDetailPage = () => {
    const { slug } = useParams();
    const { t } = useLanguage();
    const [business, setBusiness] = useState(null);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState('overview'); // 'overview' | 'products' | 'contact' | a custom tab slug
    const [customTabContent, setCustomTabContent] = useState({}); // slug -> blocks[]
    const [loadingTab, setLoadingTab] = useState(false);

    useEffect(() => {
        let active = true;
        axios.get(`/business/${slug}`)
            .then(res => {
                if (!active) return;
                setBusiness(res.data);
                setError(null);
                setTab('overview');
                setCustomTabContent({});
            })
            .catch(() => { if (active) { setError('Business not found'); setBusiness(null); } });
        return () => { active = false; };
    }, [slug]);

    const selectCustomTab = (tabSlug) => {
        setTab(tabSlug);
        if (customTabContent[tabSlug]) return; // already fetched
        setLoadingTab(true);
        axios.get(`/business/${slug}/tabs/${tabSlug}`)
            .then(res => setCustomTabContent(prev => ({ ...prev, [tabSlug]: res.data.content_json || [] })))
            .catch(() => setCustomTabContent(prev => ({ ...prev, [tabSlug]: [] })))
            .finally(() => setLoadingTab(false));
    };

    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center p-8 gap-4">
            <p className="text-2xl font-bold text-gray-700">{t('Business not found', 'વ્યવસાય મળ્યો નથી')}</p>
            <Link to="/business" className="text-primary-500 hover:underline font-medium">← {t('Back to Directory', 'ડિરેક્ટરી પર પાછા')}</Link>
        </div>
    );

    if (!business) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const customTabs = business.tabs || [];
    const TABS = [
        { key: 'overview', label: t('Overview', 'ઝાંખી') },
        { key: 'products', label: t('Products & Portfolio', 'ઉત્પાદનો') },
        ...customTabs.map(ct => ({ key: ct.slug, label: ct.title, custom: true })),
        { key: 'contact', label: t('Contact', 'સંપર્ક') },
    ];

    return (
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
            <Link to="/business" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600">
                <ArrowLeft className="w-4 h-4" /> {t('Back to Directory', 'ડિરેક્ટરી પર પાછા')}
            </Link>

            {/* Cover + header */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                <div className="h-40 sm:h-56 bg-gradient-to-br from-primary-100 to-primary-50" style={business.cover_url ? { backgroundImage: `url(${business.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined} />
                <div className="bg-white p-6 flex items-start gap-4">
                    {business.logo_url ? (
                        <img src={business.logo_url} alt={business.name} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md -mt-12" />
                    ) : (
                        <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600 -mt-12 border-4 border-white shadow-md">
                            <Store className="w-7 h-7" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900">{t(business.name, business.name_gu || business.name)}</h1>
                        {business.category && <span className="inline-block mt-1 text-xs font-bold text-primary-700 bg-primary-100 px-2.5 py-1 rounded-full">{business.category}</span>}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
                {TABS.map(tb => (
                    <button
                        key={tb.key}
                        onClick={() => tb.custom ? selectCustomTab(tb.key) : setTab(tb.key)}
                        className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${tab === tb.key ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        {tb.label}
                    </button>
                ))}
            </div>

            {tab === 'overview' && (
                <Card>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {t(business.description, business.description_gu || business.description) || t('No description provided.', 'કોઈ વર્ણન આપેલ નથી.')}
                    </p>
                    {business.owner_name && (
                        <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                            {t('Owner', 'માલિક')}: <span className="font-semibold text-gray-700">{business.owner_name}</span>
                        </p>
                    )}
                </Card>
            )}

            {tab === 'products' && (
                business.products?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {business.products.map(p => (
                            <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                {p.image_url ? (
                                    <img src={p.image_url} alt={p.name} className="w-full h-32 object-cover" />
                                ) : (
                                    <div className="w-full h-32 bg-gray-50 flex items-center justify-center text-gray-300">
                                        <Package className="w-8 h-8" />
                                    </div>
                                )}
                                <div className="p-4 space-y-1">
                                    <p className="font-bold text-gray-900">{t(p.name, p.name_gu || p.name)}</p>
                                    {p.price && <p className="text-primary-600 font-semibold text-sm">₹{p.price}</p>}
                                    {p.description && <p className="text-xs text-gray-500">{p.description}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Card><p className="text-gray-400 text-center py-8">{t('No products listed yet.', 'હજુ કોઈ ઉત્પાદનો સૂચિબદ્ધ નથી.')}</p></Card>
                )
            )}

            {tab === 'contact' && (
                <Card className="space-y-3 text-sm">
                    {business.phone && <p className="flex items-center gap-2 text-gray-700"><Phone className="w-4 h-4 text-primary-500" />{business.phone}</p>}
                    {business.email && <p className="flex items-center gap-2 text-gray-700"><Mail className="w-4 h-4 text-primary-500" />{business.email}</p>}
                    {business.address && <p className="flex items-start gap-2 text-gray-700"><MapPin className="w-4 h-4 text-primary-500 mt-0.5" />{business.address}</p>}
                    {business.website && (
                        <p className="flex items-center gap-2 text-gray-700">
                            <Globe className="w-4 h-4 text-primary-500" />
                            <a href={business.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{business.website}</a>
                        </p>
                    )}
                    {!business.phone && !business.email && !business.address && !business.website && (
                        <p className="text-gray-400">{t('No contact details provided.', 'કોઈ સંપર્ક વિગતો આપેલ નથી.')}</p>
                    )}
                </Card>
            )}

            {customTabs.some(ct => ct.slug === tab) && (
                <div className="space-y-2">
                    {loadingTab && !customTabContent[tab] ? (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (customTabContent[tab] || []).length > 0 ? (
                        <Card className="space-y-2">
                            {customTabContent[tab].map(block => <BlockRenderer key={block.id} block={block} />)}
                        </Card>
                    ) : (
                        <Card><p className="text-gray-400 text-center py-8">{t('No content yet.', 'હજુ કોઈ સામગ્રી નથી.')}</p></Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default BusinessDetailPage;

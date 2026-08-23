import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Store, MapPin, Phone } from 'lucide-react';
import axios from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

const BusinessDirectoryPage = () => {
    const { t } = useLanguage();
    const [businesses, setBusinesses] = useState(null);
    const [categories, setCategories] = useState([]);
    const [q, setQ] = useState('');
    const [category, setCategory] = useState('');

    useEffect(() => {
        axios.get('/business/categories').then(res => setCategories(res.data)).catch(() => setCategories([]));
    }, []);

    const fetchBusinesses = useCallback(() => {
        const params = {};
        if (q) params.q = q;
        if (category) params.category = category;
        axios.get('/business', { params })
            .then(res => setBusinesses(res.data))
            .catch(() => setBusinesses([]));
    }, [q, category]);

    useEffect(() => {
        const timer = setTimeout(fetchBusinesses, 250); // debounce search-as-you-type
        return () => clearTimeout(timer);
    }, [fetchBusinesses]);

    return (
        <div className="container mx-auto p-6 space-y-6 max-w-6xl">
            <div>
                <span className="text-xs font-bold tracking-widest text-primary-500 uppercase">{t('Digital Business Directory', 'ડિજિટલ બિઝનેસ ડિરેક્ટરી')}</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
                    {t('Find Local Businesses', 'સ્થાનિક વ્યવસાયો શોધો')}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                    {t('Search and browse businesses in the village', 'ગામમાં વ્યવસાયો શોધો અને જુઓ')}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder={t('Search businesses...', 'વ્યવસાય શોધો...')}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    />
                </div>
                {categories.length > 0 && (
                    <select
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    >
                        <option value="">{t('All Categories', 'બધી કેટેગરી')}</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                )}
            </div>

            {businesses === null && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-2xl" />)}
                </div>
            )}

            {businesses !== null && businesses.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">{t('No businesses found', 'કોઈ વ્યવસાય મળ્યો નથી')}</p>
                </div>
            )}

            {businesses && businesses.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {businesses.map(b => (
                        <Link
                            key={b.id}
                            to={`/business/${b.slug}`}
                            className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-3">
                                {b.logo_url ? (
                                    <img src={b.logo_url} alt={b.name} className="w-12 h-12 rounded-xl object-cover border border-gray-100" />
                                ) : (
                                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-500">
                                        <Store className="w-5 h-5" />
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 truncate">{t(b.name, b.name_gu || b.name)}</p>
                                    {b.category && <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">{b.category}</span>}
                                </div>
                            </div>
                            {b.description && <p className="text-sm text-gray-500 line-clamp-2">{t(b.description, b.description_gu || b.description)}</p>}
                            <div className="text-xs text-gray-400 space-y-1 mt-auto pt-2 border-t border-gray-50">
                                {b.address && <p className="flex items-center gap-1.5 truncate"><MapPin className="w-3 h-3 flex-shrink-0" />{b.address}</p>}
                                {b.phone && <p className="flex items-center gap-1.5"><Phone className="w-3 h-3 flex-shrink-0" />{b.phone}</p>}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BusinessDirectoryPage;

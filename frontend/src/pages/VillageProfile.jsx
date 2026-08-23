import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import axios from '../api/axios';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import BlockRenderer from '../components/pagebuilder/BlockRenderer';
import { DEFAULT_HOME_BLOCKS } from '../components/pagebuilder/defaultHomeBlocks';

// The site's homepage — just the 'home' page rendered through the same
// block renderer as any Page Builder page. If a village hasn't customized
// it yet, it falls back to a sensible default layout; saving happens
// through Admin → Page Builder, not an in-place editor here.
const VillageProfile = () => {
    const { t } = useLanguage();
    const { isAdmin } = useAuth();
    const [blocks, setBlocks] = useState(null);

    useEffect(() => {
        axios.get('/pages/home')
            .then(res => {
                const saved = res.data?.content_json;
                setBlocks(Array.isArray(saved) && saved.length ? saved : DEFAULT_HOME_BLOCKS);
            })
            .catch(() => setBlocks(DEFAULT_HOME_BLOCKS));
    }, []);

    if (!blocks) return <div className="text-center p-10">{t('Loading...', 'લોડ થઈ રહ્યું છે...')}</div>;

    return (
        <div className="container mx-auto p-6 space-y-8">
            {isAdmin && (
                <div className="flex justify-end">
                    <Link
                        to="/admin"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 border border-primary-200 px-3 py-1.5 rounded-lg transition-colors"
                    >
                        <Settings2 className="w-3.5 h-3.5" />
                        {t('Edit this page in Page Builder', 'પેજ બિલ્ડરમાં આ પેજ સંપાદિત કરો')}
                    </Link>
                </div>
            )}
            {blocks.map(block => <BlockRenderer key={block.id} block={block} />)}
        </div>
    );
};

export default VillageProfile;

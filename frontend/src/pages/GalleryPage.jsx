import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useLanguage } from '../context/LanguageContext';

const GalleryPage = () => {
    const { t } = useLanguage();
    const [images, setImages] = useState([]);
    const [active, setActive] = useState(null);

    useEffect(() => {
        axios.get('/village').then(res => setImages(res.data.images || [])).catch(() => setImages([]));
    }, []);

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-8 text-primary-700 border-l-8 border-primary-500 pl-4">
                {t('Photo Gallery', 'ફોટો ગેલેરી')}
            </h1>

            {images.length === 0 && (
                <p className="text-gray-400 text-sm">{t('No photos added yet.', 'હજુ કોઈ ફોટા ઉમેરાયા નથી.')}</p>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((url, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActive(url)}
                        className="aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <img src={url} alt={`Village photo ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>

            {active && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
                    onClick={() => setActive(null)}
                >
                    <img src={active} alt="" className="max-w-full max-h-full rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
};

export default GalleryPage;

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, Images } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const VillageGallery = ({ images = [] }) => {
    const { t } = useLanguage();
    const [lightbox, setLightbox] = useState(null); // index or null

    // Fallback to public images if none passed
    const photos = images.length > 0 ? images : [
        '/images/Loc_Sayla_1567329861.jpg',
        '/images/sayla-gujarat-1.jpg',
        '/images/Stepwell-Dhandhalpar-sayla.jpg',
    ];

    const prev = useCallback(() =>
        setLightbox(i => (i - 1 + photos.length) % photos.length), [photos.length]);
    const next = useCallback(() =>
        setLightbox(i => (i + 1) % photos.length), [photos.length]);

    // Keyboard navigation
    useEffect(() => {
        if (lightbox === null) return;
        const handler = (e) => {
            if (e.key === 'ArrowLeft')  prev();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'Escape')     setLightbox(null);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [lightbox, prev, next]);

    // Lock body scroll when lightbox open
    useEffect(() => {
        document.body.style.overflow = lightbox !== null ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [lightbox]);

    return (
        <section className="space-y-6">

            {/* Section header */}
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Images className="w-5 h-5 text-primary-500" />
                        <span className="text-xs font-bold tracking-widest text-primary-500 uppercase">
                            {t('Photo Gallery', 'ફોટો ગેલેરી')}
                        </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                        {t('Explore Sayla Village', 'સાયલા ગામ જુઓ')}
                    </h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {t(
                            'Discover the beauty, culture, and development of our village',
                            'અમારા ગામની સુંદરતા, સંસ્કૃતિ અને વિકાસ જુઓ'
                        )}
                    </p>
                </div>
                <span className="text-xs text-gray-400 font-medium self-start sm:self-end pb-1">
                    {photos.length} {t('photos', 'ફોટો')}
                </span>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {photos.map((src, i) => (
                    <button
                        key={i}
                        onClick={() => setLightbox(i)}
                        className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100 shadow-md hover:shadow-xl transition-shadow duration-300 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
                        aria-label={`${t('View photo', 'ફોટો જુઓ')} ${i + 1}`}
                    >
                        <img
                            src={src}
                            alt={`${t('Village photo', 'ગામ ફોટો')} ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Zoom icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-3">
                                <ZoomIn className="w-5 h-5 text-white" />
                            </div>
                        </div>
                        {/* Bottom label */}
                        <div className="absolute bottom-0 inset-x-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-white text-xs font-semibold tracking-wide">
                                {t('Sayla Village', 'સાયલા ગામ')} • {i + 1}/{photos.length}
                            </p>
                        </div>
                        {/* Orange accent corner */}
                        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </button>
                ))}
            </div>

            {/* ── Lightbox ── */}
            {lightbox !== null && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
                    onClick={() => setLightbox(null)}
                >
                    {/* Close */}
                    <button
                        onClick={() => setLightbox(null)}
                        className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full p-2 transition-colors"
                        aria-label={t('Close', 'બંધ કરો')}
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Prev */}
                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        className="absolute left-4 z-10 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full p-3 transition-colors"
                        aria-label={t('Previous', 'પહેલાં')}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Image */}
                    <div
                        className="relative max-w-5xl w-full mx-16 rounded-2xl overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={photos[lightbox]}
                            alt={`${t('Village photo', 'ગામ ફોટો')} ${lightbox + 1}`}
                            className="w-full max-h-[80vh] object-contain bg-black"
                        />
                        {/* Caption bar */}
                        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-6 py-4">
                            <p className="text-white font-semibold text-sm">
                                {t('Sayla Village', 'સાયલા ગામ')}
                            </p>
                            <p className="text-white/50 text-xs mt-0.5">
                                {lightbox + 1} / {photos.length}
                            </p>
                        </div>
                    </div>

                    {/* Next */}
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        className="absolute right-4 z-10 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-full p-3 transition-colors"
                        aria-label={t('Next', 'આગળ')}
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {photos.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                                className={`rounded-full transition-all duration-200 ${
                                    i === lightbox
                                        ? 'w-6 h-2 bg-primary-400'
                                        : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                                }`}
                                aria-label={`${t('Photo', 'ફોટો')} ${i + 1}`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
};

export default VillageGallery;

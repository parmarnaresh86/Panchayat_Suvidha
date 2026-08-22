
import React, { useState, useEffect } from 'react';
import { ArrowRight, PhoneCall } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate, useLocation } from 'react-router-dom';

const HeroSection = ({ villageImages, villageName }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Use images from props or fallback to defaults if not provided
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const images = villageImages && villageImages.length > 0 ? villageImages : [
        "/images/Loc_Sayla_1567329861.jpg",
        "/images/sayla-gujarat-1.jpg",
        "/images/Stepwell-Dhandhalpar-sayla.jpg"];

    useEffect(() => {
        console.log("HeroSection villageImages:", villageImages);
        console.log("Using images:", images);
    }, [villageImages, images]);

    useEffect(() => {
        let interval;
        if (isHovered) {
            interval = setInterval(() => {
                setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
            }, 1500); // Change image every 1.5 seconds on hover
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isHovered, images.length]);

    return (
        <section className="relative overflow-hidden bg-linear-to-r from-white to-orange-50 py-14 md:py-24 px-6 lg:px-8 rounded-3xl mb-12 shadow-lg border border-orange-100 transition-all duration-700 animate-in fade-in slide-in-from-top">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-orange-200 rounded-full blur-3xl opacity-30"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    
                    {/* Left Side: Content */}
                    <div className="space-y-6 text-left animate-in fade-in slide-in-from-left duration-1000">
                        <div>
                            <span className="text-sm font-semibold text-gray-500 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-orange-200 inline-flex items-center shadow-sm">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
                                {t('Government of India | PanchayatSuvidha', 'ભારત સરકાર | પંચાયત સુવિધા')}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
                                {t('Welcome to', 'સ્વાગત છે')} <br />
                                <span className="text-orange-600 underline decoration-orange-200 decoration-8 underline-offset-8 capitalize">
                                    {villageName || 'Ghughrala'}
                                </span>
                            </h1>
                        </div>

                        <div className="space-y-4 max-w-xl">
                            <p className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed">
                                {t('A model village for digital transformation and community excellence.', 'ડિજિટલ પરિવર્તન અને સામુદાયિક શ્રેષ્ઠતા માટે એક મોડેલ ગામ.')}
                            </p>
                            <p className="text-gray-500 text-sm md:text-base leading-relaxed border-l-4 border-orange-500 pl-4 py-1 bg-white/40 rounded-r-lg">
                                {t(
                                    'Discover the heritage, services, and growth of our progressive Gram Panchayat. We are committed to transparent and efficient governance.',
                                    'અમારી પ્રગતિશીલ ગ્રામ પંચાયતની વિરાસત, સેવાઓ અને વિકાસ શોધો. અમે પારદર્શક અને કાર્યક્ષમ શાસન માટે પ્રતિબદ્ધ છીએ.'
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={() => {
                                    navigate('/services');
                                }}
                                aria-label={t('Go to village services section', 'ગામની સેવાઓ વિભાગ પર જાઓ')}
                                className="flex items-center justify-center gap-2 bg-linear-to-r from-orange-500 to-orange-600 text-white px-10 py-4 rounded-2xl font-extrabold text-xl shadow-lg hover:shadow-2xl hover:scale-105 transform transition-all duration-300 ease-out group"
                            >
                                {t('View Services', 'સેવાઓ જુઓ')}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => {
                                    if (location.pathname === '/') {
                                        const contactSection = document.getElementById('quick-contact');
                                        if (contactSection) {
                                            contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        } else {
                                            navigate('/contact');
                                        }
                                    } else {
                                        navigate('/contact');
                                    }
                                }}
                                aria-label={t('Go to quick contact section', 'ઝડપી સંપર્ક વિભાગ પર જાઓ')}
                                className="flex items-center justify-center gap-2 border-2 border-gray-200 bg-white text-gray-800 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 hover:border-orange-300 hover:shadow-lg transition-all duration-300"
                            >
                                <PhoneCall className="w-5 h-5 text-orange-600" />
                                {t('Contact Panchayat', 'પંચાયત સંપર્ક')}
                            </button>
                        </div>
                    </div>

                    {/* Right Side: Image with Layered Effect and Interactive Hover */}
                    <div 
                        className="relative animate-in fade-in slide-in-from-right duration-1000 delay-200"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => {
                            setIsHovered(false);
                            setCurrentImageIndex(0);
                        }}
                    >
                        {/* Background Decorative Element */}
                        <div className="absolute -inset-4 bg-linear-to-tr from-orange-200 to-orange-50 rounded-[2.5rem] rotate-3 -z-10 shadow-inner"></div>
                        <div className="absolute -inset-4 bg-white/20 backdrop-blur-sm rounded-[2.5rem] -rotate-3 -z-10 border border-white/50 shadow-xl"></div>
                        
                        {/* Main Image Container */}
                        <div className="relative overflow-hidden rounded-3xl shadow-2xl border-8 border-white group h-96 md:h-125">
                            {images.map((src, index) => (
                                <img 
                                    key={index}
                                    src={src} 
                                    alt={`Village Heritage ${index + 1}`} 
                                    onError={(e) => {
                                        // Only set fallback if not already fallback
                                        if (!e.target.src.includes('unsplash.com')) {
                                            console.error(`Failed to load image: ${src}. Falling back to Unsplash.`);
                                            e.target.src = "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1200";
                                        }
                                    }}
                                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out ${
                                        index === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                                    } group-hover:scale-105`}
                                />
                            ))}
                            
                            {/* Overlay Info Card */}
                            <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 transform transition-transform duration-500 hover:-translate-y-2 z-20">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-orange-200">
                                        🏘️
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-orange-600 uppercase tracking-widest">{t('Model Village', 'આદર્શ ગામ')}</p>
                                        <h4 className="font-extrabold text-gray-900">{t('Digital Sayla', 'ડિજિટલ સાયલા ')}</h4>
                                    </div>
                                </div>
                            </div>

                            {/* Hover Indicator */}
                            {!isHovered && (
                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full z-10 animate-pulse">
                                    {t('HOVER TO EXPLORE', 'વધુ જોવા માટે હોવર કરો')}
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default HeroSection;

import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

// Fallback menu shown if a village hasn't saved its own navigation yet
// (new villages always get this via starter-content.js, but existing
// villages created before the Navigation feature won't have rows).
const FALLBACK_NAV = [
    { id: 'fallback-home', label_en: 'Home', label_gu: 'હોમ', link_type: 'builtin', link_value: '/', icon_url: null, children: [] },
    { id: 'fallback-services', label_en: 'Services', label_gu: 'સેવાઓ', link_type: 'builtin', link_value: '/services', icon_url: null, children: [] },
    { id: 'fallback-business', label_en: 'Business Directory', label_gu: 'બિઝનેસ ડિરેક્ટરી', link_type: 'builtin', link_value: '/business', icon_url: null, children: [] },
    { id: 'fallback-contact', label_en: 'Contact', label_gu: 'સંપર્ક', link_type: 'builtin', link_value: '/contact', icon_url: null, children: [] },
];

const resolveHref = (item) => {
    if (item.link_type === 'page') return item.link_value === 'home' ? '/' : `/p/${item.link_value}`;
    if (item.link_type === 'url') return item.link_value || '#';
    return item.link_value || '/';
};

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [openMobileSub, setOpenMobileSub] = useState(null);
    const { language, toggleLanguage, t } = useLanguage();
    const { isAdmin, isLoggedIn, refreshAuth } = useAuth();
    const navigate = useNavigate();

    const [navItems, setNavItems] = useState(FALLBACK_NAV);

    useEffect(() => {
        axios.get('/navigation')
            .then(res => setNavItems(res.data.length ? res.data : FALLBACK_NAV))
            .catch(() => setNavItems(FALLBACK_NAV));
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.dispatchEvent(new Event('auth-change'));
        refreshAuth();
        setIsOpen(false);
        navigate('/login');
    };

    const linkClass = ({ isActive }) =>
        isActive ? 'text-primary-600 font-semibold' : 'text-gray-700 hover:text-primary-600';

    const itemLabel = (item) => (
        <span className="inline-flex items-center gap-1.5">
            {item.icon_url && <img src={item.icon_url} alt="" className="w-4 h-4 rounded object-cover" />}
            {t(item.label_en, item.label_gu || item.label_en)}
        </span>
    );

    const renderLink = (item, extraClass = '') => {
        const href = resolveHref(item);
        if (item.link_type === 'url') {
            return (
                <a href={href} target="_blank" rel="noopener noreferrer" className={`text-gray-700 hover:text-primary-600 ${extraClass}`} onClick={() => setIsOpen(false)}>
                    {itemLabel(item)}
                </a>
            );
        }
        return (
            <NavLink to={href} className={(state) => `${linkClass(state)} ${extraClass}`} onClick={() => setIsOpen(false)}>
                {itemLabel(item)}
            </NavLink>
        );
    };

    // Desktop: hover dropdown for items with children
    const desktopNav = (
        <div className="hidden md:flex items-center gap-6">
            {navItems.map(item => (
                item.children?.length > 0 ? (
                    <div key={item.id} className="relative group">
                        <button className="flex items-center gap-1 text-gray-700 hover:text-primary-600">
                            {itemLabel(item)}
                            <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <div className="absolute left-0 top-full pt-2 hidden group-hover:block z-50">
                            <div className="bg-white border border-gray-100 rounded-xl shadow-lg py-2 min-w-48">
                                {item.children.map(child => (
                                    <div key={child.id} className="px-4 py-2 hover:bg-primary-50">
                                        {renderLink(child, 'block text-sm')}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div key={item.id}>{renderLink(item)}</div>
                )
            ))}
            {isAdmin && (
                <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                        `flex items-center gap-1.5 font-semibold transition-colors ${isActive ? 'text-primary-600' : 'text-primary-500 hover:text-primary-700'}`
                    }
                >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('Admin Panel', 'એડમિન પેનલ')}
                </NavLink>
            )}
        </div>
    );

    // Mobile: tap-to-expand accordion for items with children
    const mobileNav = (
        <div className="flex flex-col space-y-1">
            {navItems.map(item => (
                item.children?.length > 0 ? (
                    <div key={item.id}>
                        <button
                            onClick={() => setOpenMobileSub(openMobileSub === item.id ? null : item.id)}
                            className="flex items-center justify-between w-full py-2 text-gray-700"
                        >
                            {itemLabel(item)}
                            <ChevronDown className={`w-4 h-4 transition-transform ${openMobileSub === item.id ? 'rotate-180' : ''}`} />
                        </button>
                        {openMobileSub === item.id && (
                            <div className="pl-4 space-y-1 pb-1">
                                {item.children.map(child => (
                                    <div key={child.id} className="py-1">{renderLink(child, 'text-sm')}</div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div key={item.id} className="py-2">{renderLink(item)}</div>
                )
            ))}
            {isAdmin && (
                <NavLink
                    to="/admin"
                    className="flex items-center gap-1.5 font-semibold text-primary-500 hover:text-primary-700 py-2"
                    onClick={() => setIsOpen(false)}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('Admin Panel', 'એડમિન પેનલ')}
                </NavLink>
            )}
        </div>
    );

    return (
        <nav className="bg-white/90 backdrop-blur border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <img className="h-9 w-9" src="/logo.svg" alt="Panchayat Suvidha Logo" />
                        <span className="ml-3 text-lg sm:text-xl font-bold text-gray-900 tracking-tight">
                            PanchayatSuvidha
                        </span>
                    </div>

                    {/* Desktop nav */}
                    <div className="hidden md:flex items-center space-x-6">
                        {desktopNav}

                        <button
                            onClick={toggleLanguage}
                            className="text-sm font-medium text-gray-600 hover:text-primary-600 border border-gray-300 px-3 py-1 rounded-md"
                        >
                            {language === 'en' ? 'ગુજરાતી' : 'English'}
                        </button>

                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                            >
                                <LogOut className="w-4 h-4" />
                                {t('Logout', 'લૉગઆઉટ')}
                            </button>
                        ) : (
                            <NavLink to="/login" className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors">
                                {t('Login / Register', 'લોગિન / રજીસ્ટર')}
                            </NavLink>
                        )}
                    </div>

                    {/* Mobile controls */}
                    <div className="-mr-2 flex md:hidden items-center space-x-2">
                        <button
                            onClick={toggleLanguage}
                            className="text-xs font-medium text-gray-600 border border-gray-300 px-2 py-1 rounded-md"
                        >
                            {language === 'en' ? 'ગુ' : 'En'}
                        </button>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 sm:px-3">
                        {mobileNav}
                    </div>
                    <div className="pt-4 pb-3 border-t border-gray-200 px-2">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 w-full text-center bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                {t('Logout', 'લૉગઆઉટ')}
                            </button>
                        ) : (
                            <NavLink
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="block w-full text-center bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                            >
                                {t('Login / Register', 'લોગિન / રજીસ્ટર')}
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

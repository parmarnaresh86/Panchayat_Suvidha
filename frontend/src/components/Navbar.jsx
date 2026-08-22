import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { usePageEdit } from '../context/PageEditContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { language, toggleLanguage, t } = useLanguage();
    const { isEditMode, isAdmin, isLoggedIn, refreshAuth } = usePageEdit();
    const navigate = useNavigate();

    // Dynamic pages added via Page Builder
    const [navbarPages, setNavbarPages] = useState(() => {
        try { return JSON.parse(localStorage.getItem('navbarPages') || '[]'); } catch { return []; }
    });

    useEffect(() => {
        const sync = () => {
            try { setNavbarPages(JSON.parse(localStorage.getItem('navbarPages') || '[]')); } catch { /* */ }
        };
        window.addEventListener('navbar-pages-change', sync);
        window.addEventListener('storage', sync);
        return () => {
            window.removeEventListener('navbar-pages-change', sync);
            window.removeEventListener('storage', sync);
        };
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
        isActive ? 'text-orange-600 font-semibold' : 'text-gray-700 hover:text-orange-600';

    const navLinks = (
        <div className="flex flex-col md:flex-row md:space-x-6 space-y-2 md:space-y-0 items-start md:items-center">
            <NavLink to="/" className={linkClass} onClick={() => setIsOpen(false)}>
                {t('Village Profile', 'ગામની પ્રોફાઇલ')}
            </NavLink>
            <NavLink to="/services" className={linkClass} onClick={() => setIsOpen(false)}>
                {t('Services', 'સેવાઓ')}
            </NavLink>
            <NavLink to="/contact" className={linkClass} onClick={() => setIsOpen(false)}>
                {t('Contact', 'સંપર્ક')}
            </NavLink>
            {/* Dynamic pages from Page Builder */}
            {navbarPages.map(page => (
                <NavLink key={page.slug} to={`/p/${page.slug}`} className={linkClass} onClick={() => setIsOpen(false)}>
                    {page.title}
                </NavLink>
            ))}
            {/* Admin Panel link — only visible when logged in as admin */}
            {isAdmin && (
                <NavLink
                    to="/admin"
                    className={({ isActive }) =>
                        `flex items-center gap-1.5 font-semibold transition-colors ${isActive ? 'text-orange-600' : 'text-orange-500 hover:text-orange-700'}`
                    }
                    onClick={() => setIsOpen(false)}
                >
                    <LayoutDashboard className="w-4 h-4" />
                    {t('Admin Panel', 'એડમિન પેનલ')}
                </NavLink>
            )}
        </div>
    );

    return (
        <nav className={`bg-white/90 backdrop-blur border-b sticky top-0 z-50 transition-colors duration-200 ${isEditMode ? 'border-orange-400 bg-orange-50/90' : 'border-gray-200'}`}>
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
                        {navLinks}

                        <button
                            onClick={toggleLanguage}
                            className="text-sm font-medium text-gray-600 hover:text-orange-600 border border-gray-300 px-3 py-1 rounded-md"
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
                            <NavLink to="/login" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
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
                            className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-500"
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
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks}
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
                                className="block w-full text-center bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
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

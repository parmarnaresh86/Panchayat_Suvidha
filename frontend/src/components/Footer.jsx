import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
    const { t } = useLanguage();

    return (
        <footer className="bg-gray-900 border-t border-gray-800 mt-12">
            <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">

                {/* Copyright */}
                <span>© {new Date().getFullYear()} PanchayatSuvidha — {t('Sayla Gram Panchayat', 'સાયલા ગ્રામ પંચાયત')}</span>

                {/* Nav links */}
                <div className="flex items-center gap-4">
                    <Link to="/" className="hover:text-primary-400 transition-colors">{t('Village Profile', 'ગામ પ્રોફાઇલ')}</Link>
                    <Link to="/services" className="hover:text-primary-400 transition-colors">{t('Services', 'સેવાઓ')}</Link>
                    <Link to="/login" className="hover:text-primary-400 transition-colors">{t('Admin Login', 'એડમિન લોગિન')}</Link>
                </div>

                {/* Contact */}
                <a href="mailto:support@panchayatsuvidha.in" className="hover:text-primary-400 transition-colors">
                    {t('Contact us for website', 'વેબસાઇટ માટે સંપર્ક કરો')}
                </a>

            </div>
        </footer>
    );
};

export default Footer;

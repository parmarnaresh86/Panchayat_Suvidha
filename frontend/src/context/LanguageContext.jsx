
/* eslint react-refresh/only-export-components: off */
import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguage] = useState('en'); // 'en' or 'gu'

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'gu' : 'en');
    };

    const t = (en, gu) => {
        return language === 'en' ? en : gu;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);

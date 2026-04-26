import React, { createContext, useState, useEffect } from 'react';
import translations from './i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default to 'en', but can check localStorage
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('appLang') || 'en';
    });

    useEffect(() => {
        localStorage.setItem('appLang', lang);
        // Set dir="rtl" for Arabic
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = lang;
    }, [lang]);

    const getValue = (source, key) => {
        return key.split('.').reduce((value, part) => value?.[part], source);
    };

    const t = (key) => {
        return getValue(translations[lang], key) || getValue(translations.en, key) || key;
    };

    const translateCategory = (category) => {
        const categoryKey = category || 'Uncategorized';
        return translations[lang].categories?.[categoryKey] || translations.en.categories[categoryKey] || categoryKey;
    };

    const translateService = (service) => {
        const localized = translations[lang].serviceCopy?.[service.title];
        return {
            ...service,
            title: localized?.title || service.title,
            description: localized?.description || service.description,
            category: translateCategory(service.category)
        };
    };

    const format = (key, values = {}) => {
        return Object.entries(values).reduce(
            (text, [name, value]) => text.replace(`{${name}}`, value),
            t(key)
        );
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, format, translateCategory, translateService }}>
            {children}
        </LanguageContext.Provider>
    );
};

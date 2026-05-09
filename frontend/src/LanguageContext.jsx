import React, { createContext, useState, useEffect } from 'react';
import translations from './i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default to 'ar', but check localStorage
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('appLang') || 'ar';
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
        if (!category) return t('uncategorized');
        return (
            translations[lang].categories?.[category] ||
            translations.en.categories?.[category] ||
            category
        );
    };

    const translateSubCategory = (subCategory) => {
        if (!subCategory) return null;
        return (
            translations[lang].categories?.[subCategory] ||
            translations.en.categories?.[subCategory] ||
            subCategory
        );
    };

    /**
     * Returns a fully-localized service object.
     * `service` can be either a full object from the API or just a service title string.
     */
    const translateService = (service) => {
        // Guard: if service is null/undefined return an empty shell
        if (!service) {
            return { title: '—', description: '', category: '', sub_category: null, bullet_points: [] };
        }

        // If only a string (title) was passed, build a minimal object
        const svc = typeof service === 'string'
            ? { title: service, description: '', category: '', sub_category: null, bullet_points: [] }
            : service;

        const localized = translations[lang]?.serviceCopy?.[svc.title];
        const fallback  = translations.en?.serviceCopy?.[svc.title];
        const copy      = localized || fallback;

        return {
            ...svc,
            title:        copy?.title        || svc.title,
            description:  copy?.description  || svc.description,
            sub_category: copy?.sub_category !== undefined ? copy.sub_category : svc.sub_category,
            bullet_points: copy?.bullets     || svc.bullet_points || [],
            category:     translateCategory(svc.category)
        };
    };

    const format = (key, values = {}) => {
        return Object.entries(values).reduce(
            (text, [name, value]) => text.replace(`{${name}}`, value),
            t(key)
        );
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, format, translateCategory, translateSubCategory, translateService }}>
            {children}
        </LanguageContext.Provider>
    );
};

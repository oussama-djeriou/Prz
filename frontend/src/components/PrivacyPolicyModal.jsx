import React, { useContext } from 'react';
import { LanguageContext } from '../LanguageContext';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
    const { t, lang } = useContext(LanguageContext);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4 py-8">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-full flex flex-col" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h2 className="text-xl font-bold text-gray-800">{t('privacyPolicyTitle')}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 font-bold text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-gray-700 text-sm md:text-base leading-relaxed text-justify">
                    <p>{t('pp1')}</p>
                    <p>{t('pp2')}</p>
                    <p>{t('pp3')}</p>
                    <p>{t('pp4')}</p>
                    <p>{t('pp5')}</p>
                    <p>{t('pp6')}</p>
                    <p>{t('pp7')}</p>
                    <p>{t('pp8')}</p>
                    <p>{t('pp9')}</p>
                    <p>{t('pp10')}</p>
                    <p>{t('pp11')}</p>
                </div>
                <div className="p-4 border-t flex justify-end bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyModal;

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../LanguageContext';

const Home = () => {
    const { t } = useContext(LanguageContext);

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <h1 className="text-5xl font-extrabold text-gray-800 mb-6">{t('welcomeTitle')}</h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl">
                {t('welcomeText')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
                <Link to="/services" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg">
                    {t('browseServices')}
                </Link>
                <Link to="/register" className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-gray-50 font-bold py-3 px-6 rounded-lg text-lg">
                    {t('joinAsExpert')}
                </Link>
            </div>
        </div>
    );
};

export default Home;

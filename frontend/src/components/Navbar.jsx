import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';
import { LanguageContext } from '../LanguageContext';
import logo from '../assets/logo.png';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { lang, setLang, t } = useContext(LanguageContext);
    const navigate = useNavigate();
    const isRTL = lang === 'ar';

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md p-4">
            <div className={`container mx-auto flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className="flex items-center gap-2">
                    <img
                        src={logo}
                        alt="PRZ Logo"
                        onClick={() => navigate('/')}
                        className="h-10 w-auto object-contain cursor-pointer"
                    />
                </div>
                <div className="flex items-center gap-6">
                    {/* Language Switcher */}
                    <div className="flex gap-2 text-sm font-medium">
                        <button onClick={() => setLang('en')} className={lang === 'en' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}>EN</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => setLang('fr')} className={lang === 'fr' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}>FR</button>
                        <span className="text-gray-300">|</span>
                        <button onClick={() => setLang('ar')} className={lang === 'ar' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'}>AR</button>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/services" className="text-gray-600 hover:text-blue-600">{t('services')}</Link>
                        {user ? (
                            <>
                                {user.role === 'admin' && (
                                    <Link to="/admin" className="text-gray-600 hover:text-blue-600">{t('admin')}</Link>
                                )}
                                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600">{t('dashboard')}</Link>
                                <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-1 rounded">{t('logout')}</button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-600 hover:text-blue-600">{t('login')}</Link>
                                <Link to="/register" className="bg-blue-600 text-white px-3 py-1 rounded">{t('register')}</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

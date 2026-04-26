import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { LanguageContext } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loggedInUser = await login(email, password);
            if (loggedInUser?.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || t('loginFailed'));
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 bg-white p-8 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">{t('login')}</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-start text-gray-700 mb-2">{t('email')}</label>
                    <input 
                        type="email" 
                        className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-start text-gray-700 mb-2">{t('password')}</label>
                    <input 
                        type="password" 
                        className="w-full border p-2 rounded focus:outline-none focus:border-blue-500" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
                    {t('login')}
                </button>
            </form>
        </div>
    );
};

export default Login;

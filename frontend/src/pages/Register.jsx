import React, { useContext, useState } from 'react';
import api from '../api';
import { LanguageContext } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

const Register = () => {
    const [role, setRole] = useState('individual');
    const [formData, setFormData] = useState({
        email: '', password: '', phone: '', full_name: '', company_name: '', 
        registration_number: '', activity_type: '', location: '', birth_date: '', specialty: ''
    });
    const [cvFile, setCvFile] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { t, lang } = useContext(LanguageContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setCvFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            if (role === 'expert') {
                const data = new FormData();
                Object.keys(formData).forEach(key => {
                    if (formData[key]) data.append(key, formData[key]);
                });
                data.append('role', role);
                if (cvFile) {
                    data.append('cv_file', cvFile);
                }
                await api.post('/api/auth/register', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                const data = { ...formData, role };
                await api.post('/api/auth/register', data);
            }
            
            setSuccess(t('registrationSuccess'));
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || t('registrationFailed'));
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white p-8 border rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold mb-6 text-center">{t('register')}</h2>
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
            
            <div className="flex mb-6 gap-4 justify-center">
                <button 
                    className={`px-4 py-2 rounded ${role === 'individual' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setRole('individual')}
                >{t('individual')}</button>
                <button 
                    className={`px-4 py-2 rounded ${role === 'company' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setRole('company')}
                >{t('company')}</button>
                <button 
                    className={`px-4 py-2 rounded ${role === 'expert' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    onClick={() => setRole('expert')}
                >{t('expert')}</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-start text-gray-700 mb-1">{t('email')}</label>
                        <input type="email" name="email" onChange={handleChange} required className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-start text-gray-700 mb-1">{t('password')}</label>
                        <input type="password" name="password" onChange={handleChange} required className="w-full border p-2 rounded" />
                    </div>
                    <div>
                        <label className="block text-start text-gray-700 mb-1">{t('phone')}</label>
                        <input type="text" name="phone" onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    {role === 'individual' && (
                        <div>
                            <label className="block text-start text-gray-700 mb-1">{t('fullName')}</label>
                            <input type="text" name="full_name" onChange={handleChange} required className="w-full border p-2 rounded" />
                        </div>
                    )}

                    {role === 'company' && (
                        <>
                            <div>
                                <label className="block text-start text-gray-700 mb-1">{t('companyName')}</label>
                                <input type="text" name="company_name" onChange={handleChange} required className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-start text-gray-700 mb-1">{t('registrationNumber')}</label>
                                <input type="text" name="registration_number" onChange={handleChange} required className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-start text-gray-700 mb-1">{t('activityType')}</label>
                                <input type="text" name="activity_type" onChange={handleChange} required className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-start text-gray-700 mb-1">{t('location')}</label>
                                <input type="text" name="location" onChange={handleChange} required className="w-full border p-2 rounded" />
                            </div>
                        </>
                    )}

                    {role === 'expert' && (
                        <>
                            <div>
                                <label className="block text-start text-gray-700 mb-1">{t('fullName')}</label>
                                <input type="text" name="full_name" onChange={handleChange} required className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-start text-gray-700 mb-1">{t('birthDate')}</label>
                                <input type="date" name="birth_date" onChange={handleChange} required className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-start text-gray-700 mb-1">{t('specialty')}</label>
                                <input type="text" name="specialty" onChange={handleChange} required className="w-full border p-2 rounded" />
                            </div>
                            <div>
                                <label className="block text-start text-gray-700 mb-1">{t('cvPdf')}</label>
                                <input type="file" accept=".pdf" onChange={handleFileChange} required className="w-full border p-2 rounded" />
                            </div>
                        </>
                    )}
                </div>

                <div className={`mt-4 flex items-center ${lang === 'ar' ? 'flex-row-reverse justify-end' : ''}`}>
                    <input 
                        type="checkbox" 
                        id="terms" 
                        required 
                        checked={agreedToTerms} 
                        onChange={(e) => setAgreedToTerms(e.target.checked)} 
                        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`} 
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                        {t('agreeToTerms')}
                        <button type="button" onClick={() => setIsModalOpen(true)} className="text-blue-600 hover:underline">
                            {t('termsAndPrivacy')}
                        </button>
                    </label>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 mt-6">
                    {t('register')}
                </button>
            </form>
            <PrivacyPolicyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Register;

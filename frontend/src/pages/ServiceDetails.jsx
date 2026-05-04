import React, { useContext, useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { LanguageContext } from '../LanguageContext';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal';

const initialForm = {
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    clientType: 'regularUser'
};

const ServiceDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t, lang, translateService } = useContext(LanguageContext);
    const [service, setService] = useState(null);
    const [form, setForm] = useState(initialForm);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await api.get(`/api/services/${id}`);
                setService(res.data);
            } catch (err) {
                setService(null);
            } finally {
                setLoading(false);
            }
        };

        fetchService();
    }, [id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!localStorage.getItem('token')) {
            setError('You must be logged in to submit a request');
            setTimeout(() => navigate('/login'), 2000);
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess(false);

        try {
            await api.post('/api/requests', {
                ...form,
                service_id: Number(id)
            });
            setSuccess(true);
            setForm(initialForm);
        } catch (err) {
            setError(t('errorMsg'));
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="py-16 text-center text-gray-600">{t('loading')}</div>;
    }

    if (!service) {
        return (
            <div className="py-16 text-center">
                <p className="text-gray-600 mb-6">{t('serviceNotFound')}</p>
                <Link to="/services" className="text-blue-600 font-semibold hover:text-blue-700">
                    {t('backToServices')}
                </Link>
            </div>
        );
    }

    const localizedService = translateService(service);

    return (
        <div className="py-10 bg-gray-50 min-h-screen" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/services" className="inline-flex mb-8 text-sm font-semibold text-blue-600 hover:text-blue-700">
                    {t('backToServices')}
                </Link>

                <div className="grid lg:grid-cols-[1fr_420px] gap-8 items-start">
                    <main className="bg-white border border-gray-100 rounded-lg shadow-sm p-6 sm:p-8">
                        <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 mb-3">
                            {localizedService.category || t('serviceDetails')}
                        </p>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-5">
                            {localizedService.title}
                        </h1>
                        <p className="text-lg text-gray-700 leading-relaxed mb-8">
                            {localizedService.description}
                        </p>

                        <section className="border-t border-gray-100 pt-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('aboutService')}</h2>
                            <p className="text-gray-600 leading-relaxed">
                                {localizedService.description} {t('serviceProcess')}
                            </p>
                        </section>
                    </main>

                    <aside className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-5">{t('requestService')}</h2>

                        {success && (
                            <div className="mb-5 rounded-lg bg-green-50 border border-green-200 text-green-800 p-4">
                                {t('successMsg')}
                            </div>
                        )}
                        {error && (
                            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 text-red-700 p-4">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <label className="block text-start">
                                <span className="block text-sm font-medium text-gray-700 mb-1">{t('fullName')}</span>
                                <input name="name" value={form.name} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </label>
                            <label className="block text-start">
                                <span className="block text-sm font-medium text-gray-700 mb-1">{t('email')}</span>
                                <input type="email" name="email" value={form.email} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </label>
                            <label className="block text-start">
                                <span className="block text-sm font-medium text-gray-700 mb-1">{t('phone')}</span>
                                <input name="phone" value={form.phone} onChange={handleChange} required className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </label>
                            <div className="block text-start mb-4">
                                <span className="block text-sm font-medium text-gray-700 mb-2">{t('clientType')}</span>
                                <div className="flex gap-4">
                                    <label className="flex items-center">
                                        <input type="radio" name="clientType" value="regularUser" checked={form.clientType === 'regularUser'} onChange={handleChange} className={lang === 'ar' ? 'ml-2' : 'mr-2'} />
                                        {t('regularUser')}
                                    </label>
                                    <label className="flex items-center">
                                        <input type="radio" name="clientType" value="institution" checked={form.clientType === 'institution'} onChange={handleChange} className={lang === 'ar' ? 'ml-2' : 'mr-2'} />
                                        {t('institution')}
                                    </label>
                                </div>
                            </div>

                            {form.clientType === 'institution' && (
                                <label className="block text-start">
                                    <span className="block text-sm font-medium text-gray-700 mb-1">{t('companyName')}</span>
                                    <input name="company" value={form.company} onChange={handleChange} className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </label>
                            )}
                            <label className="block text-start">
                                <span className="block text-sm font-medium text-gray-700 mb-1">{t('message')}</span>
                                <textarea name="message" value={form.message} onChange={handleChange} required rows="5" className="w-full rounded-lg border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </label>

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

                            <button type="submit" disabled={submitting} className="w-full bg-blue-600 text-white font-semibold px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                                {t('submit')}
                            </button>
                        </form>
                    </aside>
                </div>
            </div>
            <PrivacyPolicyModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default ServiceDetails;

import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../LanguageContext';

const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t, translateService, translateCategory } = useContext(LanguageContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/api/services');
                setServices(res.data);
            } catch (error) {
                console.error("Failed to fetch services", error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleOrder = (serviceId) => {
        navigate(`/services/${serviceId}`);
    };

    const groupedServices = services.reduce((acc, service) => {
        const category = translateCategory(service.category);
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(translateService(service));
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('services')}</h2>
                <p className="text-gray-500">{t('noServices')}</p>
            </div>
        );
    }

    return (
        <div className="py-12 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">{t('marketplace')}</h2>
                    <p className="mt-2 text-4xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        {t('exploreServices')}
                    </p>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        {t('servicesDesc')}
                    </p>
                </div>

                <div className="space-y-16">
                    {Object.entries(groupedServices).map(([category, items]) => (
                        <div key={category} className="category-section">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-blue-100 inline-block">
                                {category}
                            </h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {items.map(service => (
                                    <div 
                                        key={service.id} 
                                        className="bg-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 transition duration-300 ease-in-out flex flex-col overflow-hidden border border-gray-100"
                                    >
                                        <div className="p-6 flex-grow flex flex-col">
                                            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                            <h4 className="text-xl font-bold mb-3 text-gray-800">{service.title}</h4>
                                            <p className="text-gray-600 text-sm flex-grow mb-6 leading-relaxed">{service.description}</p>
                                            
                                            <button 
                                                onClick={() => handleOrder(service.id)}
                                                className="w-full bg-blue-600 text-white font-medium px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:ring-4 focus:ring-blue-300 outline-none mt-auto flex items-center justify-center"
                                            >
                                                {t('orderService')}
                                                <svg className="w-4 h-4 ms-2 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Services;

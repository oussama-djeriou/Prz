import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { LanguageContext } from '../LanguageContext';

/* ── Icons ──────────────────────────────────────────────────────────────── */
const IconCheck = () => (
    <svg className="w-4 h-4 flex-shrink-0 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
);

const IconBolt = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
);

/* ── Service Card ────────────────────────────────────────────────────────── */
const ServiceCard = ({ service, onOrder, t }) => (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-500" />

        <div className="p-6 flex flex-col flex-grow">
            {/* Icon + Title */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                    <IconBolt />
                </div>
                <h4 className="text-lg font-bold text-gray-900 leading-snug">{service.title}</h4>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-500 mb-4 leading-relaxed">{service.description}</p>

            {/* Bullet points */}
            {service.bullet_points && service.bullet_points.length > 0 && (
                <ul className="space-y-1.5 mb-6 flex-grow">
                    {service.bullet_points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                            <IconCheck />
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* CTA Button */}
            <button
                onClick={() => onOrder(service.id)}
                className="mt-auto w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
                {t('orderService')}
                <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </button>
        </div>
    </div>
);

/* ── Main Component ──────────────────────────────────────────────────────── */
const Services = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading]   = useState(true);
    const { t, translateService, translateCategory, translateSubCategory } = useContext(LanguageContext);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await api.get('/api/services');
                setServices(res.data);
            } catch (error) {
                console.error('Failed to fetch services', error);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    const handleOrder = (serviceId) => navigate(`/services/${serviceId}`);

    /* ── Build grouped structure:
         {
           "Public Relations": {
             "Strategy": [ ...services ],
             "Reputation": [ ...services ],
             ...
           },
           "Advertising": {
             "__none__": [ ...services ]
           },
           ...
         }
    ─────────────────────────────────────────── */
    const grouped = services.reduce((acc, svc) => {
        const translated  = translateService(svc);
        const domainRaw   = svc.category  || 'Uncategorized';
        const subRaw      = svc.sub_category || '__none__';
        const domainLabel = translateCategory(domainRaw);

        if (!acc[domainRaw]) acc[domainRaw] = { label: domainLabel, subs: {} };
        if (!acc[domainRaw].subs[subRaw]) acc[domainRaw].subs[subRaw] = [];
        acc[domainRaw].subs[subRaw].push(translated);
        return acc;
    }, {});

    /* ── Render ──────────────────────────────────────────────────────────── */
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
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

                {/* ── Page header ──────────────────────────────────────────── */}
                <div className="text-center mb-16">
                    <span className="text-sm text-blue-600 font-semibold tracking-widest uppercase">
                        {t('marketplace')}
                    </span>
                    <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                        {t('exploreServices')}
                    </h2>
                    <p className="mt-4 max-w-2xl text-lg text-gray-500 mx-auto">
                        {t('servicesDesc')}
                    </p>
                </div>

                {/* ── Domains ──────────────────────────────────────────────── */}
                <div className="space-y-20">
                    {Object.entries(grouped).map(([domainKey, { label: domainLabel, subs }]) => (
                        <section key={domainKey}>

                            {/* Domain Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <h3 className="text-3xl font-extrabold text-gray-900 whitespace-nowrap">
                                    {domainLabel}
                                </h3>
                                <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
                            </div>

                            {/* Sub-categories */}
                            <div className="space-y-10">
                                {Object.entries(subs).map(([subKey, items]) => (
                                    <div key={subKey}>
                                        {/* Sub-category label (only when there is one) */}
                                        {subKey !== '__none__' && (
                                            <div className="flex items-center gap-3 mb-5">
                                                <span className="w-2 h-6 rounded-full bg-blue-500 inline-block" />
                                                <h4 className="text-xl font-bold text-blue-700">
                                                    {translateSubCategory(subKey)}
                                                </h4>
                                            </div>
                                        )}

                                        {/* Service cards */}
                                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                            {items.map(service => (
                                                <ServiceCard
                                                    key={service.id}
                                                    service={service}
                                                    onOrder={handleOrder}
                                                    t={t}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Services;

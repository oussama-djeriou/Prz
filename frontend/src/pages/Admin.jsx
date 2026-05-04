import React, { useContext, useEffect, useState } from 'react';
import api from '../api';
import { LanguageContext } from '../LanguageContext';
import { useNavigate } from 'react-router-dom';

const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
};

const Admin = () => {
    const { t, translateService } = useContext(LanguageContext);
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [experts, setExperts] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [selectedExperts, setSelectedExperts] = useState({});
    
    const [activeTab, setActiveTab] = useState('requests');
    const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [serviceForm, setServiceForm] = useState({ title: '', category: '', description: '' });

    const fetchData = async () => {
        try {
            const [reqRes, expRes, srvRes] = await Promise.all([
                api.get('/api/requests'),
                api.get('/api/admin/experts'),
                api.get('/api/services')
            ]);
            setRequests(reqRes.data);
            setExperts(expRes.data.filter(e => e.approved));
            setServices(srvRes.data);
        } catch (err) {
            setError(t('requestsLoadError'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [t]);

    if (loading) {
        return <div className="py-16 text-center text-gray-600">{t('loading')}</div>;
    }

    const handleStatusUpdate = async (requestId, status) => {
        setError('');
        
        const expert_id = selectedExperts[requestId];
        if (status === 'accepted' && !expert_id) {
            alert(t('selectExpertRequired') || 'Please select an expert first');
            return;
        }

        setActionLoading({ requestId, status });
        
        try {
            const endpoint = status === 'accepted'
                ? `/api/admin/accept/${requestId}`
                : `/api/admin/reject/${requestId}`;
            
            const payload = status === 'accepted' ? { expert_id: Number(expert_id) } : {};
            const res = await api.put(endpoint, payload);
            
            setRequests((current) => (
                current.map((item) => item.id === requestId ? res.data : item)
            ));
            
            if (status === 'accepted') {
                alert('Request accepted and email sent');
            } else {
                alert('Rejected and email sent');
            }
        } catch (err) {
            setError(err.response?.data?.msg || err.response?.data?.message || t('requestStatusUpdateError'));
        } finally {
            setActionLoading(null);
        }
    };

    const handleServiceSave = async (e) => {
        e.preventDefault();
        try {
            if (editingService) {
                await api.put(`/api/admin/services/${editingService.id}`, serviceForm);
            } else {
                await api.post('/api/admin/services', serviceForm);
            }
            setIsServiceModalOpen(false);
            setEditingService(null);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save service');
        }
    };

    const handleServiceDelete = async (id) => {
        if (!window.confirm(t('confirmDelete'))) return;
        try {
            await api.delete(`/api/admin/services/${id}`);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete service');
        }
    };

    const openServiceModal = (service = null) => {
        if (service) {
            setEditingService(service);
            setServiceForm({ title: service.title, category: service.category, description: service.description });
        } else {
            setEditingService(null);
            setServiceForm({ title: '', category: '', description: '' });
        }
        setIsServiceModalOpen(true);
    };

    return (
        <div className="py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">{t('requestsManagementDesc')}</p>
            </div>

            <div className="mb-6 flex space-x-4 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('requests')}
                    className={`py-2 px-4 font-semibold text-sm focus:outline-none ${activeTab === 'requests' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t('requestsManagement')}
                </button>
                <button 
                    onClick={() => setActiveTab('services')}
                    className={`py-2 px-4 font-semibold text-sm focus:outline-none ${activeTab === 'services' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t('servicesManagement')}
                </button>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

            {activeTab === 'requests' && (
                <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('name')}</th>
                                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('email')}</th>
                                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('phone')}</th>
                                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('serviceTitle')}</th>
                                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('message')}</th>
                                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('status')}</th>
                                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {requests.map((request) => {
                                    const localizedService = request.service ? translateService(request.service) : null;
                                    const status = request.status || 'pending';
                                    const isUpdating = actionLoading?.requestId === request.id;

                                    return (
                                        <tr key={request.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-4 text-start text-sm font-medium text-gray-900">{request.name}</td>
                                            <td className="px-5 py-4 text-start text-sm text-gray-600">{request.email}</td>
                                            <td className="px-5 py-4 text-start text-sm text-gray-600">{request.phone}</td>
                                            <td className="px-5 py-4 text-start text-sm text-gray-900">{localizedService?.title || t('notAvailable')}</td>
                                            <td className="max-w-xs px-5 py-4 text-start text-sm text-gray-600">
                                                <span className="line-clamp-3">{request.message}</span>
                                            </td>
                                            <td className="px-5 py-4 text-start text-sm">
                                                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClasses[status] || statusClasses.pending}`}>
                                                    {t(status)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-start text-sm">
                                                 <div className="flex flex-wrap gap-2 items-center">
                                                     {status === 'pending' && (
                                                         <select 
                                                             className="border rounded p-1 text-xs max-w-[150px]"
                                                             value={selectedExperts[request.id] || ''}
                                                             onChange={(e) => setSelectedExperts(prev => ({...prev, [request.id]: e.target.value}))}
                                                         >
                                                             <option value="">{t('selectExpert')}</option>
                                                             {experts.map(exp => (
                                                                 <option key={exp.id} value={exp.id}>
                                                                     {exp.full_name} ({exp.specialty || t('uncategorized')})
                                                                 </option>
                                                             ))}
                                                         </select>
                                                     )}
                                                     <button
                                                         onClick={() => handleStatusUpdate(request.id, 'accepted')}
                                                         disabled={status !== 'pending' || isUpdating}
                                                         className="rounded bg-green-500 px-3 py-1 text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60 text-xs"
                                                     >
                                                         {isUpdating && actionLoading.status === 'accepted' ? t('loading') : t('accept')}
                                                     </button>
                                                     <button
                                                         onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                                         disabled={status !== 'pending' || isUpdating}
                                                         className="rounded bg-red-500 px-3 py-1 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60 text-xs"
                                                     >
                                                         {isUpdating && actionLoading.status === 'rejected' ? t('loading') : t('reject')}
                                                     </button>
                                                     {status === 'accepted' && (
                                                         <button
                                                             onClick={() => navigate(`/chat/${request.id}`)}
                                                             className="rounded bg-blue-500 px-3 py-1 text-white transition hover:bg-blue-600 text-xs"
                                                         >
                                                             {t('openChat')}
                                                         </button>
                                                     )}
                                                 </div>
                                             </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {requests.length === 0 && (
                            <div className="p-8 text-center text-gray-500">{t('noRequestsFound')}</div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'services' && (
                <div>
                    <div className="mb-4 text-end">
                        <button 
                            onClick={() => openServiceModal()}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                        >
                            {t('addService')}
                        </button>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
                        <table className="w-full min-w-[600px] divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('serviceTitle')}</th>
                                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('serviceCategory')}</th>
                                    <th className="px-5 py-3 text-start text-xs font-semibold uppercase tracking-wide text-gray-500">{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {services.map((service) => {
                                    const localizedService = translateService(service);
                                    return (
                                        <tr key={service.id} className="hover:bg-gray-50">
                                            <td className="px-5 py-4 text-start text-sm font-medium text-gray-900">{localizedService.title}</td>
                                            <td className="px-5 py-4 text-start text-sm text-gray-600">{localizedService.category}</td>
                                            <td className="px-5 py-4 text-start text-sm">
                                                <button 
                                                    onClick={() => openServiceModal(service)}
                                                    className="text-blue-600 hover:text-blue-800 font-medium mr-3 rtl:mr-0 rtl:ml-3 text-xs"
                                                >
                                                    {t('editService')}
                                                </button>
                                                <button 
                                                    onClick={() => handleServiceDelete(service.id)}
                                                    className="text-red-600 hover:text-red-800 font-medium text-xs"
                                                >
                                                    {t('deleteService')}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {services.length === 0 && (
                            <div className="p-8 text-center text-gray-500">{t('noServices')}</div>
                        )}
                    </div>
                </div>
            )}

            {isServiceModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6 shadow-xl">
                        <h2 className="text-xl font-bold mb-4">{editingService ? t('editService') : t('addService')}</h2>
                        <form onSubmit={handleServiceSave}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('serviceTitle')}</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={serviceForm.title} 
                                    onChange={(e) => setServiceForm({...serviceForm, title: e.target.value})} 
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('serviceCategory')}</label>
                                <input 
                                    required 
                                    type="text" 
                                    value={serviceForm.category} 
                                    onChange={(e) => setServiceForm({...serviceForm, category: e.target.value})} 
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('serviceDescription')}</label>
                                <textarea 
                                    required 
                                    rows="4" 
                                    value={serviceForm.description} 
                                    onChange={(e) => setServiceForm({...serviceForm, description: e.target.value})} 
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                ></textarea>
                            </div>
                            <div className="flex justify-end space-x-3 rtl:space-x-reverse">
                                <button 
                                    type="button" 
                                    onClick={() => setIsServiceModalOpen(false)}
                                    className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50"
                                >
                                    {t('cancel')}
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                                >
                                    {t('save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;

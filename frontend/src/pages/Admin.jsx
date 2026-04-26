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
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const res = await api.get('/api/requests');
                setRequests(res.data);
            } catch (err) {
                setError(t('requestsLoadError'));
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, [t]);

    if (loading) {
        return <div className="py-16 text-center text-gray-600">{t('loading')}</div>;
    }

    const handleStatusUpdate = async (requestId, status) => {
        setError('');
        if (!localStorage.getItem('token')) {
            setError(t('loginRequired') || 'Please login again');
            return;
        }

        setActionLoading({ requestId, status });
        const previousRequests = requests;
        setRequests((current) => (
            current.map((item) => item.id === requestId ? { ...item, status } : item)
        ));

        try {
            const endpoint = status === 'accepted'
                ? `/api/admin/accept/${requestId}`
                : `/api/admin/reject/${requestId}`;
            const res = await api.put(endpoint);
            setRequests((current) => (
                current.map((item) => item.id === requestId ? res.data : item)
            ));
            if (status === 'accepted') {
                alert('Request accepted');
            } else {
                alert('Rejected and email sent');
            }
        } catch (err) {
            const updatedRequest = err.response?.data?.request;
            if (updatedRequest) {
                setRequests(previousRequests.map((item) => item.id === requestId ? updatedRequest : item));
            } else {
                setRequests(previousRequests);
            }
            setError(err.response?.data?.email_error || t('requestStatusUpdateError'));
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-900">Admin Dashboard</h1>
                <p className="mt-2 text-gray-600">{t('requestsManagementDesc')}</p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                    {error}
                </div>
            )}

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
                                            <div className="flex flex-wrap gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(request.id, 'accepted')}
                                                    disabled={status === 'accepted' || isUpdating}
                                                    className="rounded bg-green-500 px-3 py-1 text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isUpdating && actionLoading.status === 'accepted' ? t('loading') : t('accept')}
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(request.id, 'rejected')}
                                                    disabled={status === 'rejected' || isUpdating}
                                                    className="rounded bg-red-500 px-3 py-1 text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                                >
                                                    {isUpdating && actionLoading.status === 'rejected' ? t('loading') : t('reject')}
                                                </button>
                                                {status === 'accepted' && (
                                                    <button
                                                        onClick={() => navigate(`/chat/${request.id}`)}
                                                        className="rounded bg-blue-500 px-3 py-1 text-white transition hover:bg-blue-600"
                                                    >
                                                        Open Chat
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {requests.length === 0 && (
                    <div className="p-8 text-center text-gray-500">{t('noRequestsFound')}</div>
                )}
            </div>
        </div>
    );
};

export default Admin;

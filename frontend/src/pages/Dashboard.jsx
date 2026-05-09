import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import api from '../api';
import { Link } from 'react-router-dom';
import { LanguageContext } from '../LanguageContext';

const StatusBadge = ({ status, t }) => {
    let colorClass = 'bg-gray-100 text-gray-800';
    if (status === 'completed')       colorClass = 'bg-green-100 text-green-800';
    else if (status === 'assigned')   colorClass = 'bg-blue-100 text-blue-800';
    else if (status === 'pending')    colorClass = 'bg-yellow-100 text-yellow-800';
    else if (status === 'accepted')   colorClass = 'bg-green-100 text-green-800';
    else if (status === 'rejected')   colorClass = 'bg-red-100 text-red-800';
    else if (status === 'expert_assigned') colorClass = 'bg-purple-100 text-purple-800';

    const label = status === 'expert_assigned' ? t('expertAssigned') : (t(status) || status);

    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${colorClass}`}>
            {label}
        </span>
    );
};

const ClientDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [requests, setRequests] = useState([]);
    const { t, translateService } = useContext(LanguageContext);
    
    useEffect(() => {
        api.get('/api/orders').then(res => setOrders(res.data));
        api.get('/api/requests').then(res => setRequests(res.data));
    }, []);

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-bold mb-4">{t('myRequests')}</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('serviceLabel')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4">{translateService(req.service).title}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${req.status === 'accepted' ? 'bg-green-100 text-green-800' : req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {t(req.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {(req.status === 'accepted' || req.status === 'pending') && (
                                            <Link to={`/chat/${req.id}`} className="text-blue-600 hover:text-blue-900">{t('openChat')}</Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {requests.length === 0 && <div className="p-6 text-center text-gray-500">{t('noRequestsYet')}</div>}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">{t('myOrders')}</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('serviceLabel')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('expertLabel')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4">{translateService(order.service).title}</td>
                                    <td className="px-6 py-4"><StatusBadge status={order.status} t={t} /></td>
                                    <td className="px-6 py-4">{order.expert ? order.expert.full_name : t('pendingAssignment')}</td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {order.status !== 'pending' && (
                                            <Link to={`/chat/${order.id}`} className="text-blue-600 hover:text-blue-900">{t('openChat')}</Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && <div className="p-6 text-center text-gray-500">{t('noOrdersYet')}</div>}
                </div>
            </div>
        </div>
    );
};

const ExpertDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [requests, setRequests] = useState([]);
    const { t, translateService } = useContext(LanguageContext);

    const fetchData = async () => {
        const [ordersRes, requestsRes] = await Promise.all([
            api.get('/api/orders'),
            api.get('/api/requests'),
        ]);
        setOrders(ordersRes.data);
        setRequests(requestsRes.data);
    };

    useEffect(() => { fetchData(); }, []);

    const handleComplete = async (orderId) => {
        if (window.confirm(t('markCompletedConfirm'))) {
            await api.put(`/api/orders/${orderId}/complete`);
            fetchData();
        }
    };

    const handleExpertDecision = async (requestId, decision) => {
        const confirmMsg = decision === 'accepted'
            ? t('acceptRequestConfirm')
            : t('rejectRequestConfirm');
        if (!window.confirm(confirmMsg)) return;
        try {
            await api.put(`/api/requests/${requestId}/expert-decision`, { decision });
            fetchData();
        } catch (err) {
            console.error('Decision failed:', err);
            alert(t('requestStatusUpdateError'));
        }
    };

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-bold mb-4">{t('assignedRequests')}</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('serviceLabel')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('client')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {requests.map(req => (
                                <tr key={req.id}>
                                    <td className="px-6 py-4">{translateService(req.service).title}</td>
                                    <td className="px-6 py-4">{req.name}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={req.status} t={t} />
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {/* Chat is always available */}
                                            <Link
                                                to={`/chat/${req.id}`}
                                                className="text-blue-600 hover:text-blue-900 font-medium"
                                            >
                                                {t('chat')}
                                            </Link>

                                            {/* Accept / Reject only when the admin has assigned this expert and expert hasn't decided yet */}
                                            {(req.status === 'expert_assigned' || req.status === 'pending') && (
                                                <>
                                                    <button
                                                        onClick={() => handleExpertDecision(req.id, 'accepted')}
                                                        className="bg-green-500 hover:bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                                                    >
                                                        ✓ {t('accept')}
                                                    </button>
                                                    <button
                                                        onClick={() => handleExpertDecision(req.id, 'rejected')}
                                                        className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-1 rounded-full transition-colors"
                                                    >
                                                        ✗ {t('reject')}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {requests.length === 0 && <div className="p-6 text-center text-gray-500">{t('noAssignedRequests')}</div>}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">{t('assignedOrders')}</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('serviceLabel')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('client')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4">{translateService(order.service).title}</td>
                                    <td className="px-6 py-4">{order.client.full_name || order.client.company_name}</td>
                                    <td className="px-6 py-4"><StatusBadge status={order.status} t={t} /></td>
                                    <td className="px-6 py-4 text-sm font-medium flex gap-3">
                                        <Link to={`/chat/${order.id}`} className="text-blue-600 hover:text-blue-900">{t('chat')}</Link>
                                        {order.status === 'assigned' && (
                                            <button onClick={() => handleComplete(order.id)} className="text-green-600 hover:text-green-900">{t('complete')}</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && <div className="p-6 text-center text-gray-500">{t('noAssignedOrders')}</div>}
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [experts, setExperts] = useState([]);
    const { t, translateService } = useContext(LanguageContext);

    const fetchData = async () => {
        const oRes = await api.get('/api/orders');
        setOrders(oRes.data);
        const eRes = await api.get('/api/admin/experts');
        setExperts(eRes.data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproveExpert = async (id) => {
        await api.put(`/api/admin/experts/${id}/approve`);
        fetchData();
    };

    const handleRejectExpert = async (id) => {
        if(window.confirm(t('confirmDelete') || 'Are you sure you want to reject this expert?')) {
            await api.delete(`/api/admin/experts/${id}/reject`);
            fetchData();
        }
    };

    const handleAssignExpert = async (orderId, expertId) => {
        if (!expertId) return;
        await api.put(`/api/orders/${orderId}/assign`, { expert_id: expertId });
        fetchData();
    };

    const unapprovedExperts = experts.filter(e => !e.approved);
    const approvedExperts = experts.filter(e => e.approved);

    return (
        <div className="space-y-10">
            <div>
                <h2 className="text-2xl font-bold mb-4 text-red-600">{t('pendingExpertApprovals')}</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('name')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('specialty')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('cv')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('action')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {unapprovedExperts.map(exp => (
                                <tr key={exp.id}>
                                    <td className="px-6 py-4">{exp.full_name}</td>
                                    <td className="px-6 py-4">{exp.specialty}</td>
                                    <td className="px-6 py-4">
                                        <a href={`http://127.0.0.1:5000/uploads/${exp.cv_file}`} target="_blank" rel="noreferrer" className="text-blue-600 underline">{t('viewPdf')}</a>
                                    </td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button onClick={() => handleApproveExpert(exp.id)} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">{t('approve')}</button>
                                        <button onClick={() => handleRejectExpert(exp.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">{t('reject') || 'Reject'}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {unapprovedExperts.length === 0 && <div className="p-6 text-center text-gray-500">{t('noPendingExperts')}</div>}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4">{t('allOrders')}</h2>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('orderId')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('serviceLabel')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('status')}</th>
                                <th className="px-6 py-3 text-start text-xs font-medium text-gray-500 uppercase">{t('assignExpert')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td className="px-6 py-4">#{order.id}</td>
                                    <td className="px-6 py-4">{translateService(order.service).title}</td>
                                    <td className="px-6 py-4"><StatusBadge status={order.status} t={t} /></td>
                                    <td className="px-6 py-4">
                                        {order.status === 'pending' ? (
                                            <select 
                                                className="border p-1 rounded"
                                                onChange={(e) => handleAssignExpert(order.id, e.target.value)}
                                                defaultValue=""
                                            >
                                                <option value="" disabled>{t('selectExpert')}</option>
                                                {approvedExperts.map(exp => (
                                                    <option key={exp.id} value={exp.id}>{exp.full_name} ({exp.specialty})</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <span className="text-gray-500">{order.expert?.full_name || t('notAvailable')}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {orders.length === 0 && <div className="p-6 text-center text-gray-500">{t('noOrdersFound')}</div>}
                </div>
            </div>
        </div>
    );
};

const Dashboard = () => {
    const { user } = useContext(AuthContext);

    if (user.role === 'admin') return <AdminDashboard />;
    if (user.role === 'expert') return <ExpertDashboard />;
    return <ClientDashboard />;
};

export default Dashboard;

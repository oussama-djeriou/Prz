import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { LanguageContext } from '../LanguageContext';

const Chat = () => {
    const { requestId } = useParams();
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const [mode, setMode] = useState('request');

    const fetchMessages = async () => {
        try {
            if (mode === 'request') {
                const res = await api.get(`/api/chat/${requestId}`);
                setMessages(res.data);
            } else {
                const res = await api.get(`/api/orders/${requestId}/messages`);
                setMessages(res.data);
            }
            setError('');
        } catch (error) {
            if (mode === 'request' && error.response?.status === 404) {
                setMode('order');
                return;
            }
            setError(t('loadingChat'));
        }
    };

    useEffect(() => {
        let mounted = true;
        const load = async () => {
            await fetchMessages();
            if (mounted) {
                setLoading(false);
            }
        };
        load();
        const intervalId = setInterval(load, 3000);
        return () => clearInterval(intervalId);
    }, [requestId, mode]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        try {
            if (mode === 'request') {
                await api.post(`/api/chat/${requestId}`, { message: text });
            } else {
                await api.post(`/api/orders/${requestId}/messages`, { text });
            }
            setText('');
            fetchMessages();
        } catch (error) {
            alert(t('sendMessageFailed'));
        }
    };

    if (loading) return <div>{t('loadingChat')}</div>;

    return (
        <div className="max-w-3xl mx-auto h-[80vh] flex flex-col bg-white border rounded-lg shadow-sm">
            <div className="p-4 border-b bg-gray-50 flex justify-between items-center rounded-t-lg gap-2">
                <h3 className="font-bold text-lg">Chat #{requestId}</h3>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{mode === 'request' ? 'Request Chat' : 'Order Chat'}</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {error && (
                    <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</div>
                )}
                {messages.map(msg => {
                    const isMine = msg.sender_id === user.id;
                    return (
                        <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-2xl px-4 py-2 shadow-sm ${isMine ? 'bg-green-500 text-white rounded-br-md' : 'bg-gray-100 text-gray-800 rounded-bl-md'}`}>
                                <p>{msg.content || msg.text}</p>
                                <span className={`text-xs block mt-1 ${isMine ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {new Date(msg.created_at).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t bg-gray-50 flex rounded-b-lg">
                <input 
                    type="text" 
                    value={text} 
                    onChange={e => setText(e.target.value)} 
                    placeholder={t('typeMessage')}
                    className="flex-1 border rounded-s-lg p-2 focus:outline-none focus:border-green-500"
                />
                <button type="submit" className="bg-green-600 text-white px-4 rounded-e-lg hover:bg-green-700">{t('send')}</button>
            </form>
        </div>
    );
};

export default Chat;

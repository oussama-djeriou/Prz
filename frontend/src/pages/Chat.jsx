import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext';
import { LanguageContext } from '../LanguageContext';

/* ─── helpers ─── */
const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const getInitials = (name = '') =>
    name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?';

/* ─── role detection ────────────────────────────────────────────────────────
   We consider the logged-in user to be the "client" unless their role is
   'expert' or 'admin'. The partner on the other side gets the opposite style.
   ─────────────────────────────────────────────────────────────────────────── */
const ROLE_COLORS = {
    client: {
        bubble: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        time: '#c4b5fd',
        avatar: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        label: 'You',
    },
    expert: {
        bubble: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        time: '#6ee7b7',
        avatar: 'linear-gradient(135deg, #059669, #10b981)',
        label: 'Expert',
    },
};

const Chat = () => {
    const { requestId } = useParams();
    const { user } = useContext(AuthContext);
    const { t } = useContext(LanguageContext);
    const [messages, setMessages]   = useState([]);
    const [text, setText]           = useState('');
    const [loading, setLoading]     = useState(true);
    const [error, setError]         = useState('');
    const [mode, setMode]           = useState('request');
    const messagesEndRef            = useRef(null);
    const inputRef                  = useRef(null);

    /* ── fetch ── */
    const fetchMessages = async () => {
        try {
            const url =
                mode === 'request'
                    ? `/api/chat/${requestId}`
                    : `/api/orders/${requestId}/messages`;
            const res = await api.get(url);
            setMessages(res.data);
            setError('');
        } catch (err) {
            if (mode === 'request' && err.response?.status === 404) {
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
            if (mounted) setLoading(false);
        };
        load();
        const id = setInterval(load, 3000);
        return () => { mounted = false; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [requestId, mode]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    /* ── send ── */
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
            inputRef.current?.focus();
        } catch {
            alert(t('sendMessageFailed'));
        }
    };

    /* ── role for a message ── */
    const roleOf = (msg) => {
        const isMe = msg.sender_id === user?.id;
        if (isMe) {
            return user?.role === 'expert' ? 'expert' : 'client';
        }
        // partner
        return user?.role === 'expert' ? 'client' : 'expert';
    };

    /* ── loading skeleton ── */
    if (loading) {
        return (
            <div style={styles.wrapper}>
                <div style={styles.container}>
                    <div style={styles.header}>
                        <div style={styles.headerTitle}>Chat #{requestId}</div>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={styles.spinner} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>

                {/* ── header ── */}
                <div style={styles.header}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={styles.headerIcon}>💬</div>
                        <div>
                            <div style={styles.headerTitle}>Chat #{requestId}</div>
                            <div style={styles.headerSub}>
                                {mode === 'request' ? 'Request conversation' : 'Order conversation'}
                            </div>
                        </div>
                    </div>
                    <div style={styles.onlineDot} title="Active" />
                </div>

                {/* ── legend ── */}
                <div style={styles.legend}>
                    <span style={{ ...styles.legendPill, background: ROLE_COLORS.client.avatar }}>
                        👤 Client
                    </span>
                    <span style={{ ...styles.legendPill, background: ROLE_COLORS.expert.avatar }}>
                        🧑‍💼 Expert
                    </span>
                </div>

                {/* ── messages ── */}
                <div style={styles.messagesArea}>
                    {error && <div style={styles.errorBox}>{error}</div>}

                    {messages.length === 0 && !error && (
                        <div style={styles.emptyState}>
                            <div style={{ fontSize: 48, marginBottom: 8 }}>💬</div>
                            <p style={{ color: '#94a3b8', fontSize: 14 }}>No messages yet. Start the conversation!</p>
                        </div>
                    )}

                    {messages.map((msg, idx) => {
                        const isMe = msg.sender_id === user?.id;
                        const role = roleOf(msg);
                        const colors = ROLE_COLORS[role];
                        const showAvatar =
                            idx === 0 || messages[idx - 1].sender_id !== msg.sender_id;

                        return (
                            <div
                                key={msg.id}
                                style={{
                                    ...styles.messageRow,
                                    flexDirection: isMe ? 'row-reverse' : 'row',
                                    animationDelay: `${idx * 0.04}s`,
                                }}
                            >
                                {/* avatar */}
                                <div style={{
                                    ...styles.avatar,
                                    background: showAvatar ? colors.avatar : 'transparent',
                                    color: showAvatar ? '#fff' : 'transparent',
                                    boxShadow: showAvatar ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                                }}>
                                    {showAvatar ? getInitials(msg.sender_name || (isMe ? user?.full_name : 'Expert')) : ''}
                                </div>

                                {/* bubble */}
                                <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                                    {showAvatar && (
                                        <span style={{
                                            fontSize: 11,
                                            fontWeight: 600,
                                            marginBottom: 3,
                                            color: role === 'client' ? '#8b5cf6' : '#059669',
                                            paddingInline: 4,
                                        }}>
                                            {isMe ? colors.label : (role === 'expert' ? 'Expert' : 'Client')}
                                        </span>
                                    )}
                                    <div style={{
                                        ...styles.bubble,
                                        background: colors.bubble,
                                        borderRadius: isMe
                                            ? '18px 4px 18px 18px'
                                            : '4px 18px 18px 18px',
                                    }}>
                                        <p style={styles.bubbleText}>{msg.content || msg.text}</p>
                                        <span style={{ ...styles.bubbleTime, color: colors.time }}>
                                            {formatTime(msg.created_at)}
                                            {isMe && <span style={{ marginInlineStart: 4 }}>✓✓</span>}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* ── input ── */}
                <form onSubmit={handleSend} style={styles.inputBar}>
                    <input
                        ref={inputRef}
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t('typeMessage') || 'Type a message…'}
                        style={styles.input}
                        onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <button
                        type="submit"
                        disabled={!text.trim()}
                        style={{
                            ...styles.sendBtn,
                            opacity: text.trim() ? 1 : 0.5,
                            cursor: text.trim() ? 'pointer' : 'default',
                        }}
                        onMouseEnter={(e) => { if (text.trim()) e.target.style.transform = 'scale(1.08)'; }}
                        onMouseLeave={(e) => { e.target.style.transform = 'scale(1)'; }}
                    >
                        ➤
                    </button>
                </form>

            </div>
        </div>
    );
};

/* ─── inline styles ───────────────────────────────────────────────────────── */
const styles = {
    wrapper: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        padding: '24px 16px',
    },
    container: {
        width: '100%',
        maxWidth: 720,
        height: '85vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,255,255,0.08)',
        background: '#0f172a',
    },
    header: {
        padding: '16px 20px',
        background: 'linear-gradient(90deg, #1e1b4b, #312e81)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
    },
    headerIcon: { fontSize: 24 },
    headerTitle: { color: '#e2e8f0', fontWeight: 700, fontSize: 16 },
    headerSub: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
    onlineDot: {
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#10b981',
        boxShadow: '0 0 8px #10b981',
    },
    legend: {
        display: 'flex',
        gap: 8,
        padding: '8px 16px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
    },
    legendPill: {
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        color: '#fff',
    },
    messagesArea: {
        flex: 1,
        overflowY: 'auto',
        padding: '20px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        scrollbarWidth: 'thin',
        scrollbarColor: '#334155 transparent',
    },
    emptyState: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        margin: 'auto',
    },
    errorBox: {
        borderRadius: 10,
        background: 'rgba(239,68,68,0.15)',
        border: '1px solid rgba(239,68,68,0.4)',
        color: '#fca5a5',
        padding: '8px 14px',
        fontSize: 13,
        marginBottom: 8,
    },
    messageRow: {
        display: 'flex',
        alignItems: 'flex-end',
        gap: 8,
        animation: 'fadeSlideIn 0.25s ease both',
    },
    avatar: {
        width: 34,
        height: 34,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        fontWeight: 700,
        flexShrink: 0,
        transition: 'opacity 0.2s',
    },
    bubble: {
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    },
    bubbleText: {
        color: '#fff',
        fontSize: 14,
        lineHeight: 1.5,
        margin: 0,
        wordBreak: 'break-word',
    },
    bubbleTime: {
        fontSize: 10,
        marginTop: 4,
        display: 'block',
        textAlign: 'right',
    },
    inputBar: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 16px',
        background: '#1e293b',
        borderTop: '1px solid rgba(255,255,255,0.07)',
    },
    input: {
        flex: 1,
        background: '#0f172a',
        border: '1.5px solid #e2e8f0',
        borderRadius: 14,
        padding: '10px 16px',
        color: '#e2e8f0',
        fontSize: 14,
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    sendBtn: {
        width: 44,
        height: 44,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        border: 'none',
        color: '#fff',
        fontSize: 18,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.15s',
        flexShrink: 0,
        boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
    },
    spinner: {
        width: 36,
        height: 36,
        border: '3px solid rgba(99,102,241,0.2)',
        borderTop: '3px solid #6366f1',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
};

/* ─── keyframes injected once ── */
if (typeof document !== 'undefined' && !document.getElementById('chat-keyframes')) {
    const style = document.createElement('style');
    style.id = 'chat-keyframes';
    style.textContent = `
        @keyframes fadeSlideIn {
            from { opacity: 0; transform: translateY(10px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

export default Chat;

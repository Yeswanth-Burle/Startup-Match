import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Bell, Check, Trash2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications');
            setNotifications(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-indigo-200 border-t-primary rounded-full" />
        </div>
    );

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden"
        >
            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl shadow-sm border border-indigo-200">
                        <Bell className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Notifications</h2>
                        <p className="text-sm font-bold text-slate-500 mt-1">
                            You have <span className="text-indigo-600">{unreadCount}</span> unread message{unreadCount !== 1 && 's'}
                        </p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={markAllAsRead}
                        className="text-sm font-bold text-indigo-700 bg-indigo-100 px-5 py-2.5 rounded-xl transition-colors hover:bg-indigo-200 shadow-sm"
                    >
                        Mark all read
                    </motion.button>
                )}
            </div>

            <div className="divide-y divide-slate-100">
                <AnimatePresence>
                    {notifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="p-16 text-center text-slate-500 flex flex-col items-center"
                        >
                            <Bell className="w-16 h-16 text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-700">You're all caught up!</h3>
                            <p className="mt-2 font-medium">No new notifications right now.</p>
                        </motion.div>
                    ) : (
                        notifications.map((notif, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={notif._id}
                                className={`p-6 flex gap-5 transition-colors ${!notif.read ? 'bg-indigo-50/30' : 'bg-white hover:bg-slate-50'}`}
                            >
                                <div className={`mt-1.5 flex-shrink-0 w-2.5 h-2.5 rounded-full ${!notif.read ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-transparent'}`}></div>
                                <div className="flex-1">
                                    <h4 className={`text-base font-black tracking-tight ${!notif.read ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</h4>
                                    <p className="text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">{notif.message}</p>
                                    <p className="text-xs text-slate-400 mt-3 font-bold tracking-wide uppercase">{new Date(notif.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                </div>
                                {!notif.read && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => markAsRead(notif._id)}
                                        title="Mark as read"
                                        className="text-indigo-400 hover:text-indigo-700 p-2.5 self-start rounded-full hover:bg-indigo-100 transition-colors"
                                    >
                                        <Check className="w-5 h-5" />
                                    </motion.button>
                                )}
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default Notifications;

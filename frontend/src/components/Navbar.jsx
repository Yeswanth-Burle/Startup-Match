import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, User, Users, Briefcase, MessageSquare, Bell, BarChart2 } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [unreadCount, setUnreadCount] = useState(0);
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    const fetchUnreadCount = async () => {
        if (!user) return;
        try {
            const [alertsRes, chatsRes] = await Promise.all([
                api.get('/notifications/unread-count'),
                api.get('/messages/unread-count')
            ]);
            setUnreadCount(alertsRes.data.data.unreadCount);
            setUnreadChatCount(chatsRes.data.data.unreadCount);
        } catch (err) {
            console.error('Error fetching unread counts', err);
        }
    };

    useEffect(() => {
        fetchUnreadCount();

        // Poll every 30 seconds
        const interval = setInterval(() => {
            fetchUnreadCount();
        }, 30000);

        return () => clearInterval(interval);
    }, [user, location.pathname]); // Re-fetch on navigation and auth change

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const navLinks = [
        { name: 'Matches', path: '/', icon: Users },
        { name: 'Projects', path: '/projects', icon: Briefcase },
        { name: 'Chat', path: '/chat', icon: MessageSquare },
        { name: 'Alerts', path: '/notifications', icon: Bell },
    ];

    if (user?.role === 'ADMIN') {
        navLinks.push({ name: 'Admin', path: '/admin', icon: BarChart2 });
    }

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center">
                                <span className="text-white font-bold text-xl leading-none">S</span>
                            </div>
                            <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">StartupMatch</span>
                        </Link>
                        <div className="hidden sm:ml-10 sm:flex sm:space-x-1">
                            {navLinks.map(link => {
                                const isActive = location.pathname === link.path;
                                return (
                                    <Link
                                        key={link.name}
                                        to={link.path}
                                        className={`relative px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 ${isActive ? 'text-indigo-600 bg-indigo-50/80' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                                    >
                                        <div className="relative flex items-center justify-center">
                                            <link.icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                                            {link.name === 'Alerts' && unreadCount > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                </span>
                                            )}
                                            {link.name === 'Chat' && unreadChatCount > 0 && (
                                                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                </span>
                                            )}
                                        </div>
                                        <span className="flex items-center">
                                            {link.name}
                                            {link.name === 'Alerts' && unreadCount > 0 && (
                                                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                                    {unreadCount}
                                                </span>
                                            )}
                                            {link.name === 'Chat' && unreadChatCount > 0 && (
                                                <span className="ml-1.5 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-md">
                                                    {unreadChatCount}
                                                </span>
                                            )}
                                        </span>
                                        {isActive && (
                                            <motion.div layoutId="navbar-indicator" className="absolute bottom-0 left-3 right-3 h-0.5 bg-indigo-600 rounded-t-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group">
                            <span className="text-sm font-bold tracking-tight group-hover:text-indigo-700">{user?.profile?.firstName || user?.email?.split('@')[0]}</span>
                            <User className="w-5 h-5 text-indigo-500" />
                        </Link>
                        <button onClick={handleLogout} className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

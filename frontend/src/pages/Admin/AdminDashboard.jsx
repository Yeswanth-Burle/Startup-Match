import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Target, Activity, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/admin');
                setStats(data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        if (user && user.role === 'ADMIN') {
            fetchStats();
        } else {
            setLoading(false);
        }
    }, [user]);

    if (!user || user.role !== 'ADMIN') {
        return <Navigate to="/" />;
    }

    if (loading || !stats) return (
        <div className="flex items-center justify-center h-64">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-indigo-200 border-t-primary rounded-full" />
        </div>
    );

    const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

    const matchData = [
        { name: 'Accepted', value: parseFloat(stats.matchAcceptanceRate) },
        { name: 'Rejected/Pending', value: 100 - parseFloat(stats.matchAcceptanceRate) }
    ];

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-200' },
        { title: 'Total Projects', value: stats.totalProjects, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' },
        { title: 'Total Matches', value: stats.totalMatches, icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' },
        { title: 'Acceptance Rate', value: `${stats.matchAcceptanceRate}%`, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-200' },
    ];

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
            >
                <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Analytics Dashboard</h1>
                    <p className="text-slate-500 mt-1 font-bold">Platform overview and metric insights</p>
                </div>
            </motion.div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-5 hover:border-indigo-100 transition-colors"
                    >
                        <div className={`p-4 rounded-2xl ${card.bg} ${card.color} ${card.border} border shadow-inner`}>
                            <card.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-1">{card.title}</p>
                            <h3 className="text-4xl font-black text-slate-900 tracking-tight">{card.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[450px]">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Match Acceptance Breakdown</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                            <Pie
                                data={matchData}
                                cx="50%"
                                cy="50%"
                                innerRadius={100}
                                outerRadius={140}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {matchData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                formatter={(value) => `${value}%`}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                itemStyle={{ fontWeight: 'bold' }}
                            />
                            <Legend wrapperStyle={{ fontWeight: 'bold', paddingTop: '20px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[450px]">
                    <h3 className="text-xl font-black text-slate-800 tracking-tight mb-8">Most Popular Skills</h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={stats.popularSkills} margin={{ top: 5, right: 30, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} dy={10} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} dx={-10} />
                            <RechartsTooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                                itemStyle={{ fontWeight: 'bold', color: '#4f46e5' }}
                            />
                            <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 8, 8]} maxBarSize={50}>
                                {stats.popularSkills.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminDashboard;

import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { User, Briefcase, MapPin, Clock, Star, Check, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CircularScore = ({ score }) => {
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const colorClass = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="relative flex items-center justify-center">
            <svg className="transform -rotate-90 w-20 h-20">
                <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100" />
                <motion.circle
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent"
                    strokeDasharray={circumference}
                    className={colorClass}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-slate-800">{score}</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Match</span>
            </div>
        </div>
    );
};

const MatchesFeed = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMatches = async () => {
        try {
            const { data } = await api.get('/matches');
            setMatches(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const generateMatches = async () => {
        try {
            setLoading(true);
            await api.post('/matches/generate');
            await fetchMatches();
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    const handleAction = async (id, action) => {
        try {
            setMatches(prev => prev.filter(m => m._id !== id || action === 'ACCEPT'));
            if (action === 'ACCEPT') {
                const idx = matches.findIndex(m => m._id === id);
                if (idx !== -1) {
                    const updated = [...matches];
                    updated[idx].myStatus = 'ACCEPTED';
                    setMatches(updated);
                }
                await api.put(`/matches/${id}/accept`);
            } else {
                await api.put(`/matches/${id}/reject`);
            }
            fetchMatches();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-indigo-200 border-t-primary rounded-full" />
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8 max-w-4xl mx-auto pb-12"
        >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 bg-gradient-to-r from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        Your Matches <Sparkles className="w-6 h-6 text-indigo-500" />
                    </h1>
                    <p className="text-slate-500 mt-2 max-w-lg leading-relaxed">AI-driven compatibility scores tailored specifically for your startup journey and skillset.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateMatches}
                    className="bg-primary hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                    <Sparkles className="w-4 h-4" /> Generate AI Matches
                </motion.button>
            </div>

            {matches.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-slate-200 shadow-sm"
                >
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No active matches found</h3>
                    <p className="text-slate-500 max-w-md mx-auto">Click the generate button above to let our AI find the best technical and business co-founders for you.</p>
                </motion.div>
            ) : (
                <div className="grid gap-6">
                    <AnimatePresence>
                        {matches.map((match, index) => {
                            const profile = match.otherProfile;
                            if (!profile) return null;

                            return (
                                <motion.div
                                    key={match._id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-6 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-6 hover:shadow-xl hover:border-indigo-100 transition-all duration-300"
                                >

                                    {/* Left Side: Score & Action */}
                                    <div className="flex flex-col items-center justify-between border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6 md:w-1/4">
                                        <CircularScore score={match.score} />

                                        {match.myStatus === 'PENDING' ? (
                                            <div className="flex gap-3 mt-6 w-full">
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAction(match._id, 'REJECT')} className="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors">
                                                    <X className="w-5 h-5 mr-1" /> Pass
                                                </motion.button>
                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAction(match._id, 'ACCEPT')} className="flex-1 flex items-center justify-center p-2.5 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 font-medium transition-colors shadow-sm shadow-green-100">
                                                    <Check className="w-5 h-5 mr-1" /> Accept
                                                </motion.button>
                                            </div>
                                        ) : (
                                            <div className="mt-6 text-sm font-bold tracking-wide px-4 py-1.5 rounded-full bg-slate-100 text-slate-500 uppercase">
                                                {match.myStatus}
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Side: Profile Data */}
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{profile.firstName} {profile.lastName}</h3>
                                                <p className="text-primary font-semibold mt-0.5">{profile.title}</p>
                                            </div>
                                            {match.status === 'ACCEPTED' && (
                                                <motion.span
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="bg-indigo-100 text-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-sm"
                                                >
                                                    🎉 MATCHED!
                                                </motion.span>
                                            )}
                                        </div>

                                        <p className="text-slate-600 mt-4 text-base leading-relaxed max-w-2xl bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            "{profile.bio}"
                                        </p>

                                        <div className="flex flex-wrap gap-x-6 gap-y-3 mt-5 text-sm font-medium text-slate-600">
                                            <div className="flex items-center gap-1.5 bg-white"><Briefcase className="w-4 h-4 text-slate-400" /> {profile.industry}</div>
                                            <div className="flex items-center gap-1.5 bg-white"><MapPin className="w-4 h-4 text-slate-400" /> {profile.location || 'Remote'}</div>
                                            <div className="flex items-center gap-1.5 bg-white"><Clock className="w-4 h-4 text-slate-400" /> {profile.availability} hrs/wk</div>
                                            <div className="flex items-center gap-1.5 bg-white"><Star className="w-4 h-4 text-amber-400" /> {profile.experienceLevel}/10 Exp</div>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {profile.skills?.map(s => (
                                                <span key={s._id || s.name} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1 rounded-lg text-xs font-semibold tracking-wide">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Detailed Scores breakdown */}
                                        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3 border-t border-slate-100 pt-5">
                                            {Object.entries(match.detailedScores || {}).map(([key, value]) => (
                                                <div key={key} className="text-center p-2 rounded-xl hover:bg-slate-50 transition-colors">
                                                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">{key}</p>
                                                    <div className="flex items-end justify-center gap-1">
                                                        <span className="text-lg font-bold text-slate-800 leading-none">{value}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default MatchesFeed;

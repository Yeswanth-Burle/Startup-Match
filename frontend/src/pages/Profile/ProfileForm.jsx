import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { Sparkles, Save, User as UserIcon } from 'lucide-react';

const ProfileForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [skillsList, setSkillsList] = useState([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        bio: '',
        title: '',
        industry: 'Tech',
        experienceLevel: 5,
        availability: 40,
        location: '',
        skills: [],
        phoneNumber: '',
        socialLinks: {
            linkedin: '',
            github: '',
            website: ''
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [profileRes, skillsRes] = await Promise.all([
                    api.get('/profiles/me').catch(() => ({ data: { data: null } })),
                    api.get('/skills')
                ]);

                setSkillsList(skillsRes.data.data);

                if (profileRes.data.data) {
                    const p = profileRes.data.data;
                    setFormData({
                        firstName: p.firstName || '',
                        lastName: p.lastName || '',
                        bio: p.bio || '',
                        title: p.title || '',
                        industry: p.industry || 'Tech',
                        experienceLevel: p.experienceLevel || 5,
                        availability: p.availability || 40,
                        location: p.location || '',
                        skills: p.skills ? p.skills.map(s => s._id) : [],
                        phoneNumber: p.phoneNumber || '',
                        socialLinks: {
                            linkedin: p.socialLinks?.linkedin || '',
                            github: p.socialLinks?.github || '',
                            website: p.socialLinks?.website || ''
                        }
                    });
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSkillToggle = (skillId) => {
        setFormData(prev => {
            const skills = prev.skills.includes(skillId)
                ? prev.skills.filter(id => id !== skillId)
                : [...prev.skills, skillId];
            return { ...prev, skills };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/profiles', formData);
            navigate('/');
        } catch (err) {
            alert('Error saving profile');
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
            className="max-w-4xl mx-auto pb-12"
        >
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">

                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center p-3 border border-white/20 shadow-xl">
                            <UserIcon className="w-full h-full text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
                                Your Founder Profile
                            </h2>
                            <p className="text-indigo-100 font-medium mt-1 text-sm">Tell the matching engine about your journey.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 sm:p-10">
                    <div className="space-y-8">
                        {/* Personal Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">First Name</label>
                                <input name="firstName" value={formData.firstName} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Last Name</label>
                                <input name="lastName" value={formData.lastName} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Professional Title</label>
                            <input name="title" placeholder="e.g. Technical Co-Founder, Marketing Lead" value={formData.title} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Bio / Elevator Pitch</label>
                            <textarea name="bio" rows="4" placeholder="Tell us what you're passionate about..." value={formData.bio} onChange={handleChange} required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium resize-none" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Industry Focus</label>
                                <select name="industry" value={formData.industry} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium appearance-none">
                                    {['Tech', 'Health', 'Finance', 'Education', 'E-commerce', 'Other'].map(ind => (
                                        <option key={ind} value={ind}>{ind}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Location / Timezone</label>
                                <input name="location" placeholder="e.g. San Francisco, CA" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                            <div>
                                <label className="block text-sm font-bold text-indigo-900 mb-1.5 ml-1">Experience Level (1-10)</label>
                                <div className="flex items-center gap-4">
                                    <input type="range" min="1" max="10" name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="w-full accent-indigo-600" />
                                    <span className="w-10 h-10 flex items-center justify-center bg-white rounded-xl font-black text-indigo-700 shadow-sm border border-indigo-100">{formData.experienceLevel}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-indigo-900 mb-1.5 ml-1">Availability (hrs/week)</label>
                                <input type="number" min="1" max="100" name="availability" placeholder="40" value={formData.availability} onChange={handleChange} required className="w-full px-4 py-2.5 bg-white border border-indigo-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 mb-6 flex items-center gap-2">Contact & Verification <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">Private to Matches & Team</span></h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Phone Number</label>
                                    <input type="tel" name="phoneNumber" placeholder="+1 (555) 000-0000" value={formData.phoneNumber} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">LinkedIn URL</label>
                                    <input type="url" name="linkedin" placeholder="https://linkedin.com/in/username" value={formData.socialLinks.linkedin} onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, linkedin: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">GitHub URL</label>
                                    <input type="url" name="github" placeholder="https://github.com/username" value={formData.socialLinks.github} onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, github: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Personal Website</label>
                                    <input type="url" name="website" placeholder="https://yourwebsite.com" value={formData.socialLinks.website} onChange={(e) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, website: e.target.value } })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-2 mb-3 ml-1">
                                <label className="block text-sm font-bold text-slate-700">Top Skills</label>
                                <Sparkles className="w-4 h-4 text-amber-500" />
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                                {skillsList.map(skill => {
                                    const isSelected = formData.skills.includes(skill._id);
                                    return (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            key={skill._id}
                                            type="button"
                                            onClick={() => handleSkillToggle(skill._id)}
                                            className={`px-4 py-2 rounded-xl text-sm font-bold tracking-wide transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 border border-indigo-600' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'}`}
                                        >
                                            {skill.name}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-100 flex justify-end">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center gap-2 text-lg"
                        >
                            <Save className="w-5 h-5" /> Save Profile Engine Data
                        </motion.button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
};

export default ProfileForm;

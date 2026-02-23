import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Plus, Send, CheckCircle, XCircle, Rocket, Settings, User, FileText, Check, X, Users, Phone, Linkedin, Github, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ProjectsList = () => {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [myApplications, setMyApplications] = useState([]);
    const [teamData, setTeamData] = useState([]);

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('ALL'); // ALL, MINE, APPLIED, TEAM

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({ title: '', description: '', requiredSkills: [] });
    const [skillsList, setSkillsList] = useState([]);

    const [manageProject, setManageProject] = useState(null);
    const [projectApplications, setProjectApplications] = useState([]);

    useEffect(() => {
        fetchData();
        if (activeTab === 'APPLIED') {
            fetchMyApplications();
        } else if (activeTab === 'TEAM') {
            fetchTeamData();
        }
    }, [activeTab]);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [projRes, skillsRes] = await Promise.all([
                api.get('/projects'),
                api.get('/skills')
            ]);
            setProjects(projRes.data.data);
            setSkillsList(skillsRes.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyApplications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/applications/my-applications');
            setMyApplications(data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProjectApplications = async (projectId) => {
        try {
            const { data } = await api.get(`/applications/project/${projectId}`);
            setProjectApplications(data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            const { data: myAppsRes } = await api.get('/applications/my-applications');
            const myApprovedProjects = myAppsRes.data.filter(app => app.status === 'APPROVED').map(app => app.project);

            // Fetch all projects to filter my owned projects
            const { data: projRes } = await api.get('/projects');
            const myOwnedProjects = projRes.data.filter(p => {
                const ownerId = p.owner?._id || p.owner;
                return ownerId === user?._id || ownerId === user?.id;
            });

            // Combine projects where I'm owner OR approved applicant
            const allRelevantProjects = [...myOwnedProjects];
            for (const proj of myApprovedProjects) {
                if (!allRelevantProjects.find(p => p._id === proj._id)) {
                    allRelevantProjects.push(proj);
                }
            }

            // Fetch approved team members for each relevant project
            // We use the same backend endpoint that project owners use to view applications!
            const finalTeamData = await Promise.all(allRelevantProjects.map(async (project) => {
                try {
                    const { data } = await api.get(`/applications/project/${project._id}`);
                    const approvedMembers = data.data
                        .filter(app => app.status === 'APPROVED')
                        .map(app => app.applicant);
                    return { project, team: approvedMembers };
                } catch (e) {
                    console.error("Error fetching project team", e);
                    // It might fail for applicants because the backend endpoint `getProjectApplications`
                    // currently restricts access strictly to the owner.
                    return { project, team: [] };
                }
            }));

            setTeamData(finalTeamData);
        } catch (err) {
            console.error('Error fetching team data', err);
        } finally {
            setLoading(false);
        }
    };

    const openManageModal = async (project) => {
        setManageProject(project);
        setProjectApplications([]);
        await fetchProjectApplications(project._id);
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/projects', newProject);
            setShowCreateModal(false);
            setNewProject({ title: '', description: '', requiredSkills: [] });
            fetchData();
            setActiveTab('MINE');
        } catch (err) {
            alert('Error creating project');
        }
    };

    const handleApply = async (projectId) => {
        const coverLetter = prompt("Please write a short cover letter for this project:");
        if (!coverLetter) return;

        try {
            await api.post('/applications', { projectId, coverLetter });
            alert('Applied successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error applying');
        }
    };

    const handleUpdateApplication = async (appId, status) => {
        try {
            await api.put(`/applications/${appId}/status`, { status });
            setProjectApplications(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
        } catch (err) {
            alert('Error updating application');
        }
    };

    const toggleSkill = (skillId) => {
        setNewProject(prev => ({
            ...prev,
            requiredSkills: prev.requiredSkills.includes(skillId)
                ? prev.requiredSkills.filter(id => id !== skillId)
                : [...prev.requiredSkills, skillId]
        }));
    };

    const handleCloseProject = async (projectId) => {
        if (!window.confirm('Are you sure you want to close this project? No more applications will be accepted.')) return;
        try {
            await api.put(`/projects/${projectId}`, { status: 'CLOSED' });
            setProjects(prev => prev.map(p => p._id === projectId ? { ...p, status: 'CLOSED' } : p));
            setManageProject(prev => ({ ...prev, status: 'CLOSED' }));
        } catch (err) {
            alert('Error closing project');
        }
    };

    const filteredProjects = projects.filter(p => {
        if (!p || !p.owner) return false;

        const ownerId = p.owner?._id || p.owner; // Handle cases where owner might not be fully populated
        const isOwner = user ? (ownerId === user?._id || ownerId === user?.id) : false;

        if (activeTab === 'ALL') return !isOwner && p.status === 'OPEN';
        if (activeTab === 'MINE') return isOwner;
        return false;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto space-y-8 pb-12"
        >
            <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8">
                <div className="text-center sm:text-left mb-4 sm:mb-0">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center justify-center sm:justify-start gap-3">
                        Startup Projects <Rocket className="w-8 h-8 text-indigo-500" />
                    </h1>
                    <p className="text-slate-500 font-medium mt-2 text-lg">Discover visionary startups or manage your own applications.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-2xl font-bold shadow-xl shadow-indigo-200 transition-all border border-indigo-500"
                >
                    <Plus className="w-5 h-5 flex-shrink-0" /> Launch Project
                </motion.button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-full max-w-2xl">
                {['ALL', 'MINE', 'APPLIED', 'TEAM'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 font-bold py-2.5 rounded-xl transition-all ${activeTab === tab
                            ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                            }`}
                    >
                        {tab === 'ALL' && 'All Projects'}
                        {tab === 'MINE' && 'My Projects'}
                        {tab === 'APPLIED' && 'My Applications'}
                        {tab === 'TEAM' && 'Your Team'}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 border-4 border-indigo-200 border-t-primary rounded-full" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <AnimatePresence>
                        {/* Render Projects (ALL or MINE) */}
                        {(activeTab === 'ALL' || activeTab === 'MINE') && filteredProjects.map((project, idx) => (
                            <motion.div
                                key={project._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between h-full group"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-black text-slate-900 line-clamp-2 pr-2 group-hover:text-indigo-600 transition-colors">{project.title}</h3>
                                        <span className={`px-3 py-1 flex-shrink-0 text-[10px] uppercase font-black tracking-widest rounded-full ${project.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-600 mb-6 font-medium line-clamp-3 leading-relaxed">{project.description}</p>

                                    <div className="mb-4">
                                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3">Core Skills Needed</p>
                                        <div className="flex flex-wrap gap-2">
                                            {project.requiredSkills.map(skill => (
                                                <span key={skill._id} className="bg-slate-50 border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide">
                                                    {skill.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 mt-6 pt-5 flex items-center justify-between">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                                            <span className="text-indigo-700 font-bold text-xs">{project.owner?.email?.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500 truncate">{project.owner?.email?.split('@')[0]}</span>
                                    </div>

                                    {activeTab === 'ALL' ? (
                                        <motion.button
                                            whileHover={{ x: 5 }}
                                            onClick={() => handleApply(project._id)}
                                            className="flex items-center justify-center p-2 rounded-xl text-primary font-bold hover:bg-indigo-50 transition-colors"
                                        >
                                            Apply <Send className="w-4 h-4 ml-1.5" />
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            onClick={() => openManageModal(project)}
                                            className="flex items-center justify-center py-2 px-4 rounded-xl text-indigo-700 bg-indigo-50 font-bold hover:bg-indigo-100 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 mr-1.5" /> Manage
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        ))}

                        {/* Render My Applications */}
                        {activeTab === 'APPLIED' && myApplications.map((app, idx) => (
                            <motion.div
                                key={app._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col justify-between"
                            >
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 mb-2">{app.project.title}</h3>
                                    <p className="text-sm font-semibold text-slate-500 mb-4">Owner: {app.project.owner.email}</p>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Your Cover Letter</p>
                                        <p className="text-sm font-medium text-slate-700 italic">"{app.coverLetter}"</p>
                                    </div>
                                </div>

                                <div className="border-t border-slate-100 pt-5 flex justify-between items-center">
                                    <span className="text-sm font-bold text-slate-500">Application Status:</span>
                                    <span className={`px-4 py-1.5 text-xs uppercase font-black tracking-widest rounded-xl ${app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                        app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                        {app.status}
                                    </span>
                                </div>
                            </motion.div>
                        ))}

                        {/* Render Team Data */}
                        {activeTab === 'TEAM' && teamData.map((data, idx) => (
                            <motion.div
                                key={data.project._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900">{data.project.title}</h3>
                                        <p className="text-sm font-bold text-indigo-600 mt-1">
                                            {data.project.owner?._id === user?._id || data.project.owner === user?._id ? 'Owned by You' : 'Team Member'}
                                        </p>
                                    </div>
                                    <span className={`px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-full flex-shrink-0 ${data.project.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                        {data.project.status}
                                    </span>
                                </div>

                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Team Roster ({data.team.length + 1})</h4>
                                <div className="space-y-4">
                                    {/* Show Owner as part of the team */}
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50 border border-indigo-100">
                                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
                                            {data.project.owner?.email?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">
                                                {data.project.owner?._id === user?._id || data.project.owner === user?._id ? 'You' : data.project.owner?.email?.split('@')[0] || 'Unknown Owner'}
                                            </p>
                                            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wide">Project Owner</p>
                                        </div>
                                    </div>

                                    {/* Show approved applications */}
                                    {data.team.length === 0 ? (
                                        <p className="text-sm font-medium text-slate-500 italic p-3 text-center bg-slate-50 rounded-2xl border border-slate-100">
                                            No team members approved yet
                                        </p>
                                    ) : (
                                        data.team.map((member, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold">
                                                    {member?.email?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900">
                                                        {member?._id === user?._id || member?._id === user?.id ? 'You' : member?.profile?.firstName || member?.email?.split('@')[0] || 'Unknown User'}
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Approved Builder</p>

                                                    {/* Contact Info (Only visible inside Team Tab for approved members!) */}
                                                    {(member?.profile?.phoneNumber || member?.profile?.socialLinks?.linkedin || member?.profile?.socialLinks?.github || member?.profile?.socialLinks?.website) && (
                                                        <div className="flex flex-wrap gap-2 mt-1">
                                                            {member?.profile?.phoneNumber && (
                                                                <a href={`tel:${member.profile.phoneNumber}`} className="flex items-center gap-1 text-[10px] font-bold bg-indigo-100/50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md transition-colors">
                                                                    <Phone className="w-3 h-3" /> Call
                                                                </a>
                                                            )}
                                                            {member?.profile?.socialLinks?.linkedin && (
                                                                <a href={member.profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-md transition-colors">
                                                                    <Linkedin className="w-3 h-3" /> LinkedIn
                                                                </a>
                                                            )}
                                                            {member?.profile?.socialLinks?.github && (
                                                                <a href={member.profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors">
                                                                    <Github className="w-3 h-3" /> GitHub
                                                                </a>
                                                            )}
                                                            {member?.profile?.socialLinks?.website && (
                                                                <a href={member.profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md transition-colors">
                                                                    <Globe className="w-3 h-3" /> Web
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Empty States */}
                    {(activeTab === 'ALL' || activeTab === 'MINE') && filteredProjects.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full bg-white p-12 text-center rounded-3xl border-2 border-dashed border-slate-200"
                        >
                            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 transform rotate-12">
                                <Rocket className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Nothing to show</h3>
                            <p className="text-slate-500 max-w-sm mx-auto font-medium">There are no projects available in this section.</p>
                        </motion.div>
                    )}

                    {activeTab === 'APPLIED' && myApplications.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full bg-white p-12 text-center rounded-3xl border-2 border-dashed border-slate-200"
                        >
                            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Applications Yet</h3>
                            <p className="text-slate-500 max-w-sm mx-auto font-medium">Go to 'All Projects' and start applying to join a visionary team!</p>
                        </motion.div>
                    )}

                    {activeTab === 'TEAM' && teamData.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full bg-white p-12 text-center rounded-3xl border-2 border-dashed border-slate-200"
                        >
                            <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No Active Teams</h3>
                            <p className="text-slate-500 max-w-sm mx-auto font-medium">To build a team, launch a project and approve applicants, or apply to a project and get approved!</p>
                        </motion.div>
                    )}
                </div>
            )}

            {/* Create Project Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Post a New Project</h2>
                                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto">
                                <form id="createProjectForm" onSubmit={handleCreate} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Project Title</label>
                                        <input required placeholder="E.g., Revolutionary AI Healthcare App" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Elevator Pitch & Description</label>
                                        <textarea rows="4" required placeholder="Describe what you're building..." value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none resize-none" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Required Skills</label>
                                        <div className="flex flex-wrap gap-2.5">
                                            {skillsList.map(skill => (
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    type="button"
                                                    key={skill._id}
                                                    onClick={() => toggleSkill(skill._id)}
                                                    className={`px-4 py-1.5 text-sm rounded-xl font-bold tracking-wide transition-colors ${newProject.requiredSkills.includes(skill._id) ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                >
                                                    {skill.name}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                                <button onClick={() => setShowCreateModal(false)} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" form="createProjectForm" className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                                    Launch <Rocket className="w-4 h-4" />
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Manage Project Applications Modal */}
            <AnimatePresence>
                {manageProject && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Manage Project</h2>
                                        <span className={`px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-full ${manageProject.status === 'OPEN' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                            {manageProject.status}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold text-indigo-600 mt-1">{manageProject.title}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {manageProject.status === 'OPEN' && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => handleCloseProject(manageProject._id)}
                                            className="text-sm font-bold bg-amber-100 text-amber-700 px-4 py-2 rounded-xl hover:bg-amber-200 transition-colors"
                                        >
                                            Close Project
                                        </motion.button>
                                    )}
                                    <button onClick={() => setManageProject(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-full transition-colors">
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 overflow-y-auto bg-slate-50/50 space-y-6 flex-1">
                                {projectApplications.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                                        <h3 className="text-xl font-bold text-slate-700">No applicants yet</h3>
                                    </div>
                                ) : (
                                    projectApplications.map(app => (
                                        <div key={app._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700">
                                                        {app.applicant.profile?.firstName?.charAt(0) || <User className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900">
                                                            {app.applicant.profile?.firstName} {app.applicant.profile?.lastName}
                                                        </h4>
                                                        <p className="text-xs font-bold text-slate-500">{app.applicant.email}</p>
                                                    </div>
                                                </div>

                                                {app.applicant.profile && (
                                                    <div className="mt-3">
                                                        <p className="text-sm font-bold text-indigo-600">{app.applicant.profile.title}</p>

                                                        {/* Owner Verifiacation Contact Block */}
                                                        {(app.applicant.profile.phoneNumber || app.applicant.profile.socialLinks?.linkedin || app.applicant.profile.socialLinks?.github || app.applicant.profile.socialLinks?.website) && (
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {app.applicant.profile.phoneNumber && (
                                                                    <a href={`tel:${app.applicant.profile.phoneNumber}`} className="flex items-center gap-1 text-[10px] font-bold bg-indigo-100/50 hover:bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md transition-colors">
                                                                        <Phone className="w-3 h-3" /> {app.applicant.profile.phoneNumber}
                                                                    </a>
                                                                )}
                                                                {app.applicant.profile.socialLinks?.linkedin && (
                                                                    <a href={app.applicant.profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded-md transition-colors">
                                                                        <Linkedin className="w-3 h-3" /> LinkedIn
                                                                    </a>
                                                                )}
                                                                {app.applicant.profile.socialLinks?.github && (
                                                                    <a href={app.applicant.profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-md transition-colors">
                                                                        <Github className="w-3 h-3" /> GitHub
                                                                    </a>
                                                                )}
                                                                {app.applicant.profile.socialLinks?.website && (
                                                                    <a href={app.applicant.profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md transition-colors">
                                                                        <Globe className="w-3 h-3" /> Portfolio
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap gap-2 mt-3">
                                                            {app.applicant.profile.skills?.map(s => (
                                                                <span key={s._id} className="bg-slate-100 text-slate-600 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">{s.name}</span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Cover Letter</p>
                                                    <p className="text-sm font-medium text-slate-700 italic">"{app.coverLetter}"</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                                <span className={`px-3 py-1 text-[10px] uppercase font-black tracking-widest rounded-full self-start md:self-end ${app.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {app.status}
                                                </span>

                                                {app.status === 'PENDING' && (
                                                    <div className="flex gap-2 w-full mt-4">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleUpdateApplication(app._id, 'REJECTED')}
                                                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold p-2 rounded-xl flex justify-center transition-colors"
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleUpdateApplication(app._id, 'APPROVED')}
                                                            className="flex-1 bg-green-50 hover:bg-green-100 text-green-600 font-bold p-2 rounded-xl flex justify-center transition-colors shadow-sm shadow-green-100"
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </motion.button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProjectsList;

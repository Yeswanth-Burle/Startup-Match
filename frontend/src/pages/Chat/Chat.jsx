import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { Send, User as UserIcon, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Chat = () => {
    const { user } = useAuth();
    const socket = useSocket();
    const [matches, setMatches] = useState([]);
    const [activeMatch, setActiveMatch] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const fetchAcceptedMatches = async () => {
            try {
                const { data } = await api.get('/matches');
                const accepted = data.data.filter(m => m.status === 'ACCEPTED');
                setMatches(accepted);
            } catch (err) {
                console.error(err);
            }
        };
        fetchAcceptedMatches();
    }, []);

    useEffect(() => {
        if (!socket || !activeMatch) return;

        const handleNewMessage = (msg) => {
            if (msg.matchId === activeMatch._id) {
                setMessages(prev => {
                    // Prevent duplicate if we just sent it 
                    // (the server sends us back our own message)
                    if (prev.some(m => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
        };

        socket.on('newMessage', handleNewMessage);
        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, activeMatch]);

    useEffect(() => {
        if (activeMatch) {
            const fetchMessages = async () => {
                try {
                    const { data } = await api.get(`/messages/${activeMatch._id}`);
                    setMessages(data.data); // Removed .reverse() because backend sorts { createdAt: 1 } (oldest first)
                    await api.put(`/messages/${activeMatch._id}/read`);
                } catch (err) {
                    console.error('Error fetching messages', err);
                }
            };
            fetchMessages();
            socket?.emit('joinRoom', { matchId: activeMatch._id });
        }
    }, [activeMatch, socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeMatch) return;

        try {
            const receiverId = activeMatch.otherUserId || activeMatch.otherProfile?.user?._id || activeMatch.otherProfile?.user;
            const messageData = {
                matchId: activeMatch._id,
                receiverId,
                content: newMessage
            };

            const { data } = await api.post(`/messages/${activeMatch._id}`, messageData);

            socket.emit('sendMessage', data.data);
            setMessages(prev => [...prev, data.data]);
            setNewMessage('');
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-[calc(100vh-6rem)] flex rounded-3xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 max-w-6xl mx-auto"
        >
            {/* Sidebar */}
            <div className="w-1/3 bg-slate-50 border-r border-slate-200 flex flex-col">
                <div className="p-6 border-b border-slate-200 bg-white">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        Messages <MessageSquare className="w-6 h-6 text-indigo-500" />
                    </h2>
                </div>
                <div className="overflow-y-auto flex-1 p-4 space-y-2">
                    {matches.map(m => {
                        const otherProfile = m.otherProfile;
                        if (!otherProfile) return null;

                        const isActive = activeMatch?._id === m._id;

                        return (
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={m._id}
                                onClick={() => setActiveMatch(m)}
                                className={`w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all ${isActive
                                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                                    : 'hover:bg-slate-100 text-slate-700 bg-white border border-slate-100'
                                    }`}
                            >
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${isActive ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {otherProfile.firstName?.charAt(0) || <UserIcon />}
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <h4 className={`font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                        {otherProfile.firstName} {otherProfile.lastName}
                                    </h4>
                                    <p className={`text-xs font-semibold truncate mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                                        {otherProfile.title}
                                    </p>
                                </div>
                            </motion.button>
                        );
                    })}

                    {matches.length === 0 && (
                        <div className="text-center p-6 text-slate-400">
                            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p className="text-sm font-medium">Accept a match to start chatting</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {activeMatch ? (
                    <>
                        <div className="p-6 border-b border-slate-100 flex items-center gap-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                                {activeMatch.otherProfile?.firstName?.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">
                                    {activeMatch.otherProfile?.firstName} {activeMatch.otherProfile?.lastName}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium">{activeMatch.otherProfile?.title}</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                            <AnimatePresence>
                                {messages.map((msg, index) => {
                                    // Handle both populated and unpopulated sender references
                                    const senderIdStr = typeof msg.sender === 'object' && msg.sender !== null ? (msg.sender._id || msg.sender.id)?.toString() : msg.sender?.toString();
                                    const userIdStr = (user._id || user.id)?.toString();
                                    const isMine = senderIdStr === userIdStr;

                                    return (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            key={index}
                                            className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[70%] p-4 rounded-2xl ${isMine
                                                ? 'bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-200'
                                                : 'bg-white text-slate-800 rounded-bl-none shadow-sm border border-slate-100'
                                                }`}>
                                                <p className="font-medium leading-relaxed">{msg.content}</p>
                                                <span className={`text-[10px] mt-2 block font-bold ${isMine ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-3.5 rounded-xl transition-colors shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/30">
                        <MessageSquare className="w-16 h-16 text-indigo-100 mb-4" />
                        <h3 className="text-xl font-bold text-slate-800">Your Conversations</h3>
                        <p className="mt-2 font-medium">Select a match from the sidebar to chat.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default Chat;

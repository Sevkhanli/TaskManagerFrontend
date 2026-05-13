import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, TaskStatus } from '../types';
import { CheckSquare, ArrowLeft, Mail, Lock, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminLogin: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState({ email: 'admin@taskflow.pro', password: '' });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API delay
        setTimeout(async () => {
            await login(UserRole.SUPER_ADMIN);
            navigate('/');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 selection:bg-white selection:text-black">
            <div className="w-full max-w-md">
                <Link to="/login" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Portal</span>
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-zinc-900 border border-white/5 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-zinc-900" />
                            </div>
                            <span className="font-bold text-2xl tracking-tighter text-white">Root<span className="text-zinc-500">Access</span></span>
                        </div>

                        <header className="mb-8">
                            <h2 className="text-2xl font-black text-white tracking-tight">Super Admin Entry</h2>
                            <p className="text-zinc-500 text-sm mt-1">Authorized personnel only. Access is monitored.</p>
                        </header>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Admin Identifier</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input 
                                        type="email" 
                                        required
                                        value={credentials.email}
                                        onChange={e => setCredentials({...credentials, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-hidden focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-700"
                                        placeholder="admin@itbrains.edu.az"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">Security Key</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                    <input 
                                        type="password" 
                                        required
                                        value={credentials.password}
                                        onChange={e => setCredentials({...credentials, password: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-hidden focus:ring-1 focus:ring-zinc-400 transition-all placeholder:text-zinc-700"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-white text-zinc-950 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all mt-4 flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? 'Validating...' : 'Establish Connection'}
                                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> }
                            </button>
                        </form>
                    </div>
                </motion.div>
                
                <footer className="mt-8 text-center">
                    <p className="text-[10px] text-zinc-600 font-mono tracking-widest uppercase">System: TaskFlow Pro v2.4.0 / Secured by IT BRAINS</p>
                </footer>
            </div>
        </div>
    );
};

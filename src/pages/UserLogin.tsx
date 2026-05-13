import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { CheckSquare, ArrowLeft, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const UserLogin: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [credentials, setCredentials] = useState({ email: 'staff@example.com', password: '' });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(async () => {
            await login(UserRole.USER);
            navigate('/');
        }, 800);
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link to="/login" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Back to Portal</span>
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-zinc-200 p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden"
                >
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-zinc-50 rounded-full blur-2xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center">
                                <CheckSquare className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-bold text-2xl tracking-tighter text-zinc-900">Staff<span className="text-zinc-400">Portal</span></span>
                        </div>

                        <header className="mb-8">
                            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Welcome Back</h2>
                            <p className="text-zinc-500 text-sm mt-1">Access your assignments and track goals.</p>
                        </header>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Work Email</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input 
                                        type="email" 
                                        required
                                        value={credentials.email}
                                        onChange={e => setCredentials({...credentials, email: e.target.value})}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                                        placeholder="your.email@company.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input 
                                        type="password" 
                                        required
                                        value={credentials.password}
                                        onChange={e => setCredentials({...credentials, password: e.target.value})}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-zinc-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all mt-4 flex items-center justify-center gap-2 group disabled:opacity-50"
                            >
                                {loading ? 'Signing in...' : 'Enter Dashboard'}
                                {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> }
                            </button>
                        </form>
                    </div>
                </motion.div>
                
                <footer className="mt-8 text-center">
                    <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">Secured by TaskFlow Governance Protocol</p>
                </footer>
            </div>
        </div>
    );
};

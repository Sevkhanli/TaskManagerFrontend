import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { CheckSquare, ArrowLeft, Mail, Lock, User as UserIcon, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const UserLogin: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [credentials, setCredentials] = useState({ email: '', password: '' });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('[UserLogin] Form submitted');
        setLoading(true);
        setError(null);
        try {
            console.log('[UserLogin] Invoking login context...');
            const userData = await login(credentials);
            console.log('[UserLogin] Login successful for:', userData?.email);

            if (userData?.role === UserRole.SUPER_ADMIN) {
                console.warn('[UserLogin] Admin user attempted user login:', userData?.email);
                setError('Giriş rədd edildi: Admin hesabı ilə bu portaldan daxil olmaq mümkün deyil. Zəhmət olmasa Super Admin portalını seçin.');
                return;
            }
            
            // Allow a tiny frame for React to flush state before navigating
            setTimeout(() => {
                const from = (location.state as any)?.from?.pathname || '/tasks';
                console.log('[UserLogin] Navigating to:', from);
                navigate(from, { replace: true });
            }, 50);
        } catch (err: any) {
            console.error('[UserLogin] Login error:', err);
            setError(err.message || 'Giriş uğursuz oldu: Zəhmət olmasa email və şifrəni yoxlayın.');
        } finally {
            setLoading(false);
            console.log('[UserLogin] Login flow concluded');
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link to="/login" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-8 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">Portala Qayıt</span>
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
                            <span className="font-bold text-2xl tracking-tighter text-zinc-900">İşçi<span className="text-zinc-400">Portalı</span></span>
                        </div>

                        <header className="mb-8">
                            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Xoş Gəlmisiniz</h2>
                            <p className="text-zinc-500 text-sm mt-1">Tapşırıqlarınıza daxil olun və hədəfləri izləyin.</p>
                        </header>

                        <form onSubmit={handleLogin} className="space-y-5">
                            {error && (
                                <motion.div 
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold"
                                >
                                    {error}
                                </motion.div>
                            )}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">İş Emaili</label>
                                <div className="relative">
                                    <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                    <input 
                                        type="email" 
                                        required
                                        value={credentials.email}
                                        onChange={e => setCredentials({...credentials, email: e.target.value})}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl pl-12 pr-4 py-4 text-zinc-900 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all placeholder:text-zinc-300"
                                        placeholder="email@company.az"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1">Şifrə</label>
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
                                {loading ? 'Giriş edilir...' : 'Panelə Daxil Ol'}
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

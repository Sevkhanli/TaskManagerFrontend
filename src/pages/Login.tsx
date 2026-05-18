import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckSquare, ArrowRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl grid lg:grid-cols-2 bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-zinc-200">
                {/* Left side: Branding */}
                <div className="bg-zinc-900 p-8 lg:p-16 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-16">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                <CheckSquare className="w-6 h-6 text-zinc-900" />
                            </div>
                            <span className="font-bold text-2xl tracking-tighter">TaskFlow<span className="text-zinc-500">Pro</span></span>
                        </div>
                        
                        <h2 className="text-4xl lg:text-5xl font-black leading-none tracking-tighter mb-8">
                            Müəssisə <br/>İdarəetmə <br/><span className="text-zinc-500">Protokolu.</span>
                        </h2>
                        <p className="text-zinc-400 text-lg max-w-xs font-medium leading-relaxed">
                            Yüksək performanslı komandalar üçün hər bir tapşırığı və mənfi halı izləyən vahid sistem.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-2 mt-12">
                        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Built for IT BRAINS</p>
                        <div className="h-0.5 w-12 bg-white/10 rounded-full"></div>
                    </div>
                </div>

                {/* Right side: Portal Options */}
                <div className="p-8 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="mb-12">
                        <h3 className="text-3xl font-black text-zinc-900 tracking-tighter mb-2">Sistemə Giriş</h3>
                        <p className="text-zinc-500 font-medium">İdarəetmə panelinə keçid üsulunu seçin.</p>
                    </div>

                    <div className="space-y-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/login/admin')}
                            className="w-full flex items-center justify-between p-6 rounded-3xl border-2 border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black uppercase tracking-widest">Super Admin</p>
                                    <p className="text-xs text-zinc-500 font-medium">Kök Giriş və İdarəetmə</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-zinc-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">
                                <span className="bg-white px-4">Birbaşa Giriş</span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/login/user')}
                            className="w-full flex items-center justify-between p-6 rounded-3xl border border-zinc-200 bg-white text-zinc-900 hover:border-zinc-900 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center">
                                    <UserIcon className="w-6 h-6 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-black uppercase tracking-widest">Standart İstifadəçi</p>
                                    <p className="text-xs text-zinc-400 font-medium">Tapşırıq Matrisi və Şəxsi Hesablar</p>
                                </div>
                            </div>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </div>

                    <div className="mt-16 text-center text-[9px] text-zinc-300 font-black uppercase tracking-[0.2em]">
                        <p>© 2026 IT BRAINS ACADEMY. ALL RIGHTS RESERVED.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


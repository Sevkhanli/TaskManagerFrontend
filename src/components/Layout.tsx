import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, 
    CheckSquare, 
    AlertCircle, 
    Users as UsersIcon, 
    Settings as SettingsIcon,
    LogOut,
    Menu,
    X,
    Wallet,
    RefreshCcw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { PenaltySummary, UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { penaltyApi } from '../api';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const Layout: React.FC = () => {
    const { user, loading, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [summary, setSummary] = React.useState<PenaltySummary | null>(null);

    React.useEffect(() => {
        if (user) {
            fetchSummary();
        }
    }, [user, location.pathname]); // Refresh when page changes or user changes

    React.useEffect(() => {
        const handleUpdate = () => {
            console.log('[Layout] Penalty update event received, refetching in 1s...');
            setTimeout(fetchSummary, 1500);
        };
        window.addEventListener('penalty-update', handleUpdate);
        return () => window.removeEventListener('penalty-update', handleUpdate);
    }, [user]);

    const fetchSummary = async () => {
        console.log('[Layout] Fetching summary for user:', user?.id);
        try {
            const data = await penaltyApi.getMySummary();
            console.log('[Layout] Summary received:', data);
            setSummary(data);
        } catch (err) {
            console.error('[Layout] Failed to fetch summary:', err);
        }
    };

    console.log('[Layout] Rendering for user:', user?.email, 'at', location.pathname, 'loading:', loading);

    const userRole = user?.role;
    const userEmail = user?.email;

    const navigation = React.useMemo(() => {
        console.log('[Layout] Recalculating navigation for email:', userEmail, 'role:', userRole);
        const base = [
            { name: 'Tapşırıqlar', href: '/tasks', icon: CheckSquare },
            { name: 'Cərimələr', href: '/penalties', icon: AlertCircle },
        ];

        if (userRole === UserRole.SUPER_ADMIN) {
            base.push(
                { name: 'İstifadəçilər', href: '/users', icon: UsersIcon },
                { name: 'Ayarlar', href: '/settings', icon: SettingsIcon }
            );
        }
        return base;
    }, [userRole, userEmail]);

    const handleLogout = async () => {
        console.log('[Layout] Logout clicked');
        await logout();
        navigate('/login');
    };

    if (loading || !user) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-zinc-50 flex-col gap-4 font-mono text-zinc-900 font-bold uppercase tracking-widest text-[11px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900"></div>
                Sessiya Sinxronlaşdırılır...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-64 flex-col border-r border-zinc-200 bg-white sticky top-0 h-screen">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                        <CheckSquare className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">TaskFlow<span className="text-zinc-400">Pro</span></span>
                </div>
                
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive 
                                        ? "bg-zinc-900 text-white" 
                                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        );
                    })}

                    {/* Penalty Summary Mini-Widget */}
                    {summary && (
                        <div className="mt-8 px-3 py-4 rounded-xl bg-red-50/50 border border-red-100/50 group/liability relative">
                            <button 
                                onClick={fetchSummary}
                                className="absolute top-2 right-2 p-1 text-red-300 hover:text-red-500 transition-colors opacity-0 group-hover/liability:opacity-100"
                                title="Refresh Liability"
                            >
                                <RefreshCcw className="w-2.5 h-2.5" />
                            </button>
                            <div className="flex items-center gap-2 mb-3">
                                <Wallet className="w-3 h-3 text-red-500" />
                                <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Maliyyə Öhdəliyi</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xl font-black text-red-700">{summary.totalPendingAmount}</span>
                                <span className="text-[10px] font-bold text-red-500">{summary.currency}</span>
                            </div>
                            <div className="mt-2 text-[10px] text-red-400 font-medium flex items-center gap-1">
                                <AlertCircle className="w-2.5 h-2.5" />
                                {summary.pendingPenalties} ÖDƏNİLMƏMİŞ CƏRİMƏ
                            </div>
                        </div>
                    )}
                </nav>

                <div className="p-4 border-t border-zinc-200 bg-white">
                    <div className="px-3 py-3 rounded-xl bg-zinc-50 border border-zinc-100 mb-4">
                        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Giriş edilib</p>
                        <p className="text-sm font-medium text-zinc-900 truncate">{user?.fullName || 'N/A'}</p>
                        <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'N/A'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Çıxış Et
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="h-16 border-b border-zinc-200 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8">
                    <div className="flex items-center gap-4">
                        <button 
                            className="lg:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-semibold text-zinc-900">
                            {navigation.find(n => n.href === location.pathname)?.name || 'TaskFlow'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center text-xs font-bold text-zinc-600 overflow-hidden">
                            {user?.fullName?.charAt(0) || '?'}
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-4 lg:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden shadow-2xl flex flex-col"
                        >
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center">
                                        <CheckSquare className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="font-bold text-xl tracking-tight">TaskFlow<span className="text-zinc-400">Pro</span></span>
                                </div>
                                <button onClick={() => setIsMobileMenuOpen(false)}>
                                    <X className="w-5 h-5 text-zinc-500" />
                                </button>
                            </div>

                            <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                                {navigation.map((item) => {
                                    const isActive = location.pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                isActive 
                                                    ? "bg-zinc-900 text-white" 
                                                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                            )}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.name}
                                        </Link>
                                    );
                                })}

                                {summary && (
                                    <div className="mt-8 px-3 py-4 rounded-xl bg-red-50/50 border border-red-100/50 group/liability relative">
                                        <button 
                                            onClick={fetchSummary}
                                            className="absolute top-2 right-2 p-1 text-red-300 hover:text-red-500 transition-colors opacity-100"
                                            title="Refresh Liability"
                                        >
                                            <RefreshCcw className="w-2.5 h-2.5" />
                                        </button>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Wallet className="w-3 h-3 text-red-500" />
                                            <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Financial Liability</span>
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-xl font-black text-red-700">{summary.totalPendingAmount}</span>
                                            <span className="text-[10px] font-bold text-red-500">{summary.currency}</span>
                                        </div>
                                        <div className="mt-2 text-[10px] text-red-400 font-medium flex items-center gap-1">
                                            <AlertCircle className="w-2.5 h-2.5" />
                                            {summary.pendingPenalties} UNRESOLVED BREACHES
                                        </div>
                                    </div>
                                )}
                            </nav>

                            <div className="p-4 border-t border-zinc-200">
                                <div className="px-3 py-3 rounded-xl bg-zinc-50 border border-zinc-100 mb-4">
                                    <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">Signed in as</p>
                                    <p className="text-sm font-medium text-zinc-900 truncate">{user?.fullName || 'N/A'}</p>
                                    <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'N/A'}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Mail, Shield, User as UserIcon, Trash2, Edit3, Key, MoreVertical, RefreshCcw, DollarSign, AlertCircle, CheckCircle2, XCircle, X } from 'lucide-react';
import { User, UserRole, UserPenaltyStats } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { authApi, penaltyApi } from '../api';
import { useNotification } from '../contexts/NotificationContext';

const SummaryModal: React.FC<{ userId: string, onClose: () => void }> = ({ userId, onClose }) => {
    const [summary, setSummary] = useState<UserPenaltyStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const data = await penaltyApi.getUserSummary(userId);
                setSummary(data);
            } catch (err: any) {
                console.error('[SummaryModal] Error:', err);
                setError('Failed to fetch user summary.');
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [userId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-100"
            >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-zinc-900">İstifadəçi Performans Xülasəsi</h3>
                        <p className="text-sm text-zinc-500 font-mono tracking-tighter">SİST_ID: {userId}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4 py-12">
                            <RefreshCcw className="w-8 h-8 animate-spin text-zinc-300" />
                            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Göstəricilər Təhlil Edilir...</p>
                        </div>
                    ) : error ? (
                        <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
                            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                            <p className="text-red-600 font-bold mb-1">XƏTA_DATA</p>
                            <p className="text-red-400 text-sm">{error}</p>
                        </div>
                    ) : summary && (
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 p-4 bg-zinc-900 text-white rounded-2xl">
                                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                                    <UserIcon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest leading-none mb-1">İstifadəçi Kimliyi</p>
                                    <p className="text-lg font-bold">{summary.userName}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">Ümumi Öhdəlik</p>
                                    <p className="text-2xl font-black tracking-tighter text-zinc-900">
                                        {(summary.totalPenaltyAmount ?? summary.totalPendingAmount ?? 0).toFixed(2)} <span className="text-xs font-bold text-zinc-400">{summary.currency}</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                    <p className="text-[10px] font-mono text-red-400 uppercase tracking-widest mb-2">Borc Balansı</p>
                                    <p className="text-2xl font-black tracking-tighter text-red-600">
                                        {(summary.pendingAmount ?? summary.totalPendingAmount ?? 0).toFixed(2)} <span className="text-xs font-bold text-red-400">{summary.currency}</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">Ödənilmiş Məbləğ</p>
                                    <p className="text-2xl font-black tracking-tighter text-zinc-900">
                                        {(summary.paidAmount ?? 0).toFixed(2)} <span className="text-xs font-bold text-zinc-400">{summary.currency}</span>
                                    </p>
                                </div>
                                <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest mb-2">Bağışlananlar</p>
                                    <p className="text-2xl font-black tracking-tighter text-emerald-600">
                                        {summary.waivedPenalties ?? 0} <span className="text-xs font-bold text-zinc-400">HAL</span>
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-500 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-zinc-400" /> Cəmi Cərimə Sayı</span>
                                    <span className="font-bold text-zinc-900">{summary.totalPenaltyCount ?? summary.totalPenalties ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end">
                    <button onClick={onClose} className="btn-secondary px-8 font-bold text-[11px] tracking-widest">BAĞLA</button>
                </div>
            </motion.div>
        </div>
    );
};

export const Users: React.FC = () => {
    const { notify } = useNotification();
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [selectedUserForSummary, setSelectedUserForSummary] = useState<string | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({ 
        fullName: '', 
        email: '', 
        role: UserRole.USER,
        password: '',
        confirmPassword: ''
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            console.log('[Users] Fetching organizational accounts...');
            const data = await authApi.getUsers();
            console.log('[Users] Received data:', data);
            
            if (Array.isArray(data)) {
                const mappedUsers: User[] = data.map((u: any) => {
                    const originalRole = u.role || 'USER';
                    const isAdminRole = (String(u.fullName).toLowerCase().includes('admin') || String(u.role).toLowerCase().includes('admin'));
                    
                    return {
                        id: String(u.id),
                        fullName: u.fullName || u.name || 'Unknown User',
                        email: u.email || 'No email provided',
                        role: isAdminRole ? UserRole.SUPER_ADMIN : originalRole,
                        createdAt: u.createdAt || new Date().toISOString()
                    };
                });
                setUsers(mappedUsers);
                setError(null);
            } else {
                console.warn('[Users] Expected array of users, got:', data);
                setError('Received invalid data format from server.');
            }
        } catch (err: any) {
            console.error('[Users] Fetch error:', err);
            setError('Failed to synchronize staff registry.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('[Users] COMPONENT MOUNTED - Version 1.2');
        fetchUsers();
    }, []);

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (form.password !== form.confirmPassword) {
            notify('error', 'Xəta', 'Şifrələr uyğun gəlmir.');
            return;
        }

        setSubmitting(true);
        try {
            console.log('[Users] Provisioning new account:', { fullName: form.fullName, email: form.email });
            const response = await authApi.adminCreateUser({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword
            });

            if (response.success) {
                console.log('[Users] Account provisioned successfully:', response.message);
                setIsAddingUser(false);
                setForm({ fullName: '', email: '', role: UserRole.USER, password: '', confirmPassword: '' });
                notify('success', 'Hesab Yaradıldı', 'Yeni əməkdaş hesabı uğurla yaradıldı.');
                // Refresh the list to show the new user
                await fetchUsers();
            } else {
                notify('error', 'Xəta', response.message || 'İstifadəçi yaradıla bilmədi.');
            }
        } catch (err: any) {
            console.error('[Users] Creation error:', err);
            const msg = err.response?.data?.message || 'Şəbəkə xətası baş verdi.';
            notify('error', 'Xəta', msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <header>
                    <h2 className="text-3xl font-bold tracking-tight">Əməkdaş Reyestri</h2>
                    <p className="text-zinc-500">Bazadan gələn canlı əməliyyat kataloqu.</p>
                </header>
                <button 
                    onClick={() => setIsAddingUser(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" /> Yeni Hesab Yarat
                </button>
            </div>

            <AnimatePresence>
                {isAddingUser && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <form onSubmit={handleAddUser} className="card p-8 bg-zinc-900 text-white mb-6 grid gap-6">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Tam Adı</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={form.fullName}
                                        onChange={e => setForm({...form, fullName: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-white/20"
                                        placeholder="Ad Soyad..." 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Korporativ Email</label>
                                    <input 
                                        required
                                        type="email" 
                                        value={form.email}
                                        onChange={e => setForm({...form, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-white/20" 
                                        placeholder="email@company.az"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Əməliyyat Rolu</label>
                                    <select 
                                        value={form.role}
                                        onChange={e => setForm({...form, role: e.target.value as UserRole})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-white/20 ring-zinc-800"
                                    >
                                        <option value={UserRole.USER} className="bg-zinc-900">Standart İstifadəçi</option>
                                        <option value={UserRole.SUPER_ADMIN} className="bg-zinc-900">Super Admin (Root)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Şifrə (Access Key)</label>
                                    <input 
                                        required
                                        type="password" 
                                        value={form.password}
                                        onChange={e => setForm({...form, password: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-white/20" 
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Şifrəni Təsdiqlə</label>
                                    <input 
                                        required
                                        type="password" 
                                        value={form.confirmPassword}
                                        onChange={e => setForm({...form, confirmPassword: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-white/20" 
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button type="button" onClick={() => setIsAddingUser(false)} className="px-6 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors" disabled={submitting}>Ləğv Et</button>
                                <button type="submit" className="bg-white text-zinc-900 px-8 py-2 rounded-xl font-bold hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" disabled={submitting}>
                                    {submitting ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Hazırlanır...</> : 'Hesabı Aktivləşdir'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {selectedUserForSummary && (
                <SummaryModal 
                    userId={selectedUserForSummary} 
                    onClose={() => setSelectedUserForSummary(null)} 
                />
            )}

            <div className="card overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200">
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Əməkdaş</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Təhlükəsizlik İcazəsi</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400 text-center">Status</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Yaranma Tarixi</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400 text-right">Ayarlar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <RefreshCcw className="w-5 h-5 animate-spin text-zinc-400" />
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Retrieving Staff Directory...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="text-red-500 font-mono text-[10px] uppercase tracking-widest">{error}</span>
                                        <button onClick={fetchUsers} className="text-[10px] underline uppercase tracking-widest text-zinc-400 hover:text-zinc-900 font-bold">Retry Connection</button>
                                    </div>
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((u) => (
                                <tr key={u.id} className="hover:bg-zinc-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-zinc-400 group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all">
                                                {u.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-zinc-900">{u.fullName}</p>
                                                <p className="text-[10px] text-zinc-400 font-mono tracking-tighter">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {u.role === UserRole.SUPER_ADMIN ? (
                                                <Shield className="w-3 h-3 text-red-600" />
                                            ) : (
                                                <UserIcon className="w-3 h-3 text-zinc-400" />
                                            )}
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${u.role === UserRole.SUPER_ADMIN ? 'text-red-600' : 'text-zinc-600'}`}>
                                                {u.role === UserRole.SUPER_ADMIN ? 'Kritik Giriş / ROOT' : 'Standart İcazə'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-[10px] font-bold">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                            AKTİV
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 font-mono text-[11px]">{u.createdAt?.split('T')[0]}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setSelectedUserForSummary(u.id)}
                                                className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                                                title="View Performance Summary"
                                            >
                                                <DollarSign className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                                            <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"><Key className="w-4 h-4" /></button>
                                            <button className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-zinc-400 italic">No organizational accounts found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

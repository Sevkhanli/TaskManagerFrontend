import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Mail, Shield, User as UserIcon, Trash2, Edit3, Key, MoreVertical, RefreshCcw, Gavel, AlertCircle, CheckCircle2, XCircle, X, ChevronRight } from 'lucide-react';
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

const UpdateRoleModal: React.FC<{ user: User, dbRoles: string[], onClose: () => void, onSuccess: () => void }> = ({ user, dbRoles, onClose, onSuccess }) => {
    const { notify } = useNotification();
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [submitting, setSubmitting] = useState(false);

    const handleUpdate = async () => {
        setSubmitting(true);
        try {
            const response = await authApi.updateUserRole(user.id, selectedRole);
            if (response.success) {
                notify('success', 'Uğurlu', response.message || 'Rol uğurla yeniləndi.');
                onSuccess();
                onClose();
            } else {
                notify('error', 'Xəta', response.message || 'Rol yenilənə bilmədi.');
            }
        } catch (err: any) {
            console.error('[UpdateRoleModal] Error:', err);
            const msg = err.response?.data?.message || 'Şəbəkə xətası baş verdi.';
            notify('error', 'Xəta', msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100"
            >
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-zinc-900">Rolu Dəyişdir</h3>
                        <p className="text-sm text-zinc-500">{user.fullName}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Yeni Rolu Seçin</label>
                        <select 
                            value={selectedRole}
                            onChange={e => setSelectedRole(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/5 transition-all text-zinc-900 font-bold"
                        >
                            {dbRoles.length > 0 ? (
                                dbRoles.map(role => (
                                    <option key={role} value={role}>
                                        {role === 'SUPER_ADMIN' || role === 'ROLE_ADMIN' || role === 'ADMIN' ? 'Super Admin (Root)' : 
                                         role === 'USER' || role === 'ROLE_USER' ? 'Standart İstifadəçi' : role}
                                    </option>
                                ))
                            ) : (
                                <>
                                    <option value="USER">Standart İstifadəçi</option>
                                    <option value="SUPER_ADMIN">Super Admin (Root)</option>
                                </>
                            )}
                        </select>
                    </div>

                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                        <p className="text-[10px] uppercase text-zinc-400 font-mono tracking-widest mb-1">XƏBƏRDARLIQ</p>
                        <p className="text-xs text-zinc-500 leading-relaxed">
                            Rolu dəyişdirdikdə istifadəçinin sistemdəki giriş hüquqları dərhal yenilənəcəkdir.
                        </p>
                    </div>
                </div>

                <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                    <button onClick={onClose} className="px-6 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors font-bold text-[11px] tracking-widest">LƏĞV ET</button>
                    <button 
                        onClick={handleUpdate} 
                        disabled={submitting}
                        className="bg-zinc-900 text-white px-8 py-2 rounded-xl font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2 text-[11px] tracking-widest"
                    >
                        {submitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'YADDA SAXLA'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

const CreateRoleModal: React.FC<{ onClose: () => void, onSuccess: () => void }> = ({ onClose, onSuccess }) => {
    const { notify } = useNotification();
    const [roleName, setRoleName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roleName.trim()) {
            notify('error', 'Xəta', 'Rol adı daxil edilməlidir.');
            return;
        }

        setSubmitting(true);
        try {
            console.log('[CreateRoleModal] Creating new system role archetype:', roleName);
            const response = await authApi.createRole(roleName);
            if (response.success) {
                notify('success', 'Uğurlu', response.message || 'Yeni sistem rolu yaradıldı.');
                onSuccess();
                onClose();
            } else {
                notify('error', 'Xəta', response.message || 'Rol yaradıla bilmədi.');
            }
        } catch (err: any) {
            console.error('[CreateRoleModal] Error:', err);
            const msg = err.response?.data?.message || 'Şəbəkə xətası baş verdi.';
            notify('error', 'Xəta', msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100"
            >
                <form onSubmit={handleCreate}>
                    <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900">Sistem Rolu Yarat</h3>
                            <p className="text-sm text-zinc-500 uppercase font-mono tracking-tighter">İNZİBATİ_PANEL</p>
                        </div>
                        <button type="button" onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400 hover:text-zinc-900">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6">
                        <div>
                            <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Rolun Adı</label>
                            <input 
                                required
                                type="text"
                                value={roleName}
                                onChange={e => setRoleName(e.target.value)}
                                placeholder="MƏS: ROLE_SUPERVISOR"
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-2 focus:ring-zinc-900/5 transition-all text-zinc-900 font-bold placeholder:font-normal"
                            />
                        </div>

                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                            <p className="text-[10px] uppercase text-amber-600 font-mono tracking-widest mb-1">KRİTİK MƏLUMAT</p>
                            <p className="text-xs text-amber-700 leading-relaxed italic">
                                Yeni yaradılan rol dərhal sistemin vəzifə kataloquna əlavə ediləcək və işçilərin təyin edilməsi üçün əlçatan olacaqdır.
                            </p>
                        </div>
                    </div>

                    <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 rounded-xl text-zinc-500 hover:bg-zinc-100 transition-colors font-bold text-[11px] tracking-widest">LƏĞV ET</button>
                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="bg-zinc-900 text-white px-8 py-2 rounded-xl font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center gap-2 text-[11px] tracking-widest"
                        >
                            {submitting ? <RefreshCcw className="w-4 h-4 animate-spin" /> : 'SİSTEMƏ ƏLAVA ET'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export const Users: React.FC = () => {
    const { notify } = useNotification();
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [isCreatingRole, setIsCreatingRole] = useState(false);
    const [selectedUserForSummary, setSelectedUserForSummary] = useState<string | null>(null);
    const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const [dbRoles, setDbRoles] = useState<string[]>([]);
    const [form, setForm] = useState({ 
        fullName: '', 
        email: '', 
        role: 'USER',
        password: '',
        confirmPassword: ''
    });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            console.log('[Users] Synchronizing registry...');
            
            // 1. First, MUST ensure we have the roles to correctly identify users
            let currentDbRoles: string[] = ['SUPER_ADMIN', 'ADMIN', 'ROLE_SATIS', 'ROLE_USER', 'USER'];
            try {
                const roles = await authApi.getRoles();
                if (roles && roles.length > 0) {
                    currentDbRoles = roles.map(r => {
                        if (typeof r === 'string') return r.toUpperCase().trim();
                        if (typeof r === 'object' && (r as any).name) return String((r as any).name).toUpperCase().trim();
                        if (typeof r === 'object' && (r as any).authority) return String((r as any).authority).toUpperCase().trim();
                        return String(r).toUpperCase().trim();
                    });
                    setDbRoles(currentDbRoles);
                    console.log('[Users] Synced roles from DB:', currentDbRoles);
                }
            } catch (roleErr) {
                console.error('Role sync failed, using fallbacks', roleErr);
                setDbRoles(currentDbRoles);
            }

            // 2. Fetch users
            const data = await authApi.getUsers();
            console.log('[Users] Data received from server:', data);
            
            if (Array.isArray(data)) {
                const mappedUsers: User[] = data.map((u: any) => {
                    const MASTER_ROLES = ['ROLE_SATIS', 'ROLE_ADMIN', 'SUPER_ADMIN', 'ADMIN', 'ROLE_USER', 'USER'];
                    const allKnownRoles = [...currentDbRoles, ...MASTER_ROLES];
                    
                    // Collect all potential roles found in the user object
                    const findAllRoles = (obj: any, depth = 0): string[] => {
                        if (!obj || depth > 4) return [];
                        let roles: string[] = [];
                        
                        if (typeof obj === 'string') {
                            const val = obj.toUpperCase().trim();
                            // Check for exact match or ROLE_ prefix match
                            if (allKnownRoles.includes(val) || 
                                allKnownRoles.includes(`ROLE_${val}`) || 
                                val.startsWith('ROLE_')) {
                                roles.push(val);
                            }
                        } else if (Array.isArray(obj)) {
                            obj.forEach(item => {
                                roles = [...roles, ...findAllRoles(item, depth + 1)];
                            });
                        } else if (typeof obj === 'object') {
                            Object.values(obj).forEach(val => {
                                roles = [...roles, ...findAllRoles(val, depth + 1)];
                            });
                        }
                        return roles;
                    };

                    const candidates = Array.from(new Set(findAllRoles(u)));
                    
                    // Priority selection: Admin > Satis > Others > User
                    const rawRole = candidates.find(r => r.includes('ADMIN')) || 
                                   candidates.find(r => r.includes('SATIS')) ||
                                   candidates.find(r => r.includes('MANAGER')) ||
                                   candidates.find(r => r !== 'USER' && r !== 'ROLE_USER') || 
                                   candidates[0] || 'USER';

                    const isKnownAdmin = rawRole.includes('ADMIN');
                    const isAdminRole = isKnownAdmin || (String(u.fullName || u.name || u.username).toLowerCase().includes('super admin'));
                    
                    // Email extraction
                    let email = u.email || u.username || u.userName || u.user_name || u.login || u.mail || '';
                    if (!email && u.id && String(u.id).includes('@')) email = String(u.id);
                    if (!email) email = 'No email provided';
                    
                    return {
                        id: String(u.id || Math.random().toString(36).substr(2, 9)),
                        fullName: u.fullName || u.name || u.fullNameAz || u.full_name || u.username || u.userName || 'Unknown User',
                        email: email,
                        role: isAdminRole ? UserRole.SUPER_ADMIN : rawRole,
                        createdAt: u.createdAt || new Date().toISOString()
                    };
                });
                setUsers(mappedUsers);
                setError(null);
            } else {
                setError('Received invalid data format from server.');
            }
        } catch (err: any) {
            console.error('[Users] Sync error:', err);
            setError('Staff registry synchronization failed.');
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
            console.log('[Users] Provisioning new account:', { fullName: form.fullName, email: form.email, role: form.role });
            
            // EXACT JSON structure as requested by the user
            const response = await authApi.adminCreateUser({
                fullName: form.fullName,
                email: form.email,
                password: form.password,
                confirmPassword: form.confirmPassword,
                roleName: form.role 
            });

            if (response.success) {
                console.log('[Users] Account provisioned successfully:', response.message);
                setIsAddingUser(false);
                setForm({ fullName: '', email: '', role: 'USER', password: '', confirmPassword: '' });
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

    const filteredUsers = React.useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        if (!query) return users;
        return users.filter(u => 
            u.fullName.toLowerCase().includes(query) || 
            u.email.toLowerCase().includes(query) ||
            u.role.toLowerCase().includes(query)
        );
    }, [users, searchQuery]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = React.useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <header>
                    <h2 className="text-3xl font-bold tracking-tight">Əməkdaş Reyestri</h2>
                    <p className="text-zinc-500">Bazadan gələn canlı əməliyyat kataloqu.</p>
                </header>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Əməkdaş axtar..."
                            className="bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900/5 transition-all text-zinc-600 w-64"
                        />
                    </div>
                    <button 
                        onClick={() => setIsCreatingRole(true)}
                        className="px-4 py-2 border border-zinc-200 rounded-xl text-zinc-600 font-bold text-[11px] tracking-widest hover:bg-zinc-50 transition-all flex items-center gap-2"
                    >
                        <Shield className="w-4 h-4" /> YENİ ROL
                    </button>
                    <button 
                        onClick={() => setIsAddingUser(true)}
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4" /> Yeni Hesab Yarat
                    </button>
                </div>
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
                                        placeholder="email@address.az"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Əməliyyat Rolu</label>
                                    <select 
                                        value={form.role}
                                        onChange={e => setForm({...form, role: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-white/20 ring-zinc-800"
                                    >
                                        {dbRoles.length > 0 ? (
                                            dbRoles.map(role => (
                                                <option key={role} value={role} className="bg-zinc-900 text-white">
                                                    {role === 'SUPER_ADMIN' || role === 'ROLE_ADMIN' || role === 'ADMIN' ? 'Super Admin (Root)' : 
                                                     role === 'USER' || role === 'ROLE_USER' ? 'Standart İstifadəçi' : role}
                                                </option>
                                            ))
                                        ) : (
                                            <>
                                                <option value="USER" className="bg-zinc-900 text-white">Standart İstifadəçi</option>
                                                <option value="SUPER_ADMIN" className="bg-zinc-900 text-white">Super Admin (Root)</option>
                                            </>
                                        )}
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

            {selectedUserForRole && (
                <UpdateRoleModal 
                    user={selectedUserForRole}
                    dbRoles={dbRoles}
                    onClose={() => setSelectedUserForRole(null)}
                    onSuccess={fetchUsers}
                />
            )}

            {isCreatingRole && (
                <CreateRoleModal 
                    onClose={() => setIsCreatingRole(null as any)}
                    onSuccess={fetchUsers}
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
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Rol</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400 text-right">Ayarlar</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <RefreshCcw className="w-5 h-5 animate-spin text-zinc-400" />
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">Retrieving Staff Directory...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : error ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <span className="text-red-500 font-mono text-[10px] uppercase tracking-widest">{error}</span>
                                        <button onClick={fetchUsers} className="text-[10px] underline uppercase tracking-widest text-zinc-400 hover:text-zinc-900 font-bold">Retry Connection</button>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedUsers.length > 0 ? (
                            paginatedUsers.map((u) => (
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
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                u.role === UserRole.SUPER_ADMIN ? 'text-red-600' : 
                                                u.role === 'USER' ? 'text-zinc-400' : 'text-zinc-600'
                                            }`}>
                                                {u.role === UserRole.SUPER_ADMIN ? 'Kritik Giriş / ROOT' : 
                                                 u.role === 'USER' ? 'Standart İcazə' : u.role}
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
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                            u.role === UserRole.SUPER_ADMIN ? 'bg-red-50 text-red-600 border border-red-100' :
                                            u.role === 'USER' ? 'bg-zinc-50 text-zinc-400 border border-zinc-100' :
                                            'bg-zinc-900 text-white'
                                        }`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 transition-opacity">
                                            <button 
                                                onClick={() => setSelectedUserForSummary(u.id)}
                                                className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                                                title="View Performance Summary"
                                            >
                                                <Gavel className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setSelectedUserForRole(u)}
                                                className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
                                                title="Edit User Permissions"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"><Key className="w-4 h-4" /></button>
                                            <button className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-zinc-400 italic">No organizational accounts found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm">
                    <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                        Göstərilir {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)} / {filteredUsers.length} əməkdaş
                    </p>
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`w-8 h-8 rounded-lg text-[10px] font-bold transition-all ${
                                    currentPage === i + 1 
                                    ? 'bg-zinc-900 text-white' 
                                    : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-900'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}

                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 text-zinc-400 hover:text-zinc-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

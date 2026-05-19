import React, { useState } from 'react';
import { 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    DollarSign, 
    FileText, 
    Filter, 
    MoreVertical, 
    Search,
    ShieldAlert,
    XCircle,
    RefreshCcw,
    X,
    MessageSquare,
    ChevronDown,
    Check
} from 'lucide-react';
import { Penalty, PenaltyStatus, PenaltyType, UserRole, User } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { penaltyApi, authApi } from '../api';
import { motion, AnimatePresence } from 'motion/react';
import { useNotification } from '../contexts/NotificationContext';

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel: string;
    loading?: boolean;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmLabel, loading }) => (
    <AnimatePresence>
        {isOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100"
                >
                    <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                        <h3 className="text-lg font-bold text-zinc-900">Ödənişi Təsdiqlə</h3>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-zinc-900 text-white rounded-full flex items-center justify-center mx-auto mb-6">
                            <DollarSign className="w-8 h-8" />
                        </div>
                        <p className="text-zinc-600 mb-2">Bu cəriməni ödənildi olaraq qeyd etmək istədiyinizə əminsiniz? Bu, istifadəçinin maliyyə balansını yeniləyəcək.</p>
                        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">Əməliyyat inzibati icazə tələb edir</p>
                    </div>
                    <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl font-bold text-xs hover:bg-white transition-colors"
                        >
                            LƏĞV ET
                        </button>
                        <button 
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-3 px-4 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <RefreshCcw className="w-3 h-3 animate-spin" />}
                            TƏSDİQLƏ
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const WaiveModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    loading?: boolean;
}> = ({ isOpen, onClose, onConfirm, loading }) => {
    const [reason, setReason] = useState('');

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-xs">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-100"
                    >
                        <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                            <h3 className="text-lg font-bold text-zinc-900">Cəriməni Bağışla (Waive)</h3>
                            <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Əfv Qərarı</p>
                                    <p className="text-xs text-amber-600">Bu əməliyyat maliyyə öhdəliyini istifadəçinin hesabından qalıcı olaraq siləcək.</p>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Bağışlama Səbəbi</label>
                                <div className="relative">
                                    <MessageSquare className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                                    <textarea 
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="məs., Tibbi arayış təqdim edilib, texniki xəta..."
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm min-h-[100px] focus:outline-hidden focus:ring-2 focus:ring-zinc-900/5 transition-all"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex gap-3">
                            <button 
                                onClick={onClose} 
                                className="flex-1 px-4 py-2.5 border border-zinc-200 text-zinc-600 rounded-xl font-bold text-xs hover:bg-white transition-colors"
                            >
                                LƏĞV ET
                            </button>
                            <button 
                                onClick={() => onConfirm(reason)}
                                disabled={loading || !reason.trim()}
                                className="flex-3 px-4 py-2.5 bg-zinc-900 text-white rounded-xl font-bold text-xs hover:bg-zinc-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading && <RefreshCcw className="w-3 h-3 animate-spin" />}
                                TƏSDİQLƏ
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const Penalties: React.FC = () => {
    const { user } = useAuth();
    const { notify } = useNotification();
    const [penalties, setPenalties] = useState<Penalty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [dbRoles, setDbRoles] = useState<string[]>([]);
    const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
    const [roleSearchQuery, setRoleSearchQuery] = useState('');
    const isAdmin = user?.role === UserRole.SUPER_ADMIN;
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [bulkLoading, setBulkLoading] = useState(false);

    // Modal states
    const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [waiveModal, setWaiveModal] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

    const fetchPenalties = async () => {
        setLoading(true);
        try {
            let data: Penalty[] = [];
            if (isAdmin) {
                if (selectedRole) {
                    data = await penaltyApi.getPenaltiesByRole(selectedRole);
                } else {
                    data = await penaltyApi.getAllPenalties();
                }
                
                // Also fetch roles for the filter if not already fetched
                if (dbRoles.length === 0) {
                    const roles = await authApi.getRoles();
                    if (roles && roles.length > 0) {
                        setDbRoles(roles.map(r => r.toUpperCase()));
                    }
                }
            } else {
                data = await penaltyApi.getMyPenalties();
            }
            setPenalties(data);
            if (data && data.length > 0) {
                console.log('[Penalties] Raw penalty from server:', JSON.stringify(data[0], null, 2));
            }
            setError(null);
        } catch (err) {
            console.error('[Penalties] Fetch error:', err);
            setError('Failed to retrieve penalty records.');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkWaive = async () => {
        if (!selectedRole) return;
        const reason = prompt(`"${selectedRole}" rolu üzrə bütün cərimələri ləğv etmək üçün səbəb qeyd edin:`);
        if (!reason) return;

        setBulkLoading(true);
        try {
            await penaltyApi.waiveAllRole(selectedRole, reason);
            await fetchPenalties();
            window.dispatchEvent(new CustomEvent('penalty-update'));
            notify('success', 'Toplu Ləğv Etmə', 'Roldakı bütün cərimələr uğurla ləğv edildi.');
        } catch (err) {
            console.error('[Penalties] Bulk waive error:', err);
            notify('error', 'Xəta', 'Toplu ləğv etmə uğursuz oldu.');
        } finally {
            setBulkLoading(false);
        }
    };

    const handleMarkPaid = async (penaltyId: number) => {
        setActionLoading(penaltyId);
        try {
            await penaltyApi.markAsPaid(penaltyId);
            await fetchPenalties();
            window.dispatchEvent(new CustomEvent('penalty-update'));
            setConfirmModal({ isOpen: false, id: null });
            notify('success', 'Ödəniş Qəbul Edildi', 'Cərimə ödənilmiş kimi qeyd edildi.');
        } catch (err) {
            console.error('[Penalties] Mark paid error:', err);
            notify('error', 'Xəta', 'Ödəniş qeyd edilə bilmədi.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleWaive = async (penaltyId: number, reason: string) => {
        setActionLoading(penaltyId);
        try {
            await penaltyApi.waive(penaltyId, reason || 'Admin tərəfindən ləğv edildi');
            await fetchPenalties();
            window.dispatchEvent(new CustomEvent('penalty-update'));
            setWaiveModal({ isOpen: false, id: null });
            notify('success', 'Cərimə Ləğv Edildi', 'Cərimə uğurla ləğv edildi.');
        } catch (err) {
            console.error('[Penalties] Waive error:', err);
            notify('error', 'Xəta', 'Cərimə ləğv edilə bilmədi.');
        } finally {
            setActionLoading(null);
        }
    };

    React.useEffect(() => {
        if (user) {
            fetchPenalties();
        }
    }, [user, isAdmin, selectedRole]);

    console.log('[Penalties] Rendering. User:', user?.email, 'isAdmin:', isAdmin);

    if (!user) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
                <div className="animate-pulse">Cərimələr Yüklənir...</div>
            </div>
        );
    }

    // Filter Logic
    const filteredPenalties = penalties.filter(p => 
        p.user?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.task?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = React.useMemo(() => {
        const unpaidAmount = filteredPenalties
            .filter(p => p && (p.status === PenaltyStatus.PENDING || String(p.status).toUpperCase() === 'PENDING'))
            .reduce((acc, p) => acc + (p.amount || 0), 0);
        
        const paidCount = filteredPenalties
            .filter(p => p && (p.status === PenaltyStatus.PAID || String(p.status).toUpperCase() === 'PAID'))
            .length;

        return [
            { label: 'Cəmi Ödənilməmiş', value: `${unpaidAmount.toFixed(2)} AZN`, icon: DollarSign, color: 'text-zinc-900' },
            { label: 'Ödənilmiş', value: paidCount.toString(), icon: CheckCircle2, color: 'text-green-600' }
        ];
    }, [filteredPenalties]);

    const filteredRoles = React.useMemo(() => {
        const query = roleSearchQuery.toLowerCase().trim();
        const roles = Array.from(new Set(['SUPER_ADMIN', 'ADMIN', 'ROLE_SATIS', 'ROLE_USER', ...dbRoles])).filter(Boolean).sort();
        if (!query) return roles;
        return roles.filter(role => role.toLowerCase().includes(query));
    }, [dbRoles, roleSearchQuery]);

    const getUserDisplayName = (p: any) => {
        if (!p) return 'Naməlum';
        const u = p.user || {};
        return u.fullName || u.name || p.userName || p.fullName || p.staffName || u.username || 'Əməkdaş';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <header>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isAdmin ? 'Maliyyə Cərimələri' : 'Cərimə Reyestrim'}
                    </h2>
                    <p className="text-zinc-500">
                        {isAdmin 
                            ? 'Sistem pozuntularının və maliyyə cərimələrinin ümumi görünüşü.' 
                            : 'SLA pozuntuları üçün hesabınıza tətbiq edilən cərimələri nəzərdən keçirin.'}
                    </p>
                </header>
                <div className="flex items-center gap-3">
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                             {/* Searchable Role Dropdown */}
                             <div className="relative">
                                <button 
                                    onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm font-bold text-zinc-900 shadow-xs hover:border-zinc-300 transition-all min-w-[160px]"
                                >
                                    <span className="truncate">{selectedRole || 'BÜTÜN ROLLAR'}</span>
                                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <AnimatePresence>
                                    {isRoleMenuOpen && (
                                        <>
                                            <div 
                                                className="fixed inset-0 z-40" 
                                                onClick={() => setIsRoleMenuOpen(false)}
                                            />
                                            <motion.div 
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute right-0 top-full mt-2 w-64 bg-white border border-zinc-100 rounded-2xl shadow-2xl z-50 overflow-hidden"
                                            >
                                                <div className="p-3 border-b border-zinc-100">
                                                    <div className="relative">
                                                        <Search className="w-3 h-3 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                        <input 
                                                            type="text"
                                                            value={roleSearchQuery}
                                                            onChange={(e) => setRoleSearchQuery(e.target.value)}
                                                            placeholder="Rol axtar..."
                                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-zinc-900/5"
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>
                                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                                    <button 
                                                        onClick={() => {
                                                            setSelectedRole('');
                                                            setIsRoleMenuOpen(false);
                                                            setRoleSearchQuery('');
                                                        }}
                                                        className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors border-b border-zinc-50 flex items-center justify-between ${!selectedRole ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'}`}
                                                    >
                                                        BÜTÜN ROLLAR
                                                        {!selectedRole && <Check className="w-3 h-3" />}
                                                    </button>
                                                    {filteredRoles.filter(r => r !== '').map(role => (
                                                        <button 
                                                            key={role}
                                                            onClick={() => {
                                                                setSelectedRole(role);
                                                                setIsRoleMenuOpen(false);
                                                                setRoleSearchQuery('');
                                                            }}
                                                            className={`w-full text-left px-4 py-3 text-xs font-bold transition-colors border-b border-zinc-50 last:border-0 flex items-center justify-between ${selectedRole === role ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-50'}`}
                                                        >
                                                            {role}
                                                            {selectedRole === role && <Check className="w-3 h-3" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                             </div>

                            {selectedRole && (
                                <button 
                                    onClick={handleBulkWaive}
                                    disabled={bulkLoading || loading}
                                    className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-amber-500/10 whitespace-nowrap"
                                >
                                    {bulkLoading ? <RefreshCcw className="w-3 h-3 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                                    HAMSINI LƏĞV ET ({selectedRole})
                                </button>
                            )}
                        </div>
                    )}
                    <button 
                        onClick={fetchPenalties}
                        disabled={loading}
                        className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all group disabled:opacity-50"
                        title="Yenilə"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="User və ya tapşırıq üzrə axtar..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900/5 transition-all w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="card p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{stat.label}</p>
                            <p className={`text-xl font-bold`}>{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-4">
                {loading ? (
                    <div className="p-12 card text-center flex flex-col items-center gap-4">
                        <RefreshCcw className="w-8 h-8 animate-spin text-zinc-300" />
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-[0.2em]">Synchronizing financial records...</span>
                    </div>
                ) : error ? (
                    <div className="p-12 card text-center flex flex-col items-center gap-4 bg-red-50/30 border-red-100">
                        <AlertCircle className="w-8 h-8 text-red-300" />
                        <span className="text-[10px] font-mono text-red-400 uppercase tracking-[0.2em]">{error}</span>
                        <button onClick={fetchPenalties} className="btn-secondary text-[10px] py-1.5 px-4">Retry Sync</button>
                    </div>
                ) : filteredPenalties.length > 0 ? (
                    filteredPenalties.map((penalty) => (
                        <div key={penalty.id} className="card group overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-stretch">
                                {/* Status Indicator Bar */}
                                <div className={`w-1.5 md:w-2 shrink-0 ${
                                    penalty.status === PenaltyStatus.PAID ? 'bg-zinc-900' :
                                    penalty.status === PenaltyStatus.PENDING ? 'bg-red-500' : 'bg-zinc-300'
                                }`} />

                                <div className="flex-1 p-6 flex flex-col md:flex-row md:items-center gap-6 text-zinc-900">
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-500 uppercase tracking-tighter">
                                                {penalty.penaltyType?.replace('_', ' ') || 'SİSTEM_POZUNTUSU'}
                                            </span>
                                            {penalty.daysOverdue !== undefined && penalty.daysOverdue > 0 && (
                                                <span className="text-[10px] font-bold text-red-600 border border-red-100 px-2 py-0.5 rounded">
                                                    {penalty.daysOverdue} GÜN GECİKMƏ
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-lg text-zinc-900 group-hover:text-zinc-600 transition-colors">
                                            {isAdmin ? `${getUserDisplayName(penalty)} / ` : ''}
                                            <span className="text-zinc-400 font-medium">
                                                {penalty.task?.title || (penalty as any).taskTitle || (penalty as any).taskName || 'SLA Pozuntusu'}
                                            </span>
                                        </h4>
                                        <p className="text-sm text-zinc-500 flex items-center gap-2">
                                            <FileText className="w-3 h-3" /> {penalty.description || 'SLA Pozuntu Bildirişi'}
                                        </p>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6 md:min-w-[140px]">
                                        <p className="text-2xl font-mono font-black tracking-tighter">
                                            {(penalty.amount || 0).toFixed(2)} <span className="text-xs font-bold text-zinc-400">{penalty.currency || 'AZN'}</span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {penalty.status === PenaltyStatus.PENDING ? (
                                                <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-amber-500" /> ÖDƏNİŞ GÖZLƏNİLİR
                                                </span>
                                            ) : penalty.status === PenaltyStatus.PAID ? (
                                                <span className="text-[10px] font-bold text-zinc-900 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> ÖDƏNİLDİ
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> LƏĞV EDİLDİ
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0 shrink-0">
                                        {isAdmin ? (
                                            <div className="flex gap-2 w-full md:w-auto">
                                                {penalty.status === PenaltyStatus.PENDING && (
                                                    <>
                                                        <button 
                                                            onClick={() => setConfirmModal({ isOpen: true, id: penalty.id })}
                                                            disabled={actionLoading === penalty.id}
                                                            className="flex-1 md:flex-none px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors disabled:opacity-50"
                                                        >
                                                            {actionLoading === penalty.id ? 'İşlənilir...' : 'Ödənişi Qeyd Et'}
                                                        </button>
                                                        <button 
                                                            onClick={() => setWaiveModal({ isOpen: true, id: penalty.id })}
                                                            disabled={actionLoading === penalty.id}
                                                            className="flex-1 md:flex-none px-4 py-2 border border-zinc-200 text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-50 transition-colors disabled:opacity-50"
                                                        >
                                                            Ləğv Et
                                                        </button>
                                                    </>
                                                )}
                                                <button className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-50">
                                                    <MoreVertical className="w-4 h-4 text-zinc-400" />
                                                </button>
                                            </div>
                                        ) : (
                                            null
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 card text-center text-zinc-400 italic">
                        Hesabınızda qeydə alınmış cərimə yoxdur. Belə davam edin!
                    </div>
                )}
            </div>

            <ConfirmationModal 
                isOpen={confirmModal.isOpen} 
                onClose={() => setConfirmModal({ isOpen: false, id: null })}
                onConfirm={() => confirmModal.id && handleMarkPaid(confirmModal.id)}
                loading={actionLoading !== null}
                title="Ödəniş Təsdiqi"
                message="Bu cəriməni ödənildi olaraq qeyd etmək istəyirsiniz?"
                confirmLabel="TƏSDİQLƏ"
            />

            <WaiveModal 
                isOpen={waiveModal.isOpen}
                onClose={() => setWaiveModal({ isOpen: false, id: null })}
                onConfirm={(reason) => waiveModal.id && handleWaive(waiveModal.id, reason)}
                loading={actionLoading !== null}
            />
        </div>
    );
};

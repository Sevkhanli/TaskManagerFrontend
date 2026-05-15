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
    RefreshCcw
} from 'lucide-react';
import { Penalty, PenaltyStatus, PenaltyType, UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { penaltyApi } from '../api';

export const Penalties: React.FC = () => {
    const { user } = useAuth();
    const [penalties, setPenalties] = useState<Penalty[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const isAdmin = user?.role === UserRole.SUPER_ADMIN;

    const fetchPenalties = async () => {
        setLoading(true);
        try {
            const data = isAdmin 
                ? await penaltyApi.getAllPenalties() 
                : await penaltyApi.getMyPenalties();
            setPenalties(data);
            setError(null);
        } catch (err) {
            console.error('[Penalties] Fetch error:', err);
            setError('Failed to retrieve penalty records.');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (user) {
            fetchPenalties();
        }
    }, [user, isAdmin]);

    console.log('[Penalties] Rendering. User:', user?.email, 'isAdmin:', isAdmin);

    if (!user) {
        return (
            <div className="h-64 flex flex-col items-center justify-center gap-4 text-zinc-400 font-mono text-[10px] uppercase tracking-widest">
                <div className="animate-pulse">Retrieving Penalties...</div>
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
        return [
            { label: 'Total Unpaid', value: `${filteredPenalties.filter(p => p && p.status === PenaltyStatus.PENDING).reduce((acc, p) => acc + (p.amount || 0), 0).toFixed(2)} AZN`, icon: DollarSign, color: 'text-zinc-900' },
            { label: 'Active Disputes', value: filteredPenalties.filter(p => p && p.evidenceRequired && !p.evidenceProvided).length.toString(), icon: AlertCircle, color: 'text-amber-600' },
            { label: 'Settled', value: filteredPenalties.filter(p => p && p.status === PenaltyStatus.PAID).length.toString(), icon: CheckCircle2, color: 'text-green-600' }
        ];
    }, [filteredPenalties]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <header>
                    <h2 className="text-3xl font-bold tracking-tight">
                        {isAdmin ? 'Financial Penalties' : 'My Penalty Ledger'}
                    </h2>
                    <p className="text-zinc-500">
                        {isAdmin 
                            ? 'Global overview of system violations and financial penalties.' 
                            : 'Review penalties issued to your account for SLA violations.'}
                    </p>
                </header>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchPenalties}
                        disabled={loading}
                        className="p-2.5 bg-white border border-zinc-200 rounded-xl text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-all group disabled:opacity-50"
                        title="Refresh Registry"
                    >
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Filter by user or task..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-zinc-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-zinc-900/5 transition-all w-full md:w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                {penalty.penaltyType?.replace('_', ' ') || 'SYSTEM_VIOLATION'}
                                            </span>
                                            {penalty.daysOverdue !== undefined && penalty.daysOverdue > 0 && (
                                                <span className="text-[10px] font-bold text-red-600 border border-red-100 px-2 py-0.5 rounded">
                                                    {penalty.daysOverdue} DAYS OVERDUE
                                                </span>
                                            )}
                                        </div>
                                        <h4 className="font-bold text-lg text-zinc-900 group-hover:text-zinc-600 transition-colors">
                                            {isAdmin ? `${penalty.user?.fullName || 'User'} / ` : ''}
                                            <span className="text-zinc-400 font-medium">
                                                {penalty.task?.title || (penalty as any).taskTitle || (penalty as any).taskName || 'SLA Violation Task'}
                                            </span>
                                        </h4>
                                        <p className="text-sm text-zinc-500 flex items-center gap-2">
                                            <FileText className="w-3 h-3" /> {penalty.description || 'SLA Violation Alert'}
                                        </p>
                                    </div>

                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6 md:min-w-[140px]">
                                        <p className="text-2xl font-mono font-black tracking-tighter">
                                            {(penalty.amount || 0).toFixed(2)} <span className="text-xs font-bold text-zinc-400">{penalty.currency || 'AZN'}</span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            {penalty.status === PenaltyStatus.PENDING ? (
                                                <span className="text-[10px] font-bold text-red-600 flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-amber-500" /> PENDING SETTLEMENT
                                                </span>
                                            ) : penalty.status === PenaltyStatus.PAID ? (
                                                <span className="text-[10px] font-bold text-zinc-900 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> SETTLED
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-zinc-400 flex items-center gap-1">
                                                    <XCircle className="w-3 h-3" /> DISMISSED
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0 shrink-0">
                                        {isAdmin ? (
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button className="flex-1 md:flex-none px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors">Manage Dispute</button>
                                                <button className="p-2 border border-zinc-200 rounded-lg hover:bg-zinc-50">
                                                    <MoreVertical className="w-4 h-4 text-zinc-400" />
                                                </button>
                                            </div>
                                        ) : (
                                            penalty.evidenceRequired && !penalty.evidenceProvided && (
                                                <button className="w-full md:w-auto px-4 py-2 bg-zinc-900 text-white rounded-lg text-xs font-bold hover:bg-zinc-800 transition-colors flex items-center gap-2">
                                                    <ShieldAlert className="w-4 h-4" /> PROVIDE EVIDENCE
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 card text-center text-zinc-400 italic">
                        No penalties recorded for your account. Keep up the good work!
                    </div>
                )}
            </div>
        </div>
    );
};

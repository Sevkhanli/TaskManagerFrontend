import React from 'react';
import { 
    Activity, 
    CheckCircle2, 
    Clock, 
    ArrowUpRight, 
    Users as UsersIcon, 
    AlertTriangle,
    BarChart3,
    Zap,
    TrendingUp,
    BellRing
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';

export const Dashboard: React.FC = () => {
    const stats = [
        { label: 'System Throughput', value: '84.2%', trend: '+4.5%', icon: Zap, color: 'text-yellow-500' },
        { label: 'Active Task Load', value: '1,248', trend: '+124', icon: Activity, color: 'text-blue-500' },
        { label: 'SLA Compliance', value: '98.1%', trend: '-0.2%', icon: CheckCircle2, color: 'text-green-500' },
        { label: 'Pending Penalty Value', value: '3.4k', trend: '+12%', icon: AlertTriangle, color: 'text-red-500' },
    ];

    const recentLogs = [
        { id: 1, type: 'TASK_COMPLETED', user: 'Farid A.', detail: 'API Authentication Layer', time: '12m ago' },
        { id: 2, type: 'PENALTY_ISSUED', user: 'System', detail: 'Deadline Missed: Task #442', time: '44m ago' },
        { id: 3, type: 'USER_REGISTERED', user: 'Admin', detail: 'New Operative: Gunel Hasanova', time: '2h ago' },
    ];

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <header>
                    <div className="flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        Operational Status / Real-time
                    </div>
                    <h2 className="text-4xl font-black tracking-tighter text-zinc-900">Mission Intelligence</h2>
                    <p className="text-sm text-zinc-500 max-w-lg mt-2">Executive overview of task distribution, penalty ledgers, and organizational velocity.</p>
                </header>
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 bg-zinc-100 px-4 py-2 rounded-xl">
                    <Clock className="w-3 h-3 text-zinc-500" />
                    System Time: {format(new Date(), 'HH:mm:ss')} GMT
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="card p-6 group hover:bg-zinc-900 transition-all duration-300"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/10 transition-colors">
                                <stat.icon className={`w-5 h-5 ${stat.color} group-hover:text-white`} />
                            </div>
                            <span className={`text-[10px] font-black px-2 py-1 rounded bg-zinc-50 text-zinc-500 group-hover:bg-white/10 group-hover:text-white transition-colors`}>{stat.trend}</span>
                        </div>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1 group-hover:text-zinc-500">{stat.label}</p>
                        <p className="text-3xl font-black tracking-tighter text-zinc-900 group-hover:text-white">{stat.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Large Analytical Chart Placeholder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-zinc-400" />
                            Performance Analytics
                        </h3>
                        <div className="flex bg-zinc-100 p-1 rounded-lg">
                            <button className="px-3 py-1 text-[10px] font-bold rounded-md bg-white shadow-sm">24H</button>
                            <button className="px-3 py-1 text-[10px] font-bold text-zinc-400 rounded-md">7D</button>
                            <button className="px-3 py-1 text-[10px] font-bold text-zinc-400 rounded-md">30D</button>
                        </div>
                    </div>
                    
                    <div className="card h-80 bg-zinc-50 border-dashed border-2 border-zinc-200 flex flex-col items-center justify-center p-8 text-center bg-linear-to-br from-white to-zinc-50">
                        <div className="w-16 h-16 rounded-full bg-white border border-zinc-100 shadow-sm flex items-center justify-center mb-4">
                            <BarChart3 className="w-8 h-8 text-zinc-200" />
                        </div>
                        <p className="font-bold text-zinc-900">Neural Traffic Visualization</p>
                        <p className="text-xs text-zinc-400 max-w-xs mt-1 italic">Historical task completion vs. penalty issuance is being synchronized from the primary database cluster.</p>
                        <div className="flex gap-2 mt-8">
                            {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.5].map((h, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h * 100}%` }}
                                    className="w-4 bg-zinc-200 rounded-t-sm"
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vertical Feed Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <BellRing className="w-5 h-5 text-zinc-900" />
                            Real-time Feed
                        </h3>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Global Log</span>
                    </div>

                    <div className="space-y-4">
                        {recentLogs.map((log) => (
                            <div key={log.id} className="card p-4 hover:border-zinc-300 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                                        log.type === 'TASK_COMPLETED' ? 'bg-green-50 text-green-700 border-green-100' :
                                        log.type === 'PENALTY_ISSUED' ? 'bg-red-50 text-red-700 border-red-100' :
                                        'bg-zinc-50 text-zinc-700 border-zinc-200'
                                    }`}>
                                        {log.type}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-mono tracking-tighter">{log.time}</span>
                                </div>
                                <p className="text-sm font-bold text-zinc-900">{log.detail}</p>
                                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                                    <UsersIcon className="w-3 h-3 opacity-50" />
                                    Initiated by {log.user}
                                </p>
                            </div>
                        ))}
                        <button className="w-full py-3 text-xs font-bold text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-xl transition-all border border-dashed border-zinc-200">
                            View Full System Audit
                        </button>
                    </div>

                    <div className="card p-6 bg-zinc-900 text-white relative overflow-hidden group border-none">
                        <div className="absolute inset-0 bg-linear-to-br from-zinc-700 to-zinc-900 opacity-50"></div>
                        <div className="relative z-10">
                            <h4 className="font-bold mb-2">Premium Support</h4>
                            <p className="text-xs text-zinc-400 mb-6">Need assistance with your task management logic? Connect with the IT BRAINS support team.</p>
                            <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:gap-4 transition-all">
                                Open Secure Comms <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

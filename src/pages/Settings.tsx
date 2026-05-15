import React, { useState, useEffect } from 'react';
import { ShieldCheck, Database, Zap, Lock, BellRing, Save, History, RefreshCcw } from 'lucide-react';
import { penaltyApi } from '../api';
import { PenaltyConfig } from '../types';

export const Settings: React.FC = () => {
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [config, setConfig] = useState<Partial<PenaltyConfig>>({
        deadlineMissedAmount: 20,
        statusNotCompletedAmount: 50,
        falseCompletionAmount: 200,
        currency: 'AZN'
    });
    const [lastUpdatedInfo, setLastUpdatedInfo] = useState<string>('');

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const data = await penaltyApi.getConfig();
            if (data) {
                setConfig({
                    deadlineMissedAmount: data.deadlineMissedAmount,
                    statusNotCompletedAmount: data.statusNotCompletedAmount,
                    falseCompletionAmount: data.falseCompletionAmount,
                    currency: data.currency
                });
                
                const date = new Date(data.updatedAt).toLocaleString();
                setLastUpdatedInfo(`Last modified by ${data.updatedByName || 'Admin'} on ${date}`);
            }
        } catch (err) {
            console.error('Failed to fetch penalty config:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaveLoading(true);
        try {
            await penaltyApi.saveConfig(config);
            setSaved(true);
            fetchConfig(); // Refresh data
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error('Failed to save penalty config:', err);
            alert('Failed to save configuration. Please check your permissions.');
        } finally {
            setSaveLoading(false);
        }
    };

    const updateConfigField = (field: keyof PenaltyConfig, value: string) => {
        const numValue = parseFloat(value) || 0;
        setConfig(prev => ({ ...prev, [field]: numValue }));
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <RefreshCcw className="w-8 h-8 animate-spin text-zinc-300" />
                <p className="text-zinc-400 font-mono text-sm tracking-widest uppercase">Initializing Core Config...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl space-y-12 pb-12">
            <header>
                <h2 className="text-3xl font-bold tracking-tight">System Core Configuration</h2>
                <p className="text-zinc-500 italic">Modify global parameters and operational thresholds for the Academy.</p>
            </header>
            
            <div className="grid lg:grid-cols-2 gap-8">
                {/* Penalty Logic Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <ShieldCheck className="w-5 h-5 text-zinc-900" />
                        <h3 className="font-bold text-lg">Penalty Algorithms</h3>
                    </div>
                    
                    <div className="card p-8 bg-zinc-900 text-white border-none shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                        
                        <div className="space-y-8 relative z-10">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">Deadline Breach / Per Diem</label>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="number" 
                                        value={config.deadlineMissedAmount} 
                                        onChange={(e) => updateConfigField('deadlineMissedAmount', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 font-mono text-xl" 
                                    />
                                    <span className="text-zinc-500 font-bold">{config.currency}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">Status Misalignment / Flat Fee</label>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="number" 
                                        value={config.statusNotCompletedAmount} 
                                        onChange={(e) => updateConfigField('statusNotCompletedAmount', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 font-mono text-xl" 
                                    />
                                    <span className="text-zinc-500 font-bold">{config.currency}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">Integrity Violation / Max Cap</label>
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="number" 
                                        value={config.falseCompletionAmount} 
                                        onChange={(e) => updateConfigField('falseCompletionAmount', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 font-mono text-xl" 
                                    />
                                    <span className="text-zinc-500 font-bold">{config.currency}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleSave}
                                disabled={saveLoading}
                                className="w-full py-4 bg-white text-zinc-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saveLoading ? (
                                    <RefreshCcw className="w-4 h-4 animate-spin" />
                                ) : saved ? (
                                    <ShieldCheck className="w-4 h-4" />
                                ) : (
                                    <Save className="w-4 h-4" />
                                )}
                                {saveLoading ? 'Syncing...' : saved ? 'System Synchronized' : 'Apply Global Changes'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Infrastructure Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Database className="w-5 h-5 text-zinc-400" />
                        <h3 className="font-bold text-lg text-zinc-600">Operational Integrity</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="card p-6 flex items-center justify-between hover:border-zinc-300 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-zinc-50 rounded-xl group-hover:bg-zinc-100 transition-colors">
                                    <Zap className="w-5 h-5 text-zinc-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Automated Reconciliation</p>
                                    <p className="text-xs text-zinc-400">Run nightly checks for overdue tasks.</p>
                                </div>
                            </div>
                            <div className="w-10 h-5 bg-zinc-900 rounded-full relative">
                                <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                            </div>
                        </div>

                        <div className="card p-6 flex items-center justify-between hover:border-zinc-300 transition-colors cursor-pointer group text-zinc-400 italic">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-zinc-50 rounded-xl">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Strict Identity Enforcement</p>
                                    <p className="text-xs">Bio-metrics required for root access.</p>
                                </div>
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">Enterprise Only</span>
                        </div>

                        <div className="card p-6 flex items-center justify-between hover:border-zinc-300 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-zinc-50 rounded-xl group-hover:bg-zinc-100 transition-colors">
                                    <BellRing className="w-5 h-5 text-zinc-900 animate-pulse" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm">Immediate Alert Vector</p>
                                    <p className="text-xs text-zinc-400">Push notifications for penalty issuance.</p>
                                </div>
                            </div>
                            <div className="w-10 h-5 bg-zinc-200 rounded-full relative">
                                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 flex flex-col items-center justify-center text-center">
                        <History className="w-8 h-8 text-zinc-300 mb-4" />
                        <p className="text-sm font-medium text-zinc-500">Configuration History</p>
                        <p className="text-xs text-zinc-400 mt-1 max-w-[200px]">{lastUpdatedInfo || 'No recent modifications recorded.'}</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

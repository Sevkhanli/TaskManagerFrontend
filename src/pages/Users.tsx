import React, { useState, useEffect } from 'react';
import { UserPlus, Search, Mail, Shield, User as UserIcon, Trash2, Edit3, Key, MoreVertical, RefreshCcw } from 'lucide-react';
import { User, UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { authApi } from '../api';

export const Users: React.FC = () => {
    const [isAddingUser, setIsAddingUser] = useState(false);
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
                const mappedUsers: User[] = data.map((u: any) => ({
                    id: String(u.id),
                    fullName: u.fullName || u.name || 'Unknown User',
                    email: u.email || 'No email provided',
                    role: (String(u.fullName).toLowerCase().includes('admin') || String(u.role).toLowerCase().includes('admin')) 
                        ? UserRole.SUPER_ADMIN : UserRole.USER,
                    createdAt: u.createdAt || new Date().toISOString()
                }));
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
            alert('Passwords do not match.');
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
                // Refresh the list to show the new user
                await fetchUsers();
            } else {
                alert(response.message || 'Failed to create user.');
            }
        } catch (err: any) {
            console.error('[Users] Creation error:', err);
            const msg = err.response?.data?.message || 'Connection error during provisioning.';
            alert(msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <header>
                    <h2 className="text-3xl font-bold tracking-tight">Staff Registry</h2>
                    <p className="text-zinc-500">Live operational directory synchronized with backend database.</p>
                </header>
                <button 
                    onClick={() => setIsAddingUser(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <UserPlus className="w-4 h-4" /> Provision New Account
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
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Legal Full Name</label>
                                    <input 
                                        required
                                        type="text" 
                                        value={form.fullName}
                                        onChange={e => setForm({...form, fullName: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-white/20"
                                        placeholder="Enter legal name..." 
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Corporate Email Address</label>
                                    <input 
                                        required
                                        type="email" 
                                        value={form.email}
                                        onChange={e => setForm({...form, email: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-white/20" 
                                        placeholder="email@company.pro"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Operational Role</label>
                                    <select 
                                        value={form.role}
                                        onChange={e => setForm({...form, role: e.target.value as UserRole})}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-white/20 ring-zinc-800"
                                    >
                                        <option value={UserRole.USER} className="bg-zinc-900">Standard Operative</option>
                                        <option value={UserRole.SUPER_ADMIN} className="bg-zinc-900">Super Admin (Root)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Access Key (Password)</label>
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
                                    <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-2">Confirm Access Key</label>
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
                                <button type="button" onClick={() => setIsAddingUser(false)} className="px-6 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors" disabled={submitting}>Cancel</button>
                                <button type="submit" className="bg-white text-zinc-900 px-8 py-2 rounded-xl font-bold hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" disabled={submitting}>
                                    {submitting ? <><RefreshCcw className="w-4 h-4 animate-spin" /> Initializing...</> : 'Initialize Account'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="card overflow-hidden">
                <table className="w-full text-sm text-left border-collapse">
                    <thead>
                        <tr className="bg-zinc-50 border-b border-zinc-200">
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Operative</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Security Clearance</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400 text-center">Status</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400">Created At</th>
                            <th className="px-6 py-4 font-mono text-[10px] uppercase tracking-widest text-zinc-400 text-right">Settings</th>
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
                                                {u.role === UserRole.SUPER_ADMIN ? 'Critical Access / ROOT' : 'Standard Clearance'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-100 text-green-700 text-[10px] font-bold">
                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                            ACTIVE
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-500 font-mono text-[11px]">{u.createdAt?.split('T')[0]}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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

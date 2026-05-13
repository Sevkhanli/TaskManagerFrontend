import React, { useState } from 'react';
import { UserPlus, Search, Mail, Shield, User as UserIcon, Trash2, Edit3, Key, MoreVertical } from 'lucide-react';
import { User, UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const Users: React.FC = () => {
    const [isAddingUser, setIsAddingUser] = useState(false);
    const [users, setUsers] = useState<User[]>([
        { id: '1', fullName: 'Super Admin', email: 'admin@taskflow.pro', role: UserRole.SUPER_ADMIN, createdAt: '2026-01-01' },
        { id: '2', fullName: 'Farid Abdullayev', email: 'farid@example.com', role: UserRole.USER, createdAt: '2026-02-15' },
        { id: '3', fullName: 'Leyla Gurbanova', email: 'leyla@example.com', role: UserRole.USER, createdAt: '2026-03-10' },
        { id: '4', fullName: 'Ilgar Kerimov', email: 'ilgar@example.com', role: UserRole.USER, createdAt: '2026-04-01' },
    ]);

    const [form, setForm] = useState({ fullName: '', email: '', role: UserRole.USER });

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            ...form,
            createdAt: new Date().toISOString()
        };
        setUsers([newUser, ...users]);
        setForm({ fullName: '', email: '', role: UserRole.USER });
        setIsAddingUser(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <header>
                    <h2 className="text-3xl font-bold tracking-tight">Staff Accounts</h2>
                    <p className="text-zinc-500">Manage organizational access and system permissions.</p>
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
                            <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                                <button type="button" onClick={() => setIsAddingUser(false)} className="px-6 py-2 rounded-xl text-zinc-400 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="bg-white text-zinc-900 px-8 py-2 rounded-xl font-bold hover:bg-zinc-100 transition-colors">Initialize Account</button>
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
                        {users.map((u) => (
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
                                <td className="px-6 py-4 text-zinc-500 font-mono text-[11px]">{u.createdAt.split('T')[0]}</td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                                        <button className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"><Key className="w-4 h-4" /></button>
                                        <button className="p-2 text-red-400 hover:text-red-700 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

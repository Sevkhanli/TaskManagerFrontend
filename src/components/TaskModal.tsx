import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User as UserIcon, AlignLeft, Type, RefreshCcw, Search, ChevronDown } from 'lucide-react';
import { Task, TaskStatus, User, UserRole } from '../types';
import { authApi } from '../api';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task> & { completionDescription?: string }) => void;
    onDelete?: (id: number) => void;
    task?: Task | null;
    currentUser: User;
    users: User[];
    loading?: boolean;
}

export const TaskModal: React.FC<TaskModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    onDelete,
    task, 
    currentUser,
    users,
    loading = false
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<TaskStatus>(TaskStatus.TODO);
    const [deadline, setDeadline] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [assignmentType, setAssignmentType] = useState<'user' | 'role'>('user');
    const [roleName, setRoleName] = useState('');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [roleSearchQuery, setRoleSearchQuery] = useState('');
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
    const [dbRoles, setDbRoles] = useState<string[]>([]);
    const [completionDescription, setCompletionDescription] = useState('');

    const isAdmin = currentUser.role === UserRole.SUPER_ADMIN;
    const isEditing = !!task;
    
    // Permission Logic:
    // 1. Admin can edit/delete everything.
    // 2. User can edit/delete everything of their OWN self-created tasks (where they are the creator).
    // 3. User can ONLY edit status if the task was assigned to them by an Admin.
    const isTaskAssignedByAdmin = task && (task.creator.role === UserRole.SUPER_ADMIN || task.creator.fullName === 'Super Admin');
    const isOwner = task && (task.creator.id === currentUser.id || String(task.creator.id) === String(currentUser.id));

    // Users can edit everything except for tasks created by Admin.
    const canEditMetadata = isAdmin || !isEditing || (isEditing && isOwner && !isTaskAssignedByAdmin);
    const canEditStatus = true; 
    const canDelete = isEditing && (isAdmin || isOwner);

    const isCompleting = status === TaskStatus.COMPLETED && task?.status !== TaskStatus.COMPLETED;

    // Dynamic Roles from DB
    const availableRoles = React.useMemo(() => {
        // Normalize helper
        const normalize = (r: string) => String(r).toUpperCase().replace(/^ROLE_/, '').trim();
        
        // Use dbRoles if available, otherwise find roles from current users list
        const rolesList = dbRoles.length > 0 ? dbRoles : Array.from(new Set(users.map(u => String(u.role)))).filter(Boolean);
        
        // Return sorted roles, ensure no duplicates after normalization would be tricky if we want to preserve original for backend
        // So we keep original names but might filter them
        return rolesList.filter(Boolean).sort();
    }, [users, dbRoles]);

    // Fetch Roles from API
    useEffect(() => {
        if (isOpen) {
            authApi.getRoles().then(roles => {
                if (roles && roles.length > 0) {
                    setDbRoles(roles.map(r => r.toUpperCase()));
                }
            }).catch(err => console.error('Error fetching roles:', err));
        }
    }, [isOpen]);

    // Body scroll lock
    useEffect(() => {
        if (isOpen) {
            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    useEffect(() => {
        if (!roleName && availableRoles.length > 0) {
            setRoleName(availableRoles[0]);
        }
    }, [availableRoles, roleName]);

    const filteredUsers = React.useMemo(() => {
        return users.filter(u => 
            u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
        );
    }, [users, userSearchQuery]);

    const filteredRoles = React.useMemo(() => {
        return availableRoles.filter(r => 
            r.toLowerCase().includes(roleSearchQuery.toLowerCase())
        );
    }, [availableRoles, roleSearchQuery]);

    const handleDelete = () => {
        if (task && onDelete) {
            if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
                onDelete(Number(task.id));
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            console.log('[TaskModal] Permissions Check:', {
                isAdmin,
                isEditing,
                isTaskAssignedByAdmin,
                isOwner,
                canEditMetadata,
                canEditStatus,
                taskCreator: task?.creator.fullName,
                currentUser: currentUser.fullName
            });
        }
    }, [isOpen, isAdmin, isEditing, isTaskAssignedByAdmin, isOwner, canEditMetadata, canEditStatus]);

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description);
            setStatus(task.status);
            setDeadline(task.deadline.split('T')[0]);
            setAssigneeId(task.assignee.id);
            setCompletionDescription('');
        } else {
            setTitle('');
            setDescription('');
            setStatus(TaskStatus.TODO);
            setDeadline(new Date().toISOString().split('T')[0]);
            setAssigneeId(currentUser.id);
            setAssignmentType('user');
            if (availableRoles.length > 0) {
                setRoleName(availableRoles[0]);
            }
            setCompletionDescription('');
        }
    }, [task, currentUser, isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="w-full max-w-xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 border border-zinc-200 flex flex-col"
                >
                    <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50 shrink-0">
                        <div>
                            <h3 className="text-xl font-bold text-zinc-900">
                                {isEditing ? 'Tapşırıq Məlumatlarını Dəyiş' : 'Yeni Tapşırıq Başlat'}
                            </h3>
                            {isTaskAssignedByAdmin && !isAdmin && (
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">
                                    Əməliyyat Əmri: Yalnız Status Rəyi İcazəlidir
                                </p>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    <div 
                        className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar min-h-0 pb-80 overscroll-contain"
                        onWheel={(e) => {
                            // Pre-emptively stop parent scroll if at boundaries
                            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                            if (
                                (e.deltaY < 0 && scrollTop <= 0) ||
                                (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight)
                            ) {
                                e.preventDefault();
                            }
                        }}
                    >
                        {/* Title Field */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                <Type className="w-3 h-3" /> Tapşırıq Başlığı
                            </label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={!canEditMetadata}
                                placeholder="Tapşırıq başlığı..."
                                className="input-field disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                <AlignLeft className="w-3 h-3" /> Təsvir
                            </label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={!canEditMetadata}
                                placeholder="Tapşırığı təsvir edin..."
                                rows={3}
                                className="input-field resize-none py-3 disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            {/* Deadline Field */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                    <Calendar className="w-3 h-3" /> Deadline
                                </label>
                                <input 
                                    type="date"
                                    value={deadline}
                                    onChange={(e) => setDeadline(e.target.value)}
                                    disabled={!canEditMetadata}
                                    className="input-field disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed"
                                />
                            </div>

                            {/* Status Field */}
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                    Status
                                </label>
                                <select 
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                    disabled={!canEditStatus}
                                    className="input-field bg-white"
                                >
                                    {Object.values(TaskStatus).map((s) => (
                                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Assignee Field (Admin Only) */}
                        {isAdmin && !isEditing && (
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">
                                    <UserIcon className="w-3 h-3" /> Tapşırıq Sahəsi (Scope)
                                </label>
                                <div className="flex bg-zinc-100 p-1 rounded-xl mb-4">
                                    <button 
                                        type="button"
                                        onClick={() => setAssignmentType('user')}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${assignmentType === 'user' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                                    >
                                        Fərdi İstifadəçi
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setAssignmentType('role')}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${assignmentType === 'role' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                                    >
                                        Departament Rolu
                                    </button>
                                </div>

                                {assignmentType === 'user' ? (
                                    <div className="relative">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                            <input 
                                                type="text"
                                                placeholder="İstifadəçi axtar..."
                                                value={isUserMenuOpen ? userSearchQuery : (users.find(u => u.id === assigneeId)?.fullName || '')}
                                                onChange={(e) => {
                                                    setUserSearchQuery(e.target.value);
                                                    setIsUserMenuOpen(true);
                                                }}
                                                onFocus={() => {
                                                    setIsUserMenuOpen(true);
                                                    setUserSearchQuery('');
                                                }}
                                                className="input-field pl-12"
                                            />
                                            <ChevronDown className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                        </div>

                                        <AnimatePresence>
                                            {isUserMenuOpen && (
                                                <>
                                                    <div 
                                                        className="fixed inset-0 z-10" 
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    />
                                                    <motion.div 
                                                        initial={{ opacity: 0, y: -10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -10 }}
                                                        onWheel={(e) => e.stopPropagation()}
                                                        className="absolute left-0 right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar ring-1 ring-black/5"
                                                    >
                                                        {filteredUsers.length > 0 ? (
                                                            filteredUsers.map((u) => (
                                                                <button
                                                                    key={u.id}
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setAssigneeId(u.id);
                                                                        setIsUserMenuOpen(false);
                                                                        setUserSearchQuery('');
                                                                    }}
                                                                    className={`w-full text-left px-5 py-3 text-sm hover:bg-zinc-50 flex items-center justify-between transition-colors ${assigneeId === u.id ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600'}`}
                                                                >
                                                                    <div className="flex flex-col">
                                                                        <span>{u.fullName} {u.id === currentUser.id ? '(Mən)' : ''}</span>
                                                                        <span className="text-[10px] text-zinc-400 font-medium">{u.email}</span>
                                                                    </div>
                                                                    {assigneeId === u.id && <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <div className="px-5 py-4 text-xs text-zinc-400 text-center italic">İstifadəçi tapılmadı</div>
                                                        )}
                                                    </motion.div>
                                                </>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <div className="relative">
                                                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                <input 
                                                    type="text"
                                                    placeholder="Departament axtarın..."
                                                    value={isRoleMenuOpen ? roleSearchQuery : (roleName ? roleName.replace(/^ROLE_/, '').toUpperCase() : '')}
                                                    onChange={(e) => {
                                                        setRoleSearchQuery(e.target.value);
                                                        setIsRoleMenuOpen(true);
                                                    }}
                                                    onFocus={() => {
                                                        setIsRoleMenuOpen(true);
                                                        setRoleSearchQuery('');
                                                    }}
                                                    className="input-field pl-12 font-mono uppercase text-xs focus:ring-zinc-900"
                                                />
                                                <ChevronDown className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform ${isRoleMenuOpen ? 'rotate-180' : ''}`} />
                                            </div>

                                            <AnimatePresence>
                                                {isRoleMenuOpen && (
                                                    <>
                                                        <div 
                                                            className="fixed inset-0 z-10" 
                                                            onClick={() => setIsRoleMenuOpen(false)}
                                                        />
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            onWheel={(e) => e.stopPropagation()}
                                                            className="absolute left-0 right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar ring-1 ring-black/5"
                                                        >
                                                            {filteredRoles.length > 0 ? (
                                                                filteredRoles.map((r) => (
                                                                    <button
                                                                        key={r}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setRoleName(r);
                                                                            setIsRoleMenuOpen(false);
                                                                            setRoleSearchQuery('');
                                                                        }}
                                                                        className={`w-full text-left px-5 py-3 text-xs font-mono uppercase hover:bg-zinc-50 flex items-center justify-between transition-colors ${roleName === r ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600'}`}
                                                                    >
                                                                        <span>{r.replace(/^ROLE_/, '').toUpperCase()}</span>
                                                                        {roleName === r && <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />}
                                                                    </button>
                                                                ))
                                                            ) : (
                                                                <div className="px-5 py-4 text-xs text-zinc-400 text-center italic">Departament tapılmadı</div>
                                                            )}
                                                        </motion.div>
                                                    </>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 font-mono italic">
                                            Qeyd: Bu, bu qrupdakı hər bir istifadəçi üçün ayrıca tapşırıq yaradacaqdır.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {isAdmin && isEditing && (
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                    <UserIcon className="w-3 h-3" /> İcraçı
                                </label>
                                <div className="relative">
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                        <input 
                                            type="text"
                                            placeholder="İstifadəçi axtar..."
                                            value={isUserMenuOpen ? userSearchQuery : (users.find(u => u.id === assigneeId)?.fullName || '')}
                                            onChange={(e) => {
                                                setUserSearchQuery(e.target.value);
                                                setIsUserMenuOpen(true);
                                            }}
                                            onFocus={() => {
                                                setIsUserMenuOpen(true);
                                                setUserSearchQuery('');
                                            }}
                                            disabled={!canEditMetadata}
                                            className="input-field pl-12 disabled:bg-zinc-50 disabled:text-zinc-500"
                                        />
                                        <ChevronDown className={`w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </div>

                                    <AnimatePresence>
                                        {isUserMenuOpen && canEditMetadata && (
                                            <>
                                                <div 
                                                    className="fixed inset-0 z-10" 
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                />
                                                <motion.div 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    onWheel={(e) => e.stopPropagation()}
                                                    className="absolute left-0 right-0 top-full mt-2 bg-white border border-zinc-200 rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar ring-1 ring-black/5"
                                                >
                                                    {filteredUsers.length > 0 ? (
                                                        filteredUsers.map((u) => (
                                                            <button
                                                                key={u.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setAssigneeId(u.id);
                                                                    setIsUserMenuOpen(false);
                                                                    setUserSearchQuery('');
                                                                }}
                                                                className={`w-full text-left px-5 py-3 text-sm hover:bg-zinc-50 flex items-center justify-between transition-colors ${assigneeId === u.id ? 'bg-zinc-50 text-zinc-900 font-bold' : 'text-zinc-600'}`}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span>{u.fullName} {u.id === currentUser.id ? '(Mən)' : ''}</span>
                                                                    <span className="text-[10px] text-zinc-400 font-medium">{u.email}</span>
                                                                </div>
                                                                {assigneeId === u.id && <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full" />}
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="px-5 py-4 text-xs text-zinc-400 text-center italic">İstifadəçi tapılmadı</div>
                                                    )}
                                                </motion.div>
                                            </>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        )}
                        
                        {!isAdmin && !isEditing && (
                            <div className="p-4 rounded-xl bg-zinc-900 text-white flex items-center gap-3">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <p className="text-xs font-medium">Self-created task: You have full control over this objective.</p>
                            </div>
                        )}
                        {/* Completion Fields (Conditional) */}
                        {isCompleting && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-6 bg-zinc-900 rounded-2xl space-y-4 border border-zinc-800"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Tamamlama Hesabatı Tələb Olunur</h4>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Ətraflı Hesabat</label>
                                    <textarea 
                                        value={completionDescription}
                                        onChange={(e) => setCompletionDescription(e.target.value)}
                                        placeholder="Tam olaraq nə yekunlaşdırıldı?"
                                        rows={2}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 font-mono text-xs text-white"
                                    />
                                </div>
                                
                                <p className="text-[10px] text-zinc-500 italic">
                                    Qeyd: Sistem deadline bütövlüyünü yoxlayacaq və lazım gəldikdə gecikmə cərimələri tətbiq edəcəkdir.
                                </p>
                            </motion.div>
                        )}
                    </div>

                    <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between shrink-0">
                        <div>
                            {canDelete && (
                                <button 
                                    onClick={handleDelete}
                                    className="text-xs font-bold text-red-500 hover:text-red-600 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                                    disabled={loading}
                                >
                                    <X className="w-3 h-3" /> Terminate Objective
                                </button>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="btn-secondary" disabled={loading}>Ləğv Et</button>
                            <button 
                                onClick={() => onSave({ 
                                    title, 
                                    description, 
                                    status, 
                                    deadline, 
                                    assigneeId: assigneeId as any, 
                                    roleName: assignmentType === 'role' ? roleName : undefined,
                                    completionDescription
                                } as any)}
                                className="btn-primary px-8 flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><RefreshCcw className="w-4 h-4 animate-spin" /> Sinxronlaşdırılır...</>
                                ) : (
                                    isEditing ? (isCompleting ? 'Missiyanı Yekunlaşdır' : 'Tapşırığı Yenilə') : 'Tapşırıq Yarat'
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

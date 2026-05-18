import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, User as UserIcon, AlignLeft, Type, RefreshCcw } from 'lucide-react';
import { Task, TaskStatus, User, UserRole } from '../types';

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (task: Partial<Task> & { completionDescription?: string, evidenceLink?: string }) => void;
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
    const [roleName, setRoleName] = useState('ROLE_SATIS');
    const [completionDescription, setCompletionDescription] = useState('');
    const [evidenceLink, setEvidenceLink] = useState('');

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
            setEvidenceLink('');
        } else {
            setTitle('');
            setDescription('');
            setStatus(TaskStatus.TODO);
            setDeadline(new Date().toISOString().split('T')[0]);
            setAssigneeId(currentUser.id);
            setAssignmentType('user');
            setRoleName('ROLE_SATIS');
            setCompletionDescription('');
            setEvidenceLink('');
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
                                {isEditing ? 'Modify Task Details' : 'Launch New Task'}
                            </h3>
                            {isTaskAssignedByAdmin && !isAdmin && (
                                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-1">
                                    Operational Order: Only Status Feedback Allowed
                                </p>
                            )}
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                            <X className="w-5 h-5 text-zinc-400" />
                        </button>
                    </div>

                    <div className="p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar min-h-0">
                        {/* Title Field */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                <Type className="w-3 h-3" /> Task Title
                            </label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={!canEditMetadata}
                                placeholder="Task title..."
                                className="input-field disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                <AlignLeft className="w-3 h-3" /> Description
                            </label>
                            <textarea 
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                disabled={!canEditMetadata}
                                placeholder="Describe the task..."
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
                                    <UserIcon className="w-3 h-3" /> Assignment Scope
                                </label>
                                <div className="flex bg-zinc-100 p-1 rounded-xl mb-4">
                                    <button 
                                        type="button"
                                        onClick={() => setAssignmentType('user')}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${assignmentType === 'user' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                                    >
                                        Individual User
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setAssignmentType('role')}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${assignmentType === 'role' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'}`}
                                    >
                                        Department Role
                                    </button>
                                </div>

                                {assignmentType === 'user' ? (
                                    <select 
                                        value={assigneeId}
                                        onChange={(e) => setAssigneeId(e.target.value)}
                                        className="input-field"
                                    >
                                        {users.map((u) => (
                                            <option key={u.id} value={u.id}>{u.fullName} {u.id === currentUser.id ? '(Me)' : ''}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="space-y-3">
                                        <select 
                                            value={roleName}
                                            onChange={(e) => setRoleName(e.target.value)}
                                            className="input-field"
                                        >
                                            <option value="ROLE_SATIS">ROLE_SATIS (Sales)</option>
                                            <option value="ROLE_TEKNIK">ROLE_TEKNIK (Technical)</option>
                                            <option value="ROLE_ADMIN">ROLE_ADMIN (Admin)</option>
                                            <option value="ROLE_USER">ROLE_USER (General User)</option>
                                        </select>
                                        <p className="text-[10px] text-zinc-400 font-mono italic">
                                            Note: This will create separate tasks for every user belonging to this registry group.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {isAdmin && isEditing && (
                            <div>
                                <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                                    <UserIcon className="w-3 h-3" /> Assignee
                                </label>
                                <select 
                                    value={assigneeId}
                                    onChange={(e) => setAssigneeId(e.target.value)}
                                    className="input-field"
                                    disabled={!canEditMetadata}
                                >
                                    {users.map((u) => (
                                        <option key={u.id} value={u.id}>{u.fullName} {u.id === currentUser.id ? '(Me)' : ''}</option>
                                    ))}
                                </select>
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
                                    <h4 className="text-xs font-bold text-white uppercase tracking-[0.2em]">Completion Report Required</h4>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Detailed Report</label>
                                    <textarea 
                                        value={completionDescription}
                                        onChange={(e) => setCompletionDescription(e.target.value)}
                                        placeholder="What exactly was finalized?"
                                        rows={2}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 font-mono text-xs text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Evidence Link (Git/Doc)</label>
                                    <input 
                                        type="text"
                                        value={evidenceLink}
                                        onChange={(e) => setEvidenceLink(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:ring-1 focus:ring-zinc-400 font-mono text-xs text-white"
                                    />
                                </div>
                                
                                <p className="text-[10px] text-zinc-500 italic">
                                    Note: System will validate deadline integrity and apply late penalties if applicable.
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
                            <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
                            <button 
                                onClick={() => onSave({ 
                                    title, 
                                    description, 
                                    status, 
                                    deadline, 
                                    assigneeId: assigneeId as any, 
                                    roleName: assignmentType === 'role' ? roleName : undefined,
                                    completionDescription, 
                                    evidenceLink 
                                } as any)}
                                className="btn-primary px-8 flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <><RefreshCcw className="w-4 h-4 animate-spin" /> Synchronizing...</>
                                ) : (
                                    isEditing ? (isCompleting ? 'Finalize Mission' : 'Update Task') : 'Create Task'
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

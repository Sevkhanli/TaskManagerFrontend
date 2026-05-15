export enum TaskStatus {
    TODO = 'TODO',
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    OVERDUE = 'OVERDUE',
    PENDING = 'PENDING',
    CANCELLED = 'CANCELLED'
}

export enum PenaltyStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    WAIVED = 'WAIVED'
}

export enum PenaltyType {
    DEADLINE_MISSED = 'DEADLINE_MISSED',
    STATUS_NOT_COMPLETED = 'STATUS_NOT_COMPLETED',
    FALSE_COMPLETION = 'FALSE_COMPLETION'
}

export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    USER = 'USER'
}

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    createdAt: string;
    updatedAt: string;
    deadline: string;
    creator: User;
    assignee: User;
    isDeleted: boolean;
}

export interface PenaltySummary {
    userId: number;
    userName: string;
    totalPendingAmount: number;
    totalPenalties: number;
    pendingPenalties: number;
    paidPenalties: number;
    currency: string;
}

export interface TaskCompletionRequest {
    taskId: number;
    completionDescription: string;
    evidenceLink?: string;
}

export interface Penalty {
    id: string;
    user: User;
    task: Task;
    penaltyType: PenaltyType;
    status: PenaltyStatus;
    amount: number;
    currency: string;
    daysOverdue?: number;
    description: string;
    evidenceRequired: boolean;
    evidenceProvided: boolean;
    evidenceDescription?: string;
    createdAt: string;
    paidAt?: string;
    waivedBy?: User;
    waivedAt?: string;
    waiveReason?: string;
}

export interface UserPenaltyStats {
    userId: number;
    userName: string;
    totalPenaltyAmount?: number;
    paidAmount?: number;
    pendingAmount?: number;
    totalPenaltyCount?: number;
    activePenalties?: number;
    waivedPenalties?: number;
    totalPendingAmount?: number;
    totalPenalties?: number;
    pendingPenalties?: number;
    paidPenalties?: number;
    currency: string;
}

export interface PenaltyConfig {
    id: string;
    deadlineMissedAmount: number;
    statusNotCompletedAmount: number;
    falseCompletionAmount: number;
    currency: string;
    active: boolean; // Changed from isActive to active
    createdAt: string;
    updatedAt: string;
    updatedByName: string; // Changed from updatedBy: User to updatedByName: string
}

export interface StatusHistory {
    id: string;
    taskId: string;
    oldStatus?: TaskStatus;
    newStatus: TaskStatus;
    oldDeadline?: string;
    newDeadline?: string;
    changedBy: string;
    reason: string;
    changedAt: string;
}

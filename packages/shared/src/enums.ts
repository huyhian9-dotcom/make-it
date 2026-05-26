export type TaskKind = 'todo' | 'habit' | 'deadline';
export type TaskStatus = 'open' | 'done';
export type GroupTaskType = 'livre' | 'delegada' | 'mutirao' | 'acao_global';
export type GroupRole = 'owner' | 'member';
export type InviteStatus = 'pending' | 'accepted' | 'revoked';
export type Theme = 'light' | 'dark';

export const TASK_KINDS: readonly TaskKind[] = ['todo', 'habit', 'deadline'];
export const GROUP_TASK_TYPES: readonly GroupTaskType[] = ['livre', 'delegada', 'mutirao', 'acao_global'];

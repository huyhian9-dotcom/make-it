import type {
  GroupRole,
  GroupTaskType,
  InviteStatus,
  TaskKind,
  TaskStatus,
  Theme,
} from './enums';

export interface UserPreferences {
  theme: Theme;
  push: boolean;
  cloudSync: boolean;
}

/** Usuário exposto pela API (nunca inclui password_hash). */
export interface User {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

/** Tag colorida pessoal ("Esposa", "Casa"). */
export interface Label {
  id: string;
  userId: string;
  name: string;
  color: string; // hex, ex "#A78BFA"
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  done: boolean;
  position: number;
}

export interface TaskRecurrence {
  freq: 'daily' | 'weekly';
  daysOfWeek?: number[]; // 0=domingo .. 6=sábado
}

export interface Task {
  id: string;
  userId: string;
  groupId: string | null;
  labelId: string | null;
  title: string;
  notes: string | null;
  kind: TaskKind;
  dueDate: string | null; // ISO date "YYYY-MM-DD" (prazo)
  startsOn: string | null; // multi-dia
  endsOn: string | null;
  recurrence: TaskRecurrence | null; // hábito
  groupTaskType: GroupTaskType | null;
  status: TaskStatus;
  completedAt: string | null; // ISO datetime
  createdAt: string;
  updatedAt: string;
  // Relacionamentos hidratados em GET /tasks/:id e listagens:
  subtasks?: Subtask[];
  assignees?: string[]; // user ids
  label?: Label | null;
}

export interface Group {
  id: string;
  name: string;
  icon: string; // chave de ícone ou url
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  // Hidratado em listagens:
  role?: GroupRole; // papel do usuário atual
  memberCount?: number;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: GroupRole;
  user?: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

export interface GroupInvite {
  id: string;
  groupId: string;
  email: string | null;
  token: string;
  status: InviteStatus;
  createdAt: string;
}

/** Bloco de horário da rotina ("Meu dia"). */
export interface RoutineBlock {
  id: string;
  userId: string;
  label: string; // "Trabalho", "Almoço"
  color: string; // hex
  startTime: string; // "HH:MM"
  endTime: string | null; // "HH:MM"
  weekdayMask: number; // bitmask seg..dom; 0 = todo dia
  createdAt: string;
  updatedAt: string;
}

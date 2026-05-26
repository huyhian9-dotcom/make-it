import type { GroupTaskType, TaskKind, TaskStatus, Theme } from './enums';
import type { TaskRecurrence, User } from './domain';

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

export interface CreateSubtaskInput {
  title: string;
  done?: boolean;
  position?: number;
}

export interface CreateTaskDTO {
  title: string;
  notes?: string | null;
  kind?: TaskKind; // default 'todo'
  groupId?: string | null;
  labelId?: string | null;
  dueDate?: string | null;
  startsOn?: string | null;
  endsOn?: string | null;
  recurrence?: TaskRecurrence | null;
  groupTaskType?: GroupTaskType | null;
  assignees?: string[];
  subtasks?: CreateSubtaskInput[];
}

export type UpdateTaskDTO = Partial<CreateTaskDTO>;

export interface TaskFilters {
  from?: string; // ISO date
  to?: string; // ISO date
  kind?: TaskKind;
  groupId?: string;
  status?: TaskStatus;
  labelId?: string;
}

export interface CreateLabelDTO {
  name: string;
  color: string;
}
export type UpdateLabelDTO = Partial<CreateLabelDTO>;

export interface CreateGroupDTO {
  name: string;
  icon: string;
}
export type UpdateGroupDTO = Partial<CreateGroupDTO>;

export interface CreateInviteDTO {
  email?: string | null;
}

export interface CreateRoutineBlockDTO {
  label: string;
  color: string;
  startTime: string;
  endTime?: string | null;
  weekdayMask?: number;
}
export type UpdateRoutineBlockDTO = Partial<CreateRoutineBlockDTO>;

export interface UpdateUserDTO {
  name?: string;
  bio?: string | null;
  avatarUrl?: string | null;
}

export interface UpdatePreferencesDTO {
  theme?: Theme;
  push?: boolean;
  cloudSync?: boolean;
}

import { useState } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import type { Task } from '@makeit/shared';
import { LabelChip } from './LabelChip';
import { formatDateShort, getDeadlineColor } from '../lib/date';
import { useToggleTask, useToggleSubtask } from '../api/tasks';

interface TaskCardProps {
  task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  const toggleTask = useToggleTask();
  const toggleSubtask = useToggleSubtask();

  const isDone = task.status === 'done';
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;
  const hasLabel = task.label;
  const hasDueDate = task.dueDate;

  function handleToggle() {
    toggleTask.mutate({ id: task.id, done: !isDone });
  }

  function handleSubtaskToggle(subtaskId: string, done: boolean) {
    toggleSubtask.mutate({ id: subtaskId, done: !done });
  }

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${isDone ? 'opacity-90' : ''}`}
    >
      <div className="p-4">
        {/* Top row: label chip (top right) + deadline badge */}
        {(hasLabel || (hasDueDate && !isDone)) && (
          <div className="flex justify-end mb-1 gap-2">
            {hasDueDate && !isDone && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${getDeadlineColor(task.dueDate!)}`}
              >
                Até {formatDateShort(task.dueDate!)}
              </span>
            )}
            {hasLabel && task.label && (
              <LabelChip name={task.label.name} color={task.label.color} />
            )}
          </div>
        )}

        {/* Main row: checkbox + title + expand */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggle}
            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
              isDone
                ? 'bg-brand-purple border-brand-purple text-white'
                : 'border-gray-300 hover:border-brand-purple'
            }`}
            aria-label={isDone ? 'Marcar como não concluída' : 'Marcar como concluída'}
            data-testid="task-checkbox"
          >
            {isDone && <Check size={14} strokeWidth={3} />}
          </button>

          <span
            className={`flex-1 text-sm font-medium ${isDone ? 'line-through text-gray-400' : 'text-gray-800'}`}
          >
            {task.title}
          </span>

          {hasSubtasks && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-gray-400 hover:text-gray-600"
              aria-label={expanded ? 'Recolher subtarefas' : 'Expandir subtarefas'}
              data-testid="task-expand"
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>

        {/* Subtasks (expanded) */}
        {expanded && hasSubtasks && (
          <ul className="mt-3 pl-10 space-y-1" data-testid="subtask-list">
            {task.subtasks!.map((st) => (
              <li key={st.id} className="flex items-center gap-2 text-sm text-gray-600">
                <button
                  onClick={() => handleSubtaskToggle(st.id, st.done)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={st.done ? 'Marcar como não concluída' : 'Marcar como concluída'}
                >
                  <div
                    className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                      st.done ? 'bg-gray-400 border-gray-400' : 'border-gray-400'
                    }`}
                  >
                    {st.done && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                </button>
                <span className={st.done ? 'line-through text-gray-400' : ''}>{st.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

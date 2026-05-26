import { useState } from 'react';
import { Sunrise, AlignJustify } from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { useTasks } from '../api/tasks';
import { useRoutineBlocks } from '../api/routineBlocks';
import { TaskCard } from '../components/TaskCard';
import { RoutineTimeline } from '../components/RoutineTimeline';
import { formatDatePtBR, todayISO } from '../lib/date';
import { capitalizeFirst } from '../lib/format';

type Tab = 'tasks' | 'routine';

export function Home() {
  const [tab, setTab] = useState<Tab>('tasks');
  const user = useAuthStore((s) => s.user);

  const today = todayISO();
  const { data: tasks = [], isLoading: tasksLoading } = useTasks({ from: today, to: today });
  const { data: blocks = [], isLoading: blocksLoading } = useRoutineBlocks();

  const todayDate = new Date();
  const dateLabel = capitalizeFirst(formatDatePtBR(todayDate));

  const firstName = user?.name?.split(' ')[0] ?? 'Usuário';

  return (
    <div className="px-4 pt-8 pb-4">
      {/* Header */}
      <div className="flex flex-col items-start mb-6">
        <div className="mb-2">
          <Sunrise size={32} strokeWidth={1.5} className="text-gray-700" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Bom dia, {firstName}!</h1>
        <p className="text-sm text-gray-400 mt-0.5">{dateLabel}</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setTab('tasks')}
          className={`flex-1 pb-3 text-sm font-medium transition-colors ${
            tab === 'tasks'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-400'
          }`}
        >
          Tarefas de hoje
        </button>
        <button
          onClick={() => setTab('routine')}
          className={`flex-1 pb-3 text-sm font-medium transition-colors ${
            tab === 'routine'
              ? 'text-gray-900 border-b-2 border-gray-900'
              : 'text-gray-400'
          }`}
        >
          Meu dia
        </button>
      </div>

      {/* Tab content */}
      {tab === 'tasks' && (
        <div>
          {/* Counter header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {tasksLoading
                ? 'Carregando...'
                : `Você tem ${String(tasks.length).padStart(2, '0')} tarefa${tasks.length !== 1 ? 's' : ''} hoje!`}
            </span>
            <button className="text-gray-400">
              <AlignJustify size={18} />
            </button>
          </div>

          {/* Task list */}
          {tasksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Nenhuma tarefa para hoje.
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'routine' && (
        <div>
          {blocksLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <RoutineTimeline blocks={blocks} />
          )}
        </div>
      )}
    </div>
  );
}

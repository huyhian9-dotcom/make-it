import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { useGroup, useGroupTasks } from '../api/groups';
import { TaskCard } from '../components/TaskCard';

export function GroupDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: group, isLoading: groupLoading } = useGroup(id ?? '');
  const { data: tasks = [], isLoading: tasksLoading } = useGroupTasks(id ?? '');

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <ArrowLeft size={18} />
        </button>
        {groupLoading ? (
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
              <Users size={18} className="text-gray-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">{group?.name}</h1>
          </div>
        )}
      </div>

      {/* Tasks */}
      {tasksLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          Nenhuma tarefa neste grupo ainda.
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

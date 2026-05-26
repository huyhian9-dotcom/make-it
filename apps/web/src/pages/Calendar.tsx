import { useState } from 'react';
import { format } from 'date-fns';
import { AlignJustify } from 'lucide-react';
import { useTasks } from '../api/tasks';
import { CalendarMonth } from '../components/CalendarMonth';
import { TaskCard } from '../components/TaskCard';

export function Calendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Fetch tasks for the entire year to allow dots on all months
  const year = selectedDate.getFullYear();
  const { data: allTasks = [] } = useTasks({
    from: `${year}-01-01`,
    to: `${year}-12-31`,
  });

  const selectedISO = format(selectedDate, 'yyyy-MM-dd');
  const dayTasks = allTasks.filter((t) => {
    if (t.dueDate === selectedISO) return true;
    if (t.startsOn && t.endsOn) {
      return t.startsOn <= selectedISO && selectedISO <= t.endsOn;
    }
    return false;
  });

  return (
    <div className="px-4 pt-6 pb-4">
      <CalendarMonth
        tasks={allTasks}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <div className="mt-5">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-4">
          <button className="flex-1 pb-3 text-sm font-medium text-gray-900 border-b-2 border-gray-900">
            Tarefas planejadas
          </button>
          <button className="flex-1 pb-3 text-sm font-medium text-gray-400">
            Meu dia
          </button>
        </div>

        {/* Counter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-3 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {dayTasks.length > 0
              ? `Você tem ${dayTasks.length} tarefa${dayTasks.length !== 1 ? 's' : ''} programada${dayTasks.length !== 1 ? 's' : ''} para este dia!`
              : 'Nenhuma tarefa para este dia.'}
          </span>
          <button className="text-gray-400">
            <AlignJustify size={18} />
          </button>
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {dayTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </div>
    </div>
  );
}

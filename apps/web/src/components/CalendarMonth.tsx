import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Task } from '@makeit/shared';

interface CalendarMonthProps {
  tasks?: Task[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTHS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export function CalendarMonth({ tasks = [], selectedDate, onSelectDate }: CalendarMonthProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(selectedDate));

  const start = startOfWeek(startOfMonth(currentMonth));
  const end = endOfWeek(endOfMonth(currentMonth));
  const days = eachDayOfInterval({ start, end });

  const year = currentMonth.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => year - 2 + i);

  // Build a map of date => tasks for dots
  const tasksByDate = new Map<string, Task[]>();
  for (const task of tasks) {
    if (task.dueDate) {
      const key = task.dueDate;
      if (!tasksByDate.has(key)) tasksByDate.set(key, []);
      tasksByDate.get(key)!.push(task);
    }
  }

  function getDotColor(dayTasks: Task[]): string {
    const hasDone = dayTasks.some((t) => t.status === 'done');
    const hasOpen = dayTasks.some((t) => t.status === 'open');
    if (hasDone && hasOpen) return 'bg-orange-400';
    if (hasDone) return 'bg-green-500';
    return 'bg-brand-purple';
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-2">
          <select
            value={currentMonth.getMonth()}
            onChange={(e) =>
              setCurrentMonth(
                (m) =>
                  new Date(m.getFullYear(), parseInt(e.target.value), 1),
              )
            }
            className="text-sm font-medium border border-gray-200 rounded px-2 py-1 bg-white"
          >
            {MONTHS.map((m, i) => (
              <option key={m} value={i}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={year}
            onChange={(e) =>
              setCurrentMonth(
                (m) => new Date(parseInt(e.target.value), m.getMonth(), 1),
              )
            }
            className="text-sm font-medium border border-gray-200 rounded px-2 py-1 bg-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="p-1 rounded hover:bg-gray-100"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs text-gray-400 font-medium py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-1">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayTasks = tasksByDate.get(key) ?? [];
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={key}
              onClick={() => onSelectDate(day)}
              className={`relative flex flex-col items-center py-1 rounded-full mx-auto w-9 h-9 justify-center transition-colors ${
                isSelected
                  ? 'bg-gray-900 text-white'
                  : isToday
                    ? 'border-2 border-brand-purple text-brand-purple'
                    : isCurrentMonth
                      ? 'text-gray-800 hover:bg-gray-100'
                      : 'text-gray-300'
              }`}
            >
              <span className="text-xs font-medium">{format(day, 'd')}</span>
              {dayTasks.length > 0 && isCurrentMonth && (
                <span
                  className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${getDotColor(dayTasks)}`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

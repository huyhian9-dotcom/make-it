import { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addMonths, subMonths, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Sheet } from './Sheet';
import { useCreateTask } from '../api/tasks';
import type { CreateTaskDTO } from '@makeit/shared';

interface ScheduleSheetProps {
  open: boolean;
  onClose: () => void;
  taskTitle: string;
  taskNotes?: string;
  groupId?: string | null;
  multiDays?: boolean;
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export function ScheduleSheet({
  open,
  onClose,
  taskTitle,
  taskNotes,
  groupId,
  multiDays,
}: ScheduleSheetProps) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [mode, setMode] = useState<'habito' | 'prazo'>('prazo');
  const createTask = useCreateTask();

  const start = startOfWeek(startOfMonth(currentMonth));
  const end = endOfWeek(endOfMonth(currentMonth));
  const days = eachDayOfInterval({ start, end });

  function handleDayClick(day: Date) {
    if (!multiDays) {
      setSelectedDates([day]);
      return;
    }
    const exists = selectedDates.some((d) => isSameDay(d, day));
    if (exists) {
      setSelectedDates((prev) => prev.filter((d) => !isSameDay(d, day)));
    } else {
      setSelectedDates((prev) => [...prev, day]);
    }
  }

  async function handleSubmit() {
    const dto: CreateTaskDTO = {
      title: taskTitle,
      notes: taskNotes ?? null,
      groupId: groupId ?? null,
    };

    if (mode === 'habito') {
      dto.kind = 'habit';
      dto.recurrence = { freq: 'daily' };
    } else {
      dto.kind = selectedDates.length > 0 ? 'deadline' : 'todo';
      if (selectedDates.length === 1) {
        dto.dueDate = format(selectedDates[0], 'yyyy-MM-dd');
      } else if (selectedDates.length > 1) {
        const sorted = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
        dto.startsOn = format(sorted[0], 'yyyy-MM-dd');
        dto.endsOn = format(sorted[sorted.length - 1], 'yyyy-MM-dd');
      }
    }

    createTask.mutate(dto, {
      onSuccess: () => {
        setSelectedDates([]);
        setMode('prazo');
        onClose();
      },
    });
  }

  const year = currentMonth.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => year - 2 + i);

  return (
    <Sheet open={open} onClose={onClose} title={taskTitle || 'Agendar tarefa'}>
      <p className="text-sm text-gray-500 mb-4">Selecione o período/prazo da tarefa</p>

      {/* Calendar */}
      <div className="border border-gray-200 rounded-xl p-3 mb-4">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronLeft size={16} />
          </button>

          <div className="flex gap-2">
            <select
              value={currentMonth.getMonth()}
              onChange={(e) =>
                setCurrentMonth((m) => new Date(m.getFullYear(), parseInt(e.target.value), 1))
              }
              className="text-sm border border-gray-200 rounded px-2 py-0.5"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) =>
                setCurrentMonth((m) => new Date(parseInt(e.target.value), m.getMonth(), 1))
              }
              className="text-sm border border-gray-200 rounded px-2 py-0.5"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-1 rounded hover:bg-gray-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-xs text-gray-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const isSelected = selectedDates.some((d) => isSameDay(d, day));
            const isCurrentMonth = isSameMonth(day, currentMonth);

            return (
              <button
                key={key}
                onClick={() => handleDayClick(day)}
                className={`flex items-center justify-center w-9 h-9 mx-auto rounded-full text-xs font-medium transition-colors ${
                  isSelected
                    ? 'bg-gray-900 text-white'
                    : isCurrentMonth
                      ? 'text-gray-800 hover:bg-gray-100'
                      : 'text-gray-300'
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode toggles */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setMode('habito')}
          className={`flex-1 py-2 rounded-full border text-sm font-medium transition-colors ${
            mode === 'habito'
              ? 'border-green-500 text-green-600 bg-green-50'
              : 'border-gray-300 text-gray-500'
          }`}
        >
          Hábito
        </button>
        <button
          onClick={() => setMode('prazo')}
          className={`flex-1 py-2 rounded-full border text-sm font-medium transition-colors ${
            mode === 'prazo'
              ? 'border-green-500 text-green-600 bg-green-50'
              : 'border-gray-300 text-gray-500'
          }`}
        >
          Prazo
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={createTask.isPending}
        className="w-full py-4 rounded-full bg-gray-900 text-white font-semibold text-base disabled:opacity-60"
      >
        {createTask.isPending ? 'Salvando...' : 'Make IT!'}
      </button>
    </Sheet>
  );
}

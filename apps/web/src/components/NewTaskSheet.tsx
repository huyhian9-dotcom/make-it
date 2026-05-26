import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { Sheet } from './Sheet';
import { ScheduleSheet } from './ScheduleSheet';

interface NewTaskSheetProps {
  open: boolean;
  onClose: () => void;
}

export function NewTaskSheet({ open, onClose }: NewTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [multiDays, setMultiDays] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  function handleAdvance() {
    if (!title.trim()) return;
    setScheduleOpen(true);
  }

  function handleClose() {
    setTitle('');
    setNotes('');
    setIsGroup(false);
    setMultiDays(false);
    onClose();
  }

  function handleScheduleClose() {
    setScheduleOpen(false);
    handleClose();
  }

  return (
    <>
      <Sheet open={open && !scheduleOpen} onClose={handleClose} title="Nova tarefa">
        {/* Title field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nova tarefa</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="O que precisa ser feito?"
            className="w-full px-4 py-3 rounded-full bg-gray-100 border-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple"
            aria-label="Título da tarefa"
          />
        </div>

        {/* Notes field */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Notas / Detalhes</label>
          <div className="relative">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione detalhes, links, listas, etapas…"
              rows={5}
              className="w-full px-4 py-3 rounded-2xl bg-gray-100 border-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple resize-none"
            />
            <button className="absolute bottom-3 right-3 text-gray-400 hover:text-gray-600">
              <Paperclip size={18} />
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 mb-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setIsGroup((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isGroup ? 'bg-brand-purple' : 'bg-gray-300'}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isGroup ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </div>
            <span className="text-sm text-gray-700">Tarefa em grupo</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setMultiDays((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${multiDays ? 'bg-brand-purple' : 'bg-gray-300'}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${multiDays ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </div>
            <span className="text-sm text-gray-700">Multiplos dias</span>
          </label>
        </div>

        <button
          onClick={handleAdvance}
          disabled={!title.trim()}
          className="w-full py-4 rounded-full bg-gray-900 text-white font-semibold text-base disabled:opacity-50"
        >
          Avançar
        </button>
      </Sheet>

      <ScheduleSheet
        open={scheduleOpen}
        onClose={handleScheduleClose}
        taskTitle={title}
        taskNotes={notes}
        multiDays={multiDays}
      />
    </>
  );
}

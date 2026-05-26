import { useState } from 'react';
import { Paperclip } from 'lucide-react';
import { Sheet } from './Sheet';
import { ScheduleSheet } from './ScheduleSheet';
import { GroupTaskSheet } from './GroupTaskSheet';
import { useGroups } from '../api/groups';
import type { GroupTaskType } from '@makeit/shared';

interface NewTaskSheetProps {
  open: boolean;
  onClose: () => void;
}

export function NewTaskSheet({ open, onClose }: NewTaskSheetProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [isGroup, setIsGroup] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupTaskType, setGroupTaskType] = useState<GroupTaskType | null>(null);
  const [multiDays, setMultiDays] = useState(false);
  const [groupTaskOpen, setGroupTaskOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const { data: groups = [], isLoading: groupsLoading } = useGroups();

  function handleAdvance() {
    if (!title.trim()) return;
    if (isGroup) {
      if (!selectedGroupId) return;
      setGroupTaskOpen(true);
      return;
    }
    setScheduleOpen(true);
  }

  function handleGroupTaskConfirm(type: GroupTaskType) {
    setGroupTaskType(type);
    setGroupTaskOpen(false);
    setScheduleOpen(true);
  }

  function handleClose() {
    setTitle('');
    setNotes('');
    setIsGroup(false);
    setSelectedGroupId('');
    setGroupTaskType(null);
    setMultiDays(false);
    setGroupTaskOpen(false);
    onClose();
  }

  function handleScheduleClose() {
    setScheduleOpen(false);
    handleClose();
  }

  const canAdvance = Boolean(title.trim()) && (!isGroup || Boolean(selectedGroupId));

  return (
    <>
      <Sheet open={open && !scheduleOpen && !groupTaskOpen} onClose={handleClose} title="Nova tarefa">
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
            <button
              type="button"
              aria-label="Tarefa em grupo"
              aria-pressed={isGroup}
              onClick={() => {
                setIsGroup((v) => !v);
                setSelectedGroupId('');
                setGroupTaskType(null);
              }}
              className={`relative w-12 h-6 rounded-full transition-colors ${isGroup ? 'bg-brand-purple' : 'bg-gray-300'}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isGroup ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </button>
            <span className="text-sm text-gray-700">Tarefa em grupo</span>
          </label>

          {isGroup && (
            <div className="pl-[60px]">
              <label className="block text-xs font-medium text-gray-500 mb-2">
                Grupo
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                disabled={groupsLoading || groups.length === 0}
                className="w-full px-4 py-3 rounded-full bg-gray-100 border-0 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-purple disabled:opacity-60"
              >
                <option value="">
                  {groupsLoading
                    ? 'Carregando grupos...'
                    : groups.length === 0
                      ? 'Crie um grupo primeiro'
                      : 'Selecione um grupo'}
                </option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <button
              type="button"
              aria-label="Multiplos dias"
              aria-pressed={multiDays}
              onClick={() => setMultiDays((v) => !v)}
              className={`relative w-12 h-6 rounded-full transition-colors ${multiDays ? 'bg-brand-purple' : 'bg-gray-300'}`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${multiDays ? 'translate-x-6' : 'translate-x-0.5'}`}
              />
            </button>
            <span className="text-sm text-gray-700">Multiplos dias</span>
          </label>
        </div>

        <button
          onClick={handleAdvance}
          disabled={!canAdvance}
          className="w-full py-4 rounded-full bg-gray-900 text-white font-semibold text-base disabled:opacity-50"
        >
          Avançar
        </button>
      </Sheet>

      <GroupTaskSheet
        open={groupTaskOpen}
        onClose={() => setGroupTaskOpen(false)}
        onConfirm={handleGroupTaskConfirm}
        taskTitle={title}
      />

      <ScheduleSheet
        open={scheduleOpen}
        onClose={handleScheduleClose}
        taskTitle={title}
        taskNotes={notes}
        groupId={isGroup ? selectedGroupId : null}
        groupTaskType={groupTaskType}
        multiDays={multiDays}
      />
    </>
  );
}

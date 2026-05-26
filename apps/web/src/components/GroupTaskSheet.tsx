import { useState } from 'react';
import { Sheet } from './Sheet';
import { Avatar } from './Avatar';
import type { GroupTaskType } from '@makeit/shared';

interface GroupTaskSheetProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (type: GroupTaskType) => void;
  taskTitle?: string;
}

const TASK_TYPES: { key: GroupTaskType; label: string }[] = [
  { key: 'livre', label: 'Tarefa Livre' },
  { key: 'delegada', label: 'Tarefa Delegada' },
  { key: 'mutirao', label: 'Mutirão' },
  { key: 'acao_global', label: 'Ação Global' },
];

export function GroupTaskSheet({ open, onClose, onConfirm, taskTitle }: GroupTaskSheetProps) {
  const [selectedType, setSelectedType] = useState<GroupTaskType | null>(null);

  function handleSubmit() {
    if (!selectedType) return;
    onConfirm(selectedType);
    setSelectedType(null);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} title={taskTitle || 'Nome da tarefa em grupo'}>
      {/* Collaborators */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Colaboradores</label>
        <input
          type="text"
          placeholder="Grupo, nome de usuário ou e-mail"
          className="w-full px-4 py-3 rounded-full bg-gray-100 border-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple mb-3"
        />
        <div className="flex gap-3">
          {['Você', 'Colab. 01', 'Colab. 02', 'Colab. 03'].map((name) => (
            <div key={name} className="flex flex-col items-center gap-1">
              <Avatar name={name} size="md" />
              <span className="text-xs text-gray-500">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Task type */}
      <div className="mb-8">
        <p className="text-sm font-medium text-gray-700 mb-3 text-center">Tipo da tarefa em grupo:</p>
        <div className="grid grid-cols-2 gap-3">
          {TASK_TYPES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedType(key)}
              className={`py-3 rounded-full border text-sm font-medium transition-colors ${
                selectedType === key
                  ? 'border-green-500 text-green-600 bg-green-50'
                  : 'border-gray-300 text-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedType}
        className="w-full py-4 rounded-full bg-gray-900 text-white font-semibold text-base disabled:opacity-50"
      >
        Avançar
      </button>
    </Sheet>
  );
}

import { useState } from 'react';
import { Image, Star, Users, Car, Home, Briefcase, Mail } from 'lucide-react';
import { Sheet } from './Sheet';
import { useCreateGroup } from '../api/groups';
import { Avatar } from './Avatar';

const ICONS = [
  { key: 'image', Icon: Image },
  { key: 'star', Icon: Star },
  { key: 'users', Icon: Users },
  { key: 'car', Icon: Car },
  { key: 'home', Icon: Home },
  { key: 'briefcase', Icon: Briefcase },
];

interface NewGroupSheetProps {
  open: boolean;
  onClose: () => void;
}

export function NewGroupSheet({ open, onClose }: NewGroupSheetProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('users');
  const [collaborator, setCollaborator] = useState('');
  const createGroup = useCreateGroup();

  async function handleSubmit() {
    if (!name.trim()) return;
    createGroup.mutate(
      { name: name.trim(), icon: selectedIcon },
      {
        onSuccess: () => {
          setName('');
          setSelectedIcon('users');
          setCollaborator('');
          onClose();
        },
      },
    );
  }

  return (
    <Sheet open={open} onClose={onClose} title="Novo Grupo">
      {/* Name */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">Nome do grupo</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Defina um nome para sua equipe!"
          className="w-full px-4 py-3 rounded-full bg-gray-100 border-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple"
        />
      </div>

      {/* Icon picker */}
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Personalizar ícone do grupo
        </label>
        <div className="flex gap-3">
          {ICONS.map(({ key, Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedIcon(key)}
              className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                selectedIcon === key
                  ? 'border-brand-purple bg-purple-50 text-brand-purple'
                  : 'border-gray-200 bg-gray-100 text-gray-500'
              }`}
            >
              <Icon size={20} />
            </button>
          ))}
        </div>
      </div>

      {/* Collaborators */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Colaboradores</label>
        <input
          type="text"
          value={collaborator}
          onChange={(e) => setCollaborator(e.target.value)}
          placeholder="Nome de usuário ou e-mail"
          className="w-full px-4 py-3 rounded-full bg-gray-100 border-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple mb-3"
        />

        <div className="flex gap-3 items-end">
          <div className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
              <Mail size={18} />
            </div>
            <span className="text-xs text-gray-500">Gerar convite</span>
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <Avatar name={`Colaborador ${String(i).padStart(2, '0')}`} size="md" />
              <span className="text-xs text-gray-500">Colab. {String(i).padStart(2, '0')}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!name.trim() || createGroup.isPending}
        className="w-full py-4 rounded-full bg-gray-900 text-white font-semibold text-base disabled:opacity-50"
      >
        {createGroup.isPending ? 'Criando...' : 'Avançar'}
      </button>
    </Sheet>
  );
}

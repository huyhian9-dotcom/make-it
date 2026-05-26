import { Users } from 'lucide-react';
import type { Group } from '@makeit/shared';
import { useNavigate } from 'react-router-dom';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/groups/${group.id}`)}
      className="flex flex-col items-center gap-1 w-16"
    >
      <div className="w-14 h-14 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500">
        <Users size={22} />
      </div>
      <span className="text-xs text-gray-600 text-center leading-tight truncate w-full">
        {group.name}
      </span>
    </button>
  );
}

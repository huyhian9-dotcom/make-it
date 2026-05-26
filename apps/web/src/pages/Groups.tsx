import { useState } from 'react';
import { Search, Plus } from 'lucide-react';
import { useGroups, useGroupTasks } from '../api/groups';
import { GroupCard } from '../components/GroupCard';
import { NewGroupSheet } from '../components/NewGroupSheet';
import { TaskCard } from '../components/TaskCard';
import { LabelChip } from '../components/LabelChip';
import { useUIStore } from '../store/ui';
import type { Task } from '@makeit/shared';

function GroupActivityFeed({ groups }: { groups: { id: string; name: string; color?: string }[] }) {
  // We fetch tasks for all groups and merge
  const groupQueries = groups.map((g) => ({
    // eslint-disable-next-line react-hooks/rules-of-hooks
    data: useGroupTasks(g.id).data ?? [],
    group: g,
  }));

  const items: Array<{ task: Task; groupName: string; groupColor: string }> = [];
  for (const { data, group } of groupQueries) {
    for (const task of data) {
      items.push({ task, groupName: group.name, groupColor: group.color ?? '#A78BFA' });
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        Nenhuma atividade em grupo ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map(({ task, groupName, groupColor }) => (
        <div key={task.id} className="relative">
          <div className="absolute top-0 right-0 z-10 m-1">
            <LabelChip name={groupName} color={groupColor} />
          </div>
          <TaskCard task={task} />
        </div>
      ))}
    </div>
  );
}

export function Groups() {
  const [search, setSearch] = useState('');
  const newGroupSheetOpen = useUIStore((s) => s.newGroupSheetOpen);
  const openNewGroupSheet = useUIStore((s) => s.openNewGroupSheet);
  const closeNewGroupSheet = useUIStore((s) => s.closeNewGroupSheet);

  const { data: groups = [], isLoading } = useGroups();

  const filtered = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const groupsForFeed = groups.map((g) => ({
    id: g.id,
    name: g.name,
    color: '#A78BFA',
  }));

  return (
    <div className="px-4 pt-8 pb-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Grupos</h1>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Colaboradores e Grupos"
          className="w-full pl-11 pr-4 py-3 rounded-full bg-gray-100 border-0 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-purple"
        />
      </div>

      {/* Your groups */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 font-medium mb-3">Seus grupos</p>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {/* New group button */}
          <button
            onClick={openNewGroupSheet}
            className="flex flex-col items-center gap-1 w-16 flex-shrink-0"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-blue-500">
              <Plus size={24} />
            </div>
            <span className="text-xs text-gray-500">Novo</span>
          </button>

          {isLoading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="w-16 flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 animate-pulse" />
                </div>
              ))
            : filtered.map((group) => (
                <div key={group.id} className="flex-shrink-0">
                  <GroupCard group={group} />
                </div>
              ))}
        </div>
      </div>

      {/* Activity feed */}
      <div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-700">Atividades em grupo</span>
          </div>
          <div className="p-3">
            {groups.length > 0 ? (
              <GroupActivityFeed groups={groupsForFeed} />
            ) : (
              <div className="text-center py-10 text-gray-400 text-sm">
                Entre ou crie um grupo para ver as atividades.
              </div>
            )}
          </div>
        </div>
      </div>

      <NewGroupSheet open={newGroupSheetOpen} onClose={closeNewGroupSheet} />
    </div>
  );
}

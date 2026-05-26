import { NavLink } from 'react-router-dom';
import { Sunrise, CalendarDays, Plus, Users, User } from 'lucide-react';
import { useUIStore } from '../store/ui';

export function BottomNav() {
  const openNewTaskSheet = useUIStore((s) => s.openNewTaskSheet);

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-40">
      <div className="bg-white border-t border-gray-100 shadow-lg px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <Sunrise size={22} />
          </NavLink>

          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <CalendarDays size={22} />
          </NavLink>

          {/* FAB */}
          <button
            onClick={openNewTaskSheet}
            className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:bg-gray-800 active:scale-95 transition-transform -mt-5"
            aria-label="Nova tarefa"
          >
            <Plus size={28} />
          </button>

          <NavLink
            to="/groups"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <Users size={22} />
          </NavLink>

          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 p-2 rounded-xl transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            <User size={22} />
          </NavLink>
        </div>
      </div>
    </div>
  );
}

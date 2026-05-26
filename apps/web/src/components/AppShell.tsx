import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { NewTaskSheet } from './NewTaskSheet';
import { useUIStore } from '../store/ui';

export function AppShell() {
  const newTaskSheetOpen = useUIStore((s) => s.newTaskSheetOpen);
  const closeNewTaskSheet = useUIStore((s) => s.closeNewTaskSheet);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen bg-white relative flex flex-col">
        <main className="flex-1 pb-20 overflow-y-auto">
          <Outlet />
        </main>
        <BottomNav />
        <NewTaskSheet open={newTaskSheetOpen} onClose={closeNewTaskSheet} />
      </div>
    </div>
  );
}

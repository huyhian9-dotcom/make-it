import { create } from 'zustand';

interface UIState {
  newTaskSheetOpen: boolean;
  newGroupSheetOpen: boolean;
  groupTaskSheetOpen: boolean;
  openNewTaskSheet: () => void;
  closeNewTaskSheet: () => void;
  openNewGroupSheet: () => void;
  closeNewGroupSheet: () => void;
  openGroupTaskSheet: () => void;
  closeGroupTaskSheet: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  newTaskSheetOpen: false,
  newGroupSheetOpen: false,
  groupTaskSheetOpen: false,
  openNewTaskSheet: () => set({ newTaskSheetOpen: true }),
  closeNewTaskSheet: () => set({ newTaskSheetOpen: false }),
  openNewGroupSheet: () => set({ newGroupSheetOpen: true }),
  closeNewGroupSheet: () => set({ newGroupSheetOpen: false }),
  openGroupTaskSheet: () => set({ groupTaskSheetOpen: true }),
  closeGroupTaskSheet: () => set({ groupTaskSheetOpen: false }),
}));

/**
 * Zustand store for UI state management
 * Handles modals, toasts, and general UI state
 */

import { create } from 'zustand';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface UiState {
  // Modal states
  isEmailViewerOpen: boolean;
  openEmailViewer: () => void;
  closeEmailViewer: () => void;
  isRecoveryOpen: boolean;
  openRecoveryModal: () => void;
  closeRecoveryModal: () => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;

  // Theme
  isDarkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
  toggleDarkMode: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  // Initial state
  isEmailViewerOpen: false,
  isRecoveryOpen: false,
  toasts: [],
  isDarkMode: false,

  // Email viewer modal
  openEmailViewer: () => set({ isEmailViewerOpen: true }),
  closeEmailViewer: () => set({ isEmailViewerOpen: false }),
  openRecoveryModal: () => set({ isRecoveryOpen: true }),
  closeRecoveryModal: () => set({ isRecoveryOpen: false }),

  // Toast notifications
  addToast: (toast) => {
    const id = `toast-${Date.now()}`;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto-remove toast after duration
    if (toast.duration !== 0) {
      const duration = toast.duration || 3000;
      setTimeout(() => {
        get().removeToast(id);
      }, duration);
    }
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  // Theme toggle
  setDarkMode: (isDark) => set({ isDarkMode: isDark }),
  toggleDarkMode: () => {
    set((state) => ({ isDarkMode: !state.isDarkMode }));
  },
}));

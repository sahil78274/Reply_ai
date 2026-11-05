import { create } from 'zustand';

export const useStore = create((set) => ({
  // Toasts
  toasts: [],
  addToast: (toast) =>
    set((state) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 6);
      return {
        toasts: [
          ...state.toasts,
          { id, createdAt: Date.now(), ...toast },
        ].slice(0, 10),
      };
    }),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  // Notifications
  notifications: [],
  unreadNotifications: 0,
  addNotification: (notif) =>
    set((state) => {
      const item = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        read: false,
        createdAt: new Date().toISOString(),
        ...notif,
      };
      return {
        notifications: [item, ...state.notifications].slice(0, 100),
        unreadNotifications: state.unreadNotifications + 1,
      };
    }),
  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadNotifications: 0,
    })),
  markRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadNotifications: Math.max(0, state.unreadNotifications - 1),
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  // UI
  soundEnabled: true,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  mobileDrawerOpen: false,
  setMobileDrawerOpen: (open) => set({ mobileDrawerOpen: open }),
  selectedConversationId: null,
  setSelectedConversation: (id) => set({ selectedConversationId: id }),
  demoMode: true,
  setDemoMode: (v) => set({ demoMode: v }),
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface GitlabInstance {
  id: string;
  name: string;
  url: string;
  token: string;
  active: boolean;
}

export type Role = 'admin' | 'manager' | 'viewer';

export interface LocalUser {
  id: string;
  name: string;
  role: Role;
}

interface AppState {
  instances: GitlabInstance[];
  currentUser: LocalUser | null;
  users: LocalUser[];
  getGitlabClient: () => { url: string; token: string } | null;
  addInstance: (instance: Omit<GitlabInstance, 'id' | 'active'>) => void;
  setActiveInstance: (id: string) => void;
  removeInstance: (id: string) => void;
  setCurrentUser: (user: LocalUser | null) => void;
  addUser: (name: string, role: Role) => void;
  updateUserRole: (id: string, role: Role) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      instances: [],
      currentUser: { id: 'local-admin', name: 'Admin User', role: 'admin' },
      users: [{ id: 'local-admin', name: 'Admin User', role: 'admin' }],
      getGitlabClient: () => {
        const active = get().instances.find((i) => i.active);
        return active ? { url: active.url, token: active.token } : null;
      },
      addInstance: (instance) =>
        set((state) => {
          const newInstance = {
            ...instance,
            id: crypto.randomUUID(),
            active: state.instances.length === 0,
          };
          return { instances: [...state.instances, newInstance] };
        }),
      setActiveInstance: (id) =>
        set((state) => ({
          instances: state.instances.map((i) => ({ ...i, active: i.id === id })),
        })),
      removeInstance: (id) =>
        set((state) => ({
          instances: state.instances.filter((i) => i.id !== id),
        })),
      setCurrentUser: (user) => set({ currentUser: user }),
      addUser: (name, role) =>
        set((state) => ({
          users: [...state.users, { id: crypto.randomUUID(), name, role }],
        })),
      updateUserRole: (id, role) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
        })),
    }),
    {
      name: 'gitlab-dashboard-storage',
    }
  )
);

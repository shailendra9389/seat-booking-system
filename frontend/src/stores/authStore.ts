import { create } from 'zustand';
import { authApi } from '../api';
import type { User } from '../types';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: { name: string; email: string; password: string; squadId: number; batchId: number; role?: string }) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    isLoading: false,

    login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
            const response = await authApi.login(email, password);
            const { user, accessToken, refreshToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    register: async (data) => {
        set({ isLoading: true });
        try {
            const response = await authApi.register(data);
            const { user, accessToken, refreshToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        try {
            await authApi.logout();
        } catch { }
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false });
    },

    loadUser: async () => {
        if (!localStorage.getItem('accessToken')) {
            set({ isAuthenticated: false });
            return;
        }
        set({ isLoading: true });
        try {
            const response = await authApi.getProfile();
            set({ user: response.data.data.user, isAuthenticated: true, isLoading: false });
        } catch {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    setUser: (user: User) => set({ user }),
}));

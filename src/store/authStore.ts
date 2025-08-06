// src/store/authSlice.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth API service
import { authService } from '../services/authService';

const useAuthStore = create(
    persist(
        (set, _get) => ({
            isAuthenticated: false,
            token: null,
            userId: null,
            user: null,
            isLoading: false,
            error: null,

            setAuthenticated: (authenticated: boolean, token: string, userId: string) => {
                set({
                    isAuthenticated: authenticated,
                    token,
                    userId,
                    error: null
                });

                if (authenticated && token) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('userId', userId);
                } else {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                }
            },

            login: async (credentials: any) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await authService.login(credentials);
                    set({
                        isAuthenticated: true,
                        token: response.token,
                        userId: response.user.id,
                        user: response.user,
                        isLoading: false
                    });
                    return response;
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.message || 'Login failed'
                    });
                    throw error;
                }
            },

            loginWithGoogle: async () => {
                // Google Sign-In not implemented in authService
                throw new Error('Google Sign-In not available');
            },

            loginWithApple: async () => {
                // Apple Sign-In not implemented in authService
                throw new Error('Apple Sign-In not available');
            },

            loginWithFacebook: async () => {
                // Facebook Sign-In not implemented in authService
                throw new Error('Facebook Sign-In not available');
            },

            signup: async (userData: any) => {
                set({ isLoading: true, error: null });
                try {
                    const userId = await authService.signup(userData);
                    set({
                        isAuthenticated: true,
                        userId,
                        isLoading: false
                    });
                    return userId;
                } catch (error: any) {
                    set({
                        isLoading: false,
                        error: error.message || 'Signup failed'
                    });
                    throw error;
                }
            },

            // Logout action
            logout: async () => {
                try {
                    await authService.logout();
                } catch (_error: any) {
                    console.error('Error during logout:', _error);
                } finally {
                    set({
                        isAuthenticated: false,
                        token: null,
                        userId: null,
                        user: null
                    });
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                }
            },

            checkAuth: async () => {
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');

                if (token && userId) {
                    try {
                        set({
                            isAuthenticated: true,
                            token,
                            userId
                        });
                        return true;
                    } catch {
                        localStorage.removeItem('token');
                        localStorage.removeItem('userId');
                        set({
                            isAuthenticated: false,
                            token: null,
                            userId: null
                        });
                        return false;
                    }
                }
                return false;
            }
        }),
        {
            name: 'auth-storage',
            partialize: (state: any) => ({
                isAuthenticated: state.isAuthenticated,
                token: state.token,
                userId: state.userId
            }),
        }
    )
);

export default useAuthStore;
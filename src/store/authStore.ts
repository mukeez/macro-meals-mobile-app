// src/store/authSlice.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Auth API service
import { authService } from '../services/authService';

const useAuthStore = create(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            token: null,
            userId: null,
            user: null,
            isLoading: false,
            error: null,

            setAuthenticated: (authenticated, token, userId) => {
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

            login: async (credentials) => {
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
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.message || 'Login failed'
                    });
                    throw error;
                }
            },

            loginWithGoogle: async () => {
                set({ isLoading: true, error: null });
                try {
                    const authData = await authService.googleSignIn();
                    set({
                        isAuthenticated: true,
                        token: authData.token,
                        userId: authData.user.id,
                        user: authData.user,
                        isLoading: false
                    });
                    return authData;
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.message || 'Google login failed'
                    });
                    throw error;
                }
            },

            loginWithApple: async () => {
                set({ isLoading: true, error: null });
                try {
                    const authData = await authService.appleSignIn();
                    set({
                        isAuthenticated: true,
                        token: authData.token,
                        userId: authData.user.id,
                        user: authData.user,
                        isLoading: false
                    });
                    return authData;
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.message || 'Apple login failed'
                    });
                    throw error;
                }
            },

            loginWithFacebook: async () => {
                set({ isLoading: true, error: null });
                try {
                    const authData = await authService.facebookSignIn();
                    set({
                        isAuthenticated: true,
                        token: authData.token,
                        userId: authData.user.id,
                        user: authData.user,
                        isLoading: false
                    });
                    return authData;
                } catch (error) {
                    set({
                        isLoading: false,
                        error: error.message || 'Facebook login failed'
                    });
                    throw error;
                }
            },

            signup: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const userId = await authService.signup(userData);
                    set({
                        isAuthenticated: true,
                        userId,
                        isLoading: false
                    });
                    return userId;
                } catch (error) {
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
                } catch (error) {
                    console.error('Error during logout:', error);
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
                    } catch (error) {
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
            partialize: (state) => ({
                isAuthenticated: state.isAuthenticated,
                token: state.token,
                userId: state.userId
            }),
        }
    )
);

export default useAuthStore;
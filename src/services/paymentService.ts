import useStore from "../store/useStore";
import axiosInstance from "./axios";

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';

export const paymentService = {
    getStripeConfig: async () => {
        try {
            const response = await axiosInstance.get('/billing/stripe-config');
            console.log('Stripe config response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Stripe config error:', error);
            throw error;
        }
    },

    getSubscriptionDetails: async () => {
        try {
            const response = await axiosInstance.get('/billing/subscription-details');
            return response.data;
        } catch (error: any) {
            
            // Extract detailed error message from backend
            let errorMessage = 'Failed to load subscription details';
            
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.statusText) {
                errorMessage = `${error.response.statusText} (${error.response.status})`;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            throw new Error(errorMessage);
        }
    },

    cancelSubscription: async (subscriptionId: string, status: string) => {
        try {
            const requestData = {
                cancel_at_period_end: true,
                status,
                subscription_id: subscriptionId
            };
            const response = await axiosInstance.delete('/billing/cancel', {
                data: requestData
            });
            return response.data;
        } catch (error: any) {
            
            // Extract detailed error message from backend
            let errorMessage = 'Failed to cancel subscription';
            
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.statusText) {
                errorMessage = `${error.response.statusText} (${error.response.status})`;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            throw new Error(errorMessage);
        }
    },

    reactivateSubscription: async (subscriptionId?: string) => {
        try {
            const payload = subscriptionId ? { subscription_id: subscriptionId } : {};
            const response = await axiosInstance.post('/billing/reactivate-subscription', payload);
            return response.data;
        } catch (error: any) {
            
            // Extract detailed error message from backend
            let errorMessage = 'Failed to reactivate subscription';
            
            if (error.response?.data?.detail) {
                errorMessage = error.response.data.detail;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.statusText) {
                errorMessage = `${error.response.statusText} (${error.response.status})`;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            throw new Error(errorMessage);
        }
    },

    // createSetupIntent: async () => {
    //     const response = await axiosInstance.post('/billing/create-setup-intent');
    //     return response.data;
    // },

    checkout: async (email: string, plan: string, userId: string) => {
        try {
            const response = await axiosInstance.post('/billing/checkout', {
                email,
                plan,
                user_id: userId
            });
            return response.data;
        } catch (error) {
            console.error('Checkout error:', error);
            throw error;
        }
    },

    createPaymentIntent: async (email: string, user_id: string, plan: string) => {
        try {
            const response = await axiosInstance.post('/billing/create-setup-intent', {
                    email,
                    user_id,
                    plan 
                });

            console.log('Payment intent response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Payment intent error:', error);
            throw error;
        }
    }
}
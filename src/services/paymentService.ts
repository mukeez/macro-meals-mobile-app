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
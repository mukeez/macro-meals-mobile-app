import useStore from "../store/useStore";

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';

export const paymentService = {
    getStripeConfig: async () => {
        const token = useStore.getState().token;
        try {
        const response = await fetch(`${API_BASE_URL}/billing/stripe-config`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
            
        if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Stripe config error:', { status: response.status, data: errorData });
                throw new Error(`Failed to fetch stripe config: ${response.status}`);
        }
            
            const data = await response.json();
            console.log('Stripe config response:', data);
            return data;
        } catch (error) {
            console.error('Stripe config error:', error);
            throw error;
        }
    },

    // createSetupIntent: async () => {
    //     const token = useStore.getState().token;
    //     const response = await fetch(`${API_BASE_URL}/billing/create-setup-intent`, {
    //         method: 'POST',
    //         headers: {
    //             'Authorization': `Bearer ${token}`,
    //             'Content-Type': 'application/json'
    //         }
    //     });
    //     if (!response.ok) {
    //         throw new Error('Failed to create setup intent');
    //     }
    //     return response.json();
    // },

    createPaymentIntent: async (email: string, user_id: string, plan: string) => {
        const token = useStore.getState().token;
        try {
        const response = await fetch(`${API_BASE_URL}/billing/create-setup-intent`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
                body: JSON.stringify({ email, user_id, plan })
        });

        if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Payment intent error:', { 
                    status: response.status, 
                    data: errorData,
                    email,
                    user_id,
                    plan 
                });
                throw new Error(`Failed to create payment intent: ${response.status}`);
        }

            const data = await response.json();
            console.log('Payment intent response:', data);
            return data;
        } catch (error) {
            console.error('Payment intent error:', error);
            throw error;
        }
    }
}
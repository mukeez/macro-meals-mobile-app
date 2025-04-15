import useStore from "../store/useStore";

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';

class ScanService {
    async scanBarcode(barcode: string) {
        try {
            const authToken = useStore.getState().token;

            // Send barcode in the request body
            const response = await fetch(`${API_BASE_URL}/scan/barcode`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ barcode })  // Send barcode in the body
            });
            console.log(barcode)

            // console.log(response)

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to scan barcode');
            }

            return await response.json();
        } catch (error) {
            console.error('Barcode scan error:', error);
            throw error;
        }
    }

    async scanImage(imageUri: string) {
        try {
            const authToken = useStore.getState().token;

            // Create FormData for image upload
            const formData = new FormData();
            formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'food_image.jpg'
            } as any);

            const response = await fetch(`${API_BASE_URL}/scan/image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'multipart/form-data'
                },
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Failed to scan image');
            }

            return await response.json();
        } catch (error) {
            throw error;
        }
    }
}

export const scanService = new ScanService();
import useStore from "../store/useStore";


const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';


class ScanService {
    /**
     * Scan a barcode to retrieve product information
     * @param barcode The barcode number to scan
     * @param authToken Authentication token
     * @returns Promise resolving to product information
     */

    async scanBarcode(barcode: string, authToken: string) {
        try {
            const authToken = useStore.getState().token;
            const response = await fetch(`${API_BASE_URL}/scan/barcode`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ barcode })
            });

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

    /**
     * Scan an image to retrieve food item information
     * @param imageUri URI of the image to scan
     * @param authToken Authentication token
     * @returns Promise resolving to food item information
     */
    async scanImage(imageUri: string, authToken: string) {
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
            console.error('Image scan error:', error);
            throw error;
        }
    }
}

// Export a singleton instance
export const scanService = new ScanService();
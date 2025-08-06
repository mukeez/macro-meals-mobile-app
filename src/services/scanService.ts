
import axiosInstance from "./axios";

class ScanService {
    async scanBarcode(barcode: string) {
        try {
            // Send barcode in the request body
            const response = await axiosInstance.post('/scan/barcode', { barcode });

            return {
                success: true,
                data: response.data,
                barcode
            };
        } catch (error: any) {
            console.error('Barcode scan error:', error);
            return {
                success: false,
                error: error.response?.data?.detail || error.message || 'Unknown error occurred',
                barcode
            };
        }
    }

    async scanImage(imageUri: string) {
        // Create FormData for image upload
        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'food_image.jpg'
        } as any);

        const response = await axiosInstance.post('/scan/image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        return response.data;
    }
}

export const scanService = new ScanService();
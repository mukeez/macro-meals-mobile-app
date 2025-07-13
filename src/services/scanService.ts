import useStore from "../store/useStore";
import axiosInstance from "./axios";

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.macromealsapp.com/api/v1';

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
        try {
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
        } catch (error) {
            throw error;
        }
    }
}

export const scanService = new ScanService();
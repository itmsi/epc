import { apiPost, apiGet, ApiResponse, apiPut, apiDelete } from '@/helpers/apiHelper';
import { 
    VinCustomerVehicleFormData, 
    VinCustomerVehicleApiResponse,
    VinCustomerListRequest,
    VinCustomerListResponse,
    VinCustomerDetailResponse,
    VinCustomerUpdatePayload,
    VinCustomerUpdateResponse,
    VinCustomerDeleteResponse
} from '../types/vinCustomerVehicle';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class VinCustomerVehicleService {
    // Get VIN Customer List
    static async getVinCustomerList(params: Partial<VinCustomerListRequest> = {}): Promise<VinCustomerListResponse> {
        const defaultParams: VinCustomerListRequest = {
            page: 1,
            limit: 10,
            sort_order: 'desc',
            search: '',
            ...params
        };
        
        const response = await apiPost(`${API_BASE_URL}/epc/vin_customer`, defaultParams as unknown as Record<string, unknown>);
        return response.data as VinCustomerListResponse;
    }

    // Get VIN Customer Detail
    static async getVinCustomerDetail(customerId: string): Promise<VinCustomerDetailResponse> {
        const response = await apiGet(`${API_BASE_URL}/epc/vin_customer/${customerId}`);
        return response.data as VinCustomerDetailResponse;
    }

    // Create VIN Customer Vehicle
    static async createVinCustomerVehicle(formData: VinCustomerVehicleFormData): Promise<ApiResponse<VinCustomerVehicleApiResponse>> {
        const payload = {
            customer_id: formData.customer_id,
            product_ids: formData.product_ids
        };

        return await apiPost<VinCustomerVehicleApiResponse>(`${API_BASE_URL}/epc/vin_customer/create`, payload);
    }

    // Update VIN Customer Vehicle
    static async updateVinCustomerVehicle(customerId: string, productIds: string[]): Promise<VinCustomerUpdateResponse> {
        const payload: VinCustomerUpdatePayload = {
            customer_id: customerId,
            product_ids: productIds
        };
        
        const response = await apiPut(`${API_BASE_URL}/epc/vin_customer/${customerId}`, payload as unknown as Record<string, unknown>);
        return response.data as VinCustomerUpdateResponse;
    }

    // Delete VIN Customer Vehicle
    static async deleteVinCustomerVehicle(customerId: string): Promise<VinCustomerDeleteResponse> {
        const response = await apiDelete(`${API_BASE_URL}/epc/vin_customer/${customerId}`);
        return response.data as VinCustomerDeleteResponse;
    }
}
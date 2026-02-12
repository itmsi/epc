import { apiPost, ApiResponse } from '@/helpers/apiHelper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Types for VIN Search - Based on actual API response
export interface VinSearchRequest {
    search: string;
    customer_id: string;
    limit?: number;
}

// Actual API response structure
export interface VinSearchData {
    product_id: string;
    product_name_en: string;
    product_name_cn: string;
    product_description: string;
    vin_number: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
    model_type: string | null;
    dimensi: string | null;
    model_engine: string | null;
}

export interface VinSearchResponse {
    success: boolean;
    message: string;
    data: {
        items: VinSearchData[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

// VIN Detail Category Types
export interface VinCategoryItem {
    master_category_id: string;
    master_category_name_en: string;
}

export interface VinDetailData {
    data_vin: {
        product_id: string;
        vin_number: string;
        product_name_en: string;
        product_name_cn: string;
        product_description: string;
    };
    items: VinCategoryItem[];
}

export interface VinDetailResponse {
    success: boolean;
    message: string;
    data: VinDetailData;
    timestamp: string;
}

export interface VinDetailRequest {
    vin_number: string;
    customer_id: string;
}

// VIN Search Service
export class VinSearchService {
    /**
     * Search for parts by VIN number
     * @param searchQuery - VIN number or search query
     * @param customerId - Customer ID from auth_user
     * @param limit - Items per page (default: 100)
     */
    static async searchByVin(
        searchQuery: string,
        customerId: string,
        limit: number = 100
    ): Promise<ApiResponse<VinSearchResponse>> {
        const payload: Record<string, unknown> = {
            search: searchQuery,
            customer_id: customerId,
            limit: limit
        };

        return await apiPost<VinSearchResponse>(
            `${API_BASE_URL}/epc/parts-catalogs/vin/get`,
            payload
        );
    }

    /**
     * Get VIN detail with categories by VIN number
     * @param vinNumber - VIN number
     * @param customerId - Customer ID from auth_user
     */
    static async getVinDetail(
        vinNumber: string,
        customerId: string
    ): Promise<ApiResponse<VinDetailResponse>> {
        const payload: Record<string, unknown> = {
            vin_number: vinNumber,
            customer_id: customerId
        };

        return await apiPost<VinDetailResponse>(
            `${API_BASE_URL}/epc/parts-catalogs/vin/category-by-vin`,
            payload
        );
    }
}

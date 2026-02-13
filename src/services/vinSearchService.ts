import { apiPost, apiGet, apiPut, ApiResponse } from '@/helpers/apiHelper';

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

// VIN Management Types
export interface VinManagementRequest {
    search?: string;
    customer_id: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
}

export interface VinManagementItem {
    product_id: string;
    product_name_en: string;
    product_name_cn: string;
    product_description: string;
    vin_number: string;
    body_number: string | null;
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

export interface VinManagementResponse {
    success: boolean;
    message: string;
    data: {
        items: VinManagementItem[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
}

// VIN Detail Maintenance Types
export interface VinDetailMaintenanceRequest {
    product_id: string;
    customer_id: string;
}

export interface MaintenanceActivity {
    id: string;
    service_date: string;
    service_type: 'repair' | 'inspection' | 'overhaul' | 'routine';
    title: string;
    description: string;
    technician: string;
    service_id: string;
}

export interface PartReplacement {
    date: string;
    part_number: string;
    description: string;
    quantity: number;
}

export interface VinDetailAPIResponse {
    product_id: string;
    product_name_en: string;
    product_name_cn: string;
    product_description: string;
    vin_number: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
    deleted_at: null | string;
    deleted_by: null | string;
    is_delete: boolean;
    model_type: null | string;
    dimensi: null | string;
    model_engine: null | string;
    body_number: null | string;
}

export interface VinAPIResponseWrapper<T> {
    success: boolean;
    message: string;
    data: T;
    timestamp?: string;
}

export interface VinDetailMaintenanceResponse {
    success: boolean;
    message: string;
    data: VinDetailAPIResponse;
    // Extended properties for UI (will be mocked/merged)
    kpi?: {
        last_service_days: number;
        parts_replaced_count: number;
        next_inspection_date: string;
        health_index: number;
    };
    maintenance_activities?: MaintenanceActivity[];
    part_replacements?: PartReplacement[];
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

    /**
     * Get VIN Management list with pagination, search, and sorting
     * @param request - VIN Management request parameters
     */
    static async getVinManagement(
        request: VinManagementRequest
    ): Promise<ApiResponse<VinManagementResponse>> {
        const payload: Record<string, unknown> = {
            customer_id: request.customer_id,
            page: request.page || 1,
            limit: request.limit || 10,
            sort_by: request.sort_by || 'created_at',
            sort_order: request.sort_order || 'desc'
        };

        // Only add search if provided
        if (request.search && request.search.trim()) {
            payload.search = request.search.trim();
        }

        return await apiPost<VinManagementResponse>(
            `${API_BASE_URL}/epc/parts-catalogs/vin/get`,
            payload
        );
    }

    /**
     * Get VIN detail with maintenance history (mock data for now)
     */
    static async getVinDetailMaintenance(
        request: VinDetailMaintenanceRequest
    ): Promise<ApiResponse<VinDetailMaintenanceResponse>> {
        try {
            // Call the actual API endpoint
            // Note: Using product_id as the ID parameter
            const response = await apiGet<VinAPIResponseWrapper<VinDetailAPIResponse>>(
                `${API_BASE_URL}/epc/parts-catalogs/vin/get/${request.product_id}`
            );

            if (!response.data || !response.data.data) {
                // If direct VIN fetch fails
                return {
                    data: null as any,
                    status: response.status,
                    message: response.data?.message || 'Failed to fetch VIN details'
                };
            }

            const apiData = response.data.data;
            // Return success response with mock maintenance data
            return {
                status: response.status,
                message: response.data.message,
                data: {
                    success: true,
                    message: response.data.message || 'Success',
                    data: apiData,
                    // Mock data for UI development
                    kpi: {
                        last_service_days: 14,
                        parts_replaced_count: 3,
                        next_inspection_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        health_index: 85
                    },
                    maintenance_activities: [],
                    part_replacements: []
                }
            };

        } catch (error) {
            throw error;
        }
    }

    /**
     * Update VIN Body Number
     */
    static async updateVinBodyNumber(
        productId: string,
        bodyNumber: string
    ): Promise<ApiResponse<VinAPIResponseWrapper<VinDetailAPIResponse>>> {
        const payload = {
            body_number: bodyNumber
        };

        return await apiPut<VinAPIResponseWrapper<VinDetailAPIResponse>>(
            `${API_BASE_URL}/epc/parts-catalogs/vin/get/${productId}`,
            payload
        );
    }
}

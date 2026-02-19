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
    dokumen_ids: Array<{
        dokumen_id: string;
    }>;
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
    status?: string;
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
    status: string | null;
    updated_by_name: string | null;
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
    status: string | null;
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

        if (request.status && request.status.trim()) {
            payload.status = request.status.trim();
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
                    maintenance_activities: [
                        {
                            id: '1',
                            service_date: '2026-01-15',
                            service_type: 'routine',
                            title: 'Routine Maintenance 500H',
                            description: 'Standard 500-hour service check. Oil change, filter replacement, and general inspection.',
                            technician: 'Ahmad Supriyadi',
                            service_id: 'SVC-2026-001'
                        },
                        {
                            id: '2',
                            service_date: '2025-11-20',
                            service_type: 'repair',
                            title: 'Hydraulic System Repair',
                            description: 'Fixed leak in main hydraulic cylinder. Replaced seals and tested system pressure.',
                            technician: 'Budi Santoso',
                            service_id: 'SVC-2025-089'
                        },
                        {
                            id: '3',
                            service_date: '2025-09-10',
                            service_type: 'inspection',
                            title: 'Quarterly Inspection',
                            description: 'Comprehensive safety and performance inspection. All systems nominal.',
                            technician: 'Cahyo Wibowo',
                            service_id: 'SVC-2025-065'
                        },
                        {
                            id: '4',
                            service_date: '2025-06-05',
                            service_type: 'overhaul',
                            title: 'Engine Overhaul',
                            description: 'Major engine overhaul due to performance drop. Replaced piston rings and gaskets.',
                            technician: 'Dedi Kurniawan',
                            service_id: 'SVC-2025-042'
                        }
                    ],
                    part_replacements: [
                         {
                            date: '2026-01-15',
                            part_number: '612600081334',
                            description: 'Fuel Filter Element',
                            quantity: 1
                        },
                        {
                            date: '2026-01-15',
                            part_number: '1000424916',
                            description: 'Oil Filter',
                            quantity: 1
                        },
                        {
                            date: '2025-11-20',
                            part_number: '612630010055',
                            description: 'Cylinder Head Gasket',
                            quantity: 2
                        },
                        {
                            date: '2025-11-20',
                            part_number: 'DZ9112340062',
                            description: 'Hydraulic Seal Kit',
                            quantity: 1
                        },
                        {
                            date: '2025-06-05',
                            part_number: '61500010334',
                            description: 'Piston Ring Set',
                            quantity: 6
                        }
                    ]
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
        bodyNumber: string,
        status?: string
    ): Promise<ApiResponse<VinAPIResponseWrapper<VinDetailAPIResponse>>> {
        const payload: Record<string, unknown> = {
            body_number: bodyNumber
        };

        if (status !== undefined) {
            payload.status = status;
        }

        return await apiPut<VinAPIResponseWrapper<VinDetailAPIResponse>>(
            `${API_BASE_URL}/epc/parts-catalogs/vin/get/${productId}`,
            payload
        );
    }
}

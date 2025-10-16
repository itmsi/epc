// Service untuk pagination API calls untuk part catalogue
// Menggunakan service yang sudah ada dari partCatalogueService
import { 
    CabinService, 
    EngineService, 
    AxleService, 
    TransmissionService, 
    SteeringService 
} from '@/services/partCatalogueService';

interface PaginationResponse<T> {
    data: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

// Fetch Cabins with pagination
export const fetchAllCabins = async (
    page: number = 1, 
    pageSize: number = 10,
    search?: string
): Promise<PaginationResponse<any>> => {
    try {
        const response = await CabinService.getCabins(page, pageSize, { search });
        
        // Response dari CabinService sudah dalam format yang benar
        const responseData = response.data?.data || {};
        
        return {
            data: responseData.items || [],
            totalItems: responseData.pagination?.total || 0,
            totalPages: responseData.pagination?.totalPages || 0,
            currentPage: responseData.pagination?.page || page,
            hasNextPage: page < (responseData.pagination?.totalPages || 0),
            hasPrevPage: page > 1
        };
    } catch (error) {
        console.error('Error fetching paginated cabins:', error);
        return {
            data: [],
            totalItems: 0,
            totalPages: 0,
            currentPage: page,
            hasNextPage: false,
            hasPrevPage: false
        };
    }
};

// Fetch Engines with pagination
export const fetchAllEngines = async (
    page: number = 1, 
    pageSize: number = 10,
    search?: string
): Promise<PaginationResponse<any>> => {
    try {
        const response = await EngineService.getEngines(page, pageSize, { search });
        
        // Response dari EngineService sudah dalam format yang benar
        const responseData = response.data?.data || {};
        
        return {
            data: responseData.items || [],
            totalItems: responseData.pagination?.total || 0,
            totalPages: responseData.pagination?.totalPages || 0,
            currentPage: responseData.pagination?.page || page,
            hasNextPage: page < (responseData.pagination?.totalPages || 0),
            hasPrevPage: page > 1
        };
    } catch (error) {
        console.error('Error fetching paginated engines:', error);
        return {
            data: [],
            totalItems: 0,
            totalPages: 0,
            currentPage: page,
            hasNextPage: false,
            hasPrevPage: false
        };
    }
};

// Fetch Axles with pagination
export const fetchAllAxles = async (
    page: number = 1, 
    pageSize: number = 10,
    search?: string
): Promise<PaginationResponse<any>> => {
    try {
        const response = await AxleService.getAxles(page, pageSize, { search });
        
        // Response dari AxleService sudah dalam format yang benar
        const responseData = response.data?.data || {};
        
        return {
            data: responseData.items || [],
            totalItems: responseData.pagination?.total || 0,
            totalPages: responseData.pagination?.totalPages || 0,
            currentPage: responseData.pagination?.page || page,
            hasNextPage: page < (responseData.pagination?.totalPages || 0),
            hasPrevPage: page > 1
        };
    } catch (error) {
        console.error('Error fetching paginated axles:', error);
        return {
            data: [],
            totalItems: 0,
            totalPages: 0,
            currentPage: page,
            hasNextPage: false,
            hasPrevPage: false
        };
    }
};

// Fetch Transmissions with pagination
export const fetchAllTransmissions = async (
    page: number = 1, 
    pageSize: number = 10,
    search?: string
): Promise<PaginationResponse<any>> => {
    try {
        const response = await TransmissionService.getTransmissions(page, pageSize, { search });
        
        // Response dari TransmissionService sudah dalam format yang benar
        const responseData = response.data?.data || {};
        
        return {
            data: responseData.items || [],
            totalItems: responseData.pagination?.total || 0,
            totalPages: responseData.pagination?.totalPages || 0,
            currentPage: responseData.pagination?.page || page,
            hasNextPage: page < (responseData.pagination?.totalPages || 0),
            hasPrevPage: page > 1
        };
    } catch (error) {
        console.error('Error fetching paginated transmissions:', error);
        return {
            data: [],
            totalItems: 0,
            totalPages: 0,
            currentPage: page,
            hasNextPage: false,
            hasPrevPage: false
        };
    }
};

// Fetch Steerings with pagination
export const fetchAllSteerings = async (
    page: number = 1, 
    pageSize: number = 10,
    search?: string
): Promise<PaginationResponse<any>> => {
    try {
        const response = await SteeringService.getSteerings(page, pageSize, { search });
        
        // Response dari SteeringService sudah dalam format yang benar
        const responseData = response.data?.data || {};
        
        return {
            data: responseData.items || [],
            totalItems: responseData.pagination?.total || 0,
            totalPages: responseData.pagination?.totalPages || 0,
            currentPage: responseData.pagination?.page || page,
            hasNextPage: page < (responseData.pagination?.totalPages || 0),
            hasPrevPage: page > 1
        };
    } catch (error) {
        console.error('Error fetching paginated steerings:', error);
        return {
            data: [],
            totalItems: 0,
            totalPages: 0,
            currentPage: page,
            hasNextPage: false,
            hasPrevPage: false
        };
    }
};

// Generic function untuk semua part types
export const fetchPartsPaginated = async (
    partType: string,
    page: number = 1,
    pageSize: number = 20,
    search?: string
): Promise<PaginationResponse<any>> => {
    switch (partType) {
        case 'cabin':
            return fetchAllCabins(page, pageSize, search);
        case 'engine':
            return fetchAllEngines(page, pageSize, search);
        case 'axle':
            return fetchAllAxles(page, pageSize, search);
        case 'transmission':
            return fetchAllTransmissions(page, pageSize, search);
        case 'steering':
            return fetchAllSteerings(page, pageSize, search);
        default:
            return {
                data: [],
                totalItems: 0,
                totalPages: 0,
                currentPage: page,
                hasNextPage: false,
                hasPrevPage: false
            };
    }
};
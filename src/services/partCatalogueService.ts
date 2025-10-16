import { apiDelete, apiGet, apiPost, apiPut, ApiResponse } from '@/helpers/apiHelper';
import { 
  Cabin,
  CabinFormData, 
  CabinApiResponse, 
  CabinFilters,
  Engine,
  EngineFormData, 
  EngineApiResponse, 
  EngineFilters,
  AxleApiResponse,
  AxleFilters,
  AxleFormData,
  Axle,
  TransmissionFilters,
  TransmissionApiResponse,
  TransmissionFormData,
  Transmission,
  SteeringFilters,
  SteeringApiResponse,
  SteeringFormData,
  Steering,
} from '@/types/partCatalogue';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Cabin Services
export class CabinService {
    // Fetch cabins with pagination and filters
    static async getCabins(
        page: number = 1, 
        limit: number = 10, 
        filters: Partial<CabinFilters> = {}
    ): Promise<ApiResponse<CabinApiResponse>> {
        const payload = {
            page,
            limit,
            search: filters.search || '',
            sort_order: filters.sort_order || 'desc'
        };

        return await apiPost<CabinApiResponse>(`${API_BASE_URL}/catalogs/cabines/get`, payload);
    }

    // Create new cabin
    static async createCabin(formData: CabinFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            cabines_name_en: formData.cabines_name_en,
            cabines_name_cn: formData.cabines_name_cn,
            cabines_description: formData.cabines_description,
            type_cabines: formData.type_cabines || []
        };
        
        return await apiPost<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/cabines/create`, payload);
    }

    // Get existing cabin by ID
    static async getCabinById(cabinId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Cabin }>> {
        return await apiGet<{ success: boolean; message: string; data: Cabin }>(`${API_BASE_URL}/catalogs/cabines/${cabinId}`, { cabines_id: cabinId });
    }

    // Update existing cabin
    static async updateCabin(cabinId: string, formData: CabinFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            cabines_id: cabinId,
            cabines_name_en: formData.cabines_name_en,
            cabines_name_cn: formData.cabines_name_cn,
            cabines_description: formData.cabines_description,
            type_cabines: formData.type_cabines || []
        };
        
        return await apiPut<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/cabines/${cabinId}`, payload);
    }

    // Delete cabin
    static async deleteCabin(cabinId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/cabines/${cabinId}`);
    }
}

// Engine Services
export class EngineService {
    // Fetch engines with pagination and filters
    static async getEngines(
        page: number = 1, 
        limit: number = 10, 
        filters: Partial<EngineFilters> = {}
    ): Promise<ApiResponse<EngineApiResponse>> {
        const payload = {
            page,
            limit,
            search: filters.search || '',
            sort_order: filters.sort_order || 'desc'
        };

        return await apiPost<EngineApiResponse>(`${API_BASE_URL}/catalogs/engines/get`, payload);
    }

    // Create new engine
    static async createEngine(formData: EngineFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            engines_name_en: formData.engines_name_en,
            engines_name_cn: formData.engines_name_cn,
            engines_description: formData.engines_description,
            type_engines: formData.type_engines || []
        };

        return await apiPost<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/engines/create`, payload);
    }

    // Get existing engine by ID
    static async getEngineById(engineId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Engine }>> {
        return await apiGet<{ success: boolean; message: string; data: Engine }>(`${API_BASE_URL}/catalogs/engines/${engineId}`, { engines_id: engineId });
    }

    // Update existing engine
    static async updateEngine(engineId: string, formData: EngineFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            engines_id: engineId,
            engines_name_en: formData.engines_name_en,
            engines_name_cn: formData.engines_name_cn,
            engines_description: formData.engines_description,
            type_engines: formData.type_engines || []
        };

        return await apiPut<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/engines/${engineId}`, payload);
    }

    // Delete engine
    static async deleteEngine(engineId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/engines/${engineId}`);
    }
}

// Axle Services
export class AxleService {
    // Fetch axles with pagination and filters
    static async getAxles(
        page: number = 1,
        limit: number = 10,
        filters: Partial<AxleFilters> = {}
    ): Promise<ApiResponse<AxleApiResponse>> {
        const payload = {
            page,
            limit,
            search: filters.search || '',
            sort_order: filters.sort_order || 'desc'
        };

        return await apiPost<AxleApiResponse>(`${API_BASE_URL}/catalogs/axel/get`, payload);
    }

    // Create new axel
    static async createAxle(formData: AxleFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            axel_name_en: formData.axel_name_en,
            axel_name_cn: formData.axel_name_cn,
            axel_description: formData.axel_description,
            type_axels: formData.type_axels || []
        };

        return await apiPost<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/axel/create`, payload);
    }

    // Get existing axel by ID
    static async getAxelById(axelId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Axle }>> {
        return await apiGet<{ success: boolean; message: string; data: Axle }>(`${API_BASE_URL}/catalogs/axel/${axelId}`, { axels_id: axelId });
    }

    // Update existing axel
    static async updateAxle(axelId: string, formData: AxleFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            axel_name_en: formData.axel_name_en,
            axel_name_cn: formData.axel_name_cn,
            axel_description: formData.axel_description,
            type_axels: formData.type_axels || []
        };
        console.log({
            payload
        });
        
        return await apiPut<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/axel/${axelId}`, payload);
    }

    // Delete axel
    static async deleteAxle(axelId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/axel/${axelId}`);
    }
}
// Transmission Services
export class TransmissionService {
    // Fetch transmissions with pagination and filters
    static async getTransmissions(
        page: number = 1,
        limit: number = 10,
        filters: Partial<TransmissionFilters> = {}
    ): Promise<ApiResponse<TransmissionApiResponse>> {
        const payload = {
            page,
            limit,
            search: filters.search || '',
            sort_order: filters.sort_order || 'desc'
        };

        return await apiPost<TransmissionApiResponse>(`${API_BASE_URL}/catalogs/transmission/get`, payload);
    }

    // Create new transmission
    static async createTransmission(formData: TransmissionFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            transmission_name_en: formData.transmission_name_en,
            transmission_name_cn: formData.transmission_name_cn,
            transmission_description: formData.transmission_description,
            type_transmissions: formData.type_transmissions || []
        };

        return await apiPost<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/transmission/create`, payload);
    }

    // Get existing transmission by ID
    static async getTransmissionById(transmissionId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Transmission }>> {
        return await apiGet<{ success: boolean; message: string; data: Transmission }>(`${API_BASE_URL}/catalogs/transmission/${transmissionId}`, { transmission_id: transmissionId });
    }

    // Update existing transmission
    static async updateTransmission(transmissionId: string, formData: TransmissionFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            transmission_id: transmissionId,
            transmission_name_en: formData.transmission_name_en,
            transmission_name_cn: formData.transmission_name_cn,
            transmission_description: formData.transmission_description,
            type_transmissions: formData.type_transmissions || []
        };

        return await apiPut<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/transmission/${transmissionId}`, payload);
    }

    // Delete transmission
    static async deleteTransmission(transmissionId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/transmission/${transmissionId}`);
    }
}
// Steering Services
export class SteeringService {
    // Fetch steerings with pagination and filters
    static async getSteerings(
        page: number = 1,
        limit: number = 10,
        filters: Partial<SteeringFilters> = {}
    ): Promise<ApiResponse<SteeringApiResponse>> {
        const payload = {
            page,
            limit,
            search: filters.search || '',
            sort_order: filters.sort_order || 'desc'
        };

        return await apiPost<SteeringApiResponse>(`${API_BASE_URL}/catalogs/steering/get`, payload);
    }

    // Create new steering
    static async createSteering(formData: SteeringFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            steering_name_en: formData.steering_name_en,
            steering_name_cn: formData.steering_name_cn,
            steering_description: formData.steering_description,
            type_steerings: formData.type_steerings || []
        };

        return await apiPost<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/steering/create`, payload);
    }

    // Get existing steering by ID
    static async getSteeringById(steeringId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Steering }>> {
        return await apiGet<{ success: boolean; message: string; data: Steering }>(`${API_BASE_URL}/catalogs/steering/${steeringId}`);
    }

    // Update existing steering
    static async updateSteering(steeringId: string, formData: SteeringFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            steering_id: steeringId,
            steering_name_en: formData.steering_name_en,
            steering_name_cn: formData.steering_name_cn,
            steering_description: formData.steering_description,
            type_steerings: formData.type_steerings || []
        };

        return await apiPut<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/steering/${steeringId}`, payload);
    }

    // Delete steering
    static async deleteSteering(steeringId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/steering/${steeringId}`);
    }
}

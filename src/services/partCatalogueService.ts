import { apiDelete, apiGet, apiPost, apiPut, ApiResponse, apiPostMultipart, apiPutMultipart } from '@/helpers/apiHelper';
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
  CatalogDataItem,
  Vin,
  VinFormData,
  VinApiResponse,
  VinFilters,
  MasterBookApiResponse,
  MasterPdf
} from '@/types/partCatalogue';
import { CatalogsListRequest, ManageCatalogsResponse, PartCatalogueFormData, PartItem, EditCatalogResponse } from '@/types/asyncSelect';

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
export class CatalogManageService {

    private static transformPartsToDataItems(parts: PartItem[]): CatalogDataItem[] {
        return parts.map(part => ({
            target_id: part.part_target,
            diagram_serial_number: '', 
            part_number: part.code_product,
            catalog_item_name_en: part.name_english,
            catalog_item_name_ch: part.name_chinese,
            description: '', 
            quantity: part.quantity
        }));
    }

    static async createCatalog(formData: PartCatalogueFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        const formDataPayload = new FormData();

        // Add required fields
        formDataPayload.append('name_pdf', formData.code_cabin);
        formDataPayload.append('master_catalog', formData.part_type);
        formDataPayload.append('master_category_id', formData.part_id);
        formDataPayload.append('type_category_id', formData.type_id);
        formDataPayload.append('use_csv', formData.use_csv_upload.toString());
        
        // Handle SVG image file - send empty string if no file uploaded
        if (formData.svg_image) {
            formDataPayload.append('file_foto', formData.svg_image);
        } else {
            formDataPayload.append('file_foto', '');
        }
        
        // Transform and add data_items as JSON string
        const dataItems = this.transformPartsToDataItems(formData.parts);
        formDataPayload.append('data_items', JSON.stringify(dataItems));

        // Handle CSV file - only append if exists
        if (formData.csv_file) {
            formDataPayload.append('file_csv', formData.csv_file);
        }
        
        return await apiPostMultipart<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/all-item-catalogs/create`, formDataPayload);
    }

    static async getItems(params: CatalogsListRequest): Promise<ManageCatalogsResponse> {
        // Filter out empty parameters to avoid sending unnecessary data
        const filteredParams: Record<string, unknown> = {
            page: params.page,
            limit: params.limit
        };

        // Only include non-empty optional parameters
        if (params.search && params.search.trim() !== '') {
            filteredParams.search = params.search;
        }
        
        if (params.sort_by && params.sort_by.trim() !== '') {
            filteredParams.sort_by = params.sort_by;
        }
        
        if (params.sort_order && params.sort_order.trim() !== '') {
            filteredParams.sort_order = params.sort_order;
        }

        if (params.master_pdf_id && params.master_pdf_id.trim() !== '') {
            filteredParams.master_pdf_id = params.master_pdf_id;
        }

        if (params.master_catalog && params.master_catalog.trim() !== '') {
            filteredParams.master_catalog = params.master_catalog;
        }

        const response = await apiPost(`${API_BASE_URL}/catalogs/all-item-catalogs/get`, filteredParams);
        return response.data as ManageCatalogsResponse;
    }

    static async getItemsById(id: string): Promise<EditCatalogResponse> {
        try {
            const response = await apiGet<EditCatalogResponse>(`${API_BASE_URL}/catalogs/all-item-catalogs/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                data: {
                    name_pdf: '',
                    master_pdf_id: '',
                    data_master_category: []
                },
                message: 'Failed to fetch catalog details',
                timestamp: new Date().toISOString()
            };
        }
    }

    static async updateItemsById(id: string, formData: PartCatalogueFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        const formDataPayload = new FormData();

        // Add required fields
        formDataPayload.append('name_pdf', formData.code_cabin);
        formDataPayload.append('master_catalog', formData.part_type);
        formDataPayload.append('master_category_id', formData.part_id);
        formDataPayload.append('type_category_id', formData.type_id);
        formDataPayload.append('use_csv', formData.use_csv_upload.toString());
        
        // Handle SVG image file - send empty string if no file uploaded
        if (formData.svg_image) {
            formDataPayload.append('file_foto', formData.svg_image);
        } else {
            formDataPayload.append('file_foto', '');
        }
        
        // Transform and add data_items as JSON string
        const dataItems = this.transformPartsToDataItems(formData.parts);
        formDataPayload.append('data_items', JSON.stringify(dataItems));

        // Handle CSV file - only append if exists
        if (formData.csv_file) {
            formDataPayload.append('file_csv', formData.csv_file);
        }

        return await apiPutMultipart<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/all-item-catalogs/${id}`, formDataPayload);
    }

    static async deleteCatalog(id: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/all-item-catalogs/${id}`);
    }
}
// Vin Services
export class VinService {
    // Fetch Vins with pagination and filters
    static async getVins(
        page: number = 1,
        limit: number = 10,
        filters: Partial<VinFilters> = {}
    ): Promise<ApiResponse<VinApiResponse>> {
        const payload = {
            page,
            limit,
            search: filters.search || '',
            sort_order: filters.sort_order || 'desc'
        };

        return await apiPost<VinApiResponse>(`${API_BASE_URL}/catalogs/productions/get`, payload);
    }

    // Create new vin
    static async createVin(formData: VinFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            vin_number: formData.vin_number,
            production_name_en: formData.production_name_en,
            production_name_cn: formData.production_name_cn,
            production_description: formData.production_description || '',
            data_details: formData.master_pdf || []
        };

        return await apiPost<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/productions/create`, payload);
    }

    // Get master manage list with pagination and filters
    static async getMasterManages(
        page: number = 1,
        limit: number = 10,
        filters: Partial<VinFilters> = {}
    ): Promise<ApiResponse<MasterBookApiResponse>> {
        const payload = {
            page,
            limit,
            search: filters.search || ''
        };

        return await apiPost<MasterBookApiResponse>(`${API_BASE_URL}/catalogs/master-pdf/get`, payload);
    }

    // Get existing vin by ID
    static async getVinById(vinId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Vin }>> {
        return await apiGet<{ success: boolean; message: string; data: Vin }>(`${API_BASE_URL}/catalogs/productions/${vinId}`, { production_id: vinId });
    }

    // Update existing vin
    static async updateVin(vinId: string, formData: VinFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform formData to match API expectations
        const payload = {
            production_id: vinId,
            vin_number: formData.vin_number,
            production_name_en: formData.production_name_en,
            production_name_cn: formData.production_name_cn,
            production_description: formData.production_description || '',
            data_details: formData.master_pdf || []
        };

        return await apiPut<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/productions/${vinId}`, payload);
    }

    // Delete vin
    static async deleteVin(vinId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/productions/${vinId}`);
    }
}
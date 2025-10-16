import { apiPostMultipart, ApiResponse, apiPost, apiGet } from '@/helpers/apiHelper';
import { CatalogsListRequest, ManageCatalogsResponse, PartCatalogueFormData, PartItem, EditCatalogResponse } from '@/types/asyncSelect';

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL_SEC;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Interface for individual catalog data items
 */
interface CatalogDataItem {
    target_id: string;              // part_target
    diagram_serial_number: string;  // empty string (not available)
    part_number: string;            // code_product
    catalog_item_name_en: string;   // name_english
    catalog_item_name_ch: string;   // name_chinese
    description: string;            // empty string (not available)
    quantity: number;               // quantity
}

/**
 * Service for catalog creation operations
 */
export class CatalogManageService {

    /**
     * Transform form parts data to API format
     */
    private static transformPartsToDataItems(parts: PartItem[]): CatalogDataItem[] {
        return parts.map(part => ({
            target_id: part.part_target,
            diagram_serial_number: '', // Not available, set to empty string
            part_number: part.code_product,
            catalog_item_name_en: part.name_english,
            catalog_item_name_ch: part.name_chinese,
            description: '', // Not available, set to empty string
            quantity: part.quantity
        }));
    }

    /**
     * Create a new catalog
     */
    static async createCatalog(formData: PartCatalogueFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        // Transform form data to API payload format
        const formDataPayload = new FormData();

        // Add required fields
        formDataPayload.append('name_pdf', formData.code_cabin);
        formDataPayload.append('master_catalog', formData.part_type);
        formDataPayload.append('master_category_id', formData.part_id);
        formDataPayload.append('type_category_id', formData.type_id);
        formDataPayload.append('use_csv', formData.use_csv_upload.toString());
        
        // Always send file_foto field - empty string if no file uploaded
        if (formData.svg_image) {
            formDataPayload.append('file_foto', formData.svg_image);
        } else {
            formDataPayload.append('file_foto', '');
        }
        
        // Transform and add data_items as JSON string
        const dataItems = this.transformPartsToDataItems(formData.parts);
        formDataPayload.append('data_items', JSON.stringify(dataItems));

        // Add files if they exist (optional)
        // if (formData.svg_image) {
        //     formDataPayload.append('file_foto', formData.svg_image);
        // }

        if (formData.csv_file) {
            formDataPayload.append('file_csv', formData.csv_file);
        }
        
        return await apiPostMultipart<{ success: boolean; message?: string }>(`${API_BASE_URL}/catalogs/all-item-catalogs/create`, formDataPayload);
    }

    // Get Manage Catalog
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

    // Get ITEMS by ID
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
}
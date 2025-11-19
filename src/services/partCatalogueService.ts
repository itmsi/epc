import { apiDelete, apiGet, apiPost, apiPut, ApiResponse, apiPostMultipart, apiPutMultipart } from '@/helpers/apiHelper';
import { 
  CatalogDataItem,
  VinFormData,
  VinApiResponse,
  VinDetailResponse,
  VinFilters,
  MasterBookApiResponse,
  MasterCategoryFilters,
  MasterCategoryApiResponse,
  MasterCategoryFormData,
  MasterCategory,
  CategoryFilters,
  CategoryApiResponse,
  CategoryFormData,
  Category,
  DetailCatalog,
  DetailCatalogFilters,
  DetailCatalogApiResponse
} from '@/types/partCatalogue';
import { CatalogsListRequest, ManageCatalogsResponse, PartCatalogueFormData, PartItem, CatalogDetailResponse, CatalogEditResponse } from '@/types/asyncSelect';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export class CatalogManageService {

    private static transformPartsToDataItems(parts: PartItem[]): CatalogDataItem[] {
        return parts.map(part => ({
            target_id: part.target_id,
            diagram_serial_number: '', 
            part_number: part.part_number,
            catalog_item_name_en: part.catalog_item_name_en,
            catalog_item_name_ch: part.catalog_item_name_ch,
            description: part.description, 
            quantity: part.quantity
        }));
    }

    static async createCatalog(formData: PartCatalogueFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        const formDataPayload = new FormData();

        formDataPayload.append('dokumen_name', formData.code_cabin);
        formDataPayload.append('master_category_id', formData.master_category);
        formDataPayload.append('category_id', formData.part_id);
        formDataPayload.append('type_category_id', formData.type_id);
        
        // Handle SVG image file - send empty string if no file uploaded
        if (formData.svg_image) {
            formDataPayload.append('file_foto', formData.svg_image);
        } else {
            formDataPayload.append('file_foto', '');
        }
        
        const dataItems = this.transformPartsToDataItems(formData.parts);
        formDataPayload.append('data_items', JSON.stringify(dataItems));
        
        return await apiPostMultipart<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/item_category/create`, formDataPayload);
    }

    static async getItems(params: CatalogsListRequest): Promise<ManageCatalogsResponse> {
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

        const response = await apiPost(`${API_BASE_URL}/epc/item_category/get`, filteredParams);
        return response.data as ManageCatalogsResponse;
    }

    static async getItemsById(id: string): Promise<CatalogDetailResponse> {
        try {
            const response = await apiGet<CatalogDetailResponse>(`${API_BASE_URL}/epc/item_category/dokumen/${id}`);
            return response.data;
        } catch (error) {
            return {
                success: false,
                data: {
                    dokumen_name: '',
                    master_category_id: '',
                    master_category_name_en: '',
                    master_category_name_cn: '',
                    category_id: '',
                    category_name_en: '',
                    category_name_cn: '',
                    type_category_id: '',
                    type_category_name_en: '',
                    type_category_name_cn: '',
                    items: [],
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: 0,
                        totalPages: 0
                    }
                },
                message: 'Failed to fetch catalog details',
                timestamp: new Date().toISOString()
            };
        }
    }

    // Search items in specific catalog with server-side filtering
    static async searchCatalogItems(catalogId: string, params: {
        search?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
        page?: number;
        limit?: number;
    }): Promise<CatalogDetailResponse> {
        const filteredParams: Record<string, string | number | boolean> = {};

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

        if (params.page !== undefined) {
            filteredParams.page = params.page;
        }

        if (params.limit !== undefined) {
            filteredParams.limit = params.limit;
        }

        try {
            const response = await apiGet<CatalogDetailResponse>(`${API_BASE_URL}/epc/item_category/dokumen/${catalogId}`, filteredParams);
            return response.data;
        } catch (error) {
            return {
                success: false,
                data: {
                    dokumen_name: '',
                    master_category_id: '',
                    master_category_name_en: '',
                    master_category_name_cn: '',
                    category_id: '',
                    category_name_en: '',
                    category_name_cn: '',
                    type_category_id: '',
                    type_category_name_en: '',
                    type_category_name_cn: '',
                    items: [],
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: 0,
                        totalPages: 0
                    }
                },
                message: 'Failed to search catalog items',
                timestamp: new Date().toISOString()
            };
        }
    }

    // Method untuk Edit - menggunakan endpoint item_category/{id}
    static async getCatalogForEdit(id: string): Promise<CatalogEditResponse> {
        try {
            const response = await apiGet<CatalogEditResponse>(`${API_BASE_URL}/epc/item_category/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching catalog for edit:', error);
            throw error;
        }
    }

    static async updateItemsById(id: string, formData: PartCatalogueFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        const formDataPayload = new FormData();

        formDataPayload.append('dokumen_name', formData.code_cabin);
        formDataPayload.append('master_category_id', formData.master_category);
        formDataPayload.append('category_id', formData.part_id);
        formDataPayload.append('type_category_id', formData.type_id);
        
        if (formData.svg_image === null) {
            formDataPayload.append('file_foto', '');
        } else if (formData.svg_image instanceof File) {
            formDataPayload.append('file_foto', formData.svg_image);
        }

        const dataItems = this.transformPartsToDataItems(formData.parts);
        formDataPayload.append('data_items', JSON.stringify(dataItems));

        return await apiPutMultipart<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/item_category/${id}`, formDataPayload);
    }

    static async addItemsToCatalog(catalogId: string, formData: PartCatalogueFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        const formDataPayload = new FormData();

        // Add required fields untuk add items
        formDataPayload.append('dokumen_name', formData.code_cabin);
        formDataPayload.append('catalog_id', catalogId);
        formDataPayload.append('master_category_id', formData.master_category);
        formDataPayload.append('category_id', formData.part_id);
        formDataPayload.append('type_category_id', formData.type_id);
        
        // Handle SVG image file jika ada
        if (formData.svg_image instanceof File) {
            formDataPayload.append('file_foto', formData.svg_image);
        }
        
        // Transform dan add data_items sebagai JSON string
        const dataItems = this.transformPartsToDataItems(formData.parts);
        formDataPayload.append('data_items', JSON.stringify(dataItems));

        // Gunakan endpoint untuk add items ke catalog existing
        return await apiPostMultipart<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/item_category/create`, formDataPayload);
    }

    static async renameCatalog(id: string, newName: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiPut<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/dokumen/${id}`, {
            dokumen_name: newName
        });
    }

    static async duplicateCatalog(id: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiPost<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/dokumen/duplikat/${id}`);
    }

    static async deleteItemsCatalog(id: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/item_category/${id}`);
    }

    static async deleteCatalog(id: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/dokumen/${id}`);
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

        return await apiPost<VinApiResponse>(`${API_BASE_URL}/epc/products/get`, payload);
    }

    // Create new vin
    static async createVin(formData: VinFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        const payload = {
            vin_number: formData.vin_number,
            product_name_en: formData.product_name_en,
            product_name_cn: formData.product_name_cn,
            product_description: formData.product_description || '',
            data_details: formData.data_details || []
        };

        return await apiPost<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/products/create`, payload);
    }

    // Get existing vin by ID
    static async getVinById(vinId: string): Promise<ApiResponse<VinDetailResponse>> {
        return await apiGet<VinDetailResponse>(`${API_BASE_URL}/epc/products/${vinId}`);
    }

    // Update existing vin
    static async updateVin(vinId: string, formData: VinFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        const payload = {
            product_id: vinId,
            vin_number: formData.vin_number,
            product_name_en: formData.product_name_en,
            product_name_cn: formData.product_name_cn,
            product_description: formData.product_description || '',
            data_details: formData.data_details || []
        };

        return await apiPut<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/products/${vinId}`, payload);
    }

    // Delete vin
    static async deleteVin(vinId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/products/${vinId}`);
    }
}

// ================== MASTER PDF SERVICES ==================
export class MasterPdfService {
    static async getMasterPdfs(
        page: number = 1,
        limit: number = 10,
        filters: Partial<VinFilters> = {}
    ): Promise<ApiResponse<MasterBookApiResponse>> {
        const payload = {
            page,
            limit,
            search: filters.search || ''
        };

        return await apiPost<MasterBookApiResponse>(`${API_BASE_URL}/epc/master-pdf/get`, payload);
    }
}

// ================== MASTER CATEGORY SERVICES ==================
export class MasterCategoryService {
    static async getMasterCategories(
        page: number = 1,
        limit: number = 10,
        filters: Partial<MasterCategoryFilters> = {}
    ): Promise<ApiResponse<MasterCategoryApiResponse>> {
        const payload = {
            page,
            limit,
            search: filters.search || '',
            sort_order: filters.sort_order || 'desc'
        };

        return await apiPost<MasterCategoryApiResponse>(`${API_BASE_URL}/epc/master_category/get`, payload);
    }

    // Create new master category
    static async createMasterCategory(formData: MasterCategoryFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        const payload = {
            master_category_name_en: formData.master_category_name_en,
            master_category_name_cn: formData.master_category_name_cn,
            master_category_description: formData.master_category_description,
        };

        return await apiPost<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/master_category/create`, payload);
    }

    static async getMasterCategoryById(masterCategoryId: string): Promise<ApiResponse<{ success: boolean; message: string; data: MasterCategory }>> {
        return await apiGet<{ success: boolean; message: string; data: MasterCategory }>(`${API_BASE_URL}/epc/master_category/${masterCategoryId}`);
    }

    static async updateMasterCategory(masterCategoryId: string, formData: MasterCategoryFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        const payload = {
            master_category_id: masterCategoryId,
            master_category_name_en: formData.master_category_name_en,
            master_category_name_cn: formData.master_category_name_cn,
            master_category_description: formData.master_category_description,
        };

        return await apiPut<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/master_category/${masterCategoryId}`, payload);
    }

    static async deleteMasterCategory(masterCategoryId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/master_category/${masterCategoryId}`);
    }
}

// CATEGORY Services
export class CategoryService {
    static async getCategory(
        page: number = 1,
        limit: number = 10,
        filters: Partial<CategoryFilters> = {}
    ): Promise<ApiResponse<CategoryApiResponse>> {
        const payload = {
            page,
            limit,
            search: filters.search || '',
            sort_order: filters.sort_order || 'desc',
            master_category_id: filters.master_category_id || ''
        };

        return await apiPost<CategoryApiResponse>(`${API_BASE_URL}/epc/categories/get`, payload);
    }

    // Create new category
    static async createCategory(formData: CategoryFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        const payload = {
            master_category_id: formData.master_category_id,
            master_category_name_en: formData.master_category_name_en,
            category_name_en: formData.category_name_en,
            category_name_cn: formData.category_name_cn,
            category_description: formData.category_description,
            data_type: formData.data_type || []
        };

        return await apiPost<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/categories/create`, payload);
    }

    // Get existing category by ID
    static async getCategoryById(categoryId: string): Promise<ApiResponse<{ success: boolean; message: string; data: Category }>> {
        return await apiGet<{ success: boolean; message: string; data: Category }>(`${API_BASE_URL}/epc/categories/${categoryId}`, { category_id: categoryId });
    }

    // Update existing category
    static async updateCategory(categoryId: string, formData: CategoryFormData): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        const payload = {
            category_id: categoryId,
            master_category_id: formData.master_category_id,
            master_category_name_en: formData.master_category_name_en,
            category_name_en: formData.category_name_en,
            category_name_cn: formData.category_name_cn,
            category_description: formData.category_description,
            data_type: formData.data_type || []
        };

        return await apiPut<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/categories/${categoryId}`, payload);
    }

    // Delete category
    static async deleteCategory(categoryId: string): Promise<ApiResponse<{ success: boolean; message?: string }>> {
        return await apiDelete<{ success: boolean; message?: string }>(`${API_BASE_URL}/epc/categories/${categoryId}`);
    }
}

// Detail Catalog Services
export class DetailCatalogService {

    static async getDetailCatalog(
        page: number = 1,
        limit: number = 10,
        filters: Partial<DetailCatalogFilters> = {}
    ): Promise<ApiResponse<DetailCatalogApiResponse>> {
        const payload = {
            page,
            limit,
            search: filters.search || '',
            sort_order: filters.sort_order || 'desc',
            category_id: filters.category_id || ''
        };

        return await apiPost<DetailCatalogApiResponse>(`${API_BASE_URL}/epc/type_category/get`, payload);
    }
    
    // Get existing detail catalog by ID
    static async getDetailCatalogById(detailCatalogId: string): Promise<ApiResponse<{ success: boolean; message: string; data: DetailCatalog }>> {
        return await apiGet<{ success: boolean; message: string; data: DetailCatalog }>(`${API_BASE_URL}/epc/type_category/${detailCatalogId}`);
    }

}
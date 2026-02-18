import { apiPost, ApiResponse } from '@/helpers/apiHelper';
import { 
    CategorySelectionRequest, 
    CategorySelectionResponse 
} from '../types/categorySelection';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class CategorySelectionService {
    static async getCategoryItems(
        request: CategorySelectionRequest
    ): Promise<ApiResponse<CategorySelectionResponse>> {
        const payload: CategorySelectionRequest = {
            dokumen_ids: request.dokumen_ids,
            product_id: request.product_id,
            customer_id: request.customer_id,
            search: request.search || '',
            page: request.page || 1,
            limit: request.limit || 10,
            sort_by: request.sort_by || 'created_at',
            sort_order: request.sort_order || 'desc'
        };

        return await apiPost<CategorySelectionResponse>(
            `${API_BASE_URL}/epc/parts-catalogs/get-by-master-category-id`,
            payload as unknown as Record<string, unknown>
        );
    }
}
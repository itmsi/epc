import { apiGet, apiPost, ApiResponse } from '@/helpers/apiHelper';
import { TransactionOrderListResponse, TransactionRequest, TransactionOrderDetailResponse } from '../types/transaction';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class TransactionService {
    static async getTransactionItems(
        request: TransactionRequest
    ): Promise<ApiResponse<TransactionOrderListResponse>> {
        const payload: TransactionRequest = {
            search: request.search || '',
            page: request.page || 1,
            limit: request.limit || 10,
            sort_by: request.sort_by || 'created_at',
            sort_order: request.sort_order || 'desc'
        };

        return await apiPost<TransactionOrderListResponse>(
            `${API_BASE_URL}/epc//transaction_order/get`,
            payload as unknown as Record<string, unknown>
        );
    }
    static async getDetailTransactionItems(transactionOrderID: string): Promise<TransactionOrderDetailResponse> {
        try {
            const response = await apiGet<TransactionOrderDetailResponse>(`${API_BASE_URL}/epc/transaction_order/${transactionOrderID}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching transaction details:', error);
            throw error;
        }
    }
}
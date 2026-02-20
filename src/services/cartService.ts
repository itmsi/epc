import { apiPost, ApiResponse } from '@/helpers/apiHelper';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface TransactionOrderItem {
    master_item_id: string;
    part_number: string;
    master_item_name_en: string;
    master_item_name_ch: string;
    quantity_needs: string | number;
    quantity_order: string | number;
}

export interface TransactionOrderVinGroup {
    vin_number: string;
    item: TransactionOrderItem[];
}

export interface TransactionOrderRequest {
    customer_id: string;
    transaction_order_date: string;
    transaction_order_status: string;
    transaction_order_items: {
        data: TransactionOrderVinGroup[];
    };
    transaction_order_items_total: number;
}

export class CartService {
    static async createTransactionOrder(payload: TransactionOrderRequest): Promise<ApiResponse<any>> {
        return await apiPost(
            // Sesuai endpoint dari Swagger user
            `${API_BASE_URL}/epc/transaction_order/create`, 
            payload as unknown as Record<string, unknown>
        );
    }
}

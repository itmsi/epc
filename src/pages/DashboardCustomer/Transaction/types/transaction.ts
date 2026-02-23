export interface TransactionRequest {
    page?: number;
    limit?: number;
    search?: string;
    sort_by?: string;
    sort_order?: "asc" | "desc";
}

export interface TransactionOrder {
    transaction_order_id: string;
    transaction_order_no: number;
    customer_id: string;
    transaction_order_date: string;
    transaction_order_status: string;
    transaction_order_items_total: number;
    transaction_order_description: string | null;
}

export interface Pagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface TransactionOrderListResponse {
  success: boolean;
  message: string;
  data: {
    items: TransactionOrder[];
    pagination: Pagination;
  };
}

export interface TransactionOrderItem {
  part_number: string;
  master_item_id: string;
  quantity_needs: number;
  quantity_order: number;
  master_item_name_ch: string;
  master_item_name_en: string;
}

export interface TransactionOrderVin {
  item: TransactionOrderItem[];
  vin_number: string;
}

export interface TransactionOrderDetail extends TransactionOrder {
  transaction_order_items: {
    data: TransactionOrderVin[];
  };
}

export interface TransactionOrderDetailResponse {
  success: boolean;
  message: string;
  data: TransactionOrderDetail;
}
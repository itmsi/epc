// ======================== VIN Customer Vehicle Interfaces =======================
export interface VinCustomerVehicleItem {
  id: string;
  vin_number: string;
  product_name: string;
  model_unit?: string;
  engine_number?: string;
  engine_type?: string;
  description?: string;
  label?: string;
}

export interface VinCustomerVehicleFormData {
  customer_id: string;
  product_ids: string[];
  selectedVins: VinCustomerVehicleItem[];
}

export interface VinCustomerVehicleValidationErrors {
  customer_id?: string;
  product_ids?: string;
  selectedVins?: string;
}

export interface VinCustomerVehicleApiResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    customer_id: string;
    product_ids: string[];
  };
}

// ======================== VIN Customer List (Manage Page) =======================
export interface VinCustomerListItem {
  customer_id: string;
  customer_name: string;
  count: number;
}

export interface VinCustomerListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VinCustomerListFilters {
  search: string;
  sort_by: string;
  sort_order: 'asc' | 'desc';
}

export interface VinCustomerListRequest {
  page: number;
  limit: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface VinCustomerListResponse {
  success: boolean;
  code: number;
  message: string;
  data: {
    items: VinCustomerListItem[];
    pagination: VinCustomerListPagination;
  };
}

// ======================== VIN Customer Detail (View Page) =======================
export interface VinCustomerProduct {
  id: string;
  product_id: string;
  product_name_en: string;
  product_name_cn: string;
  vin_number: string;
}

export interface VinCustomerDetail {
  customer_id: string;
  customer_name: string;
  count: number;
  products: VinCustomerProduct[];
}

export interface VinCustomerDetailResponse {
  success: boolean;
  code: number;
  message: string;
  data: VinCustomerDetail;
}

// ======================== VIN Customer Update =======================
export interface VinCustomerUpdatePayload {
  customer_id: string;
  product_ids: string[];
}

export interface VinCustomerUpdateItem {
  id: string;
  customer_id: string;
  product_id: string;
}

export interface VinCustomerUpdateResponse {
  success: boolean;
  code: number;
  message: string;
  data: VinCustomerUpdateItem[];
}

// ======================== VIN Customer Delete =======================
export interface VinCustomerDeleteResponse {
  success: boolean;
  code: number;
  message: string;
}
export interface TypeCabin {
  type_cabine_id: string;
  type_cabine_name_en: string;
  type_cabine_name_cn: string;
  type_cabine_description: string;
}

export interface TypeCabinFormData {
  type_cabine_name_en: string;
  type_cabine_name_cn: string;
  type_cabine_description: string;
}

export interface Cabin {
  cabines_id: string;
  cabines_name_en: string;
  cabines_name_cn: string;
  cabines_description: string;
  type_cabines: TypeCabin[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  is_delete: boolean;
}

export interface CabinFormData {
  cabines_name_en: string;
  cabines_name_cn: string;
  cabines_description: string;
  type_cabines: TypeCabinFormData[];
}

export interface CabinPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  per_page: number;
  current_page: number;
}

export interface CabinApiResponse {
  success: boolean;
  message: string;
  data: {
    items: Cabin[];
    pagination: CabinPagination;
  };
}

export interface CabinFilters {
  search: string;
  sort_order: 'asc' | 'desc' | '';
}

export interface CabinValidationErrors {
  [key: string]: string;
}

// ======================== Similar Interfaces for Engine =======================
export interface TypeEngine {
  type_engine_id: string;
  type_engine_name_en: string;
  type_engine_name_cn: string;
  type_engine_description: string;
}

export interface TypeEngineFormData {
  type_engine_name_en: string;
  type_engine_name_cn: string;
  type_engine_description: string;
}

export interface Engine {
  engines_id: string;
  engines_name_en: string;
  engines_name_cn: string;
  engines_description: string;
  type_engines: TypeEngine[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  is_delete: boolean;
}

export interface EngineFormData {
  engines_name_en: string;
  engines_name_cn: string;
  engines_description: string;
  type_engines: TypeEngineFormData[];
}

export interface EnginePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  per_page: number;
  current_page: number;
}

export interface EngineApiResponse {
  success: boolean;
  message: string;
  data: {
    items: Engine[];
    pagination: EnginePagination;
  };
}

export interface EngineFilters {
  search: string;
  sort_order: 'asc' | 'desc' | '';
}

export interface EngineValidationErrors {
  [key: string]: string;
}


// ======================== Similar Interfaces for AXLE =======================
export interface TypeAxel {
  type_axel_id: string;
  type_axel_name_en: string;
  type_axel_name_cn: string;
  type_axel_description: string;
}

export interface TypeAxleFormData {
  type_axel_name_en: string;
  type_axel_name_cn: string;
  type_axel_description: string;
}

export interface Axle {
  axel_id: string;
  axel_name_en: string;
  axel_name_cn: string;
  axel_description: string;
  type_axels: TypeAxel[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  is_delete: boolean;
}

export interface AxleFormData {
  axel_name_en: string;
  axel_name_cn: string;
  axel_description: string;
  type_axels: TypeAxleFormData[];
}

export interface AxlePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  per_page: number;
  current_page: number;
}

export interface AxleApiResponse {
  success: boolean;
  message: string;
  data: {
    items: Axle[];
    pagination: AxlePagination;
  };
}

export interface AxleFilters {
  search: string;
  sort_order: 'asc' | 'desc' | '';
}

export interface AxleValidationErrors {
  [key: string]: string;
}

// ======================== Similar Interfaces for Transmission =======================
export interface TypeTransmission {
  type_transmission_id: string;
  type_transmission_name_en: string;
  type_transmission_name_cn: string;
  type_transmission_description: string;
}

export interface TypeTransmissionFormData {
  type_transmission_name_en: string;
  type_transmission_name_cn: string;
  type_transmission_description: string;
}

export interface Transmission {
  transmission_id: string;
  transmission_name_en: string;
  transmission_name_cn: string;
  transmission_description: string;
  type_transmissions: TypeTransmission[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  is_delete: boolean;
}

export interface TransmissionFormData {
  transmission_name_en: string;
  transmission_name_cn: string;
  transmission_description: string;
  type_transmissions: TypeTransmissionFormData[];
}

export interface TransmissionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  per_page: number;
  current_page: number;
}

export interface TransmissionApiResponse {
  success: boolean;
  message: string;
  data: {
    items: Transmission[];
    pagination: TransmissionPagination;
  };
}

export interface TransmissionFilters {
  search: string;
  sort_order: 'asc' | 'desc' | '';
}

export interface TransmissionValidationErrors {
  [key: string]: string;
}

// ======================== Similar Interfaces for STEERING =======================
export interface TypeSteering {
  type_steering_id: string;
  type_steering_name_en: string;
  type_steering_name_cn: string;
  type_steering_description: string;
}

export interface TypeSteeringFormData {
  type_steering_name_en: string;
  type_steering_name_cn: string;
  type_steering_description: string;
}

export interface Steering {
  steering_id: string;
  steering_name_en: string;
  steering_name_cn: string;
  steering_description: string;
  type_steerings: TypeSteering[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
  is_delete: boolean;
}

export interface SteeringFormData {
  steering_name_en: string;
  steering_name_cn: string;
  steering_description: string;
  type_steerings: TypeSteeringFormData[];
}

export interface SteeringPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  per_page: number;
  current_page: number;
}

export interface SteeringApiResponse {
  success: boolean;
  message: string;
  data: {
    items: Steering[];
    pagination: SteeringPagination;
  };
}

export interface SteeringFilters {
  search: string;
  sort_order: 'asc' | 'desc' | '';
}

export interface SteeringValidationErrors {
  [key: string]: string;
}

export interface CatalogDataItem {
    target_id: string;              // part_target
    diagram_serial_number: string;  // empty string
    part_number: string;            // code_product
    catalog_item_name_en: string;   // name_english
    catalog_item_name_ch: string;   // name_chinese
    description: string;            // empty string
    quantity: number;               // quantity
}

// VIN Types
export interface Vin {
  production_id: string;
  vin_number: string;
  production_name_en: string;
  production_name_cn: string;
  production_description?: string;
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
  deleted_at: string | null;
  deleted_by: string | null;
  is_delete: boolean;
}

export interface VinFormData {
  vin_number: string;
  production_name_en: string;
  production_name_cn: string;
  production_description?: string;
  master_pdf?: { master_pdf_id: string }[];
}

export interface VinPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VinApiResponse {
  success: boolean;
  message: string;
  data: {
    items: Vin[];
    pagination: VinPagination;
  };
  timestamp: string;
}

export interface VinFilters {
  search: string;
  sort_order: 'asc' | 'desc' | '';
}

export interface VinValidationErrors {
  [key: string]: string;
}

// Master PDF types
export interface MasterPdf {
  master_pdf_id: string;
  name_pdf: string;
  description: string | null;
  master_catalog: string | null;
  created_at: string;
  updated_at: string;
}

export interface MasterManagePagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface MasterBookApiResponse {
  success: boolean;
  message: string;
  data: MasterPdf[];
  pagination: MasterManagePagination;
  timestamp: string;
}

export interface UseManageVinsProps {
    initialPage?: number;
    initialLimit?: number;
    initialFilters?: Partial<VinFilters>;
}

export interface VinListRequest {
    page: number;
    limit: number;
    search?: string;
    sort_order?: 'asc' | 'desc' | '';
}


export interface UseMasterManageProps {
    initialPage?: number;
    initialLimit?: number;
    initialFilters?: Partial<VinFilters>;
}

export interface MasterManageListRequest {
    page: number;
    limit: number;
    search: string;
}
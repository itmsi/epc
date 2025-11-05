// Types for AsyncSelect components and related functionality

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface AsyncSelectConfig {
    isSearchable?: boolean;
    isClearable?: boolean;
    disabled?: boolean;
    className?: string;
    placeholder?: string;
    error?: string;
    success?: boolean;
    isLoading?: boolean;
}

export interface AsyncSelectCallbacks {
    onChange?: (selectedOption: { value: string; label: string; } | null) => void;
    onInputChange?: (value: string) => void;
    onMenuScrollToBottom?: () => Promise<void> | void;
}

export interface AsyncSelectData {
    defaultOptions?: SelectOption[];
    loadOptions?: (search: string) => Promise<SelectOption[]>;
    inputValue?: string;
}

export interface CustomAsyncSelectProps extends AsyncSelectConfig, AsyncSelectCallbacks, AsyncSelectData {
    name?: string;
    value?: SelectOption | null;
    noOptionsMessage?: () => string;
    loadingMessage?: () => string;
}

// Pagination-related types
export interface PaginationState {
    currentPage: number;
    pageSize: number;
    hasMore: boolean;
    loading: boolean;
}

export interface PaginatedSelectOptions {
    options: SelectOption[];
    pagination: PaginationState;
}

// Part catalogue specific types
export interface PartCatalogueFormData {
    code_cabin: string;
    part_type: string;
    part_id: string;
    type_id: string;
    master_category: string;
    svg_image: File | null | undefined; // undefined = keep existing, null = remove, File = new upload
    file_foto: File | null;
    dokumen_id?: string;
    // use_csv_upload: boolean;
    // csv_file: File | null;
    parts: PartItem[];
}
export interface PartItem {
    id: string;
    target_id: string;
    part_number: string;
    file_foto: string | null;
    catalog_item_name_en: string;
    catalog_item_name_ch: string;
    description: string;
    unit: string;
    quantity: number;
}

export interface CreatePartItem {
    target_id: string;
    part_number: string;
    file_foto: string | null;
    catalog_item_name_en: string;
    catalog_item_name_ch: string;
    description: string;
    unit: string;
    quantity: number;
}

export interface CatalogValidationErrors {
    code_cabin?: string;
    part_type?: string;
    part_id?: string;
    type_id?: string;
    master_category?: string;
    svg_image?: string;
    parts?: string;
    general?: string;
    // Dynamic part validation fields
    [key: string]: string | undefined;
}

export interface PartCatalogueData {
    cabins: any[] | null;
    engines: any[] | null;
    axles: any[] | null;
    transmissions: any[] | null;
    steerings: any[] | null;
}

export const PART_TYPES = [
    { value: '', label: 'Select Part Type' },
    { value: 'cabin', label: 'Cabin' },
    { value: 'engine', label: 'Engine' },
    { value: 'transmission', label: 'Transmission' },
    { value: 'axle', label: 'Axle' },
    { value: 'steering', label: 'Steering' }
] as const;

export type PartType = 'cabin' | 'engine' | 'transmission' | 'axle' | 'steering';

// Catalog Management Types
export interface CatalogItem {
    item_catalog_axle_id?: string;
    item_catalog_cabin_id?: string;
    item_catalog_engine_id?: string;
    item_catalog_transmission_id?: string;
    item_catalog_steering_id?: string;
    master_pdf_id: string;
    target_id: string;
    diagram_serial_number: string | null;
    part_number: string;
    catalog_item_name_en: string;
    catalog_item_name_ch: string;
    description: string | null;
    quantity: number;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
    file_foto: string | null;
    name_pdf: string;
    master_catalog: string;
    // Dynamic fields based on catalog type
    [key: string]: any;
}

// New simplified catalog document item for list view
export interface CatalogDocumentItem {
    dokumen_id: string;
    dokumen_name: string;
    master_category_id: string;
    master_category_name_en: string;
    master_category_name_cn: string;
}

export interface CatalogPagination {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ManageCatalogsResponse {
    success: boolean;
    message: string;
    data: {
        items: CatalogDocumentItem[];
        pagination: CatalogPagination;
    };
    timestamp: string;
}

export interface CatalogsListRequest {
    page: number;
    limit: number;
    search?: string;
    sort_by?: string;
    sort_order: 'asc' | 'desc' | '';
    master_pdf_id?: string;
    master_catalog?: string;
}

// Edit Catalog Types
export interface EditCatalogItem {
    items_id: string;
    master_pdf_id: string;
    target_id: string;
    diagram_serial_number: string | null;
    part_number: string;
    catalog_item_name_en: string;
    catalog_item_name_ch: string;
    description: string | null;
    quantity: number;
    file_foto: string | null;
}

export interface EditCatalogMasterCategory {
    master_catalog: string;
    master_category_id: string;
    master_category_name: string;
    type_category_id: string;
    type_category_name: string;
    data_items: EditCatalogItem[];
}

export interface EditCatalogData {
    name_pdf: string;
    master_pdf_id: string;
    data_master_category: EditCatalogMasterCategory[];
}

export interface EditCatalogResponse {
    success: boolean;
    message: string;
    data: EditCatalogData;
    timestamp: string;
}

// New catalog detail response structure
export interface CatalogDetailItem {
    item_category_id: string;
    dokumen_id: string;
    master_category_id: string;
    master_category_name_en: string;
    master_category_name_cn: string;
    category_name_en: string;
    category_name_cn: string;
    type_category_name_en: string;
    type_category_name_cn: string;
}

export interface CatalogDetailData {
    dokumen_name: string;
    master_category_id: string;
    master_category_name_en: string;
    master_category_name_cn: string;
    category_id: string;
    category_name_en: string;
    category_name_cn: string;
    type_category_id: string;
    type_category_name_en: string;
    type_category_name_cn: string;
    items: CatalogDetailItem[];
    pagination: CatalogPagination;
}

export interface CatalogDetailResponse {
    success: boolean;
    message: string;
    data: CatalogDetailData;
    timestamp: string;
}

// Response structure untuk Edit catalog dari endpoint item_category/{id}
export interface CatalogEditDetailItem {
    item_category_detail_id: string;
    item_category_id: string;
    target_id: string;
    part_number: string;
    catalog_item_name_en: string;
    catalog_item_name_ch: string;
    description: string;
    quantity: number;
    unit: string | null;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
    unit_name_en: string | null;
    unit_name_cn: string | null;
}

export interface CatalogEditData {
    item_category_id: string;
    type_category_id: string;
    dokumen_id: string;
    item_category_name_en: string | null;
    item_category_name_cn: string | null;
    item_category_description: string | null;
    item_category_foto: string;
    created_at: string;
    created_by: string;
    updated_at: string;
    updated_by: string;
    category_id: string;
    dokumen_name: string;
    dokumen_description: string | null;
    type_category_name_en: string;
    type_category_name_cn: string;
    category_name_en: string;
    category_name_cn: string;
    master_category_id: string;
    master_category_name_en: string;
    master_category_name_cn: string;
    details: CatalogEditDetailItem[];
}

export interface CatalogEditResponse {
    success: boolean;
    message: string;
    data: CatalogEditData;
    timestamp: string;
}
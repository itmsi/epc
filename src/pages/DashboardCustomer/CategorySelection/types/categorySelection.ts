export interface CategorySelectionRequest {
  master_category_id: string;
  product_id: string;
  customer_id: string;
  search?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// Child item - item dengan id_link yang memiliki value adalah card
export interface CategoryChildItem {
  id: string;
  id_link: string | null;
  name: string;
  name_cn: string;
  description: string | null;
  child: CategoryChildItem[];
}

// Parent category item
export interface CategoryItem {
  id: string;
  id_link: string | null;
  name: string;
  name_cn: string;
  description: string;
  child: CategoryChildItem[];
}

export interface CategorySelectionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CategorySelectionResponse {
  success: boolean;
  message: string;
  data: {
    items: CategoryItem[];
    pagination: CategorySelectionPagination;
  };
  timestamp: string;
}

export interface CategorySelectionHookParams {
  masterCategoryId?: string;
  productId?: string;
  customerId?: string;
  initialLimit?: number;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
}

export interface CategorySelectionState {
  items: CategoryItem[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  searchQuery: string;
}
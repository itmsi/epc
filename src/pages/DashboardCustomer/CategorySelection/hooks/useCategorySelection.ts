import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getIdUsers } from '@/helpers/generalHelper';
import { CategorySelectionService } from '../services/categorySelection';
import { 
  CategorySelectionState, 
  CategorySelectionHookParams 
} from '../types/categorySelection';

export const useCategorySelection = ({
  masterCategoryId,
  productId,
  customerId,
  initialLimit = 12,
  initialSortBy = 'created_at',
  initialSortOrder = 'desc'
}: CategorySelectionHookParams = {}) => {
  const [state, setState] = useState<CategorySelectionState>({
    items: [],
    loading: false,
    error: null,
    currentPage: 1,
    totalItems: 0,
    totalPages: 0,
    searchQuery: '',
  });

  // Dapatkan customer_id dari localStorage jika tidak disediakan
  const finalCustomerId = customerId || getIdUsers();

  const loadItems = useCallback(async (
    page: number = 1,
    search: string = ''
  ) => {
    if (!masterCategoryId || !productId || !finalCustomerId) {
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await CategorySelectionService.getCategoryItems({
        master_category_id: masterCategoryId,
        product_id: productId,
        customer_id: finalCustomerId,
        search,
        page,
        limit: initialLimit,
        sort_by: initialSortBy,
        sort_order: initialSortOrder,
      });

      if (response.data.success) {
        const { items, pagination } = response.data.data;

        setState(prev => ({
          ...prev,
          items,
          currentPage: page,
          totalItems: pagination.total,
          totalPages: pagination.totalPages,
          loading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: response.data.message || 'Gagal mengambil data',
          loading: false,
        }));
        toast.error(response.data.message || 'Gagal mengambil data');
      }
    } catch (error) {
      console.error('Error loading category items:', error);
      setState(prev => ({
        ...prev,
        error: 'Terjadi kesalahan saat mengambil data',
        loading: false,
      }));
      toast.error('Terjadi kesalahan saat mengambil data');
    }
  }, [masterCategoryId, productId, finalCustomerId, initialLimit, initialSortBy, initialSortOrder]);

  // Navigasi pagination
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= state.totalPages) {
      loadItems(page, state.searchQuery);
    }
  }, [loadItems, state.searchQuery, state.totalPages]);

  // Search functionality
  const performSearch = useCallback((searchQuery: string) => {
    setState(prev => ({ ...prev, searchQuery }));
    loadItems(1, searchQuery);
  }, [loadItems]);

  // Refresh data
  const refetch = useCallback(() => {
    loadItems(state.currentPage, state.searchQuery);
  }, [loadItems, state.currentPage, state.searchQuery]);

  // Load initial data
  useEffect(() => {
    if (masterCategoryId && productId && finalCustomerId) {
      loadItems(1, '');
    }
  }, [loadItems, masterCategoryId, productId, finalCustomerId]);

  return {
    items: state.items,
    loading: state.loading,
    error: state.error,
    currentPage: state.currentPage,
    totalItems: state.totalItems,
    totalPages: state.totalPages,
    searchQuery: state.searchQuery,
    goToPage,
    performSearch,
    refetch,
  };
};
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { 
    CatalogItem, 
    CatalogsListRequest, 
    CatalogPagination
} from '@/types/asyncSelect';
import { CatalogManageService } from '@/services/catalogManageService';

interface UseManageCatalogsProps {
    initialPage?: number;
    initialLimit?: number;
    initialFilters?: Partial<CatalogsListRequest>;
}

interface UseManageCatalogsReturn {
    // Data
    catalogs: CatalogItem[];
    loading: boolean;
    error: string | null;
    
    // Pagination
    pagination: CatalogPagination;
    
    // Filters
    filters: CatalogsListRequest;
    setFilters: React.Dispatch<React.SetStateAction<CatalogsListRequest>>;
    
    // Actions
    fetchCatalogs: (params?: Partial<CatalogsListRequest>) => Promise<void>;
    refreshCatalogs: () => Promise<void>;
    handlePageChange: (page: number) => void;
    handleLimitChange: (limit: number) => void;
    handleSearch: (search: string) => void;
    handleSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    handleFilterChange: (key: keyof CatalogsListRequest, value: string) => void;
    clearFilters: () => void;
    
    // Computed
    hasData: boolean;
    isEmpty: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
}

export function useManageCatalogs(props: UseManageCatalogsProps = {}): UseManageCatalogsReturn {
    const { 
        initialPage = 1, 
        initialLimit = 10,
        initialFilters = {}
    } = props;

    // State
    const [catalogs, setCatalogs] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<CatalogPagination>({
        page: initialPage,
        limit: initialLimit,
        total: 0,
        totalPages: 0
    });

    // Filters state
    const [filters, setFilters] = useState<CatalogsListRequest>({
        page: initialPage,
        limit: initialLimit,
        search: '',
        sort_by: '',
        sort_order: 'desc',
        master_pdf_id: '',
        master_catalog: '',
        ...initialFilters
    });

    // Fetch catalogs
    const fetchCatalogs = useCallback(async (params?: Partial<CatalogsListRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const requestParams = { ...filters, ...params };
            const response = await CatalogManageService.getItems(requestParams);

            if (response.success) {
                setCatalogs(response.data.items);
                setPagination(response.data.pagination);
                
                // Update filters state with current params
                setFilters(prev => ({ ...prev, ...requestParams }));
            } else {
                throw new Error(response.message || 'Failed to fetch catalogs');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching catalogs';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Error fetching catalogs:', err);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Refresh catalogs with current filters
    const refreshCatalogs = useCallback(async () => {
        await fetchCatalogs();
    }, [fetchCatalogs]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        fetchCatalogs({ page });
    }, [fetchCatalogs]);

    // Handle limit change
    const handleLimitChange = useCallback((limit: number) => {
        fetchCatalogs({ page: 1, limit });
    }, [fetchCatalogs]);

    // Handle search
    const handleSearch = useCallback((search: string) => {
        fetchCatalogs({ page: 1, search });
    }, [fetchCatalogs]);

    // Handle sort
    const handleSort = useCallback((sort_by: string, sort_order: 'asc' | 'desc') => {
        fetchCatalogs({ sort_by, sort_order });
    }, [fetchCatalogs]);

    // Handle filter change
    const handleFilterChange = useCallback((key: keyof CatalogsListRequest, value: string) => {
        fetchCatalogs({ page: 1, [key]: value });
    }, [fetchCatalogs]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        const defaultFilters: CatalogsListRequest = {
            page: 1,
            limit: initialLimit,
            search: '',
            sort_by: '',
            sort_order: 'asc',
            master_pdf_id: '',
            master_catalog: ''
        };
        setFilters(defaultFilters);
        fetchCatalogs(defaultFilters);
    }, [fetchCatalogs, initialLimit]);

    // Computed values
    const hasData = catalogs.length > 0;
    const isEmpty = !loading && catalogs.length === 0;
    const isFirstPage = pagination.page <= 1;
    const isLastPage = pagination.page >= pagination.totalPages;

    // Initial fetch
    useEffect(() => {
        fetchCatalogs();
    }, []); // Only run once on mount

    return {
        // Data
        catalogs,
        loading,
        error,
        
        // Pagination
        pagination,
        
        // Filters
        filters,
        setFilters,
        
        // Actions
        fetchCatalogs,
        refreshCatalogs,
        handlePageChange,
        handleLimitChange,
        handleSearch,
        handleSort,
        handleFilterChange,
        clearFilters,
        
        // Computed
        hasData,
        isEmpty,
        isFirstPage,
        isLastPage
    };
}

export default useManageCatalogs;
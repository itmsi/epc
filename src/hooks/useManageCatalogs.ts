import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    CatalogDocumentItem, 
    CatalogsListRequest, 
    CatalogPagination,
    CatalogDetailData,
    PartItem
} from '@/types/asyncSelect';
import { CatalogManageService } from '@/services/partCatalogueService';
import { usePartCatalogueManagement } from '@/hooks/usePartCatalogueManagement';

interface UseManageCatalogsProps {
    initialPage?: number;
    initialLimit?: number;
    initialFilters?: Partial<CatalogsListRequest>;
}

interface UseManageCatalogsReturn {
    // Data
    catalogs: CatalogDocumentItem[];
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
    const [catalogs, setCatalogs] = useState<CatalogDocumentItem[]>([]);
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
            sort_order: 'desc',
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

interface UseEditCatalogProps {
    catalogId?: string;
}

interface UseEditCatalogReturn extends ReturnType<typeof usePartCatalogueManagement> {
    // Original catalog data
    catalogData: CatalogDetailData | null;
    
    // Loading states
    loadingCatalog: boolean;
    submitting: boolean;
    
    // Fetch catalog data
    fetchCatalogData: () => Promise<void>;
}

export function useEditCatalog(props: UseEditCatalogProps = {}): UseEditCatalogReturn {
    const { catalogId: propCatalogId } = props;
    const params = useParams();
    const navigate = useNavigate();
    const catalogId = propCatalogId || params.id;

    // Use existing part catalogue management hook
    const partCatalogueHook = usePartCatalogueManagement();

    // Additional states for edit functionality
    const [catalogData, setCatalogData] = useState<CatalogDetailData | null>(null);
    const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    
    // Ref to track if catalog data has been fetched to prevent multiple calls
    const hasFetchedCatalog = useRef<boolean>(false);

    // Fetch catalog data by ID
    const fetchCatalogData = useCallback(async () => {
        if (!catalogId) return;
        
        // Prevent multiple fetches
        if (hasFetchedCatalog.current) return;

        try {
            setLoadingCatalog(true);
            hasFetchedCatalog.current = true;
            
            // Untuk Edit page, gunakan endpoint item_category/{id}
            const response = await CatalogManageService.getCatalogForEdit(catalogId);
            console.log({
                response
            });
            
            if (response.success) {
                // Set catalog data dengan struktur yang minimal untuk Edit page
                setCatalogData({
                    dokumen_name: response.data.dokumen_name || '',
                    master_category_id: response.data.item_category_id || '',
                    master_category_name_en: response.data.master_category_name_en || '',
                    master_category_name_cn: response.data.master_category_name_cn || '',
                    category_id: response.data.category_id || '',
                    category_name_en: response.data.category_name_en || '',
                    category_name_cn: response.data.category_name_cn || '',
                    type_category_id: response.data.type_category_id || '',
                    type_category_name_en: response.data.type_category_name_en || '',
                    type_category_name_cn: response.data.type_category_name_cn || '',
                    items: [], // Empty karena untuk Edit page tidak perlu items
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: 0,
                        totalPages: 1
                    }
                });
                
                // Populate form data dari response
                if (response.data.details && response.data.details.length > 0) {
                    // Transform details ke format PartItem untuk form
                    const parts: PartItem[] = response.data.details.map((detail, index) => ({
                        id: `part-${index}`, // Generate temporary ID
                        target_id: detail.target_id,
                        part_number: detail.part_number,
                        catalog_item_name_en: detail.catalog_item_name_en,
                        catalog_item_name_ch: detail.catalog_item_name_ch,
                        description: detail.description,
                        quantity: detail.quantity,
                        unit: detail.unit || '',
                        file_foto: null
                    }));
                    
                    // Update form data using the existing hook's setFormData
                    partCatalogueHook.setFormData(prev => ({
                        ...prev,
                        code_cabin: response.data.dokumen_name,
                        master_category: response.data.category_id, // Gunakan category_id
                        part_id: response.data.category_id, // category_id
                        type_id: response.data.type_category_id, // type_category_id
                        part_type: '', // Perlu mapping dari category/type
                        svg_image: null, // File SVG dari item_category_foto jika diperlukan
                        parts: parts // Parts dari details
                    }));
                }
            } else {
                toast.error(response.message || 'Failed to load catalog data');
            }
        } catch (error) {
            console.error('Error fetching catalog data:', error);
            toast.error('Failed to load catalog data');
            hasFetchedCatalog.current = false; // Reset on error to allow retry
        } finally {
            setLoadingCatalog(false);
        }
    }, [catalogId, partCatalogueHook.setFormData]);

    // Override the submit handler for update functionality
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!catalogId) {
            toast.error('Catalog ID is required');
            return;
        }
        
        const errors = partCatalogueHook.validateForm();
        partCatalogueHook.setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error('Please fix the validation errors');
            return;
        }

        try {
            setSubmitting(true);
            
            // Call the update service
            const response = await CatalogManageService.updateItemsById(catalogId, partCatalogueHook.formData);
            
            if (response.data?.success) {
                toast.success('Catalog updated successfully!');
                // Navigate back to manage page
                navigate('/epc/manage');
            } else {
                toast.error(response.data?.message || 'Failed to update catalog');
            }
            
        } catch (error) {
            console.error('Error updating catalog:', error);
            toast.error('Failed to update catalog');
        } finally {
            setSubmitting(false);
        }
    }, [catalogId, partCatalogueHook, navigate, setSubmitting]);

    // Load catalog data on mount
    useEffect(() => {
        if (catalogId) {
            fetchCatalogData();
        }
    }, [catalogId, fetchCatalogData]);

    return {
        ...partCatalogueHook,
        
        // Override handleSubmit for update functionality
        handleSubmit,
        
        // Additional edit-specific properties
        catalogData,
        loadingCatalog,
        submitting,
        fetchCatalogData
    };
}

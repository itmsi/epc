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

    catalogs: CatalogDocumentItem[];
    loading: boolean;
    error: string | null;
    
    pagination: CatalogPagination;
    
    filters: CatalogsListRequest;
    setFilters: React.Dispatch<React.SetStateAction<CatalogsListRequest>>;
    
    fetchCatalogs: (params?: Partial<CatalogsListRequest>, append?: boolean) => Promise<void>;
    refreshCatalogs: () => Promise<void>;
    handlePageChange: (page: number) => void;
    handleLimitChange: (limit: number) => void;
    handleSearch: (search: string) => void;
    handleSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    handleFilterChange: (key: keyof CatalogsListRequest, value: string) => void;
    clearFilters: () => void;
    
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


    const [catalogs, setCatalogs] = useState<CatalogDocumentItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<CatalogPagination>({
        page: initialPage,
        limit: initialLimit,
        total: 0,
        totalPages: 0
    });


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


    const fetchCatalogs = useCallback(async (params?: Partial<CatalogsListRequest>, append: boolean = false) => {
        try {
            setLoading(true);
            setError(null);

            const requestParams = { ...filters, ...params };
            const response = await CatalogManageService.getItems(requestParams);

            if (response.success) {
                if (append && requestParams.page > 1) {
                    // Append new items for infinite scrolling
                    setCatalogs(prev => [...prev, ...response.data.items]);
                } else {
                    // Replace all items for new search/filter
                    setCatalogs(response.data.items);
                }
                setPagination(response.data.pagination);
                
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


    const refreshCatalogs = useCallback(async () => {
        await fetchCatalogs();
    }, [fetchCatalogs]);


    const handlePageChange = useCallback((page: number) => {
        fetchCatalogs({ page });
    }, [fetchCatalogs]);


    const handleLimitChange = useCallback((limit: number) => {
        fetchCatalogs({ page: 1, limit });
    }, [fetchCatalogs]);


    const handleSearch = useCallback((search: string) => {
        fetchCatalogs({ page: 1, search });
    }, [fetchCatalogs]);


    const handleSort = useCallback((sort_by: string, sort_order: 'asc' | 'desc') => {
        fetchCatalogs({ sort_by, sort_order });
    }, [fetchCatalogs]);


    const handleFilterChange = useCallback((key: keyof CatalogsListRequest, value: string) => {
        fetchCatalogs({ page: 1, [key]: value });
    }, [fetchCatalogs]);


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


    const hasData = catalogs.length > 0;
    const isEmpty = !loading && catalogs.length === 0;
    const isFirstPage = pagination.page <= 1;
    const isLastPage = pagination.page >= pagination.totalPages;


    useEffect(() => {
        fetchCatalogs();
    }, []);

    return {
        catalogs,
        loading,
        error,
        pagination,
        filters,
        setFilters,
        fetchCatalogs,
        refreshCatalogs,
        handlePageChange,
        handleLimitChange,
        handleSearch,
        handleSort,
        handleFilterChange,
        clearFilters,
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
    catalogData: CatalogDetailData | null;
    loadingCatalog: boolean;
    submitting: boolean;
    fetchCatalogData: () => Promise<void>;
}

export function useEditCatalog(props: UseEditCatalogProps = {}): UseEditCatalogReturn {
    const { catalogId: propCatalogId } = props;
    const params = useParams();
    const navigate = useNavigate();
    const catalogId = propCatalogId || params.id;
    const partCatalogueHook = usePartCatalogueManagement();
    const [catalogData, setCatalogData] = useState<CatalogDetailData | null>(null);
    const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const hasFetchedCatalog = useRef<boolean>(false);
    const fetchCatalogData = useCallback(async () => {
        if (!catalogId) return;
        
        if (hasFetchedCatalog.current) return;

        try {
            setLoadingCatalog(true);
            hasFetchedCatalog.current = true;
            const response = await CatalogManageService.getCatalogForEdit(catalogId);
            
            if (response.success) {
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
                    items: [],
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: 0,
                        totalPages: 1
                    }
                });
                
                if (response.data.details && response.data.details.length > 0) {
                    const parts: PartItem[] = response.data.details.map((detail, index) => ({
                        id: `part-${index}`,
                        target_id: detail.target_id,
                        part_number: detail.part_number,
                        catalog_item_name_en: detail.catalog_item_name_en,
                        catalog_item_name_ch: detail.catalog_item_name_ch,
                        description: detail.description,
                        quantity: detail.quantity,
                        unit: detail.unit || '',
                        file_foto: null
                    }));
                    
                    partCatalogueHook.setFormData(prev => ({
                        ...prev,
                        code_cabin: response.data.dokumen_name,
                        master_category: response.data.category_id,
                        part_id: response.data.category_id,
                        type_id: response.data.type_category_id,
                        part_type: '',
                        svg_image: null,
                        parts: parts
                    }));
                }
            } else {
                toast.error(response.message || 'Failed to load catalog data');
            }
        } catch (error) {
            console.error('Error fetching catalog data:', error);
            toast.error('Failed to load catalog data');
            hasFetchedCatalog.current = false;
        } finally {
            setLoadingCatalog(false);
        }
    }, [catalogId, partCatalogueHook.setFormData]);


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
            
        
            const response = await CatalogManageService.updateItemsById(catalogId, partCatalogueHook.formData);
            
            if (response.data?.success) {
                toast.success('Catalog updated successfully!');
            
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


    useEffect(() => {
        if (catalogId) {
            fetchCatalogData();
        }
    }, [catalogId, fetchCatalogData]);

    return {
        ...partCatalogueHook,
        
    
        handleSubmit,
        
    
        catalogData,
        loadingCatalog,
        submitting,
        fetchCatalogData
    };
}

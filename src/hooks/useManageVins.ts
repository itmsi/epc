import { useState, useCallback, useEffect, useRef } from 'react';
import { SelectOption } from '@/types/asyncSelect';
import { UseManageVinsProps, Vin, VinFilters, VinFormData, VinDetailItem, VinListRequest, VinPagination } from '@/types/partCatalogue';
import { VinService } from '@/services/partCatalogueService';
import { useManageCatalogs } from '@/hooks/useManageCatalogs';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router';

interface UseMasterVinManagerReturn {
    // Catalog state
    catalogs: any[];
    loading: boolean;
    pagination: any;
    
    // Search operations
    loadCatalogOptions: (inputValue: string) => Promise<SelectOption[]>;
    handleMenuScrollToBottom: () => void;
    createCatalogOptions: () => SelectOption[];
    
    // Search timeout management
    searchTimeout: NodeJS.Timeout | null;
    setSearchTimeout: React.Dispatch<React.SetStateAction<NodeJS.Timeout | null>>;
}

export const useMasterVinManager = (): UseMasterVinManagerReturn => {
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Use catalog management hook for catalog selection
    const {
        catalogs,
        loading,
        fetchCatalogs,
        pagination
    } = useManageCatalogs({
        initialLimit: 5
    });

    // Cleanup search timeout on unmount
    useEffect(() => {
        return () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
        };
    }, [searchTimeout]);

    // Create options from catalogs
    const createCatalogOptions = useCallback((): SelectOption[] => {
        console.log({
            catalogsLength: catalogs.length,
            hasNextPage: pagination?.totalPages > pagination?.page,
            currentPage: pagination?.page
        });
        
        return catalogs.map(catalog => ({
            value: catalog.dokumen_id,
            label: `${catalog.dokumen_name}${catalog.master_category_name_en ? ` - ${catalog.master_category_name_en}` : ''}`
        }));
    }, [catalogs, pagination]);

    // Load catalog options with search and pagination
    const loadCatalogOptions = useCallback(async (inputValue: string): Promise<SelectOption[]> => {
        console.log('loadCatalogOptions called with:', `"${inputValue}"`);
        
        // Clear existing timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
            setSearchTimeout(null);
        }

        // Return a promise that resolves after debounce
        return new Promise((resolve) => {
            const timeoutId = setTimeout(async () => {
                try {
                    const searchTerm = inputValue?.trim() || '';
                    console.log('Executing search after debounce for:', `"${searchTerm}"`);
                    
                    if (searchTerm.length > 0) {
                        console.log('Searching with term:', searchTerm);
                        // Reset pagination and search
                        await fetchCatalogs({ 
                            page: 1, 
                            search: searchTerm 
                        });
                    } else {
                        console.log('Loading default options (no search term)');
                        // If no search term, load first page without search
                        await fetchCatalogs({ 
                            page: 1, 
                            search: '' 
                        });
                    }
                    
                    const options = createCatalogOptions();
                    console.log('Returning', options.length, 'options for search term:', `"${searchTerm}"`);
                    resolve(options);
                } catch (error) {
                    console.error('Error in loadCatalogOptions:', error);
                    resolve([]);
                }
                setSearchTimeout(null);
            }, 300); // Reduced debounce to 300ms for better responsiveness
            
            setSearchTimeout(timeoutId);
        });
    }, [searchTimeout, fetchCatalogs, createCatalogOptions]);

    // Handle scroll to bottom for pagination
    const handleMenuScrollToBottom = useCallback(() => {
        console.log('Scroll to bottom triggered:', {
            loading: loading,
            hasNextPage: pagination?.page < pagination?.totalPages,
            currentPage: pagination?.page
        });
        
        if (!loading && pagination?.page < pagination?.totalPages) {
            const nextPage = pagination.page + 1;
            console.log('Loading next page:', nextPage);
            
            // Fetch halaman berikutnya
            fetchCatalogs({ page: nextPage });
        }
    }, [loading, pagination, fetchCatalogs]);

    return {
        // Catalog state
        catalogs,
        loading,
        pagination,
        
        // Search operations
        loadCatalogOptions,
        handleMenuScrollToBottom,
        createCatalogOptions,
        
        // Search timeout management
        searchTimeout,
        setSearchTimeout
    };
};


// CREATE VIN USING THE HOOK
interface UseManageVinsReturn {
    // Data
    vins: Vin[];
    loading: boolean;
    error: string | null;
    
    // Pagination
    pagination: VinPagination | null;
    
    // Filters
    filters: VinListRequest;
    setFilters: React.Dispatch<React.SetStateAction<VinListRequest>>;
    
    // Search specific states
    searchInput: string;
    setSearchInput: React.Dispatch<React.SetStateAction<string>>;
    
    // Actions
    fetchVins: (params?: Partial<VinListRequest>) => Promise<void>;
    refreshVins: () => Promise<void>;
    handlePageChange: (page: number) => void;
    handleLimitChange: (limit: number) => void;
    handleSearch: (search: string) => void;
    handleManualSearch: () => void;
    handleSort: (sortOrder: 'asc' | 'desc') => void;
    handleFilterChange: (key: keyof VinListRequest, value: string | number) => void;
    clearFilters: () => void;
    
    // Computed
    hasData: boolean;
    isEmpty: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
}

export function useManageVins(props: UseManageVinsProps = {}): UseManageVinsReturn {
    const {
        initialPage = 1,
        initialLimit = 10,
        initialFilters = {}
    } = props;

    // State management
    const [vins, setVins] = useState<Vin[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<VinPagination | null>(null);

    // Search input state for debouncing
    const [searchInput, setSearchInput] = useState<string>(initialFilters.search || '');
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Filter state
    const [filters, setFilters] = useState<VinListRequest>({
        page: initialPage,
        limit: initialLimit,
        search: initialFilters.search || '',
        sort_order: initialFilters.sort_order || ''
    });

    // Fetch vins function
    const fetchVins = useCallback(async (params?: Partial<VinListRequest>) => {
        try {
            setLoading(true);
            setError(null);

            const requestParams = { ...filters, ...params };
            
            const vinFilters: Partial<VinFilters> = {
                search: requestParams.search || '',
                sort_order: requestParams.sort_order || 'desc'
            };

            const response = await VinService.getVins(
                requestParams.page || 1,
                requestParams.limit || 10,
                vinFilters
            );

            if (response.data?.success) {
                setVins(response.data.data.items || []);
                setPagination(response.data.data.pagination || null);
            } else {
                throw new Error(response.data?.message || 'Failed to fetch VINs');
            }
        } catch (error: any) {
            console.error('Error fetching VINs:', error);
            setError(error.message || 'Failed to fetch VINs');
            toast.error('Failed to fetch VINs');
            setVins([]);
            setPagination(null);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Refresh function
    const refreshVins = useCallback(async () => {
        await fetchVins();
    }, [fetchVins]);

    // Debounced search effect
    useEffect(() => {
        // Clear previous timeout
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Set new timeout for debounced search
        debounceRef.current = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
        }, 500); // 500ms delay

        // Cleanup timeout on unmount
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, [searchInput]);

    // Event handlers
    const handlePageChange = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);

    const handleLimitChange = useCallback((limit: number) => {
        setFilters(prev => ({ ...prev, limit, page: 1 })); // Reset to first page when changing limit
    }, []);

    const handleSearch = useCallback((search: string) => {
        setFilters(prev => ({ ...prev, search, page: 1 })); // Reset to first page when searching
    }, []);

    // Manual search handler for immediate search trigger
    const handleManualSearch = useCallback(() => {
        // Clear any pending debounced search
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        // Immediately trigger search with current input
        setFilters(prev => ({ ...prev, search: searchInput, page: 1 }));
    }, [searchInput]);

    const handleSort = useCallback((sort_order: 'asc' | 'desc') => {
        setFilters(prev => ({ ...prev, sort_order, page: 1 })); // Reset to first page when sorting
    }, []);

    const handleFilterChange = useCallback((key: keyof VinListRequest, value: string | number) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 })); // Reset to first page when changing filters
    }, []);

    const clearFilters = useCallback(() => {
        setSearchInput(''); // Clear search input as well
        setFilters({
            page: 1,
            limit: initialLimit,
            search: '',
            sort_order: 'desc'
        });
    }, [initialLimit]);

    // Computed values
    const hasData = vins.length > 0;
    const isEmpty = !loading && vins.length === 0;
    const isFirstPage = (pagination?.page || 1) === 1;
    const isLastPage = (pagination?.page || 1) === (pagination?.totalPages || 1);

    // Effect to fetch data when filters change
    useEffect(() => {
        fetchVins();
    }, [filters.page, filters.limit, filters.search, filters.sort_order]); // Only depend on filter values, not the fetchVins function

    return {
        // Data
        vins,
        loading,
        error,
        
        // Pagination
        pagination,
        
        // Filters
        filters,
        setFilters,
        
        // Search
        searchInput,
        setSearchInput,
        
        // Actions
        fetchVins,
        refreshVins,
        handlePageChange,
        handleLimitChange,
        handleSearch,
        handleManualSearch,
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

// USE CREATE VIN HOOK
interface UseCreateVinReturn {
    // Form state
    formData: VinFormData;
    setFormData: React.Dispatch<React.SetStateAction<VinFormData>>;
    errors: Partial<VinFormData>;
    setErrors: React.Dispatch<React.SetStateAction<Partial<VinFormData>>>;
    submitting: boolean;
    
    // Search state
    searchInputValues: { [key: number]: string };
    setSearchInputValues: React.Dispatch<React.SetStateAction<{ [key: number]: string }>>;
    searchTimeout: NodeJS.Timeout | null;
    setSearchTimeout: React.Dispatch<React.SetStateAction<NodeJS.Timeout | null>>;
    
    // Actions
    handleInputChange: (name: keyof VinFormData, value: string) => void;
    addMasterPdf: () => void;
    removeMasterPdf: (index: number) => void;
    updateMasterPdfSelection: (index: number, selectedOption: SelectOption | null) => void;
    handleDetailInputChange: (index: number, field: keyof Omit<VinDetailItem, 'dokumen_id'>, value: string) => void;
    handleSearchInputChange: (index: number) => (inputValue: string) => void;
    validateForm: () => boolean;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export const useCreateVin = (): UseCreateVinReturn => {
    const navigate = useNavigate();
    
    // Form state
    const [formData, setFormData] = useState<VinFormData>({
        vin_number: '',
        product_name_en: '',
        product_name_cn: '',
        product_description: '',
        data_details: []
    });

    // Validation errors
    const [errors, setErrors] = useState<Partial<VinFormData>>({});
    
    // Submission state
    const [submitting, setSubmitting] = useState(false);
    
    // Search state
    const [searchInputValues, setSearchInputValues] = useState<{ [key: number]: string }>({});
    const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

    // Handle input changes
    const handleInputChange = useCallback((name: keyof VinFormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    // Add detail item
    const addMasterPdf = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            data_details: [
                ...(prev.data_details || []),
                { 
                    dokumen_id: '',
                    product_detail_name_en: '',
                    product_detail_name_cn: '',
                    product_detail_description: ''
                }
            ]
        }));
    }, []);

    // Remove detail item
    const removeMasterPdf = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            data_details: prev.data_details?.filter((_, i) => i !== index) || []
        }));
        
        // Clean up search input value for removed field
        setSearchInputValues(prev => {
            const newValues = { ...prev };
            delete newValues[index];
            // Reindex remaining values
            const reindexed: { [key: number]: string } = {};
            Object.keys(newValues)
                .map(k => parseInt(k))
                .filter(k => k > index)
                .forEach(k => {
                    reindexed[k - 1] = newValues[k];
                });
            Object.keys(newValues)
                .map(k => parseInt(k))
                .filter(k => k < index)
                .forEach(k => {
                    reindexed[k] = newValues[k];
                });
            return reindexed;
        });
    }, []);

    // Update catalog selection
    const updateMasterPdfSelection = useCallback((index: number, selectedOption: SelectOption | null) => {
        const dokumen_id = selectedOption ? String(selectedOption.value) : '';
        console.log({
            dokumen_id
        });
        
        setFormData(prev => ({
            ...prev,
            data_details: prev.data_details?.map((item, i) => 
                i === index ? { ...item, dokumen_id } : item
            ) || []
        }));
    }, []);

    // Handle detail input change
    const handleDetailInputChange = useCallback((index: number, field: keyof Omit<VinDetailItem, 'dokumen_id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            data_details: prev.data_details?.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            ) || []
        }));
    }, []);

    // Handle search input change
    const handleSearchInputChange = useCallback((index: number) => (inputValue: string) => {
        setSearchInputValues(prev => ({
            ...prev,
            [index]: inputValue
        }));
        console.log(`Search input for field ${index} changed to:`, `"${inputValue}"`);
    }, []);

    // Validate form
    const validateForm = useCallback((): boolean => {
        const newErrors: Partial<VinFormData> = {};

        if (!formData.vin_number.trim()) {
            newErrors.vin_number = 'VIN Number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setSubmitting(true);

        try {
            const response = await VinService.createVin(formData);

            if (response.data?.success) {
                toast.success(response.data?.message || 'VIN created successfully');
                navigate('/epc/vins');
            } else {
                toast.error(response.data?.message || response.message || 'Failed to create VIN');
            }
        } catch (error) {
            console.error('Error creating VIN:', error);
            toast.error('An error occurred while creating VIN');
        } finally {
            setSubmitting(false);
        }
    }, [formData, validateForm, navigate]);

    return {
        // Form state
        formData,
        setFormData,
        errors,
        setErrors,
        submitting,
        
        // Search state
        searchInputValues,
        setSearchInputValues,
        searchTimeout,
        setSearchTimeout,
        
        // Actions
        handleInputChange,
        addMasterPdf,
        removeMasterPdf,
        updateMasterPdfSelection,
        handleDetailInputChange,
        handleSearchInputChange,
        validateForm,
        handleSubmit
    };
};
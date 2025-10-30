import { useState, useCallback, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { 
    SelectOption,
    PartItem,
    PartCatalogueFormData,
    CatalogValidationErrors
} from '@/types/asyncSelect';
import { usePartCatalogueManagement } from '@/hooks/usePartCatalogueManagement';
import { MasterCategoryService, DetailCatalogService, CatalogManageService } from '@/services/partCatalogueService';
import { useCategory } from '@/hooks/usePartCatalogue';

// Local interface for async select return type
interface AsyncSelectHookReturn {
    partOptions: SelectOption[];
    loadPartOptions: (searchQuery: string) => Promise<SelectOption[]>;
    pagination: any;
    handleScrollToBottom: () => Promise<void>;
    filterOptions: (options: SelectOption[], searchQuery: string) => SelectOption[];
    getSelectedOption: (value: string, options: SelectOption[]) => SelectOption | null;
    resetPagination: () => void;
    isLoading: boolean;
    
    // Master Category functionality
    masterCategoryOptions: SelectOption[];
    loadMasterCategoryOptions: (searchQuery: string) => Promise<SelectOption[]>;
    handleMasterCategoryScrollToBottom: () => Promise<void>;
    masterCategoryLoading: boolean;
    masterCategorySearchValue: string;
    handleMasterCategorySearchChange: (value: string) => void;
    
    // Detail Catalog functionality
    detailCatalogOptions: SelectOption[];
    loadDetailCatalogOptions: (searchQuery: string) => Promise<SelectOption[]>;
    handleDetailCatalogScrollToBottom: () => Promise<void>;
    detailCatalogLoading: boolean;
    detailCatalogSearchValue: string;
    handleDetailCatalogSearchChange: (value: string) => void;
}

interface UseCreateCatalogReturn {
    // Search state
    searchInputValue: string;
    setSearchInputValue: (value: string) => void;
    handleSearchInputChange: (inputValue: string) => void;
    
    // Part options management
    partOptions: SelectOption[];
    loadPartOptions: (searchQuery: string) => Promise<SelectOption[]>;
    
    // CSV handling
    parseCSVFile: (file: File) => Promise<PartItem[]>;
    handleCSVUpload: (file: File | null) => Promise<void>;
    
    // Form management from existing hook
    formData: PartCatalogueFormData;
    setFormData: React.Dispatch<React.SetStateAction<PartCatalogueFormData>>;
    validationErrors: CatalogValidationErrors;
    setValidationErrors: React.Dispatch<React.SetStateAction<CatalogValidationErrors>>;
    catalogueDataLoading: boolean;
    selectedPartData: any; 
    subTypes: any[];
    getSubTypeOptions: () => SelectOption[];
    handleSelectChange: (name: string) => (selectedOption: { value: string; label: string; } | null) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAddPart: () => void;
    handleRemovePart: (partId: string) => void;
    handlePartChange: (partId: string, field: keyof PartItem, value: string | number) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    loading: boolean;
    
    // Async select hook
    asyncSelectHook: AsyncSelectHookReturn;
}

export const useCreateCatalog = (): UseCreateCatalogReturn => {
    // Search state
    const [searchInputValue, setSearchInputValue] = useState('');
    
    // Local loading state for form operations
    const [formSubmitLoading, setFormSubmitLoading] = useState(false);
    
    // Use the existing part catalogue management hook
    const partCatalogueHook = usePartCatalogueManagement();
    const {
        formData,
        setFormData,
        validationErrors,
        setValidationErrors
    } = partCatalogueHook;

    // Use the category hook to get categories based on master_category_id
    const categoryHook = useCategory();

    // Fetch categories when master_category changes
    useEffect(() => {
        if (formData.master_category) {
            // Update category filters to include master_category_id
            // useCategory hook will automatically fetch when filter changes
            categoryHook.handleFilterChange('master_category_id', formData.master_category);
        }
    }, [formData.master_category]); // Remove categoryHook from dependencies to prevent infinite loop

    // Reset detail catalog options when part_id is cleared
    useEffect(() => {
        if (!formData.part_id) {
            setDetailCatalogOptions([]);
            setDetailCatalogSearchValue('');
        }
    }, [formData.part_id]);

    // Memoize part options from categories when master_category is selected
    const partOptions = useMemo(() => {
        if (formData.master_category && categoryHook.categories && categoryHook.categories.length > 0) {
            return categoryHook.categories.map(category => ({
                value: category.category_id,
                label: `${category.category_name_en} ${category.category_name_cn ? `- ${category.category_name_cn}` : ''}`
            }));
        }
        
        // Return empty array if no master_category is selected
        return [];
    }, [formData.master_category, categoryHook.categories]);

    // Create load options function for AsyncSelect with search capability
    const loadPartOptions = useCallback(async (searchQuery: string): Promise<SelectOption[]> => {
        if (!formData.master_category) {
            return [];
        }
        
        try {
            // Update search filter and fetch categories
            categoryHook.handleFilterChange('search', searchQuery);
            await categoryHook.fetchCategories(1, 20);
            
            return categoryHook.categories.map(category => ({
                value: category.category_id,
                label: `${category.category_name_en} ${category.category_name_cn ? `- ${category.category_name_cn}` : ''}`
            }));
        } catch (error) {
            console.error('Error loading part options:', error);
            return [];
        }
    }, [formData.master_category, categoryHook]);

    // Handle search input change
    const handleSearchInputChange = useCallback((inputValue: string) => {
        setSearchInputValue(inputValue);
    }, []);

    // Clear search input when part type changes
    useEffect(() => {
        setSearchInputValue('');
    }, [formData.part_type]);

    // Parse CSV file and convert to parts data
    const parseCSVFile = useCallback((file: File): Promise<PartItem[]> => {
        return new Promise((resolve, reject) => {
            Papa.parse<Record<string, string>>(file, {
                header: true,
                skipEmptyLines: true,
                transform: (value: string) => {
                    // Trim whitespace from all values
                    return typeof value === 'string' ? value.trim() : value;
                },
                complete: (results: Papa.ParseResult<Record<string, string>>) => {
                    if (results.errors.length > 0) {
                        console.error('CSV parsing errors:', results.errors);
                        toast.error('CSV parsing failed: ' + results.errors[0].message);
                        reject(new Error('CSV parsing failed: ' + results.errors[0].message));
                        return;
                    }

                    try {
                        // Map CSV data to internal part structure
                        const parsedParts: PartItem[] = results.data.map((row: any, index: number) => {
                            // Validate required fields
                            const requiredFields = ['target_id', 'part_number', 'catalog_item_name_en', 'catalog_item_name_ch', 'quantity'];
                            const missingFields = requiredFields.filter(field => !row[field]);
                            
                            if (missingFields.length > 0) {
                                throw new Error(`Row ${index + 1}: Missing required fields: ${missingFields.join(', ')}`);
                            }

                            // Convert to internal format
                            return {
                                id: `csv-${Date.now()}-${index}`,
                                target_id: row.target_id || '',
                                part_number: row.part_number || '',
                                quantity: parseInt(row.quantity) || 1,
                                catalog_item_name_en: row.catalog_item_name_en || '',
                                catalog_item_name_ch: row.catalog_item_name_ch || '',
                                description: row.description || '',
                                unit: row.unit || '',
                                file_foto: null
                            };
                        });

                        toast.success(`Successfully parsed ${parsedParts.length} parts from CSV`);
                        resolve(parsedParts);
                    } catch (error: any) {
                        toast.error('Error processing CSV data: ' + error.message);
                        reject(error);
                    }
                },
                error: (error: Error) => {
                    toast.error('Failed to parse CSV file: ' + error.message);
                    reject(new Error('Failed to parse CSV file: ' + error.message));
                }
            });
        });
    }, []);

    // Handle CSV file upload and parsing
    const handleCSVUpload = useCallback(async (file: File | null) => {
        if (!file) return;

        try {
            // Parse CSV and populate parts directly (no longer storing CSV file)
            const parsedParts = await parseCSVFile(file);
            
            // Update form data with parsed parts
            setFormData((prev: PartCatalogueFormData) => ({
                ...prev,
                parts: parsedParts
            }));

            toast.success(`Successfully imported ${parsedParts.length} parts from CSV`);
        } catch (error: any) {
            console.error('CSV upload error:', error);
            toast.error('Failed to process CSV file: ' + error.message);
        }
    }, [parseCSVFile, setFormData]);

    // Master Category functionality
    const [masterCategoryOptions, setMasterCategoryOptions] = useState<SelectOption[]>([]);
    const [masterCategoryLoading, setMasterCategoryLoading] = useState(false);
    const [masterCategorySearchValue, setMasterCategorySearchValue] = useState('');
    
    // Master Category pagination state
    const [masterCategoryPage, setMasterCategoryPage] = useState(1);
    const [masterCategoryHasMore, setMasterCategoryHasMore] = useState(true);
    const masterCategoryPageLimit = 5;

    // Fetch master categories data
    const fetchMasterCategories = useCallback(async (page: number = 1, append: boolean = false) => {
        setMasterCategoryLoading(true);
        try {
            const response = await MasterCategoryService.getMasterCategories(page, masterCategoryPageLimit, {
                search: masterCategorySearchValue
            });
            
            if (response.data.success) {
                const newMasterCategories = response.data.data.items;
                const totalItems = response.data.data.pagination.total;
                
                setMasterCategoryHasMore(page * masterCategoryPageLimit < totalItems);
                
                if (append) {
                    // Append new data for pagination
                    const newOptions: SelectOption[] = newMasterCategories.map(mc => ({
                        value: mc.master_category_id,
                        label: `${mc.master_category_name_en} ${mc.master_category_name_cn ? `- ${mc.master_category_name_cn}` : ''}`
                    }));
                    setMasterCategoryOptions(prev => [...prev, ...newOptions]);
                } else {
                    // Initial load or search
                    const options: SelectOption[] = newMasterCategories.map(mc => ({
                        value: mc.master_category_id,
                        label: `${mc.master_category_name_en} ${mc.master_category_name_cn ? `- ${mc.master_category_name_cn}` : ''}`
                    }));
                    setMasterCategoryOptions(options);
                }
            }
        } catch (error) {
            console.error('Error fetching master categories:', error);
            toast.error('Failed to load master categories');
        } finally {
            setMasterCategoryLoading(false);
        }
    }, [masterCategorySearchValue]);

    // Load master category options for search
    const loadMasterCategoryOptions = useCallback(async (searchQuery: string): Promise<SelectOption[]> => {
        try {
            const response = await MasterCategoryService.getMasterCategories(1, masterCategoryPageLimit, {
                search: searchQuery
            });
            
            if (response.data.success) {
                const options = response.data.data.items.map(mc => ({
                    value: mc.master_category_id,
                    label: `${mc.master_category_name_en} ${mc.master_category_name_cn ? `- ${mc.master_category_name_cn}` : ''}`
                }));
                return options;
            }
            return [];
        } catch (error) {
            console.error('Error loading master category options:', error);
            return [];
        }
    }, []);

    // Handle master category search change
    const handleMasterCategorySearchChange = useCallback((value: string) => {
        setMasterCategorySearchValue(value);
    }, []);

    // Handle master category scroll to bottom for infinite scroll
    const handleMasterCategoryScrollToBottom = useCallback(async () => {
        if (masterCategoryHasMore && !masterCategoryLoading) {
            const nextPage = masterCategoryPage + 1;
            setMasterCategoryPage(nextPage);
            await fetchMasterCategories(nextPage, true);
        }
    }, [masterCategoryHasMore, masterCategoryLoading, masterCategoryPage]); // Remove fetchMasterCategories to prevent circular dependency

    // Initial fetch of master categories - run only once on mount
    useEffect(() => {
        fetchMasterCategories(1, false);
    }, []); // Empty dependency to run only once

    // Detail Catalog functionality
    const [detailCatalogOptions, setDetailCatalogOptions] = useState<SelectOption[]>([]);
    const [detailCatalogLoading, setDetailCatalogLoading] = useState(false);
    const [detailCatalogSearchValue, setDetailCatalogSearchValue] = useState('');
    
    // Detail Catalog pagination state
    const [detailCatalogPage, setDetailCatalogPage] = useState(1);
    const [detailCatalogHasMore, setDetailCatalogHasMore] = useState(false);

    // Fetch detail catalogs data - Define before useEffect that uses it
    const fetchDetailCatalogs = useCallback(async (page: number = 1, append: boolean = false) => {
        if (!formData.part_id) return;
        
        setDetailCatalogLoading(true);
        try {
            // Use getDetailCatalog with category_id filter to get list of type categories
            const response = await DetailCatalogService.getDetailCatalog(page, 10, {
                category_id: formData.part_id,
                search: detailCatalogSearchValue,
                sort_order: 'desc'
            });
            
            if (response.data.success && response.data.data.items) {
                // Map items to select options
                const options: SelectOption[] = response.data.data.items.map(item => ({
                    value: item.type_category_id,
                    label: `${item.type_category_name_en} ${item.type_category_name_cn ? `- ${item.type_category_name_cn}` : ''}`
                }));
                
                if (append) {
                    setDetailCatalogOptions(prev => [...prev, ...options]);
                } else {
                    setDetailCatalogOptions(options);
                }
                
                // Update pagination state
                const pagination = response.data.data.pagination;
                setDetailCatalogHasMore(page < pagination.totalPages);
            } else {
                if (!append) {
                    setDetailCatalogOptions([]);
                }
                setDetailCatalogHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching detail catalogs:', error);
            toast.error('Failed to load detail catalogs');
            if (!append) {
                setDetailCatalogOptions([]);
            }
            setDetailCatalogHasMore(false);
        } finally {
            setDetailCatalogLoading(false);
        }
    }, [formData.part_id, detailCatalogSearchValue]);

    // Fetch detail catalogs when part_id changes
    useEffect(() => {
        if (formData.part_id) {
            setDetailCatalogPage(1);
            setDetailCatalogHasMore(false);
            fetchDetailCatalogs(1, false);
        } else {
            setDetailCatalogOptions([]);
            setDetailCatalogSearchValue('');
            setDetailCatalogPage(1);
            setDetailCatalogHasMore(false);
        }
    }, [formData.part_id, fetchDetailCatalogs]); // Add fetchDetailCatalogs to dependencies

    // Load detail catalog options for search
    const loadDetailCatalogOptions = useCallback(async (searchQuery: string): Promise<SelectOption[]> => {
        if (!formData.part_id) {
            return [];
        }

        try {
            // Use getDetailCatalog with search and category_id filter
            const response = await DetailCatalogService.getDetailCatalog(1, 10, {
                category_id: formData.part_id,
                search: searchQuery,
                sort_order: 'desc'
            });
            
            if (response.data.success && response.data.data.items) {
                // Map items to select options
                const options: SelectOption[] = response.data.data.items.map(item => ({
                    value: item.type_category_id,
                    label: `${item.type_category_name_en} ${item.type_category_name_cn ? `- ${item.type_category_name_cn}` : ''}`
                }));
                
                return options;
            }
            return [];
        } catch (error) {
            console.error('Error loading detail catalog options:', error);
            return [];
        }
    }, [formData.part_id]);    // Handle detail catalog search change
    const handleDetailCatalogSearchChange = useCallback((value: string) => {
        setDetailCatalogSearchValue(value);
    }, []);

    // Handle detail catalog scroll to bottom for infinite scroll
    const handleDetailCatalogScrollToBottom = useCallback(async () => {
        if (detailCatalogHasMore && !detailCatalogLoading) {
            const nextPage = detailCatalogPage + 1;
            setDetailCatalogPage(nextPage);
            await fetchDetailCatalogs(nextPage, true);
        }
    }, [detailCatalogHasMore, detailCatalogLoading, detailCatalogPage, fetchDetailCatalogs]);

    // Validation function for new system
    const validateCreateCatalogForm = useCallback((): CatalogValidationErrors => {
        const errors: CatalogValidationErrors = {};

        // Required field validations
        if (!formData.code_cabin.trim()) {
            errors.code_cabin = 'Code Cabin is required';
        }

        if (!formData.master_category) {
            errors.master_category = 'Master Category is required';
        }

        if (!formData.part_id) {
            errors.part_id = 'Part selection is required';
        }

        if (!formData.type_id) {
            errors.type_id = 'Type selection is required';
        }

        // Parts validation
        if (formData.parts.length === 0) {
            errors.parts = 'At least one part is required';
        } else {
            // Validate each part
            formData.parts.forEach((part, index) => {
                if (!part.target_id.trim()) {
                    (errors as any)[`part_${index}_target`] = `Part ${index + 1} target is required`;
                }
                if (!part.part_number.trim()) {
                    (errors as any)[`part_${index}_code`] = `Part ${index + 1} number is required`;
                }
                if (!part.catalog_item_name_en.trim()) {
                    (errors as any)[`part_${index}_name_en`] = `Part ${index + 1} English name is required`;
                }
                if (!part.catalog_item_name_ch.trim()) {
                    (errors as any)[`part_${index}_name_cn`] = `Part ${index + 1} Chinese name is required`;
                }
                if (part.quantity <= 0) {
                    (errors as any)[`part_${index}_quantity`] = `Part ${index + 1} quantity must be greater than 0`;
                }
            });
        }

        return errors;
    }, [formData]);

    // Handle form submission for new system
    const handleCreateCatalogSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors = validateCreateCatalogForm();
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error('Please fix the validation errors');
            return;
        }

        setFormSubmitLoading(true);
        try {
            const response = await CatalogManageService.createCatalog(formData);

            if (response.data?.success) {
                toast.success(response.data.message || 'Catalog created successfully');
                // Component will handle navigation
            } else {
                throw new Error(response.data?.message || 'Failed to create catalog');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create catalog';
            setValidationErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setFormSubmitLoading(false);
        }
    }, [formData, validateCreateCatalogForm, setValidationErrors, partCatalogueHook]);

    // Enhanced asyncSelectHook with master category and detail catalog functionality
    const enhancedAsyncSelectHook = {
        partOptions: [],
        loadPartOptions: async () => [],
        pagination: null,
        handleScrollToBottom: async () => {},
        filterOptions: () => [],
        getSelectedOption: () => null,
        resetPagination: () => {},
        isLoading: false,
        masterCategoryOptions,
        loadMasterCategoryOptions,
        handleMasterCategoryScrollToBottom,
        masterCategoryLoading,
        masterCategorySearchValue,
        handleMasterCategorySearchChange,
        detailCatalogOptions,
        loadDetailCatalogOptions,
        handleDetailCatalogScrollToBottom,
        detailCatalogLoading,
        detailCatalogSearchValue,
        handleDetailCatalogSearchChange
    };

    return {
        // Search state
        searchInputValue,
        setSearchInputValue,
        handleSearchInputChange,
        
        // Part options management
        partOptions,
        loadPartOptions,
        
        // CSV handling
        parseCSVFile,
        handleCSVUpload,
        
        // All existing hook functionality with overrides
        ...partCatalogueHook,
        
        // Override specific functions for new system
        handleSubmit: handleCreateCatalogSubmit,  // Use new submit handler
        loading: formSubmitLoading || partCatalogueHook.loading, // Combine loading states
        catalogueDataLoading: formData.master_category ? categoryHook.loading : partCatalogueHook.catalogueDataLoading,
        
        // Enhanced async select hook with master category
        asyncSelectHook: enhancedAsyncSelectHook
    };
};
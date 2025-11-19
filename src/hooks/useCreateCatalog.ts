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

interface AsyncSelectHookReturn {
    partOptions: SelectOption[];
    loadPartOptions: (searchQuery: string) => Promise<SelectOption[]>;
    pagination: any;
    handleScrollToBottom: () => Promise<void>;
    filterOptions: (options: SelectOption[], searchQuery: string) => SelectOption[];
    getSelectedOption: (value: string, options: SelectOption[]) => SelectOption | null;
    resetPagination: () => void;
    isLoading: boolean;
    
    masterCategoryOptions: SelectOption[];
    loadMasterCategoryOptions: (searchQuery: string) => Promise<SelectOption[]>;
    handleMasterCategoryScrollToBottom: () => Promise<void>;
    masterCategoryLoading: boolean;
    masterCategorySearchValue: string;
    handleMasterCategorySearchChange: (value: string) => void;
    
    detailCatalogOptions: SelectOption[];
    loadDetailCatalogOptions: (searchQuery: string) => Promise<SelectOption[]>;
    handleDetailCatalogScrollToBottom: () => Promise<void>;
    detailCatalogLoading: boolean;
    detailCatalogSearchValue: string;
    handleDetailCatalogSearchChange: (value: string) => void;
}

interface UseCreateCatalogReturn {
    searchInputValue: string;
    setSearchInputValue: (value: string) => void;
    handleSearchInputChange: (inputValue: string) => void;
    
    partOptions: SelectOption[];
    loadPartOptions: (searchQuery: string) => Promise<SelectOption[]>;
    
    parseCSVFile: (file: File) => Promise<PartItem[]>;
    handleCSVUpload: (file: File | null) => Promise<void>;
    
    formData: PartCatalogueFormData;
    setFormData: React.Dispatch<React.SetStateAction<PartCatalogueFormData>>;
    validationErrors: CatalogValidationErrors;
    setValidationErrors: React.Dispatch<React.SetStateAction<CatalogValidationErrors>>;
    catalogueDataLoading: boolean;
    selectedPartData: any; 
    subTypes: any[];
    handleSelectChange: (name: string) => (selectedOption: { value: string; label: string; } | null) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAddPart: () => void;
    handleRemovePart: (partId: string) => void;
    handlePartChange: (partId: string, field: keyof PartItem, value: string | number) => void;
    handleSubmit: (e: React.FormEvent) => Promise<boolean>;
    loading: boolean;
    
    asyncSelectHook: AsyncSelectHookReturn;
}

export const useCreateCatalog = (): UseCreateCatalogReturn => {
    const [searchInputValue, setSearchInputValue] = useState('');
    
    const [formSubmitLoading, setFormSubmitLoading] = useState(false);
    
    const partCatalogueHook = usePartCatalogueManagement();
    const {
        formData,
        setFormData,
        setValidationErrors
    } = partCatalogueHook;

    const categoryHook = useCategory();

    useEffect(() => {
        if (formData.master_category) {
            categoryHook.handleFilterChange('master_category_id', formData.master_category);
        }
    }, [formData.master_category]);

    useEffect(() => {
        if (!formData.part_id) {
            setDetailCatalogOptions([]);
            setDetailCatalogSearchValue('');
        }
    }, [formData.part_id]);

    const partOptions = useMemo(() => {
        if (formData.master_category && categoryHook.categories && categoryHook.categories.length > 0) {
            return categoryHook.categories.map(category => ({
                value: category.category_id,
                label: `${category.category_name_en} ${category.category_name_cn ? `- ${category.category_name_cn}` : ''}`
            }));
        }
        
        return [];
    }, [formData.master_category, categoryHook.categories]);

    const loadPartOptions = useCallback(async (searchQuery: string): Promise<SelectOption[]> => {
        if (!formData.master_category) {
            return [];
        }
        
        try {
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

    const handleSearchInputChange = useCallback((inputValue: string) => {
        setSearchInputValue(inputValue);
    }, []);

    useEffect(() => {
        setSearchInputValue('');
    }, [formData.part_type]);

    const parseCSVFile = useCallback((file: File): Promise<PartItem[]> => {
        return new Promise((resolve, reject) => {
            Papa.parse<Record<string, string>>(file, {
                header: true,
                skipEmptyLines: true,
                transform: (value: string) => {
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
                        const parsedParts: PartItem[] = results.data.map((row: any, index: number) => {
                            const requiredFields = ['target_id', 'part_number', 'catalog_item_name_en', 'catalog_item_name_ch', 'quantity'];
                            const missingFields = requiredFields.filter(field => !row[field]);
                            
                            if (missingFields.length > 0) {
                                throw new Error(`Row ${index + 1}: Missing required fields: ${missingFields.join(', ')}`);
                            }

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

    const handleCSVUpload = useCallback(async (file: File | null) => {
        if (!file) return;

        try {
            const parsedParts = await parseCSVFile(file);
            
            setFormData((prev: PartCatalogueFormData) => ({
                ...prev,
                parts: parsedParts
            }));

            // toast.success(`Successfully imported ${parsedParts.length} parts from CSV`);
        } catch (error: any) {
            console.error('CSV upload error:', error);
            toast.error('Failed to process CSV file: ' + error.message);
        }
    }, [parseCSVFile, setFormData]);

    const [masterCategoryOptions, setMasterCategoryOptions] = useState<SelectOption[]>([]);
    const [masterCategoryLoading, setMasterCategoryLoading] = useState(false);
    const [masterCategorySearchValue, setMasterCategorySearchValue] = useState('');
    
    const [masterCategoryPage, setMasterCategoryPage] = useState(1);
    const [masterCategoryHasMore, setMasterCategoryHasMore] = useState(true);
    const masterCategoryPageLimit = 5;

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
                    const newOptions: SelectOption[] = newMasterCategories.map(mc => ({
                        value: mc.master_category_id,
                        label: `${mc.master_category_name_en} ${mc.master_category_name_cn ? `- ${mc.master_category_name_cn}` : ''}`
                    }));
                    setMasterCategoryOptions(prev => [...prev, ...newOptions]);
                } else {
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

    const handleMasterCategorySearchChange = useCallback((value: string) => {
        setMasterCategorySearchValue(value);
    }, []);

    const handleMasterCategoryScrollToBottom = useCallback(async () => {
        if (masterCategoryHasMore && !masterCategoryLoading) {
            const nextPage = masterCategoryPage + 1;
            setMasterCategoryPage(nextPage);
            await fetchMasterCategories(nextPage, true);
        }
    }, [masterCategoryHasMore, masterCategoryLoading, masterCategoryPage]);

    useEffect(() => {
        fetchMasterCategories(1, false);
    }, []);

    const [detailCatalogOptions, setDetailCatalogOptions] = useState<SelectOption[]>([]);
    const [detailCatalogLoading, setDetailCatalogLoading] = useState(false);
    const [detailCatalogSearchValue, setDetailCatalogSearchValue] = useState('');
    
    const [detailCatalogPage, setDetailCatalogPage] = useState(1);
    const [detailCatalogHasMore, setDetailCatalogHasMore] = useState(false);

    const fetchDetailCatalogs = useCallback(async (page: number = 1, append: boolean = false) => {
        if (!formData.part_id) return;
        
        setDetailCatalogLoading(true);
        try {
            const response = await DetailCatalogService.getDetailCatalog(page, 10, {
                category_id: formData.part_id,
                search: detailCatalogSearchValue,
                sort_order: 'desc'
            });
            
            if (response.data.success && response.data.data.items) {
                const options: SelectOption[] = response.data.data.items.map(item => ({
                    value: item.type_category_id,
                    label: `${item.type_category_name_en} ${item.type_category_name_cn ? `- ${item.type_category_name_cn}` : ''}`
                }));
                
                if (append) {
                    setDetailCatalogOptions(prev => [...prev, ...options]);
                } else {
                    setDetailCatalogOptions(options);
                }
                
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
    }, [formData.part_id, fetchDetailCatalogs]);

    const loadDetailCatalogOptions = useCallback(async (searchQuery: string): Promise<SelectOption[]> => {
        if (!formData.part_id) {
            return [];
        }

        try {
            const response = await DetailCatalogService.getDetailCatalog(1, 10, {
                category_id: formData.part_id,
                search: searchQuery,
                sort_order: 'desc'
            });
            
            if (response.data.success && response.data.data.items) {
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

    const handleDetailCatalogScrollToBottom = useCallback(async () => {
        if (detailCatalogHasMore && !detailCatalogLoading) {
            const nextPage = detailCatalogPage + 1;
            setDetailCatalogPage(nextPage);
            await fetchDetailCatalogs(nextPage, true);
        }
    }, [detailCatalogHasMore, detailCatalogLoading, detailCatalogPage, fetchDetailCatalogs]);

    const validateCreateCatalogForm = useCallback((): CatalogValidationErrors => {
        const errors: CatalogValidationErrors = {};

        if (!formData.code_cabin.trim()) {
            errors.code_cabin = 'Document Name is required';
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

        if (formData.parts.length === 0) {
            errors.parts = 'At least one part is required';
        } else {
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
                if (part.quantity <= 0) {
                    (errors as any)[`part_${index}_quantity`] = `Part ${index + 1} quantity must be greater than 0`;
                }
            });
        }

        return errors;
    }, [formData]);

    const handleCreateCatalogSubmit = useCallback(async (e: React.FormEvent): Promise<boolean> => {
        e.preventDefault();
        
        const errors = validateCreateCatalogForm();
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error('Please fix the validation errors');
            return false;
        }

        setFormSubmitLoading(true);
        try {
            const response = await CatalogManageService.createCatalog(formData);

            if (response.data?.success) {
                toast.success(response.data.message || 'Catalog created successfully');
                setValidationErrors({});
                return true;
            } else {
                throw new Error(response.data?.message || 'Failed to create catalog');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to create catalog';
            setValidationErrors({ general: errorMessage });
            toast.error(errorMessage);
            return false;
        } finally {
            setFormSubmitLoading(false);
        }
    }, [formData, validateCreateCatalogForm, setValidationErrors, partCatalogueHook]);

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
        searchInputValue,
        setSearchInputValue,
        handleSearchInputChange,
        
        partOptions,
        loadPartOptions,
        
        parseCSVFile,
        handleCSVUpload,
        
        ...partCatalogueHook,
        
        handleSubmit: handleCreateCatalogSubmit,
        loading: formSubmitLoading || partCatalogueHook.loading,
        catalogueDataLoading: formData.master_category ? categoryHook.loading : partCatalogueHook.catalogueDataLoading,
        
        asyncSelectHook: enhancedAsyncSelectHook
    };
};
import { useState, useCallback, useEffect } from 'react';
import { SelectOption } from '@/types/asyncSelect';
import { 
    CategoryFormData,
    CategoryValidationErrors,
    MasterCategory 
} from '@/types/partCatalogue';
import { useCreateCategory } from '@/hooks/usePartCatalogue';
import { MasterCategoryService } from '@/services/partCatalogueService';

interface UseCreateCategoryEnhancedReturn {
    // Search state
    searchInputValue: string;
    handleSearchInputChange: (inputValue: string) => void;
    
    // Master Category options management
    masterCategoryOptions: SelectOption[];
    loadMasterCategoryOptions: (searchQuery: string) => Promise<SelectOption[]>;
    masterCategoryLoading: boolean;
    handleScrollToBottom: () => void;
    hasMore: boolean;
    
    // Form management from existing hook
    formData: CategoryFormData;
    validationErrors: CategoryValidationErrors;
    loading: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTypeCategorysChange: (typeCategorys: any[]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    
    // Select change handler
    handleSelectChange: (name: string) => (selectedOption: { value: string; label: string; } | null) => void;
    
    // Utilities
    setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>;
    setValidationErrors: React.Dispatch<React.SetStateAction<any>>;
}

export const useCreateCategoryEnhanced = (): UseCreateCategoryEnhancedReturn => {
    // Search state
    const [searchInputValue, setSearchInputValue] = useState('');
    
    // Master Category state
    const [masterCategoryOptions, setMasterCategoryOptions] = useState<SelectOption[]>([]);
    const [masterCategoryLoading, setMasterCategoryLoading] = useState(false);
    const [allMasterCategories, setAllMasterCategories] = useState<MasterCategory[]>([]);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const pageLimit = 5;
    
    // Use the existing create category hook
    const {
        formData,
        validationErrors,
        loading,
        handleInputChange,
        handleTypeCategorysChange,
        handleSubmit: originalHandleSubmit,
        setFormData,
        setValidationErrors
    } = useCreateCategory();

    // Enhanced handleSubmit with logging
    const handleSubmit = useCallback(async (e: React.FormEvent) => {        
        return await originalHandleSubmit(e);
    }, [formData, originalHandleSubmit]);

    // Fetch master categories data
    const fetchMasterCategories = useCallback(async (page: number = 1, append: boolean = false) => {
        setMasterCategoryLoading(true);
        try {
            const response = await MasterCategoryService.getMasterCategories(page, pageLimit);
            
            if (response.data.success) {
                const newMasterCategories = response.data.data.items;
                const totalItems = response.data.data.pagination.total;
                
                setHasMore(page * pageLimit < totalItems);
                
                if (append) {
                    // Append new data for pagination
                    setAllMasterCategories(prev => [...prev, ...newMasterCategories]);
                    
                    const newOptions: SelectOption[] = newMasterCategories.map(mc => ({
                        value: mc.master_category_id,
                        label: `${mc.master_category_name_en} ${mc.master_category_name_cn ? `- ${mc.master_category_name_cn}` : ''}`
                    }));
                    setMasterCategoryOptions(prev => [...prev, ...newOptions]);
                } else {
                    // Initial load
                    setAllMasterCategories(newMasterCategories);
                    
                    const options: SelectOption[] = newMasterCategories.map(mc => ({
                        value: mc.master_category_id,
                        label: `${mc.master_category_name_en} ${mc.master_category_name_cn ? `- ${mc.master_category_name_cn}` : ''}`
                    }));
                    setMasterCategoryOptions(options);
                }
            }
        } catch (error) {
            console.error('Error fetching master categories:', error);
        } finally {
            setMasterCategoryLoading(false);
        }
    }, [pageLimit, setHasMore]);

    // Load master category options with search capability
    const loadMasterCategoryOptions = useCallback(async (searchQuery: string): Promise<SelectOption[]> => {
        if (allMasterCategories.length === 0) {
            await fetchMasterCategories(1, false);
        }
        
        if (!searchQuery) {
            return masterCategoryOptions;
        }
        
        // Filter options based on search query
        const filteredOptions = masterCategoryOptions.filter(option =>
            option.label.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        return filteredOptions;
    }, [masterCategoryOptions, allMasterCategories.length, fetchMasterCategories]);

    // Handle scroll to bottom for infinite scroll
    const handleScrollToBottom = useCallback(() => {
        if (hasMore && !masterCategoryLoading) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            fetchMasterCategories(nextPage, true);
        }
    }, [hasMore, masterCategoryLoading, currentPage, fetchMasterCategories]);

    // Handle search input change
    const handleSearchInputChange = useCallback((inputValue: string) => {
        setSearchInputValue(inputValue);
    }, []);

    // Handle select change untuk CustomSelect component
    const handleSelectChange = useCallback((name: string) => (selectedOption: { value: string; label: string; } | null) => {
        const value = selectedOption ? selectedOption.value : '';
        
        // If this is master_category_id selection, also set the master_category_name_en
        if (name === 'master_category_id' && selectedOption) {
            const selectedMasterCategory = allMasterCategories.find(mc => mc.master_category_id === selectedOption.value);
            
            setFormData(prev => ({
                ...prev,
                [name]: value,
                master_category_name_en: selectedMasterCategory?.master_category_name_en || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear validation error for this field
        if (validationErrors[name as keyof CategoryFormData]) {
            setValidationErrors((prev: any) => ({
                ...prev,
                [name]: undefined
            }));
        }
    }, [setFormData, validationErrors, setValidationErrors, allMasterCategories]);

    // Initial fetch master categories when component mounts
    useEffect(() => {
        fetchMasterCategories(1, false);
    }, [fetchMasterCategories]);

    return {
        // Search state
        searchInputValue,
        handleSearchInputChange,
        
        // Master Category options management
        masterCategoryOptions,
        loadMasterCategoryOptions,
        masterCategoryLoading,
        handleScrollToBottom,
        hasMore,
        
        // Form management from existing hook
        formData,
        validationErrors,
        loading,
        handleInputChange,
        handleTypeCategorysChange,
        handleSubmit,
        
        // Select change handler
        handleSelectChange,
        
        // Utilities
        setFormData,
        setValidationErrors
    };
};
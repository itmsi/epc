import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CategoryService, MasterCategoryService } from '@/services/partCatalogueService';
import { 
    MasterCategoryFormData,
    MasterCategoryValidationErrors,
    MasterCategory,
    MasterCategoryPagination,
    MasterCategoryFilters,
    CategoryFormData,
    CategoryValidationErrors,
    TypeCategoryFormData,
    Category,
    CategoryPagination,
    CategoryFilters,
} from '@/types/partCatalogue';

// ============================= MASTER CATEGORY ============================= //
interface UseMasterCategoryReturn {
    mastercategory: MasterCategory[];
    loading: boolean;
    error: string | null;
    pagination: MasterCategoryPagination | null;
    filters: MasterCategoryFilters;

    // Actions
    fetchMasterCategories: (page?: number, limit?: number) => Promise<void>;
    handleDeleteMasterCategory: (masterCategoryId: string) => Promise<void>;
    handleFilterChange: (key: keyof MasterCategoryFilters, value: string) => void;
    handleSearchChange: (value: string) => void;
    handleManualSearch: () => void;
    clearSearch: () => void;
    resetFilters: () => void;
    clearError: () => void;
}

const initialFiltersMasterCategory: MasterCategoryFilters = {
    search: '',
    sort_order: ''
};

export const useMasterCategory = (): UseMasterCategoryReturn => {
    const [mastercategory, setMasterCategory] = useState<MasterCategory[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<MasterCategoryPagination | null>(null);
    const [filters, setFilters] = useState<MasterCategoryFilters>(initialFiltersMasterCategory);

    // Fetch master categories data
    const fetchMasterCategories = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await MasterCategoryService.getMasterCategories(page, limit, filters);
            
            if (response.data.success) {
                setMasterCategory(response.data.data.items);
                setPagination(response.data.data.pagination);
            } else {
                throw new Error('Failed to fetch master categories');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch master categories';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Handle delete master category
    const handleDeleteMasterCategory = useCallback(async (masterCategoryId: string) => {
        setLoading(true);
        try {
            const response = await MasterCategoryService.deleteMasterCategory(masterCategoryId);

            if (response.data.success) {
                toast.success('Master category deleted successfully');
                await fetchMasterCategories(pagination?.page || 1, pagination?.limit || 10);
            } else {
                throw new Error('Failed to delete master category');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete master category';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchMasterCategories, pagination]);

    // Handle filter change
    const handleFilterChange = useCallback((key: keyof MasterCategoryFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // Handle search change (without automatic fetch)
    const handleSearchChange = useCallback((value: string) => {
        setFilters(prev => ({
            ...prev,
            search: value
        }));
    }, []);

    // Manual search trigger
    const handleManualSearch = useCallback(() => {
        fetchMasterCategories(1, pagination?.limit || 10);
    }, [fetchMasterCategories, pagination]);

    // Clear search
    const clearSearch = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            search: ''
        }));
        fetchMasterCategories(1, pagination?.limit || 10);
    }, [fetchMasterCategories, pagination]);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters(initialFiltersMasterCategory);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch master category when sort_order changes (but not search)
    useEffect(() => {
        if (filters.sort_order !== initialFiltersMasterCategory.sort_order) {
            fetchMasterCategories(1, pagination?.limit || 10);
        }
    }, [filters.sort_order, fetchMasterCategories, pagination?.limit]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchMasterCategories(1);
    }, []);

    return {
        mastercategory,
        loading,
        error,
        pagination,
        filters,
        fetchMasterCategories,
        handleDeleteMasterCategory,
        handleFilterChange,
        handleSearchChange,
        handleManualSearch,
        clearSearch,
        resetFilters,
        clearError
    };
};
interface UseMasterCategoryFormProps {
    initialData?: Partial<MasterCategoryFormData>;
    masterCategoryId?: string;
    onSuccess?: () => void;
    redirectPath?: string;
}

interface UseMasterCategoryFormReturn {
    // State
    formData: MasterCategoryFormData;
    validationErrors: any;
    loading: boolean;
    
    // Handlers
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    // handleTypeMasterCategoriesChange: (typeMasterCategories: TypeMasterCategoryFormData[]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    
    // Utilities
    validateFormData: (data: MasterCategoryFormData) => MasterCategoryValidationErrors;
    setFormData: React.Dispatch<React.SetStateAction<MasterCategoryFormData>>;
    setValidationErrors: React.Dispatch<React.SetStateAction<any>>;
    clearError: (fieldName: string) => void;
    resetForm: () => void;
}

const defaultInitialDataMasterCategory: MasterCategoryFormData = {
    master_category_name_en: '',
    master_category_name_cn: '',
    master_category_description: '',
};

export const useMasterCategoryForm = ({
    initialData = {},
    masterCategoryId,
    onSuccess,
    redirectPath = '/epc/master-category'
}: UseMasterCategoryFormProps = {}): UseMasterCategoryFormReturn => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<MasterCategoryFormData>({
        ...defaultInitialDataMasterCategory,
        ...initialData
    });
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(prevData => {
                // Only update if data is actually different
                const newData = { ...defaultInitialDataMasterCategory, ...initialData };
                if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                    return newData;
                }
                return prevData;
            });
        }
    }, [initialData]);

    // Validate form data
    const validateFormData = useCallback((data: MasterCategoryFormData): MasterCategoryValidationErrors => {
        const errors: MasterCategoryValidationErrors = {};

        if (!data.master_category_name_en.trim()) {
            errors.master_category_name_en = 'English master category name is required';
        }

        return errors;
    }, []);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error for this field
        if (validationErrors[name as keyof MasterCategoryFormData]) {
            setValidationErrors((prev: any) => ({
                ...prev,
                [name]: undefined
            }));
        }
    }, [validationErrors]);

    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors = validateFormData(formData);
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            let response;
            
            if (masterCategoryId) {
                // Update existing master category
                response = await MasterCategoryService.updateMasterCategory(masterCategoryId, formData);
                if (response.data.success) {
                    toast.success('Master category updated successfully');
                } else {
                    throw new Error('Failed to update master category');
                }
            } else {
                // Create new master category
                response = await MasterCategoryService.createMasterCategory(formData);
                if (response.data.success) {
                    toast.success('Master category created successfully');
                } else {
                    throw new Error('Failed to create master category');
                }
            }

            if (onSuccess) {
                onSuccess();
            } else {
                navigate(redirectPath);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Operation failed';
            setValidationErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [formData, validateFormData, masterCategoryId, onSuccess, navigate, redirectPath]);

    // Clear specific error
    const clearError = useCallback((fieldName: string) => {
        setValidationErrors((prev: any) => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({ ...defaultInitialDataMasterCategory, ...initialData });
        setValidationErrors({});
    }, [initialData]);

    return {
        // State
        formData,
        validationErrors,
        loading,
        
        // Handlers
        handleInputChange,
        handleSubmit,
        
        // Utilities
        validateFormData,
        setFormData,
        setValidationErrors,
        clearError,
        resetForm
    };
};

// Hook khusus untuk create master category
export const useCreateMasterCategory = (onSuccess?: () => void) => {
    return useMasterCategoryForm({
        onSuccess,
        redirectPath: '/epc/master-category'
    });
};

// Hook khusus untuk edit master category
export const useEditMasterCategory = (masterCategory: MasterCategory | null, onSuccess?: () => void) => {
    const initialData: Partial<MasterCategoryFormData> = useMemo(() => {
        return masterCategory ? {
            master_category_name_en: masterCategory.master_category_name_en,
            master_category_name_cn: masterCategory.master_category_name_cn,
            master_category_description: masterCategory.master_category_description
        } : {};
    }, [masterCategory]);

    return useMasterCategoryForm({
        initialData,
        masterCategoryId: masterCategory?.master_category_id,
        onSuccess,
        redirectPath: '/epc/master-category'
    });
};

// ============================= CATEGORY ============================= //
interface UseCategoryReturn {
    categories: Category[];
    loading: boolean;
    error: string | null;
    pagination: CategoryPagination | null;
    filters: CategoryFilters;
    
    // Actions
    fetchCategories: (page?: number, limit?: number) => Promise<void>;
    handleDeleteCategory: (categoryId: string) => Promise<void>;
    handleFilterChange: (key: keyof CategoryFilters, value: string) => void;
    handleSearchChange: (value: string) => void;
    handleManualSearch: () => void;
    clearSearch: () => void;
    resetFilters: () => void;
    clearError: () => void;
}

const initialFiltersCategory: CategoryFilters = {
    search: '',
    sort_order: '',
    master_category_id: ''
};

export const useCategory = (): UseCategoryReturn => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<CategoryPagination | null>(null);
    const [filters, setFilters] = useState<CategoryFilters>(initialFiltersCategory);

    // Fetch category data
    const fetchCategories = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await CategoryService.getCategory(page, limit, filters);
            
            if (response.data.success) {
                setCategories(response.data.data.items);
                setPagination(response.data.data.pagination);
            } else {
                throw new Error('Failed to fetch categories');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Handle delete category
    const handleDeleteCategory = useCallback(async (categoryId: string) => {
        setLoading(true);
        try {
            const response = await CategoryService.deleteCategory(categoryId);

            if (response.data.success) {
                toast.success('Category deleted successfully');
                await fetchCategories(pagination?.page || 1, pagination?.limit || 10);
            } else {
                throw new Error('Failed to delete category');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete category';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchCategories, pagination]);

    // Handle filter change
    const handleFilterChange = useCallback((key: keyof CategoryFilters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // Handle search change (without automatic fetch)
    const handleSearchChange = useCallback((value: string) => {
        setFilters(prev => ({
            ...prev,
            search: value
        }));
    }, []);

    // Manual search trigger
    const handleManualSearch = useCallback(() => {
        fetchCategories(1, pagination?.limit || 10);
    }, [fetchCategories, pagination]);

    // Clear search
    const clearSearch = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            search: ''
        }));
        fetchCategories(1, pagination?.limit || 10);
    }, [fetchCategories, pagination]);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters(initialFiltersCategory);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch category when sort_order changes (but not search)
    useEffect(() => {
        if (filters.sort_order !== initialFiltersCategory.sort_order) {
            fetchCategories(1, pagination?.limit || 10);
        }
    }, [filters.sort_order, fetchCategories, pagination?.limit]);

    // Fetch categories when master_category_id changes
    useEffect(() => {
        if (filters.master_category_id !== initialFiltersCategory.master_category_id) {
            fetchCategories(1, 50); // Use higher limit for dropdown, remove pagination dependency
        }
    }, [filters.master_category_id]); // Only depend on the filter value, not fetchCategories

    // Initial fetch when component mounts
    useEffect(() => {
        fetchCategories(1);
    }, []);

    return {
        categories,
        loading,
        error,
        pagination,
        filters,
        fetchCategories,
        handleDeleteCategory,
        handleFilterChange,
        handleSearchChange,
        handleManualSearch,
        clearSearch,
        resetFilters,
        clearError
    };
};

// ========== FORM HOOKS ==========
interface UseCategoryFormProps {
    initialData?: Partial<CategoryFormData>;
    categoryId?: string;
    onSuccess?: () => void;
    redirectPath?: string;
}

interface UseCategoryFormReturn {
    // State
    formData: CategoryFormData;
    validationErrors: any;
    loading: boolean;
    
    // Handlers
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTypeCategorysChange: (typeCategorys: TypeCategoryFormData[]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    
    // Utilities
    validateFormData: (data: CategoryFormData) => CategoryValidationErrors;
    setFormData: React.Dispatch<React.SetStateAction<CategoryFormData>>;
    setValidationErrors: React.Dispatch<React.SetStateAction<any>>;
    clearError: (fieldName: string) => void;
    resetForm: () => void;
}

const defaultInitialDataCategory: CategoryFormData = {
    master_category_id: '',
    category_name_en: '',
    category_name_cn: '',
    category_description: '',
    data_type: []
};

export const useCategoryForm = ({
    initialData = {},
    categoryId,
    onSuccess,
    redirectPath = '/epc/category'
}: UseCategoryFormProps = {}): UseCategoryFormReturn => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<CategoryFormData>({
        ...defaultInitialDataCategory,
        ...initialData
    });
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(prevData => {
                // Only update if data is actually different
                const newData = { ...defaultInitialDataCategory, ...initialData };
                if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                    return newData;
                }
                return prevData;
            });
        }
    }, [initialData]);

    // Validate form data
    const validateFormData = useCallback((data: CategoryFormData): CategoryValidationErrors => {
        const errors: CategoryValidationErrors = {};

        if (!data.category_name_en.trim()) {
            errors.category_name_en = 'English category name is required';
        }

        // Validate data_type
        if (data.data_type && data.data_type.length > 0) {
            data.data_type.forEach((type, index) => {
                if (!type.type_category_name_en.trim()) {
                    errors[`data_type.${index}.type_category_name_en`] = 'English type category name is required';
                }
            });
        }

        return errors;
    }, []);

    // Handle input change
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error for this field
        if (validationErrors[name as keyof CategoryFormData]) {
            setValidationErrors((prev: any) => ({
                ...prev,
                [name]: undefined
            }));
        }
    }, [validationErrors]);

    // Handle TypeCategories change
    const handleTypeCategorysChange = useCallback((typeCategory: TypeCategoryFormData[]) => {
        setFormData(prev => ({
            ...prev,
            data_type: typeCategory
        }));

        // Clear validation errors for type_categories
        const newErrors = { ...validationErrors } as Record<string, string>;
        Object.keys(newErrors).forEach(key => {
            if (key.startsWith('data_type.')) {
                delete newErrors[key];
            }
        });
        setValidationErrors(newErrors);
    }, [validationErrors]);

    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors = validateFormData(formData);
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            let response;
            
            if (categoryId) {
                // Update existing category
                response = await CategoryService.updateCategory(categoryId, formData);
                if (response.data.success) {
                    toast.success('Category updated successfully');
                } else {
                    throw new Error('Failed to update category');
                }
            } else {
                // Create new category
                response = await CategoryService.createCategory(formData);
                if (response.data.success) {
                    toast.success('Category created successfully');
                } else {
                    throw new Error('Failed to create category');
                }
            }

            if (onSuccess) {
                onSuccess();
            } else {
                navigate(redirectPath);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Operation failed';
            setValidationErrors({ general: errorMessage });
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [formData, validateFormData, categoryId, onSuccess, navigate, redirectPath]);

    // Clear specific error
    const clearError = useCallback((fieldName: string) => {
        setValidationErrors((prev: any) => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({ ...defaultInitialDataCategory, ...initialData });
        setValidationErrors({});
    }, [initialData]);

    return {
        // State
        formData,
        validationErrors,
        loading,
        
        // Handlers
        handleInputChange,
        handleTypeCategorysChange,
        handleSubmit,
        
        // Utilities
        validateFormData,
        setFormData,
        setValidationErrors,
        clearError,
        resetForm
    };
};

// Hook khusus untuk create category
export const useCreateCategory = (onSuccess?: () => void) => {
    return useCategoryForm({
        onSuccess,
        redirectPath: '/epc/category'
    });
};

// Hook khusus untuk edit category
export const useEditCategory = (category: Category | null, onSuccess?: () => void) => {
    const initialData: Partial<CategoryFormData> = useMemo(() => {
        return category ? {
            master_category_id: category.master_category_id,
            master_category_name_en: category.master_category_name_en,
            category_name_en: category.category_name_en,
            category_name_cn: category.category_name_cn,
            category_description: category.category_description,
            data_type: category.data_type.map(tc => ({
                type_category_name_en: tc.type_category_name_en,
                type_category_name_cn: tc.type_category_name_cn,
                type_category_description: tc.type_category_description
            }))
        } : {};
    }, [category]);

    return useCategoryForm({
        initialData,
        categoryId: category?.category_id,
        onSuccess,
        redirectPath: '/epc/category'
    });
};

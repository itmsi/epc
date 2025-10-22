import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AxleService, CabinService, EngineService, SteeringService, TransmissionService } from '@/services/partCatalogueService';
import { 
    Cabin, 
    CabinFilters, 
    CabinPagination,
    CabinFormData,
    CabinValidationErrors,
    TypeCabinFormData,
    Engine, 
    EngineFilters, 
    EnginePagination,
    EngineFormData,
    EngineValidationErrors,
    TypeEngineFormData,
    AxleFormData,
    TypeAxleFormData,
    AxleValidationErrors,
    Axle,
    AxleFilters,
    AxlePagination,
    Transmission,
    TransmissionPagination,
    TransmissionFilters,
    TransmissionFormData,
    TypeTransmissionFormData,
    TransmissionValidationErrors,
    Steering,
    SteeringPagination,
    SteeringFilters,
    SteeringFormData,
    SteeringValidationErrors,
    TypeSteeringFormData,
} from '@/types/partCatalogue';

interface UseCabinReturn {
    cabins: Cabin[];
    loading: boolean;
    error: string | null;
    pagination: CabinPagination | null;
    filters: CabinFilters;
    
    // Actions
    fetchCabins: (page?: number, limit?: number) => Promise<void>;
    handleDeleteCabin: (cabinId: string) => Promise<void>;
    handleFilterChange: (key: keyof CabinFilters, value: string) => void;
    handleSearchChange: (value: string) => void;
    handleManualSearch: () => void;
    clearSearch: () => void;
    resetFilters: () => void;
    clearError: () => void;
}

const initialFilters: CabinFilters = {
    search: '',
    sort_order: ''
};

export const useCabin = (): UseCabinReturn => {
    const [cabins, setCabins] = useState<Cabin[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<CabinPagination | null>(null);
    const [filters, setFilters] = useState<CabinFilters>(initialFilters);

    // Fetch cabins data
    const fetchCabins = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await CabinService.getCabins(page, limit, filters);
            
            if (response.data.success) {
                setCabins(response.data.data.items);
                setPagination(response.data.data.pagination);
            } else {
                throw new Error('Failed to fetch cabins');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cabins';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Handle delete cabin
    const handleDeleteCabin = useCallback(async (cabinId: string) => {
        setLoading(true);
        try {
            const response = await CabinService.deleteCabin(cabinId);
            
            if (response.data.success) {
                toast.success('Cabin deleted successfully');
                await fetchCabins(pagination?.page || 1, pagination?.limit || 10);
            } else {
                throw new Error('Failed to delete cabin');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete cabin';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchCabins, pagination]);

    // Handle filter change
    const handleFilterChange = useCallback((key: keyof CabinFilters, value: string) => {
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
        fetchCabins(1, pagination?.limit || 10);
    }, [fetchCabins, pagination]);

    // Clear search
    const clearSearch = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            search: ''
        }));
        fetchCabins(1, pagination?.limit || 10);
    }, [fetchCabins, pagination]);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch cabins when sort_order changes (but not search)
    useEffect(() => {
        if (filters.sort_order !== initialFilters.sort_order) {
            fetchCabins(1, pagination?.limit || 10);
        }
    }, [filters.sort_order, fetchCabins, pagination?.limit]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchCabins(1);
    }, []);

    return {
        cabins,
        loading,
        error,
        pagination,
        filters,
        fetchCabins,
        handleDeleteCabin,
        handleFilterChange,
        handleSearchChange,
        handleManualSearch,
        clearSearch,
        resetFilters,
        clearError
    };
};

// ========== FORM HOOKS ==========

interface UseCabinFormProps {
    initialData?: Partial<CabinFormData>;
    cabinId?: string;
    onSuccess?: () => void;
    redirectPath?: string;
}

interface UseCabinFormReturn {
    // State
    formData: CabinFormData;
    validationErrors: any;
    loading: boolean;
    
    // Handlers
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTypeCabinesChange: (typeCabines: TypeCabinFormData[]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    
    // Utilities
    validateFormData: (data: CabinFormData) => CabinValidationErrors;
    setFormData: React.Dispatch<React.SetStateAction<CabinFormData>>;
    setValidationErrors: React.Dispatch<React.SetStateAction<any>>;
    clearError: (fieldName: string) => void;
    resetForm: () => void;
}

const defaultInitialData: CabinFormData = {
    cabines_name_en: '',
    cabines_name_cn: '',
    cabines_description: '',
    type_cabines: []
};

export const useCabinForm = ({
    initialData = {},
    cabinId,
    onSuccess,
    redirectPath = '/epc/cabin'
}: UseCabinFormProps = {}): UseCabinFormReturn => {
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState<CabinFormData>({
        ...defaultInitialData,
        ...initialData
    });
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(prevData => {
                // Only update if data is actually different
                const newData = { ...defaultInitialData, ...initialData };
                if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                    return newData;
                }
                return prevData;
            });
        }
    }, [initialData]);

    // Validate form data
    const validateFormData = useCallback((data: CabinFormData): CabinValidationErrors => {
        const errors: CabinValidationErrors = {};

        if (!data.cabines_name_en.trim()) {
            errors.cabines_name_en = 'English cabin name is required';
        }

        if (!data.cabines_name_cn.trim()) {
            errors.cabines_name_cn = 'Chinese cabin name is required';
        }

        if (!data.cabines_description.trim()) {
            errors.cabines_description = 'Description is required';
        }

        // Validate type_cabines
        if (data.type_cabines && data.type_cabines.length > 0) {
            data.type_cabines.forEach((typeCabin, index) => {
                if (!typeCabin.type_cabine_name_en.trim()) {
                    errors[`type_cabines.${index}.type_cabine_name_en`] = 'English type cabin name is required';
                }
                if (!typeCabin.type_cabine_name_cn.trim()) {
                    errors[`type_cabines.${index}.type_cabine_name_cn`] = 'Chinese type cabin name is required';
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
        if (validationErrors[name as keyof CabinFormData]) {
            setValidationErrors((prev: any) => ({
                ...prev,
                [name]: undefined
            }));
        }
    }, [validationErrors]);

    // Handle TypeCabines change
    const handleTypeCabinesChange = useCallback((typeCabines: TypeCabinFormData[]) => {
        setFormData(prev => ({
            ...prev,
            type_cabines: typeCabines
        }));

        // Clear validation errors for type_cabines
        const newErrors = { ...validationErrors } as Record<string, string>;
        Object.keys(newErrors).forEach(key => {
            if (key.startsWith('type_cabines.')) {
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
            
            if (cabinId) {
                // Update existing cabin
                response = await CabinService.updateCabin(cabinId, formData);
                if (response.data.success) {
                    toast.success('Cabin updated successfully');
                } else {
                    throw new Error('Failed to update cabin');
                }
            } else {
                // Create new cabin
                response = await CabinService.createCabin(formData);
                if (response.data.success) {
                    toast.success('Cabin created successfully');
                } else {
                    throw new Error('Failed to create cabin');
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
    }, [formData, validateFormData, cabinId, onSuccess, navigate, redirectPath]);

    // Clear specific error
    const clearError = useCallback((fieldName: string) => {
        setValidationErrors((prev: any) => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({ ...defaultInitialData, ...initialData });
        setValidationErrors({});
    }, [initialData]);

    return {
        // State
        formData,
        validationErrors,
        loading,
        
        // Handlers
        handleInputChange,
        handleTypeCabinesChange,
        handleSubmit,
        
        // Utilities
        validateFormData,
        setFormData,
        setValidationErrors,
        clearError,
        resetForm
    };
};

// Hook khusus untuk create cabin
export const useCreateCabin = (onSuccess?: () => void) => {
    return useCabinForm({
        onSuccess,
        redirectPath: '/epc/cabin'
    });
};

// Hook khusus untuk edit cabin
export const useEditCabin = (cabin: Cabin | null, onSuccess?: () => void) => {
    const initialData: Partial<CabinFormData> = useMemo(() => {
        return cabin ? {
            cabines_name_en: cabin.cabines_name_en,
            cabines_name_cn: cabin.cabines_name_cn,
            cabines_description: cabin.cabines_description,
            type_cabines: cabin.type_cabines.map(tc => ({
                type_cabine_name_en: tc.type_cabine_name_en,
                type_cabine_name_cn: tc.type_cabine_name_cn,
                type_cabine_description: tc.type_cabine_description
            }))
        } : {};
    }, [cabin]);

    return useCabinForm({
        initialData,
        cabinId: cabin?.cabines_id,
        onSuccess,
        redirectPath: '/epc/cabin'
    });
};

// ========= ENGINE HOOKS ==========
interface UseEngineReturn {
    engines: Engine[];
    loading: boolean;
    error: string | null;
    pagination: EnginePagination | null;
    filters: EngineFilters;
    
    // Actions
    fetchEngines: (page?: number, limit?: number) => Promise<void>;
    handleDeleteEngine: (engineId: string) => Promise<void>;
    handleFilterChange: (key: keyof EngineFilters, value: string) => void;
    handleSearchChange: (value: string) => void;
    handleManualSearch: () => void;
    clearSearch: () => void;
    resetFilters: () => void;
    clearError: () => void;
}

const initialFiltersEngine: EngineFilters = {
    search: '',
    sort_order: ''
};

export const useEngine = (): UseEngineReturn => {
    const [engines, setEngines] = useState<Engine[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<EnginePagination | null>(null);
    const [filters, setFilters] = useState<EngineFilters>(initialFiltersEngine);

    // Fetch engines data
    const fetchEngines = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await EngineService.getEngines(page, limit, filters);
            
            if (response.data.success) {
                setEngines(response.data.data.items);
                setPagination(response.data.data.pagination);
            } else {
                throw new Error('Failed to fetch engines');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cabins';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Handle delete engine
    const handleDeleteEngine = useCallback(async (engineId: string) => {
        setLoading(true);
        try {
            const response = await EngineService.deleteEngine(engineId);

            if (response.data.success) {
                toast.success('Engine deleted successfully');
                await fetchEngines(pagination?.page || 1, pagination?.limit || 10);
            } else {
                throw new Error('Failed to delete engine');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete engine';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchEngines, pagination]);

    // Handle filter change
    const handleFilterChange = useCallback((key: keyof EngineFilters, value: string) => {
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
        fetchEngines(1, pagination?.limit || 10);
    }, [fetchEngines, pagination]);

    // Clear search
    const clearSearch = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            search: ''
        }));
        fetchEngines(1, pagination?.limit || 10);
    }, [fetchEngines, pagination]);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch engines when sort_order changes (but not search)
    useEffect(() => {
        if (filters.sort_order !== initialFilters.sort_order) {
            fetchEngines(1, pagination?.limit || 10);
        }
    }, [filters.sort_order, fetchEngines, pagination?.limit]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchEngines(1);
    }, []);

    return {
        engines,
        loading,
        error,
        pagination,
        filters,
        fetchEngines,
        handleDeleteEngine,
        handleFilterChange,
        handleSearchChange,
        handleManualSearch,
        clearSearch,
        resetFilters,
        clearError
    };
};

// ========== FORM HOOKS ENGINE ==========
interface UseEngineFormProps {
    initialData?: Partial<EngineFormData>;
    engineId?: string;
    onSuccess?: () => void;
    redirectPath?: string;
}

interface UseEngineFormReturn {
    // State
    formData: EngineFormData;
    validationErrors: any;
    loading: boolean;
    
    // Handlers
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTypeEnginesChange: (typeEngines: TypeEngineFormData[]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    
    // Utilities
    validateFormData: (data: EngineFormData) => EngineValidationErrors;
    setFormData: React.Dispatch<React.SetStateAction<EngineFormData>>;
    setValidationErrors: React.Dispatch<React.SetStateAction<any>>;
    clearError: (fieldName: string) => void;
    resetForm: () => void;
}

const defaultInitialDataEngine: EngineFormData = {
    engines_name_en: '',
    engines_name_cn: '',
    engines_description: '',
    type_engines: []
};

export const useEngineForm = ({
    initialData = {},
    engineId,
    onSuccess,
    redirectPath = '/epc/engine'
}: UseEngineFormProps = {}): UseEngineFormReturn => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<EngineFormData>({
        ...defaultInitialDataEngine,
        ...initialData
    });
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(prevData => {
                // Only update if data is actually different
                const newData = { ...defaultInitialDataEngine, ...initialData };
                if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                    return newData;
                }
                return prevData;
            });
        }
    }, [initialData]);

    // Validate form data
    const validateFormData = useCallback((data: EngineFormData): EngineValidationErrors => {
        const errors: EngineValidationErrors = {};

        if (!data.engines_name_en.trim()) {
            errors.engines_name_en = 'English engine name is required';
        }

        if (!data.engines_name_cn.trim()) {
            errors.engines_name_cn = 'Chinese engine name is required';
        }

        if (!data.engines_description.trim()) {
            errors.engines_description = 'Description is required';
        }

        // Validate type_engines
        if (data.type_engines && data.type_engines.length > 0) {
            data.type_engines.forEach((typeEngine, index) => {
                if (!typeEngine.type_engine_name_en.trim()) {
                    errors[`type_engines.${index}.type_engine_name_en`] = 'English type engine name is required';
                }
                if (!typeEngine.type_engine_name_cn.trim()) {
                    errors[`type_engines.${index}.type_engine_name_cn`] = 'Chinese type engine name is required';
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
        if (validationErrors[name as keyof EngineFormData]) {
            setValidationErrors((prev: any) => ({
                ...prev,
                [name]: undefined
            }));
        }
    }, [validationErrors]);

    // Handle TypeEngines change
    const handleTypeEnginesChange = useCallback((typeEngines: TypeEngineFormData[]) => {
        setFormData(prev => ({
            ...prev,
            type_engines: typeEngines
        }));

        // Clear validation errors for type_engines
        const newErrors = { ...validationErrors } as Record<string, string>;
        Object.keys(newErrors).forEach(key => {
            if (key.startsWith('type_engines.')) {
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
            
            if (engineId) {
                // Update existing engine
                response = await EngineService.updateEngine(engineId, formData);
                if (response.data.success) {
                    toast.success('Engine updated successfully');
                } else {
                    throw new Error('Failed to update engine');
                }
            } else {
                // Create new engine
                response = await EngineService.createEngine(formData);
                if (response.data.success) {
                    toast.success('Engine created successfully');
                } else {
                    throw new Error('Failed to create engine');
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
    }, [formData, validateFormData, engineId, onSuccess, navigate, redirectPath]);

    // Clear specific error
    const clearError = useCallback((fieldName: string) => {
        setValidationErrors((prev: any) => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({ ...defaultInitialDataEngine, ...initialData });
        setValidationErrors({});
    }, [initialData]);

    return {
        // State
        formData,
        validationErrors,
        loading,
        
        // Handlers
        handleInputChange,
        handleTypeEnginesChange,
        handleSubmit,
        
        // Utilities
        validateFormData,
        setFormData,
        setValidationErrors,
        clearError,
        resetForm
    };
};

// Hook khusus untuk create engine
export const useCreateEngine = (onSuccess?: () => void) => {
    return useEngineForm({
        onSuccess,
        redirectPath: '/epc/engine'
    });
};

// Hook khusus untuk edit engine
export const useEditEngine = (engine: Engine | null, onSuccess?: () => void) => {
    const initialData: Partial<EngineFormData> = useMemo(() => {
        return engine ? {
            engines_name_en: engine.engines_name_en,
            engines_name_cn: engine.engines_name_cn,
            engines_description: engine.engines_description,
            type_engines: engine.type_engines.map(tc => ({
                type_engine_name_en: tc.type_engine_name_en,
                type_engine_name_cn: tc.type_engine_name_cn,
                type_engine_description: tc.type_engine_description
            }))
        } : {};
    }, [engine]);

    return useEngineForm({
        initialData,
        engineId: engine?.engines_id,
        onSuccess,
        redirectPath: '/epc/engine'
    });
};


// ========= AXLE HOOKS ==========
interface UseAxleReturn {
    axles: Axle[];
    loading: boolean;
    error: string | null;
    pagination: AxlePagination | null;
    filters: AxleFilters;

    // Actions
    fetchAxles: (page?: number, limit?: number) => Promise<void>;
    handleDeleteAxle: (axleId: string) => Promise<void>;
    handleFilterChange: (key: keyof AxleFilters, value: string) => void;
    handleSearchChange: (value: string) => void;
    handleManualSearch: () => void;
    clearSearch: () => void;
    resetFilters: () => void;
    clearError: () => void;
}

const initialFiltersAxle: AxleFilters = {
    search: '',
    sort_order: ''
};

export const useAxle = (): UseAxleReturn => {
    const [axles, setAxles] = useState<Axle[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<AxlePagination | null>(null);
    const [filters, setFilters] = useState<AxleFilters>(initialFiltersAxle);

    // Fetch axles data
    const fetchAxles = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await AxleService.getAxles(page, limit, filters);

            if (response.data.success) {
                setAxles(response.data.data.items);
                setPagination(response.data.data.pagination);
            } else {
                throw new Error('Failed to fetch axles');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch axles';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Handle delete axle
    const handleDeleteAxle = useCallback(async (axleId: string) => {
        setLoading(true);
        try {
            const response = await AxleService.deleteAxle(axleId);

            if (response.data.success) {
                toast.success('Axle deleted successfully');
                await fetchAxles(pagination?.page || 1, pagination?.limit || 10);
            } else {
                throw new Error('Failed to delete axle');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete axle';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchAxles, pagination]);

    // Handle filter change
    const handleFilterChange = useCallback((key: keyof AxleFilters, value: string) => {
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
        fetchAxles(1, pagination?.limit || 10);
    }, [fetchAxles, pagination]);

    // Clear search
    const clearSearch = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            search: ''
        }));
        fetchAxles(1, pagination?.limit || 10);
    }, [fetchAxles, pagination]);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch axels when sort_order changes (but not search)
    useEffect(() => {
        if (filters.sort_order !== initialFilters.sort_order) {
            fetchAxles(1, pagination?.limit || 10);
        }
    }, [filters.sort_order, fetchAxles, pagination?.limit]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchAxles(1);
    }, []);

    return {
        axles,
        loading,
        error,
        pagination,
        filters,
        fetchAxles,
        handleDeleteAxle,
        handleFilterChange,
        handleSearchChange,
        handleManualSearch,
        clearSearch,
        resetFilters,
        clearError
    };
};
// ========== FORM HOOKS AXEL ==========
interface UseAxelFormProps {
    initialData?: Partial<AxleFormData>;
    axelId?: string;
    onSuccess?: () => void;
    redirectPath?: string;
}

interface UseAxleFormReturn {
    // State
    formData: AxleFormData;
    validationErrors: any;
    loading: boolean;
    
    // Handlers
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTypeAxlesChange: (typeAxles: TypeAxleFormData[]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    
    // Utilities
    validateFormData: (data: AxleFormData) => AxleValidationErrors;
    setFormData: React.Dispatch<React.SetStateAction<AxleFormData>>;
    setValidationErrors: React.Dispatch<React.SetStateAction<any>>;
    clearError: (fieldName: string) => void;
    resetForm: () => void;
}

const defaultInitialDataAxle: AxleFormData = {
    axel_name_en: '',
    axel_name_cn: '',
    axel_description: '',
    type_axels: []
};

export const useAxleForm = ({
    initialData = {},
    axelId,
    onSuccess,
    redirectPath = '/epc/axle'
}: UseAxelFormProps = {}): UseAxleFormReturn => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<AxleFormData>({
        ...defaultInitialDataAxle,
        ...initialData
    });
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(prevData => {
                // Only update if data is actually different
                const newData = { ...defaultInitialDataAxle, ...initialData };
                if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                    return newData;
                }
                return prevData;
            });
        }
    }, [initialData]);

    // Validate form data
    const validateFormData = useCallback((data: AxleFormData): AxleValidationErrors => {
        const errors: AxleValidationErrors = {};

        if (!data.axel_name_en.trim()) {
            errors.axel_name_en = 'English axel name is required';
        }

        if (!data.axel_name_cn.trim()) {
            errors.axel_name_cn = 'Chinese axel name is required';
        }

        if (!data.axel_description.trim()) {
            errors.axel_description = 'Description is required';
        }

        // Validate type_axles
        if (data.type_axels && data.type_axels.length > 0) {
            data.type_axels.forEach((typeAxel, index) => {
                if (!typeAxel.type_axel_name_en.trim()) {
                    errors[`type_axels.${index}.type_axel_name_en`] = 'English type axel name is required';
                }
                if (!typeAxel.type_axel_name_cn.trim()) {
                    errors[`type_axels.${index}.type_axel_name_cn`] = 'Chinese type axel name is required';
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
        if (validationErrors[name as keyof AxleFormData]) {
            setValidationErrors((prev: any) => ({
                ...prev,
                [name]: undefined
            }));
        }
    }, [validationErrors]);

    // Handle TypeAxles change
    const handleTypeAxlesChange = useCallback((typeAxles: TypeAxleFormData[]) => {
        setFormData(prev => ({
            ...prev,
            type_axels: typeAxles
        }));

        // Clear validation errors for type_axels
        const newErrors = { ...validationErrors } as Record<string, string>;
        Object.keys(newErrors).forEach(key => {
            if (key.startsWith('type_axles.')) {
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

            if (axelId) {
                // Update existing axle
                response = await AxleService.updateAxle(axelId, formData);
                if (response.data.success) {
                    toast.success('Axle updated successfully');
                } else {
                    throw new Error('Failed to update axle');
                }
            } else {
                // Create new axle
                response = await AxleService.createAxle(formData);
                if (response.data.success) {
                    toast.success('Axle created successfully');
                } else {
                    throw new Error('Failed to create axle');
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
    }, [formData, validateFormData, axelId, onSuccess, navigate, redirectPath]);

    // Clear specific error
    const clearError = useCallback((fieldName: string) => {
        setValidationErrors((prev: any) => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({ ...defaultInitialDataAxle, ...initialData });
        setValidationErrors({});
    }, [initialData]);

    return {
        // State
        formData,
        validationErrors,
        loading,
        
        // Handlers
        handleInputChange,
        handleTypeAxlesChange,
        handleSubmit,
        
        // Utilities
        validateFormData,
        setFormData,
        setValidationErrors,
        clearError,
        resetForm
    };
};

// Hook khusus untuk create axle
export const useCreateAxle = (onSuccess?: () => void) => {
    return useAxleForm({
        onSuccess,
        redirectPath: '/epc/axle'
    });
};

// Hook khusus untuk edit axle
export const useEditAxle = (axle: Axle | null, onSuccess?: () => void) => {
    const initialData: Partial<AxleFormData> = useMemo(() => {
        return axle ? {
            axel_name_en: axle.axel_name_en,
            axel_name_cn: axle.axel_name_cn,
            axel_description: axle.axel_description,
            type_axels: axle.type_axels.map(tc => ({
                type_axel_name_en: tc.type_axel_name_en,
                type_axel_name_cn: tc.type_axel_name_cn,
                type_axel_description: tc.type_axel_description
            }))
        } : {};
    }, [axle]);

    return useAxleForm({
        initialData,
        axelId: axle?.axel_id,
        onSuccess,
        redirectPath: '/epc/axle'
    });
};

// ========= PART TRANSMISSION HOOKS ==========
interface UseTransmissionReturn {
    transmissions: Transmission[];
    loading: boolean;
    error: string | null;
    pagination: TransmissionPagination | null;
    filters: TransmissionFilters;
    
    // Actions
    fetchTransmissions: (page?: number, limit?: number) => Promise<void>;
    handleDeleteTransmission: (transmissionId: string) => Promise<void>;
    handleFilterChange: (key: keyof TransmissionFilters, value: string) => void;
    handleSearchChange: (value: string) => void;
    handleManualSearch: () => void;
    clearSearch: () => void;
    resetFilters: () => void;
    clearError: () => void;
}

const initialFiltersTransmission: TransmissionFilters = {
    search: '',
    sort_order: ''
};

export const useTransmission = (): UseTransmissionReturn => {
    const [transmissions, setTransmissions] = useState<Transmission[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<TransmissionPagination | null>(null);
    const [filters, setFilters] = useState<TransmissionFilters>(initialFiltersTransmission);

    // Fetch transmissions data
    const fetchTransmissions = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await TransmissionService.getTransmissions(page, limit, filters);
            
            if (response.data.success) {
                setTransmissions(response.data.data.items);
                setPagination(response.data.data.pagination);
            } else {
                throw new Error('Failed to fetch transmissions');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transmissions';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Handle delete transmission
    const handleDeleteTransmission = useCallback(async (transmissionId: string) => {
        setLoading(true);
        try {
            const response = await TransmissionService.deleteTransmission(transmissionId);

            if (response.data.success) {
                toast.success('Transmission deleted successfully');
                await fetchTransmissions(pagination?.page || 1, pagination?.limit || 10);
            } else {
                throw new Error('Failed to delete transmission');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete transmission';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchTransmissions, pagination]);

    // Handle filter change
    const handleFilterChange = useCallback((key: keyof TransmissionFilters, value: string) => {
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
        fetchTransmissions(1, pagination?.limit || 10);
    }, [fetchTransmissions, pagination]);

    // Clear search
    const clearSearch = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            search: ''
        }));
        fetchTransmissions(1, pagination?.limit || 10);
    }, [fetchTransmissions, pagination]);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch cabins when sort_order changes (but not search)
    // Fetch transmissions when sort_order changes (but not search)
    useEffect(() => {
        if (filters.sort_order !== initialFilters.sort_order) {
            fetchTransmissions(1, pagination?.limit || 10);
        }
    }, [filters.sort_order, fetchTransmissions, pagination?.limit]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchTransmissions(1);
    }, []);

    return {
        transmissions,
        loading,
        error,
        pagination,
        filters,
        fetchTransmissions,
        handleDeleteTransmission,
        handleFilterChange,
        handleSearchChange,
        handleManualSearch,
        clearSearch,
        resetFilters,
        clearError
    };
};

// ========== FORM HOOKS ==========
interface UseTransmissionFormProps {
    initialData?: Partial<TransmissionFormData>;
    transmissionId?: string;
    onSuccess?: () => void;
    redirectPath?: string;
}

interface UseTransmissionFormReturn {
    // State
    formData: TransmissionFormData;
    validationErrors: any;
    loading: boolean;
    
    // Handlers
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTypeTransmissionsChange: (typeTransmissions: TypeTransmissionFormData[]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    
    // Utilities
    validateFormData: (data: TransmissionFormData) => TransmissionValidationErrors;
    setFormData: React.Dispatch<React.SetStateAction<TransmissionFormData>>;
    setValidationErrors: React.Dispatch<React.SetStateAction<any>>;
    clearError: (fieldName: string) => void;
    resetForm: () => void;
}

const defaultInitialDataTransmission: TransmissionFormData = {
    transmission_name_en: '',
    transmission_name_cn: '',
    transmission_description: '',
    type_transmissions: []
};

export const useTransmissionForm = ({
    initialData = {},
    transmissionId,
    onSuccess,
    redirectPath = '/epc/transmission'
}: UseTransmissionFormProps = {}): UseTransmissionFormReturn => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<TransmissionFormData>({
        ...defaultInitialDataTransmission,
        ...initialData
    });
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(prevData => {
                // Only update if data is actually different
                const newData = { ...defaultInitialDataTransmission, ...initialData };
                if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                    return newData;
                }
                return prevData;
            });
        }
    }, [initialData]);

    // Validate form data
    const validateFormData = useCallback((data: TransmissionFormData): TransmissionValidationErrors => {
        const errors: TransmissionValidationErrors = {};

        if (!data.transmission_name_en.trim()) {
            errors.transmission_name_en = 'English transmission name is required';
        }

        if (!data.transmission_name_cn.trim()) {
            errors.transmission_name_cn = 'Chinese transmission name is required';
        }

        if (!data.transmission_description.trim()) {
            errors.transmission_description = 'Description is required';
        }

        // Validate type_transmissions
        if (data.type_transmissions && data.type_transmissions.length > 0) {
            data.type_transmissions.forEach((typeTransmission, index) => {
                if (!typeTransmission.type_transmission_name_en.trim()) {
                    errors[`type_transmissions.${index}.type_transmission_name_en`] = 'English type transmission name is required';
                }
                if (!typeTransmission.type_transmission_name_cn.trim()) {
                    errors[`type_transmissions.${index}.type_transmission_name_cn`] = 'Chinese type transmission name is required';
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
        if (validationErrors[name as keyof CabinFormData]) {
            setValidationErrors((prev: any) => ({
                ...prev,
                [name]: undefined
            }));
        }
    }, [validationErrors]);

    // Handle TypeTransmissions change
    const handleTypeTransmissionsChange = useCallback((typeTransmissions: TypeTransmissionFormData[]) => {
        setFormData(prev => ({
            ...prev,
            type_transmissions: typeTransmissions
        }));

        // Clear validation errors for type_transmissions
        const newErrors = { ...validationErrors } as Record<string, string>;
        Object.keys(newErrors).forEach(key => {
            if (key.startsWith('type_transmissions.')) {
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
            
            if (transmissionId) {
                // Update existing transmission
                response = await TransmissionService.updateTransmission(transmissionId, formData);
                if (response.data.success) {
                    toast.success('Cabin updated successfully');
                } else {
                    throw new Error('Failed to update cabin');
                }
            } else {
                // Create new transmission
                response = await TransmissionService.createTransmission(formData);
                if (response.data.success) {
                    toast.success('Cabin created successfully');
                } else {
                    throw new Error('Failed to create cabin');
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
    }, [formData, validateFormData, transmissionId, onSuccess, navigate, redirectPath]);

    // Clear specific error
    const clearError = useCallback((fieldName: string) => {
        setValidationErrors((prev: any) => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({ ...defaultInitialDataTransmission, ...initialData });
        setValidationErrors({});
    }, [initialData]);

    return {
        // State
        formData,
        validationErrors,
        loading,
        
        // Handlers
        handleInputChange,
        handleTypeTransmissionsChange,
        handleSubmit,
        
        // Utilities
        validateFormData,
        setFormData,
        setValidationErrors,
        clearError,
        resetForm
    };
};

// Hook khusus untuk create transmission
export const useCreateTransmission = (onSuccess?: () => void) => {
    return useTransmissionForm({
        onSuccess,
        redirectPath: '/epc/transmission'
    });
};

// Hook khusus untuk edit transmission
export const useEditTransmission = (transmission: Transmission | null, onSuccess?: () => void) => {
    const initialData: Partial<TransmissionFormData> = useMemo(() => {
        return transmission ? {
            transmission_name_en: transmission.transmission_name_en,
            transmission_name_cn: transmission.transmission_name_cn,
            transmission_description: transmission.transmission_description,
            type_transmissions: transmission.type_transmissions.map(tc => ({
                type_transmission_name_en: tc.type_transmission_name_en,
                type_transmission_name_cn: tc.type_transmission_name_cn,
                type_transmission_description: tc.type_transmission_description
            }))
        } : {};
    }, [transmission]);

    return useTransmissionForm({
        initialData,
        transmissionId: transmission?.transmission_id,
        onSuccess,
        redirectPath: '/epc/transmission'
    });
};

// ========= PART STEERING HOOKS ==========
interface UseSteeringReturn {
    steerings: Steering[];
    loading: boolean;
    error: string | null;
    pagination: SteeringPagination | null;
    filters: SteeringFilters;

    // Actions
    fetchSteerings: (page?: number, limit?: number) => Promise<void>;
    handleDeleteSteering: (steeringId: string) => Promise<void>;
    handleFilterChange: (key: keyof SteeringFilters, value: string) => void;
    handleSearchChange: (value: string) => void;
    handleManualSearch: () => void;
    clearSearch: () => void;
    resetFilters: () => void;
    clearError: () => void;
}

const initialFiltersSteering: SteeringFilters = {
    search: '',
    sort_order: ''
};

export const useSteering = (): UseSteeringReturn => {
    const [steerings, setSteerings] = useState<Steering[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<SteeringPagination | null>(null);
    const [filters, setFilters] = useState<SteeringFilters>(initialFiltersSteering);

    // Fetch steerings data
    const fetchSteerings = useCallback(async (page = 1, limit = 10) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await SteeringService.getSteerings(page, limit, filters);
            
            if (response.data.success) {
                setSteerings(response.data.data.items);
                setPagination(response.data.data.pagination);
            } else {
                throw new Error('Failed to fetch steerings');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch steerings';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // Handle delete steering
    const handleDeleteSteering = useCallback(async (steeringId: string) => {
        setLoading(true);
        try {
            const response = await SteeringService.deleteSteering(steeringId);

            if (response.data.success) {
                toast.success('Steering deleted successfully');
                await fetchSteerings(pagination?.page || 1, pagination?.limit || 10);
            } else {
                throw new Error('Failed to delete steering');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete steering';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchSteerings, pagination]);

    // Handle filter change
    const handleFilterChange = useCallback((key: keyof SteeringFilters, value: string) => {
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
        fetchSteerings(1, pagination?.limit || 10);
    }, [fetchSteerings, pagination]);

    // Clear search
    const clearSearch = useCallback(() => {
        setFilters(prev => ({
            ...prev,
            search: ''
        }));
        fetchSteerings(1, pagination?.limit || 10);
    }, [fetchSteerings, pagination]);

    // Reset filters
    const resetFilters = useCallback(() => {
        setFilters(initialFilters);
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch steerings when sort_order changes (but not search)
    useEffect(() => {
        if (filters.sort_order !== initialFilters.sort_order) {
            fetchSteerings(1, pagination?.limit || 10);
        }
    }, [filters.sort_order, fetchSteerings, pagination?.limit]);

    // Initial fetch when component mounts
    useEffect(() => {
        fetchSteerings(1);
    }, []);

    return {
        steerings,
        loading,
        error,
        pagination,
        filters,
        fetchSteerings,
        handleDeleteSteering,
        handleFilterChange,
        handleSearchChange,
        handleManualSearch,
        clearSearch,
        resetFilters,
        clearError
    };
};

// ========== FORM HOOKS ==========
interface UseSteeringFormProps {
    initialData?: Partial<SteeringFormData>;
    steeringId?: string;
    onSuccess?: () => void;
    redirectPath?: string;
}

interface UseSteeringFormReturn {
    // State
    formData: SteeringFormData;
    validationErrors: any;
    loading: boolean;
    
    // Handlers
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleTypeSteeringsChange: (typeSteerings: TypeSteeringFormData[]) => void;
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    
    // Utilities
    validateFormData: (data: SteeringFormData) => SteeringValidationErrors;
    setFormData: React.Dispatch<React.SetStateAction<SteeringFormData>>;
    setValidationErrors: React.Dispatch<React.SetStateAction<any>>;
    clearError: (fieldName: string) => void;
    resetForm: () => void;
}

const defaultInitialDataSteering: SteeringFormData = {
    steering_name_en: '',
    steering_name_cn: '',
    steering_description: '',
    type_steerings: []
};

export const useSteeringForm = ({
    initialData = {},
    steeringId,
    onSuccess,
    redirectPath = '/epc/steering'
}: UseSteeringFormProps = {}): UseSteeringFormReturn => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<SteeringFormData>({
        ...defaultInitialDataSteering,
        ...initialData
    });
    const [validationErrors, setValidationErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);

    // Update form data when initialData changes
    useEffect(() => {
        if (initialData && Object.keys(initialData).length > 0) {
            setFormData(prevData => {
                // Only update if data is actually different
                const newData = { ...defaultInitialDataSteering, ...initialData };
                if (JSON.stringify(prevData) !== JSON.stringify(newData)) {
                    return newData;
                }
                return prevData;
            });
        }
    }, [initialData]);

    // Validate form data
    const validateFormData = useCallback((data: SteeringFormData): SteeringValidationErrors => {
        const errors: SteeringValidationErrors = {};

        if (!data.steering_name_en.trim()) {
            errors.steering_name_en = 'English steering name is required';
        }

        if (!data.steering_name_cn.trim()) {
            errors.steering_name_cn = 'Chinese steering name is required';
        }

        if (!data.steering_description.trim()) {
            errors.steering_description = 'Description is required';
        }

        // Validate type_steerings
        if (data.type_steerings && data.type_steerings.length > 0) {
            data.type_steerings.forEach((typeSteering, index) => {
                if (!typeSteering.type_steering_name_en.trim()) {
                    errors[`type_steerings.${index}.type_steering_name_en`] = 'English type steering name is required';
                }
                if (!typeSteering.type_steering_name_cn.trim()) {
                    errors[`type_steerings.${index}.type_steering_name_cn`] = 'Chinese type steering name is required';
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
        if (validationErrors[name as keyof CabinFormData]) {
            setValidationErrors((prev: any) => ({
                ...prev,
                [name]: undefined
            }));
        }
    }, [validationErrors]);

    // Handle TypeSteerings change
    const handleTypeSteeringsChange = useCallback((typeSteerings: TypeSteeringFormData[]) => {
        setFormData(prev => ({
            ...prev,
            type_steerings: typeSteerings
        }));

        // Clear validation errors for type_steerings
        const newErrors = { ...validationErrors } as Record<string, string>;
        Object.keys(newErrors).forEach(key => {
            if (key.startsWith('type_steerings.')) {
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

            if (steeringId) {
                // Update existing steering
                response = await SteeringService.updateSteering(steeringId, formData);
                if (response.data.success) {
                    toast.success('Steering updated successfully');
                } else {
                    throw new Error('Failed to update steering');
                }
            } else {
                // Create new steering
                response = await SteeringService.createSteering(formData);
                if (response.data.success) {
                    toast.success('Steering created successfully');
                } else {
                    throw new Error('Failed to create steering');
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
    }, [formData, validateFormData, steeringId, onSuccess, navigate, redirectPath]);

    // Clear specific error
    const clearError = useCallback((fieldName: string) => {
        setValidationErrors((prev: any) => ({
            ...prev,
            [fieldName]: undefined
        }));
    }, []);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({ ...defaultInitialDataSteering, ...initialData });
        setValidationErrors({});
    }, [initialData]);

    return {
        // State
        formData,
        validationErrors,
        loading,
        
        // Handlers
        handleInputChange,
        handleTypeSteeringsChange,
        handleSubmit,
        
        // Utilities
        validateFormData,
        setFormData,
        setValidationErrors,
        clearError,
        resetForm
    };
};

// Hook khusus untuk create steering
export const useCreateSteering = (onSuccess?: () => void) => {
    return useSteeringForm({
        onSuccess,
        redirectPath: '/epc/steering'
    });
};

// Hook khusus untuk edit steering
export const useEditSteering = (steering: Steering | null, onSuccess?: () => void) => {
    const initialData: Partial<SteeringFormData> = useMemo(() => {
        return steering ? {
            steering_name_en: steering.steering_name_en,
            steering_name_cn: steering.steering_name_cn,
            steering_description: steering.steering_description,
            type_steerings: steering.type_steerings.map(tc => ({
                type_steering_name_en: tc.type_steering_name_en,
                type_steering_name_cn: tc.type_steering_name_cn,
                type_steering_description: tc.type_steering_description
            }))
        } : {};
    }, [steering]);

    return useSteeringForm({
        initialData,
        steeringId: steering?.steering_id,
        onSuccess,
        redirectPath: '/epc/steering'
    });
};

import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
    PartCatalogueData, 
    PartCatalogueFormData, 
    CatalogValidationErrors,
    PartItem 
} from '@/types/asyncSelect';
import { CatalogManageService } from '@/services/partCatalogueService';

interface UsePartCatalogueManagementProps {
    onPartTypeChange?: (partType: string) => void;
}

interface UsePartCatalogueManagementReturn {
    // Form data
    formData: PartCatalogueFormData;
    setFormData: React.Dispatch<React.SetStateAction<PartCatalogueFormData>>;
    
    // Validation
    validationErrors: CatalogValidationErrors;
    setValidationErrors: React.Dispatch<React.SetStateAction<CatalogValidationErrors>>;
    validateForm: () => CatalogValidationErrors;
    
    // Part catalogue data
    partCatalogueData: PartCatalogueData;
    catalogueDataLoading: boolean;
    fetchPartCatalogueData: (partType: string) => Promise<void>;
    
    // Selected data
    selectedPartData: any;
    subTypes: any[];
    
    // Form handlers
    handleSelectChange: (name: string) => (selectedOption: { value: string; label: string; } | null) => void;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleAddPart: () => void;
    handleRemovePart: (partId: string) => void;
    handlePartChange: (partId: string, field: keyof PartItem, value: string | number) => void;
    
    // Form submission
    handleSubmit: (e: React.FormEvent) => Promise<void>;
    loading: boolean;
}

export const usePartCatalogueManagement = ({
    onPartTypeChange
}: UsePartCatalogueManagementProps = {}): UsePartCatalogueManagementReturn => {
    const [formData, setFormData] = useState<PartCatalogueFormData>({
        code_cabin: '',
        part_type: '',
        part_id: '',
        type_id: '',
        master_category: '',
        svg_image: null,
        file_foto: null,
        dokumen_id:'',
        // use_csv_upload: false,
        // csv_file: null,
        parts: []
    });
    
    const [validationErrors, setValidationErrors] = useState<CatalogValidationErrors>({});
    const [loading, setLoading] = useState(false);

    // State untuk menyimpan data part catalogue yang di-load on demand
    // Note: Legacy state - mostly unused in new master_category flow
    const [partCatalogueData] = useState<PartCatalogueData>({
        cabins: null,
        engines: null,
        axles: null,
        transmissions: null,
        steerings: null
    });
    
    const [catalogueDataLoading, setCatalogueDataLoading] = useState(false);
    const [selectedPartData, setSelectedPartData] = useState<any>(null);
    const [subTypes, setSubTypes] = useState<any[]>([]);

    // Ref to track ongoing requests for each part type
    const fetchingRefs = useRef<Record<string, boolean>>({});

    // Function untuk fetch data part catalogue berdasarkan type
    const fetchPartCatalogueData = useCallback(async (partType: string) => {
        const currentData = partCatalogueData[partType as keyof typeof partCatalogueData];
        
        // Cek apakah data sudah ada (harus array dengan length > 0, bukan null/undefined)
        if (currentData && Array.isArray(currentData) && currentData.length > 0) {
            return;
        }

        // Prevent multiple simultaneous requests for the same part type
        if (catalogueDataLoading || fetchingRefs.current[partType]) {
            return;
        }

        setCatalogueDataLoading(true);
        fetchingRefs.current[partType] = true;
        
        try {
            // Legacy part type loading - now handled by cascade system
            // This function is kept for compatibility but not actively used
        } catch (error) {
            console.error(`Error fetching ${partType} data:`, error);
            toast.error(`Failed to load ${partType} data`);
        } finally {
            setCatalogueDataLoading(false);
            fetchingRefs.current[partType] = false;
        }
    }, [catalogueDataLoading]); // Remove partCatalogueData dependency to prevent loops

    // Handle select change untuk CustomSelect component
    const handleSelectChange = useCallback((name: string) => (selectedOption: { value: string; label: string; } | null) => {
        const value = selectedOption ? selectedOption.value : '';
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error for this field
        if (validationErrors[name as keyof CatalogValidationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }

        // Reset dependent fields when parent fields change
        if (name === 'master_category') {
            // Reset part_id and type_id when master_category changes
            setFormData(prev => ({
                ...prev,
                part_id: '',
                type_id: ''
            }));
            setSelectedPartData(null);
            setSubTypes([]);
            
            // Clear validation errors for dependent fields
            setValidationErrors(prev => ({
                ...prev,
                part_id: undefined,
                type_id: undefined
            }));
        } else if (name === 'part_id') {
            // Reset type_id when part_id changes
            setFormData(prev => ({
                ...prev,
                type_id: ''
            }));
            setSubTypes([]);
            
            // Clear validation error for type_id
            setValidationErrors(prev => ({
                ...prev,
                type_id: undefined
            }));
        } else if (name === 'part_type') {
            // Legacy: Keep for Detail.tsx compatibility
            setFormData(prev => ({
                ...prev,
                part_id: '',
                type_id: ''
            }));
            setSelectedPartData(null);
            setSubTypes([]);
            
            // Note: Legacy fetchPartCatalogueData removed - Detail.tsx should use its own logic
            if (onPartTypeChange) {
                onPartTypeChange(value);
            }
        }
    }, [validationErrors, onPartTypeChange]);

    // Handle input change for text inputs
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear validation error for this field
        if (validationErrors[name as keyof CatalogValidationErrors]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    }, [validationErrors]);

    // Handle checkbox change
    const handleCheckboxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    }, []);

    // Generate unique ID for part items
    const generateId = useCallback(() => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }, []);

    // Add new part item
    const handleAddPart = useCallback(() => {
        const newPart: PartItem = {
            id: generateId(),
            target_id: '',
            part_number: '',
            file_foto: null,
            catalog_item_name_en: '',
            catalog_item_name_ch: '',
            description: '',
            unit: '',
            quantity: 1
        };

        setFormData(prev => ({
            ...prev,
            parts: [...prev.parts, newPart]
        }));
    }, [generateId]);

    // Remove part item
    const handleRemovePart = useCallback((partId: string) => {
        setFormData(prev => ({
            ...prev,
            parts: prev.parts.filter(part => part.id !== partId)
        }));
    }, []);

    // Handle part item change
    const handlePartChange = useCallback((partId: string, field: keyof PartItem, value: string | number) => {
        
        setFormData(prev => {
            const updatedParts = prev.parts.map(part => {
                if (part.id === partId) {
                    return { ...part, [field]: field === 'quantity' ? Number(value) : value };
                }
                return part;
            });
            
            return {
                ...prev,
                parts: updatedParts
            };
        });
    }, []);

    // Validate form
    const validateForm = useCallback((): CatalogValidationErrors => {
        const errors: CatalogValidationErrors = {};

        if (!formData.code_cabin.trim()) {
            errors.code_cabin = 'Document Name is required';
        }

        if (!formData.part_type) {
            errors.part_type = 'Part type is required';
        }

        if (!formData.part_id) {
            errors.part_id = 'Part selection is required';
        }

        if (!formData.type_id) {
            errors.type_id = 'Type selection is required';
        }

        // SVG image is optional - no validation required

        // Validate parts input (CSV files are directly converted to parts)
        if (formData.parts.length === 0) {
            errors.parts = 'At least one part is required';
        } else {
            // Validate each part
            const invalidParts = formData.parts.some(part => 
                !part.target_id.trim() || 
                !part.part_number.trim() || 
                !part.catalog_item_name_en.trim() || 
                !part.catalog_item_name_ch.trim() || 
                !part.quantity || 
                Number(part.quantity) <= 0
            );
            
            if (invalidParts) {
                errors.parts = 'All part fields are required and quantity must be greater than 0';
            }
        }

        return errors;
    }, [formData]);

    // Handle form submission
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors = validateForm();
        setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setLoading(true);
        try {
            // Call the catalog creation service
            const response = await import('@/services/partCatalogueService').then(
                ({ CatalogManageService }) => CatalogManageService.createCatalog(formData)
            );

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
            setLoading(false);
        }
    }, [validateForm]);

    // Update selected part data and sub types when part_id changes
    useEffect(() => {
        // Legacy part_type logic removed - now handled by master_category flow
        // For new flow (master_category based), selectedPartData and subTypes 
        // are managed by the cascade system in useCreateCatalog
        if (!formData.part_id) {
            setSelectedPartData(null);
            setSubTypes([]);
            return;
        }
    }, [formData.part_id, formData.part_type, partCatalogueData]);

    return {
        formData,
        setFormData,
        validationErrors,
        setValidationErrors,
        validateForm,
        partCatalogueData,
        catalogueDataLoading,
        fetchPartCatalogueData,
        selectedPartData,
        subTypes,
        handleSelectChange,
        handleInputChange,
        handleCheckboxChange,
        handleAddPart,
        handleRemovePart,
        handlePartChange,
        handleSubmit,
        loading
    };
};

export const useViewCatalogItems = () => {
    const [loading, setLoading] = useState(false);

    // Handle delete category items dengan proper error handling
    const handleDeleteCategoryItems = useCallback(async (itemCategoryID: string, onSuccess?: () => void) => {
        if (!itemCategoryID) {
            toast.error('Item ID is required');
            return false;
        }

        setLoading(true);
        try {
            const response = await CatalogManageService.deleteItemsCatalog(itemCategoryID);

            if (response.data?.success) {
                toast.success('Category item deleted successfully');
                // Call onSuccess callback jika disediakan
                if (onSuccess) {
                    onSuccess();
                }
                return true;
            } else {
                throw new Error(response.data?.message || 'Failed to delete category item');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to delete category items';
            toast.error(errorMessage);
            return false;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        handleDeleteCategoryItems,
        loading
    };
};
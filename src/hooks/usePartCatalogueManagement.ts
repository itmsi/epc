import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import { 
    PartCatalogueData, 
    PartType, 
    SelectOption, 
    PartCatalogueFormData, 
    CatalogValidationErrors,
    PartItem 
} from '@/types/asyncSelect';
import { AsyncSelectService } from '@/services/customAsyncSelectService';

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
    
    // Options
    getSubTypeOptions: () => SelectOption[];
    
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
        svg_image: null,
        use_csv_upload: false,
        csv_file: null,
        parts: []
    });

    const [validationErrors, setValidationErrors] = useState<CatalogValidationErrors>({});
    const [loading, setLoading] = useState(false);

    // State untuk menyimpan data part catalogue yang di-load on demand
    const [partCatalogueData, setPartCatalogueData] = useState<PartCatalogueData>({
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
            // Import services
            const { 
                CabinService, 
                EngineService, 
                AxleService, 
                TransmissionService, 
                SteeringService 
            } = await import('@/services/partCatalogueService');

            switch (partType) {
                case 'cabin':
                    const cabinResponse = await CabinService.getCabins(1, 10);
                    if (cabinResponse.data?.success && cabinResponse.data?.data?.items) {
                        setPartCatalogueData(prev => ({
                            ...prev,
                            cabins: cabinResponse.data.data.items
                        }));
                    }
                    break;
                case 'engine':
                    const engineResponse = await EngineService.getEngines(1, 10);
                    if (engineResponse.data?.success && engineResponse.data?.data?.items) {
                        setPartCatalogueData(prev => ({
                            ...prev,
                            engines: engineResponse.data.data.items
                        }));
                    }
                    break;
                case 'axle':
                    const axleResponse = await AxleService.getAxles(1, 10);
                    if (axleResponse.data?.success && axleResponse.data?.data?.items) {
                        setPartCatalogueData(prev => ({
                            ...prev,
                            axles: axleResponse.data.data.items
                        }));
                    }
                    break;
                case 'transmission':
                    const transmissionResponse = await TransmissionService.getTransmissions(1, 10);
                    if (transmissionResponse.data?.success && transmissionResponse.data?.data?.items) {
                        setPartCatalogueData(prev => ({
                            ...prev,
                            transmissions: transmissionResponse.data.data.items
                        }));
                    }
                    break;
                case 'steering':
                    const steeringResponse = await SteeringService.getSteerings(1, 10);
                    if (steeringResponse.data?.success && steeringResponse.data?.data?.items) {
                        setPartCatalogueData(prev => ({
                            ...prev,
                            steerings: steeringResponse.data.data.items
                        }));
                    }
                    break;
            }
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

        // Reset dependent fields when part type changes
        if (name === 'part_type') {
            setFormData(prev => ({
                ...prev,
                part_id: '',
                type_id: ''
            }));
            setSelectedPartData(null);
            setSubTypes([]);
            
            // Fetch data untuk part type yang dipilih dengan debouncing
            if (value) {
                // Add timeout to prevent too many rapid API calls
                setTimeout(() => {
                    fetchPartCatalogueData(value);
                }, 50);
                
                if (onPartTypeChange) {
                    onPartTypeChange(value);
                }
            }
        }

        // Reset type when part changes
        if (name === 'part_id') {
            setFormData(prev => ({
                ...prev,
                type_id: ''
            }));
        }
    }, [validationErrors, fetchPartCatalogueData, onPartTypeChange]);

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
            [name]: checked,
            // Clear CSV file if unchecking
            ...(name === 'use_csv_upload' && !checked ? { csv_file: null } : {}),
            // Clear parts if checking CSV upload
            ...(name === 'use_csv_upload' && checked ? { parts: [] } : {})
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
            part_target: '',
            code_product: '',
            name_english: '',
            name_chinese: '',
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
        setFormData(prev => ({
            ...prev,
            parts: prev.parts.map(part => 
                part.id === partId 
                    ? { ...part, [field]: field === 'quantity' ? Number(value) : value }
                    : part
            )
        }));
    }, []);

    // Get options for sub type selection
    const getSubTypeOptions = useCallback(() => {
        return AsyncSelectService.transformSubTypeDataToOptions(formData.part_type as PartType, subTypes);
    }, [formData.part_type, subTypes]);

    // Validate form
    const validateForm = useCallback((): CatalogValidationErrors => {
        const errors: CatalogValidationErrors = {};

        if (!formData.code_cabin.trim()) {
            errors.code_cabin = 'Code cabin is required';
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

        // Validate CSV upload if selected
        if (formData.use_csv_upload) {
            if (!formData.csv_file) {
                errors.csv_file = 'CSV file is required when CSV upload is selected';
            }
        } else {
            // Validate manual parts input
            if (formData.parts.length === 0) {
                errors.parts = 'At least one part is required';
            } else {
                // Validate each part
                const invalidParts = formData.parts.some(part => 
                    !part.part_target.trim() || 
                    !part.code_product.trim() || 
                    !part.name_english.trim() || 
                    !part.name_chinese.trim() || 
                    !part.quantity || 
                    Number(part.quantity) <= 0
                );
                
                if (invalidParts) {
                    errors.parts = 'All part fields are required and quantity must be greater than 0';
                }
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
            const response = await import('@/services/catalogManageService').then(
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
        if (!formData.part_id || !formData.part_type) {
            setSelectedPartData(null);
            setSubTypes([]);
            return;
        }

        let selectedData = null;
        let types: any[] = [];

        // First, try to find in the existing data
        switch (formData.part_type) {
            case 'cabin':
                selectedData = partCatalogueData.cabins?.find((cabin: any) => cabin.cabines_id === formData.part_id);
                types = selectedData?.type_cabines || [];
                break;
            case 'engine':
                selectedData = partCatalogueData.engines?.find((engine: any) => engine.engines_id === formData.part_id);
                types = selectedData?.type_engines || [];
                break;
            case 'axle':
                selectedData = partCatalogueData.axles?.find((axle: any) => axle.axel_id === formData.part_id);
                types = selectedData?.type_axels || [];
                break;
            case 'transmission':
                selectedData = partCatalogueData.transmissions?.find((transmission: any) => transmission.transmission_id === formData.part_id);
                types = selectedData?.type_transmissions || [];
                break;
            case 'steering':
                selectedData = partCatalogueData.steerings?.find((steering: any) => steering.steering_id === formData.part_id);
                types = selectedData?.type_steerings || [];
                break;
        }

        setSelectedPartData(selectedData);
        setSubTypes(types);
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
        getSubTypeOptions,
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
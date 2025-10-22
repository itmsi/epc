import { useState, useCallback, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import toast from 'react-hot-toast';
import { 
    PartType, 
    SelectOption,
    PartItem,
    PartCatalogueFormData,
    CatalogValidationErrors,
    PartCatalogueData
} from '@/types/asyncSelect';
import { useEditCatalog } from '@/hooks/useManageCatalogs';
import { CatalogAsyncSelectService, useAsyncSelect } from '@/hooks/useCustomAsyncSelect';
import { AsyncSelectService } from '@/services/customAsyncSelectService';

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
}

interface UseEditCatalogEnhancedReturn {
    // Search state
    searchInputValue: string;
    setSearchInputValue: (value: string) => void;
    handleSearchInputChange: (inputValue: string) => void;
    
    // Part options management
    partOptions: SelectOption[];
    loadPartOptions: (searchQuery: string) => Promise<SelectOption[]>;
    getPartDataByType: () => any[];
    getPartOptions: () => SelectOption[];
    
    // CSV handling
    parseCSVFile: (file: File) => Promise<PartItem[]>;
    handleCSVUpload: (file: File | null) => Promise<void>;
    
    // Form management from existing hook
    formData: PartCatalogueFormData;
    setFormData: React.Dispatch<React.SetStateAction<PartCatalogueFormData>>;
    validationErrors: CatalogValidationErrors;
    setValidationErrors: React.Dispatch<React.SetStateAction<CatalogValidationErrors>>;
    partCatalogueData: PartCatalogueData;
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
    loadingCatalog: boolean;
    submitting: boolean;
    catalogData: any;
    
    // Async select hook
    asyncSelectHook: AsyncSelectHookReturn;
}

export const useEditCatalogEnhanced = (): UseEditCatalogEnhancedReturn => {
    // Search state
    const [searchInputValue, setSearchInputValue] = useState('');
    
    // Use the existing edit catalog hook
    const editCatalogHook = useEditCatalog();
    const {
        formData,
        setFormData,
        validationErrors,
        setValidationErrors,
        partCatalogueData
    } = editCatalogHook;
    
    // Use the async select hook for pagination and search
    const asyncSelectHook = useAsyncSelect({
        partType: formData.part_type as PartType,
        partCatalogueData
    });

    // Helper to get part data by type
    const getPartDataByType = useCallback(() => {
        switch (formData.part_type) {
            case 'cabin': return partCatalogueData.cabins || [];
            case 'engine': return partCatalogueData.engines || [];
            case 'axle': return partCatalogueData.axles || [];
            case 'transmission': return partCatalogueData.transmissions || [];
            case 'steering': return partCatalogueData.steerings || [];
            default: return [];
        }
    }, [formData.part_type, partCatalogueData]);

    // Get options for part selection
    const getPartOptions = useCallback((): SelectOption[] => {
        if (!formData.part_type) return [{ value: '', label: 'Select Part Type First' }];

        const baseOptions = AsyncSelectService.createDefaultOptions(`Select ${formData.part_type}`);
        const partData = getPartDataByType();
        
        if (!partData.length) return baseOptions;

        const transformedOptions = CatalogAsyncSelectService.transformPartDataToOptions(
            formData.part_type as PartType, 
            partData
        );
        
        return baseOptions.concat(transformedOptions);
    }, [formData.part_type, getPartDataByType]);

    // Memoize part options to prevent unnecessary recalculations
    const partOptions = useMemo(() => {
        if (asyncSelectHook.partOptions.length > 0) {
            return asyncSelectHook.partOptions;
        }
        return getPartOptions();
    }, [asyncSelectHook.partOptions, getPartOptions]);

    // Create load options function for AsyncSelect with search capability
    const loadPartOptions = useCallback(async (searchQuery: string): Promise<SelectOption[]> => {
        const allOptions = getPartOptions();
        return AsyncSelectService.createLoadOptions(allOptions, true)(searchQuery);
    }, [getPartOptions]);

    // Handle search input change
    const handleSearchInputChange = useCallback((inputValue: string) => {
        setSearchInputValue(inputValue);
        console.log('Search input changed to:', `"${inputValue}"`);
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
                                part_target: row.target_id || '',
                                code_product: row.part_number || '',
                                quantity: parseInt(row.quantity) || 1,
                                name_english: row.catalog_item_name_en || '',
                                name_chinese: row.catalog_item_name_ch || '',
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

        // Update form data with the file
        setFormData((prev: PartCatalogueFormData) => ({
            ...prev,
            csv_file: file
        }));

        // Clear CSV validation errors
        if (validationErrors.csv_file) {
            setValidationErrors((prev: CatalogValidationErrors) => {
                const newErrors = { ...prev };
                delete newErrors.csv_file;
                return newErrors;
            });
        }

        try {
            // Parse CSV and populate parts
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
            
            // Remove the file from form data on error
            setFormData((prev: PartCatalogueFormData) => ({
                ...prev,
                csv_file: null
            }));
        }
    }, [parseCSVFile, setFormData, validationErrors.csv_file, setValidationErrors]);

    return {
        // Search state
        searchInputValue,
        setSearchInputValue,
        handleSearchInputChange,
        
        // Part options management
        partOptions,
        loadPartOptions,
        getPartDataByType,
        getPartOptions,
        
        // CSV handling
        parseCSVFile,
        handleCSVUpload,
        
        // All existing hook functionality
        ...editCatalogHook,
        
        // Async select hook
        asyncSelectHook
    };
};
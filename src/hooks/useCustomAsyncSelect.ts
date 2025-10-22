import { useState, useCallback, useMemo, useEffect } from 'react';
import { 
    SelectOption, 
    PaginationState, 
    PartType, 
    PartCatalogueData 
} from '@/types/asyncSelect';
import { AsyncSelectService } from '@/services/customAsyncSelectService';
// import { CatalogAsyncSelectService } from '@/services/catalogAsyncSelectService';

interface UseAsyncSelectProps {
    partType: PartType | '';
    partCatalogueData: PartCatalogueData;
}

interface UseAsyncSelectReturn {
    // Options and data
    partOptions: SelectOption[];
    loadPartOptions: (searchQuery: string) => Promise<SelectOption[]>;
    
    // Pagination state
    pagination: PaginationState;
    handleScrollToBottom: () => Promise<void>;
    
    // Search functionality
    filterOptions: (options: SelectOption[], searchQuery: string) => SelectOption[];
    
    // Form helpers
    getSelectedOption: (value: string, options: SelectOption[]) => SelectOption | null;
    resetPagination: () => void;
    
    // Loading state
    isLoading: boolean;
}

export const useAsyncSelect = ({
    partType,
    partCatalogueData
}: UseAsyncSelectProps): UseAsyncSelectReturn => {
    const [pagination, setPagination] = useState<PaginationState>({
        currentPage: 1,
        pageSize: 10,
        hasMore: true,
        loading: false
    });

    const [allPartOptions, setAllPartOptions] = useState<SelectOption[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Generate part options based on part type and data
    const partOptions = useMemo(() => {
        if (!partType) return [];

        const baseOptions = AsyncSelectService.createDefaultOptions(partType);
        
        switch (partType) {
            case 'cabin':
                const cabinOptions = CatalogAsyncSelectService.transformPartDataToOptions('cabin', partCatalogueData.cabins || []);
                return baseOptions.concat(cabinOptions);
            case 'engine':
                const engineOptions = CatalogAsyncSelectService.transformPartDataToOptions('engine', partCatalogueData.engines || []);
                return baseOptions.concat(engineOptions);
            case 'axle':
                const axleOptions = CatalogAsyncSelectService.transformPartDataToOptions('axle', partCatalogueData.axles || []);
                return baseOptions.concat(axleOptions);
            case 'transmission':
                const transmissionOptions = CatalogAsyncSelectService.transformPartDataToOptions('transmission', partCatalogueData.transmissions || []);
                return baseOptions.concat(transmissionOptions);
            case 'steering':
                const steeringOptions = CatalogAsyncSelectService.transformPartDataToOptions('steering', partCatalogueData.steerings || []);
                return baseOptions.concat(steeringOptions);
            default:
                return baseOptions;
        }
    }, [partType, partCatalogueData]);

    // Create load options function for AsyncSelect
    const loadPartOptions = useCallback(
        async (searchQuery: string): Promise<SelectOption[]> => {
            const allOptions = allPartOptions.length > 0 ? allPartOptions : partOptions;
            return AsyncSelectService.createLoadOptions(allOptions, true)(searchQuery);
        },
        [partOptions, allPartOptions]
    );

    // Filter options based on search query
    const filterOptions = useCallback(
        (options: SelectOption[], searchQuery: string) => {
            return AsyncSelectService.filterOptions(options, searchQuery);
        },
        []
    );

    // Get selected option helper
    const getSelectedOption = useCallback(
        (value: string, options: SelectOption[]) => {
            return AsyncSelectService.getSelectedOption(value, options);
        },
        []
    );

    // Handle scroll to bottom for pagination
    const handleScrollToBottom = useCallback(async () => {
        if (pagination.loading || !pagination.hasMore || !partType) {
            return;
        }

        const nextPage = pagination.currentPage + 1;
        
        setPagination(prev => ({ ...prev, loading: true }));
        setIsLoading(true);

        try {
            // Import pagination service dynamically
            const { fetchPartsPaginated } = await import('@/services/partPaginationService');
            
            const response = await fetchPartsPaginated(
                partType,
                nextPage,
                pagination.pageSize
            );

            // Transform API data to options
            const newOptions = CatalogAsyncSelectService.transformPartDataToOptions(partType, response.data);

            // Add new options to existing ones (prevent duplicates)
            setAllPartOptions(prev => {
                // If this is the first pagination, include the initial partOptions
                const currentOptions = prev.length > 0 ? prev : partOptions;
                const existingValues = new Set(currentOptions.map((option: SelectOption) => option.value));
                const uniqueNewOptions = newOptions.filter((option: SelectOption) => !existingValues.has(option.value));
                return [...currentOptions, ...uniqueNewOptions];
            });

            setPagination(prev => ({
                ...prev,
                currentPage: nextPage,
                hasMore: response.hasNextPage,
                loading: false
            }));

        } catch (error) {
            console.error('Failed to load more options:', error);
            
            // Fallback to existing data
            const allOptions = partOptions;
            const startIndex = pagination.currentPage * pagination.pageSize;
            const endIndex = startIndex + pagination.pageSize;
            const fallbackOptions = allOptions.slice(startIndex, endIndex);
            
            if (fallbackOptions.length > 0) {
                setAllPartOptions(prev => {
                    const currentOptions = prev.length > 0 ? prev : partOptions;
                    const existingValues = new Set(currentOptions.map(option => option.value));
                    const uniqueNewOptions = fallbackOptions.filter(option => !existingValues.has(option.value));
                    return [...currentOptions, ...uniqueNewOptions];
                });
                
                setPagination(prev => ({
                    ...prev,
                    currentPage: prev.currentPage + 1,
                    hasMore: endIndex < allOptions.length,
                    loading: false
                }));
            } else {
                setPagination(prev => ({ ...prev, loading: false }));
            }
        } finally {
            setIsLoading(false);
        }
    }, [pagination, partType, partOptions]);

    // Reset pagination when part type changes
    const resetPagination = useCallback(() => {
        setAllPartOptions([]);
        setPagination({
            currentPage: 1,
            pageSize: 10,
            hasMore: true,
            loading: false
        });
        setIsLoading(false);
    }, []);

    // Reset pagination when part type changes
    useEffect(() => {
        resetPagination();
    }, [partType, resetPagination]);

    return {
        partOptions: allPartOptions.length > 0 ? allPartOptions : partOptions,
        loadPartOptions,
        pagination,
        handleScrollToBottom,
        filterOptions,
        getSelectedOption,
        resetPagination,
        isLoading: isLoading || pagination.loading
    };
};

export class CatalogAsyncSelectService {
    /**
     * Transform part catalogue data to select options
     */
    static transformPartDataToOptions(partType: PartType, data: any[]): SelectOption[] {
        if (!data || !Array.isArray(data)) return [];

        switch (partType) {
            case 'cabin':
                return data.map((cabin: any) => ({
                    value: cabin.cabines_id,
                    label: `${cabin.cabines_name_en} - ${cabin.cabines_name_cn}`
                }));
            case 'engine':
                return data.map((engine: any) => ({
                    value: engine.engines_id,
                    label: `${engine.engines_name_en} - ${engine.engines_name_cn}`
                }));
            case 'axle':
                return data.map((axle: any) => ({
                    value: axle.axel_id,
                    label: `${axle.axel_name_en} - ${axle.axel_name_cn}`
                }));
            case 'transmission':
                return data.map((transmission: any) => ({
                    value: transmission.transmission_id,
                    label: `${transmission.transmission_name_en} - ${transmission.transmission_name_cn}`
                }));
            case 'steering':
                return data.map((steering: any) => ({
                    value: steering.steering_id,
                    label: `${steering.steering_name_en} - ${steering.steering_name_cn}`
                }));
            default:
                return [];
        }
    }

    /**
     * Transform sub-type data to select options
     */
    static transformSubTypeDataToOptions(partType: PartType, subTypes: any[]): SelectOption[] {
        if (!subTypes || !Array.isArray(subTypes)) return [];

        const baseOptions = [{ value: '', label: 'Select Type' }];

        switch (partType) {
            case 'cabin':
                return baseOptions.concat(
                    subTypes.map((type: any) => ({
                        value: type.type_cabine_id,
                        label: `${type.type_cabine_name_en} - ${type.type_cabine_name_cn}`
                    }))
                );
            case 'engine':
                return baseOptions.concat(
                    subTypes.map((type: any) => ({
                        value: type.type_engine_id,
                        label: `${type.type_engine_name_en} - ${type.type_engine_name_cn}`
                    }))
                );
            case 'axle':
                return baseOptions.concat(
                    subTypes.map((type: any) => ({
                        value: type.type_axel_id,
                        label: `${type.type_axel_name_en} - ${type.type_axel_name_cn}`
                    }))
                );
            case 'transmission':
                return baseOptions.concat(
                    subTypes.map((type: any) => ({
                        value: type.type_transmission_id,
                        label: `${type.type_transmission_name_en} - ${type.type_transmission_name_cn}`
                    }))
                );
            case 'steering':
                return baseOptions.concat(
                    subTypes.map((type: any) => ({
                        value: type.type_steering_id,
                        label: `${type.type_steering_name_en} - ${type.type_steering_name_cn}`
                    }))
                );
            default:
                return baseOptions;
        }
    }

    /**
     * Create default options for part types
     */
    static createDefaultPartOptions(partType: string): SelectOption[] {
        return [{ value: '', label: `Select ${partType}` }];
    }

    /**
     * Get part type display name
     */
    static getPartTypeDisplayName(partType: PartType): string {
        const partTypeNames = {
            cabin: 'Cabin',
            engine: 'Engine', 
            axle: 'Axle',
            transmission: 'Transmission',
            steering: 'Steering'
        };

        return partTypeNames[partType] || partType;
    }

    /**
     * Validate part type selection
     */
    static validatePartType(partType: string): partType is PartType {
        const validPartTypes: PartType[] = ['cabin', 'engine', 'axle', 'transmission', 'steering'];
        return validPartTypes.includes(partType as PartType);
    }

    /**
     * Get field mappings for each part type
     */
    static getPartTypeFieldMappings(partType: PartType) {
        const mappings = {
            cabin: {
                id: 'cabines_id',
                nameEn: 'cabines_name_en',
                nameCn: 'cabines_name_cn',
                typeId: 'type_cabine_id',
                typeNameEn: 'type_cabine_name_en',
                typeNameCn: 'type_cabine_name_cn'
            },
            engine: {
                id: 'engines_id',
                nameEn: 'engines_name_en',
                nameCn: 'engines_name_cn',
                typeId: 'type_engine_id',
                typeNameEn: 'type_engine_name_en',
                typeNameCn: 'type_engine_name_cn'
            },
            axle: {
                id: 'axel_id',
                nameEn: 'axel_name_en',
                nameCn: 'axel_name_cn',
                typeId: 'type_axel_id',
                typeNameEn: 'type_axel_name_en',
                typeNameCn: 'type_axel_name_cn'
            },
            transmission: {
                id: 'transmission_id',
                nameEn: 'transmission_name_en',
                nameCn: 'transmission_name_cn',
                typeId: 'type_transmission_id',
                typeNameEn: 'type_transmission_name_en',
                typeNameCn: 'type_transmission_name_cn'
            },
            steering: {
                id: 'steering_id',
                nameEn: 'steering_name_en',
                nameCn: 'steering_name_cn',
                typeId: 'type_steeringwheel_id',
                typeNameEn: 'type_steeringwheel_name_en',
                typeNameCn: 'type_steeringwheel_name_cn'
            }
        };

        return mappings[partType];
    }
}
import { useState, useCallback, useMemo } from 'react';
import { 
    SelectOption, 
    PaginationState, 
    PartType, 
    PartCatalogueData 
} from '@/types/asyncSelect';
import { AsyncSelectService } from '@/services/customAsyncSelectService';
import { CatalogAsyncSelectService } from '@/services/catalogAsyncSelectService';

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
                const existingValues = new Set(prev.map((option: SelectOption) => option.value));
                const uniqueNewOptions = newOptions.filter((option: SelectOption) => !existingValues.has(option.value));
                return [...prev, ...uniqueNewOptions];
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
                    const existingValues = new Set(prev.map(option => option.value));
                    const uniqueNewOptions = fallbackOptions.filter(option => !existingValues.has(option.value));
                    return [...prev, ...uniqueNewOptions];
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
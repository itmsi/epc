import { useState, useCallback, useMemo } from 'react';
import { VinService } from '@/services/partCatalogueService';
import { Vin } from '@/types/partCatalogue';

export interface VinSelectOption {
    value: string;
    label: string;
    data?: Vin; // Full VIN data object
}

export interface VinPaginationState {
    page: number;
    hasMore: boolean;
    loading: boolean;
}

interface LoadVinParams {
    search?: string;
    page?: number;
    reset?: boolean;
}

export const useVinSelect = () => {
    const [vinOptions, setVinOptions] = useState<VinSelectOption[]>([]);
    const [pagination, setPagination] = useState<VinPaginationState>({
        page: 1,
        hasMore: true,
        loading: false
    });
    const [inputValue, setInputValue] = useState('');

    const loadVinOptions = useCallback(async ({ 
        search = '', 
        page = 1, 
        reset = false 
    }: LoadVinParams = {}) => {
        try {
            // Prevent multiple concurrent requests
            if (pagination.loading && !reset) {
                return vinOptions;
            }

            setPagination(prev => ({ ...prev, loading: true }));

            const response = await VinService.getVins(
                page,
                50,
                {
                    search,
                    sort_order: 'desc'
                }
            );

            if (!response.data.success) {
                throw new Error('Failed to load VIN options');
            }

            const newOptions: VinSelectOption[] = response.data.data.items.map((vin: Vin) => ({
                value: vin.product_id,
                label: vin.vin_number + ' (' + vin.product_name_en + ')',
                data: vin
            }));

            const updatedOptions = reset ? newOptions : [...vinOptions, ...newOptions];
            
            setVinOptions(updatedOptions);
            setPagination({
                page: response.data.data.pagination.page,
                hasMore: response.data.data.pagination.page < response.data.data.pagination.totalPages,
                loading: false
            });

            return updatedOptions;

        } catch (error) {
            console.error('Error loading VIN options:', error);
            setPagination(prev => ({ ...prev, loading: false }));
            return vinOptions;
        }
    }, [pagination.loading, vinOptions]);

    // Handle input change with search
    const handleInputChange = useCallback(async (newInputValue: string) => {
        setInputValue(newInputValue);
        
        // Reset states for new search
        setVinOptions([]);
        setPagination({ page: 1, hasMore: true, loading: false });
        
        return await loadVinOptions({ 
            search: newInputValue, 
            page: 1, 
            reset: true 
        });
    }, [loadVinOptions]);

    // Handle pagination scroll
    const handleMenuScrollToBottom = useCallback(async () => {
        if (pagination.hasMore && !pagination.loading) {
            await loadVinOptions({ 
                search: inputValue, 
                page: pagination.page + 1 
            });
        }
    }, [pagination, inputValue, loadVinOptions]);

    // Initialize options on mount
    const initializeOptions = useCallback(async () => {
        if (vinOptions.length === 0 && !pagination.loading) {
            await loadVinOptions({ reset: true });
        }
    }, [vinOptions.length, pagination.loading, loadVinOptions]);

    // Get VIN option by ID
    const getVinById = useCallback(async (vinId: string): Promise<VinSelectOption | null> => {
        try {
            const response = await VinService.getVinById(vinId);
            
            if (!response.data.success || !response.data.data) {
                return null;
            }

            return {
                value: response.data.data.product_id,
                label: response.data.data.vin_number + ' (' + response.data.data.product_name_en + ')',
                data: response.data.data
            };
        } catch (error) {
            console.error('Error getting VIN by ID:', error);
            return null;
        }
    }, []);

    // Reset hook state
    const resetHook = useCallback(() => {
        setVinOptions([]);
        setInputValue('');
        setPagination({ page: 1, hasMore: true, loading: false });
    }, []);

    // Computed values
    const isInitialLoading = useMemo(() => 
        vinOptions.length === 0 && pagination.loading, 
        [vinOptions.length, pagination.loading]
    );

    const hasData = useMemo(() => 
        vinOptions.length > 0, 
        [vinOptions.length]
    );

    return {
        // State
        vinOptions,
        pagination,
        inputValue,
        
        // Computed
        isInitialLoading,
        hasData,
        
        // Actions
        handleInputChange,
        handleMenuScrollToBottom,
        initializeOptions,
        getVinById,
        resetHook,
        
        // Utils (expose if needed for advanced usage)
        loadVinOptions
    };
};
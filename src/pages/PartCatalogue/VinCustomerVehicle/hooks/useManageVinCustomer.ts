import { useState, useCallback, useEffect, useRef } from 'react';
import { VinCustomerListItem, VinCustomerListPagination, VinCustomerListRequest } from '../types/vinCustomerVehicle';
import { VinCustomerVehicleService } from '../services/vinCustomerVehicleService';
import toast from 'react-hot-toast';

interface FilterState {
    search: string;
    sort_by: string;
    sort_order: 'asc' | 'desc'
}

export const useManageVinCustomer = () => {
    // State - data from API
    const [vinCustomers, setVinCustomers] = useState<VinCustomerListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchInput, setSearchInput] = useState<string>('');

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        sort_by: 'updated_at',
        sort_order: 'desc'
    });
    
    const [pagination, setPagination] = useState<VinCustomerListPagination>({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    // Refs to hold current values
    const filtersRef = useRef(filters);
    const paginationRef = useRef(pagination);
    
    // Update refs when state changes
    useEffect(() => { filtersRef.current = filters; }, [filters]);
    useEffect(() => { paginationRef.current = pagination; }, [pagination]);

    // Fetch data from API
    const fetchVinCustomers = useCallback(async (params: Partial<VinCustomerListRequest> = {}) => {
        try {
            setLoading(true);
            setError(null);

            const currentFilters = filtersRef.current;
            const currentPagination = paginationRef.current;
            
            const requestParams: VinCustomerListRequest = {
                page: params?.page ?? currentPagination.page,
                limit: params?.limit ?? currentPagination.limit,
                sort_order: params?.sort_order ?? currentFilters.sort_order ?? 'desc',
                sort_by: params?.sort_by ?? currentFilters.sort_by ?? 'updated_at',
                search: params?.search !== undefined ? params.search : currentFilters.search,
            };

            const response = await VinCustomerVehicleService.getVinCustomerList(requestParams);

            if (response?.success) {
                setVinCustomers(response.data?.items || []);
                setPagination(response.data?.pagination);
            } else {
                throw new Error(response?.message || 'Gagal mengambil data');
            }
        } catch (err: any) {
            console.error('Error fetching VIN Customers:', err);
            setError(err.message || 'Gagal mengambil data');
            toast.error('Gagal mengambil data VIN Customer');
            setVinCustomers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchVinCustomers();
    }, []);

    // Refresh data
    const refreshData = useCallback(async () => {
        await fetchVinCustomers();
    }, [fetchVinCustomers]);

    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
        fetchVinCustomers({ page });
    }, [fetchVinCustomers]);

    // Handle limit change
    const handleLimitChange = useCallback((limit: number) => {
        setPagination(prev => ({ ...prev, limit, page: 1 }));
        fetchVinCustomers({ limit, page: 1 });
    }, [fetchVinCustomers]);

    // Handle manual search
    const handleManualSearch = useCallback(() => {
        setFilters(prev => ({ ...prev, search: searchInput }));
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchVinCustomers({ search: searchInput, page: 1 });
    }, [searchInput, fetchVinCustomers]);

    // Handle sort
    const handleSort = useCallback((column: string, direction: 'asc' | 'desc') => {
        setFilters(prev => ({ 
            ...prev, 
            sort_by: column, 
            sort_order: direction
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchVinCustomers({ sort_by: column, sort_order: direction, page: 1 });
    }, [fetchVinCustomers]);

    // Clear search
    const clearSearch = useCallback(() => {
        setSearchInput('');
        setFilters(prev => ({ ...prev, search: '' }));
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchVinCustomers({ search: '', page: 1 });
    }, [fetchVinCustomers]);

    // Computed values
    const hasData = vinCustomers.length > 0;
    const isEmpty = !loading && vinCustomers.length === 0;

    return {
        vinCustomers,
        loading,
        error,
        pagination,
        filters,
        searchInput,
        setSearchInput,
        refreshData,
        handlePageChange,
        handleLimitChange,
        handleManualSearch,
        handleSort,
        clearSearch,
        hasData,
        isEmpty
    };
}
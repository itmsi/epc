import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { TransactionRequest, TransactionOrder, Pagination } from '../types/transaction';
import { TransactionService } from '../services/transactionService';

interface UseTransactionProps {
    initialPage?: number;
    initialLimit?: number;
}

interface UseTransactionReturn {
    // Data state
    transactions: TransactionOrder[];
    loading: boolean;
    error: string | null;
    pagination: Pagination;
    
    // Filter state
    filters: TransactionRequest;
    setFilters: React.Dispatch<React.SetStateAction<TransactionRequest>>;
    
    // Actions
    fetchTransactions: () => Promise<void>;
    handlePageChange: (page: number) => void;
    handleLimitChange: (limit: number) => void;
    handleSearch: (search: string) => void;
    handleSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
    
    // Computed states
    hasData: boolean;
    isEmpty: boolean;
    isFirstPage: boolean;
    isLastPage: boolean;
}

export function useTransaction(props: UseTransactionProps = {}): UseTransactionReturn {
    const { 
        initialPage = 1, 
        initialLimit = 10 
    } = props;
    
    // State untuk data transactions
    const [transactions, setTransactions] = useState<TransactionOrder[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    
    // State untuk pagination
    const [pagination, setPagination] = useState<Pagination>({
        page: initialPage,
        limit: initialLimit,
        total: 0,
        totalPages: 0
    });
    
    // State untuk filters
    const [filters, setFilters] = useState<TransactionRequest>({
        page: initialPage,
        limit: initialLimit,
        search: '',
        sort_by: 'created_at',
        sort_order: 'desc'
    });
    
    // Fetch transactions data
    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await TransactionService.getTransactionItems(filters);
            
            if (response.data.success) {
                setTransactions(response.data.data.items);
                setPagination(response.data.data.pagination);
            } else {
                setError('Gagal memuat data transaksi');
                toast.error('Gagal memuat data transaksi');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat data';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [filters]);
    
    // Handle page change
    const handlePageChange = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }));
    }, []);
    
    // Handle limit change
    const handleLimitChange = useCallback((limit: number) => {
        setFilters(prev => ({ ...prev, limit, page: 1 }));
    }, []);
    
    // Handle search
    const handleSearch = useCallback((search: string) => {
        setFilters(prev => ({ ...prev, search, page: 1 }));
    }, []);
    
    // Handle sort
    const handleSort = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
        setFilters(prev => ({ ...prev, sort_by: sortBy, sort_order: sortOrder }));
    }, []);
    
    // Computed states
    const hasData = transactions.length > 0;
    const isEmpty = !loading && transactions.length === 0;
    const isFirstPage = pagination.page === 1;
    const isLastPage = pagination.page >= pagination.totalPages;
    
    // Effect untuk fetch data ketika filters berubah
    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);
    
    return {
        // Data state
        transactions,
        loading,
        error,
        pagination,
        
        // Filter state
        filters,
        setFilters,
        
        // Actions
        fetchTransactions,
        handlePageChange,
        handleLimitChange,
        handleSearch,
        handleSort,
        
        // Computed states
        hasData,
        isEmpty,
        isFirstPage,
        isLastPage
    };
}
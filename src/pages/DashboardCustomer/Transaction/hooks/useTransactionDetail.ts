import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { TransactionOrderDetail } from '../types/transaction';
import { TransactionService } from '../services/transactionService';

interface UseTransactionDetailReturn {
    // Data state
    transactionDetail: TransactionOrderDetail | null;
    loading: boolean;
    error: string | null;
    
    // Actions
    fetchTransactionDetail: (transactionOrderID: string) => Promise<void>;
    resetDetail: () => void;
    
    // Computed states
    hasData: boolean;
}

export function useTransactionDetail(): UseTransactionDetailReturn {
    // State untuk data transaction detail
    const [transactionDetail, setTransactionDetail] = useState<TransactionOrderDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    // Fetch transaction detail
    const fetchTransactionDetail = useCallback(async (transactionOrderID: string) => {
        if (!transactionOrderID) {
            setError('Transaction order ID diperlukan');
            return;
        }
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await TransactionService.getDetailTransactionItems(transactionOrderID);
            
            if (response.success) {
                setTransactionDetail(response.data);
            } else {
                const errorMsg = 'Gagal memuat detail transaksi';
                setError(errorMsg);
                toast.error(errorMsg);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan saat memuat detail transaksi';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);
    
    // Reset detail data
    const resetDetail = useCallback(() => {
        setTransactionDetail(null);
        setError(null);
        setLoading(false);
    }, []);
    
    // Computed states
    const hasData = transactionDetail !== null;
    
    return {
        // Data state
        transactionDetail,
        loading,
        error,
        
        // Actions
        fetchTransactionDetail,
        resetDetail,
        
        // Computed states
        hasData,
    };
}
import { useState, useCallback } from 'react';
import { fetchSubTypeOptions } from '@/services/asyncSelectService';

interface Option {
    value: string | number;
    label: string;
}

interface UseAsyncSelectReturn {
    data: Option[];
    loading: boolean;
    fetchMore: () => Promise<void>;
    refetch: (search: string) => Promise<Option[]>;
    selectInputValue: string;
    setSelectInputValue: (value: string) => void;
    hasMore: boolean;
}

interface UseAsyncSelectProps {
    partType: string;
    partId: string;
    pageSize?: number;
}

export const useAsyncSelect = ({
    partType,
    partId,
    pageSize = 20
}: UseAsyncSelectProps): UseAsyncSelectReturn => {
    const [data, setData] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectInputValue, setSelectInputValue] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch more data for pagination
    const fetchMore = useCallback(async () => {
        if (!hasMore || loading) return;

        setLoading(true);
        try {
            const result = await fetchSubTypeOptions(
                partType,
                partId,
                selectInputValue,
                currentPage + 1,
                pageSize
            );

            setData(prev => [...prev, ...result.items]);
            setCurrentPage(prev => prev + 1);
            setHasMore(result.hasNextPage);
        } catch (error) {
            console.error('Error fetching more options:', error);
        } finally {
            setLoading(false);
        }
    }, [partType, partId, selectInputValue, currentPage, pageSize, hasMore, loading]);

    // Refetch data with search
    const refetch = useCallback(async (search: string) => {
        setLoading(true);
        try {
            const result = await fetchSubTypeOptions(
                partType,
                partId,
                search,
                1,
                pageSize
            );

            setData(result.items);
            setCurrentPage(1);
            setHasMore(result.hasNextPage);
            return result.items;
        } catch (error) {
            console.error('Error refetching options:', error);
            return [];
        } finally {
            setLoading(false);
        }
    }, [partType, partId, pageSize]);

    return {
        data,
        loading,
        fetchMore,
        refetch,
        selectInputValue,
        setSelectInputValue,
        hasMore
    };
};
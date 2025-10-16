import { useState, useCallback, useMemo, useEffect } from 'react';

interface Option {
    value: string | number;
    label: string;
}

interface PaginationConfig {
    pageSize?: number;
    initialPage?: number;
    enableServerPagination?: boolean;
    fetchOptions?: (page: number, pageSize: number) => Promise<{
        items: Option[];
        hasNextPage: boolean;
        totalItems: number;
    }>;
}

interface UsePaginatedOptionsProps {
    allOptions?: Option[]; // Optional untuk client-side pagination
    config?: PaginationConfig;
}

interface UsePaginatedOptionsReturn {
    displayedOptions: Option[];
    hasMore: boolean;
    isLoading: boolean;
    loadMore: () => Promise<void>;
    reset: () => void;
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

export const usePaginatedOptions = ({
    allOptions = [],
    config = {}
}: UsePaginatedOptionsProps): UsePaginatedOptionsReturn => {
    const { 
        pageSize = 50, 
        initialPage = 1, 
        enableServerPagination = false,
        fetchOptions 
    } = config;
    
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [isLoading, setIsLoading] = useState(false);
    const [displayedOptions, setDisplayedOptions] = useState<Option[]>([]);
    const [hasMore, setHasMore] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    // Client-side pagination calculation
    const clientTotalPages = Math.ceil(allOptions.length / pageSize);
    const clientDisplayedOptions = useMemo(() => {
        return allOptions.slice(0, currentPage * pageSize);
    }, [allOptions, currentPage, pageSize]);
    const clientHasMore = currentPage < clientTotalPages;

    // Server-side pagination
    const loadMoreOptions = useCallback(async () => {
        if (isLoading || !hasMore) return;
        
        setIsLoading(true);
        try {
            if (enableServerPagination && fetchOptions) {
                const data = await fetchOptions(currentPage, pageSize);
                setDisplayedOptions((prevOptions) => [...prevOptions, ...data.items]);
                setCurrentPage((prevPage) => prevPage + 1);
                setHasMore(data.hasNextPage);
                setTotalItems(data.totalItems);
            }
        } catch (error) {
            console.error("Failed to load options:", error);
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, isLoading, hasMore, enableServerPagination, fetchOptions, pageSize]);

    // Client-side load more
    const loadMoreClientOptions = useCallback(async () => {
        if (clientHasMore && !isLoading) {
            setIsLoading(true);
            
            // Simulate API delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300));
            
            setCurrentPage(prev => prev + 1);
            setIsLoading(false);
        }
    }, [clientHasMore, isLoading]);

    // Reset function
    const reset = useCallback(() => {
        setCurrentPage(initialPage);
        setIsLoading(false);
        if (enableServerPagination) {
            setDisplayedOptions([]);
            setHasMore(true);
            setTotalItems(0);
        }
    }, [initialPage, enableServerPagination]);

    // Load initial data untuk server pagination
    useEffect(() => {
        if (enableServerPagination && fetchOptions) {
            loadMoreOptions();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update client-side state when allOptions changes
    useEffect(() => {
        if (!enableServerPagination) {
            setTotalItems(allOptions.length);
            setHasMore(clientHasMore);
        }
    }, [allOptions.length, clientHasMore, enableServerPagination]);

    const finalDisplayedOptions = enableServerPagination ? displayedOptions : clientDisplayedOptions;
    const finalHasMore = enableServerPagination ? hasMore : clientHasMore;
    const finalTotalPages = enableServerPagination 
        ? Math.ceil(totalItems / pageSize) 
        : clientTotalPages;
    const loadMore = enableServerPagination ? loadMoreOptions : loadMoreClientOptions;

    return {
        displayedOptions: finalDisplayedOptions,
        hasMore: finalHasMore,
        isLoading,
        loadMore,
        reset,
        currentPage,
        totalPages: finalTotalPages,
        totalItems: enableServerPagination ? totalItems : allOptions.length
    };
};
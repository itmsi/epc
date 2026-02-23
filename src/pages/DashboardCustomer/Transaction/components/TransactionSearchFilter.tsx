import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import React, { useState, useCallback } from 'react';
import { MdClear, MdSearch } from 'react-icons/md';

interface TransactionSearchFilterProps {
    onSearch: (searchTerm: string) => void;
    onSortOrderChange?: (sortOrder: 'asc' | 'desc') => void;
    loading: boolean;
    placeholder?: string;
    initialSortOrder?: 'asc' | 'desc';
}

const TransactionSearchFilter: React.FC<TransactionSearchFilterProps> = ({
    onSearch,
    onSortOrderChange,
    initialSortOrder = 'desc'
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Debounce search - trigger after user stops typing for 300ms
        // const timeoutId = setTimeout(() => {
        //     onSearch(value);
        // }, 300);

        // Clear previous timeout
        // return () => clearTimeout(timeoutId);
    }, [onSearch]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchTerm);
    }, [searchTerm, onSearch]);

    const clearSearch = useCallback(() => {
        setSearchTerm('');
        onSearch('');
    }, [onSearch]);

    const handleFilterChange = useCallback((key: string, value: string) => {
        if (key === 'sort_order' && (value === 'asc' || value === 'desc')) {
            setSortOrder(value);
            onSortOrderChange?.(value);
        }
    }, [onSortOrderChange]);

    return (
        <>
        <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                {/* Search Input */}
                <div className="flex-1">
                    <div className="relative flex">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                type="text"
                                placeholder="Cari transaksi..."
                                value={searchTerm}
                                onChange={(e) => handleInputChange(e)}
                                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                className={`pl-10 py-2 w-full `}
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    type="button"
                                >
                                    <MdClear className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sort Order */}
                <div className="flex items-center gap-2">
                    <CustomSelect
                        id="sort_order"
                        name="sort_order"
                        value={sortOrder ? { 
                            value: sortOrder, 
                            label: sortOrder === 'asc' ? 'Ascending' : 'Descending' 
                        } : null}
                        onChange={(selectedOption) => 
                            handleFilterChange('sort_order', selectedOption?.value || '')
                        }
                        options={[
                            { value: 'asc', label: 'Ascending' },
                            { value: 'desc', label: 'Descending' }
                        ]}
                        placeholder="Order by"
                        isClearable={false}
                        isSearchable={false}
                        className="w-70"
                    />
                </div>
            </div>
        </div>
    </>);
};

export default TransactionSearchFilter;
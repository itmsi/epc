import CustomSelect from '@/components/form/select/CustomSelect';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import { useState, useCallback } from 'react';
import { MdSearch, MdClear } from 'react-icons/md';

interface SearchFormProps {
  onSearch: (query: string) => void;
  onSortChange?: (sortOrder: 'asc' | 'desc') => void;
  placeholder?: string;
  sortOrder?: 'asc' | 'desc';
  loading?: boolean;
  className?: string;
}

const SearchForm: React.FC<SearchFormProps> = ({
  onSearch,
  onSortChange,
  placeholder = 'Search catalogs...',
  sortOrder,
  loading = false,
  className = '',
}) => {
  const [searchValue, setSearchValue] = useState('');

  // Handle search saat tekan enter atau klik button
  const handleSearch = useCallback(() => {
    onSearch(searchValue);
  }, [onSearch, searchValue]);

  // Handle perubahan input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle clear search
  const handleClear = () => {
    setSearchValue('');
    onSearch('');
  };

  // Handle enter key
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative flex">
            <div className="relative flex-1">
              <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={20} />
              <Input
                type="text"
                placeholder={placeholder}
                value={searchValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className={`pl-10 py-2 w-full rounded-r-none ${searchValue ? 'pr-10' : 'pr-4'}`}
              />
              {searchValue && (
                <button
                  onClick={handleClear}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 z-10"
                  type="button"
                >
                  <MdClear className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading}
              className="rounded-l-none px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300 border-l-0"
              size="sm"
            >
              <MdSearch className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Sort Order Filter */}
        {onSortChange && (
          <div className="flex items-center gap-2">
            <CustomSelect
              id="sort_order"
              name="sort_order"
              value={sortOrder ? {
                value: sortOrder,
                label: sortOrder === 'asc' ? 'Ascending' : 'Descending'
              } : null}
              onChange={(selected) => {
                if (selected?.value) {
                  onSortChange(selected.value as 'asc' | 'desc');
                }
              }}
              options={[
                { value: 'asc', label: 'Ascending' },
                { value: 'desc', label: 'Descending' }
              ]}
              placeholder="Order by"
              isClearable={false}
              isSearchable={false}
              className="w-40"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchForm;

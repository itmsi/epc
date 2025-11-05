import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableColumn } from 'react-data-table-component';
import { MdAdd, MdSearch, MdClear } from 'react-icons/md';

// Components
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomDataTable from '@/components/ui/table/CustomDataTable';

// Types and hooks
import { CatalogDocumentItem } from '@/types/asyncSelect';
import { useManageCatalogs } from '@/hooks/useManageCatalogs';
import { PermissionGate } from '@/components/common/PermissionComponents';

export default function ManageCatalogs() {
    const navigate = useNavigate();
    const handleCreate = () => {
        navigate('/epc/manage/create');
    };
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');

    // Use the manage catalogs hook
    const {
        catalogs,
        loading,
        error,
        pagination,
        filters,
        handlePageChange,
        handleLimitChange,
        handleSearch,
        handleFilterChange,
        clearFilters,
        refreshCatalogs
    } = useManageCatalogs({
        initialLimit: 10
    });

    // Handle search input change (no debounce, just update local state)
    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    // Handle manual search (when user presses Enter or clicks search button)
    const handleManualSearch = () => {
        handleSearch(searchTerm);
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setSearchTerm('');
        clearFilters();
    };

    // Handle row actions
    const handleView = (catalog: CatalogDocumentItem) => {
        // TODO: Implement view details
        navigate(`/epc/manage/view/${catalog.dokumen_id}`);
    };

    // Define table columns
    const columns: TableColumn<CatalogDocumentItem>[] = useMemo(() => [
        {
            name: 'Document Name',
            selector: (row: CatalogDocumentItem) => row.dokumen_name,
            cell: (row: CatalogDocumentItem) => (
                <div className="py-2">
                    <div className="font-medium text-gray-900">{row.dokumen_name}</div>
                </div>
            ),
            wrap: true,
        },
        {
            name: 'Category',
            selector: (row: CatalogDocumentItem) => row.master_category_name_en,
            cell: (row: CatalogDocumentItem) => (
                <div className="py-2">
                    <div className="font-medium text-gray-900">{row.master_category_name_en}</div>
                    <div className="text-xs text-gray-400">{row.master_category_name_cn}</div>
                </div>
            ),
            wrap: true,
        }
    ], []);

    // Search and filter component
    const SearchAndFilters = useMemo(() => (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <Input
                            type="text"
                            placeholder="Search catalogs..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleManualSearch();
                                }
                            }}
                            className={`pl-10 py-2 w-full rounded-r-none ${filters.search ? 'pr-10' : 'pr-4'}`}
                        />
                        {filters.search && (
                            <button
                                onClick={handleClearFilters}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                type="button"
                            >
                                <MdClear className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <Button
                        onClick={handleManualSearch}
                        className="rounded-l-none px-4 py-2 bg-transparent hover:bg-gray-300 text-gray-700 border border-gray-300 border-l-0"
                        size="sm"
                    >
                        <MdSearch className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Note: Part type filter removed as the new API response uses master categories */}
            
            {/* Sort Order */}
            <div className="flex items-center gap-2">
                <CustomSelect
                    id="sort_order"
                    name="sort_order"
                    value={filters.sort_order ? { 
                        value: filters.sort_order, 
                        label: filters.sort_order === 'asc' ? 'Ascending' : 'Descending' 
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
    ), [searchTerm, loading]);
    
    const controlHeight = 1.75; // Adjust based on actual control height
    return (
        <>
            <PageMeta
                title="Manage Catalogs | MSI"
                description="Manage and view all part catalogs"
                image="/motor-sights-international.png"
            />

            <div className="bg-white shadow rounded-lg">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">Manage Catalogs</h3>
                            <p className="mt-1 text-sm text-gray-500">Create, edit, and manage your part catalogs</p>
                        </div>
                        
                        <PermissionGate permission="create">
                            <Button
                                onClick={handleCreate}
                                className="rounded-md w-full md:w-50 font-secondary font-medium flex items-center justify-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="h-4 w-4" />
                                Create New Catalog
                            </Button>
                        </PermissionGate>
                    </div>
                </div>
                {/* Filter Section */}
                <div className="px-6 py-4 border-b border-gray-200">
                    {SearchAndFilters}
                </div>
                <div className="p-6 font-secondary">
                    {/* Search and Filters */}

                    {/* Error State */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center">
                                <div className="text-red-600 font-medium">Error loading catalogs</div>
                            </div>
                            <div className="text-red-500 text-sm mt-1">{error}</div>
                            <Button
                                variant="outline"
                                onClick={refreshCatalogs}
                                className="mt-3 text-red-600 border-red-200 hover:bg-red-50"
                                size="sm"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}
                    <CustomDataTable
                        columns={columns}
                        data={catalogs}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.limit || 10}
                        paginationDefaultPage={pagination?.page || 1}
                        paginationRowsPerPageOptions={[10, 25, 50, 100]}
                        onChangePage={(page) => {
                            handlePageChange(page);
                        }}
                        onChangeRowsPerPage={(currentRowsPerPage) => {
                            handleLimitChange(currentRowsPerPage);
                        }}
                        responsive
                        highlightOnHover
                        striped={false}
                        persistTableHead
                        borderRadius="8px"
                        fixedHeader={true}
                        fixedHeaderScrollHeight={`calc(100vh/${controlHeight})`}
                        onRowClicked={handleView}
                    />
                </div>
            </div>
        </>
    );
}

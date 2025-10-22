import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdSearch, MdClear } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import CustomDataTable from "@/components/ui/table";
import CustomSelect from '@/components/form/select/CustomSelect';
import PageMeta from '@/components/common/PageMeta';
import { useManageVins } from '@/hooks/useManageVins';
import { Vin } from '@/types/partCatalogue';
import Input from '@/components/form/input/InputField';

export default function ManageVins() {
    const navigate = useNavigate();
    
    // Use the manage vins hook
    const {
        vins,
        loading,
        error,
        pagination,
        filters,
        searchInput,
        setSearchInput,
        handlePageChange,
        handleLimitChange,
        handleManualSearch,
        handleSort,
        refreshVins
    } = useManageVins();

    // Handle row actions
    const handleView = (row: Vin) => {
        navigate(`/epc/vins/view/${row.production_id}`);
    };

    const handleCreate = () => {
        navigate('/epc/vins/create');
    };

    // Clear search function
    const clearSearch = () => {
        setSearchInput('');
    };

    // Table columns definition
    const columns = useMemo(() => [
        {
            name: 'VIN Number',
            selector: (row: Vin) => row.vin_number,
            sortable: true,
            minWidth: '150px',
            cell: (row: Vin) => (
                <div className="font-medium text-gray-900">
                    {row.vin_number}
                </div>
            )
        },
        {
            name: 'Production Name',
            selector: (row: Vin) => row.production_name_en,
            sortable: true,
            minWidth: '200px',
            cell: (row: Vin) => (
                <div>
                    <div className="font-medium text-gray-900">
                        {row.production_name_en}
                    </div>
                    <div className="text-sm text-gray-500">
                        {row.production_name_cn}
                    </div>
                </div>
            )
        },
        {
            name: 'Description',
            selector: (row: Vin) => row.production_description || '',
            sortable: false,
            minWidth: '250px',
            cell: (row: Vin) => (
                <div className="text-sm text-gray-600">
                    {row.production_description || '-'}
                </div>
            )
        }
    ], []);

    // Search and filter component
    const SearchAndFilters = useMemo(() => (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search Input */}
            <div className="flex-1">
                <div className="relative flex">
                    <div className="relative flex-1">
                        <Input
                            type="text"
                            placeholder="Search VINs..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleManualSearch();
                                }
                            }}
                            className={`pl-10 py-2 w-full rounded-r-none ${searchInput ? 'pr-10' : 'pr-4'}`}
                        />
                        {searchInput && (
                            <button
                                onClick={clearSearch}
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
                        handleSort(selectedOption?.value as 'asc' | 'desc' || 'desc')
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
    ), [searchInput, filters.sort_order, loading]);
    
    return (
        <>
            <PageMeta
                title="Manage VINs | MSI"
                description="Manage and view all VIN production data"
                image="/motor-sights-international.png"
            />

            <div className="bg-white shadow rounded-lg">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900">Manage VINs</h1>
                            <p className="mt-1 text-sm text-gray-600">
                                Manage vehicle identification numbers and production data
                            </p>
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleCreate}
                            className="flex items-center gap-2"
                        >
                            <MdAdd className="w-4 h-4" />
                            Add New VIN
                        </Button>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-6 py-4 border-b border-gray-200">
                    {SearchAndFilters}
                </div>

                <div className="p-6 font-secondary">
                    {/* Error message */}
                    {error && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-center">
                                <div className="text-red-800">
                                    <strong>Error:</strong> {error}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={refreshVins}
                                    className="ml-auto"
                                >
                                    Retry
                                </Button>
                            </div>
                        </div>
                    )}

                    <CustomDataTable
                        columns={columns}
                        data={vins}
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
                        fixedHeaderScrollHeight="calc(100vh - 300px)"
                        onRowClicked={handleView}
                    />
                </div>
            </div>
        </>
    );
}
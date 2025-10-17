import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { TableColumn } from 'react-data-table-component';
import { MdAdd, MdSearch, MdClear, MdEdit, MdVisibility, MdDeleteOutline } from 'react-icons/md';

// Components
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import Badge from '@/components/ui/badge/Badge';

// Types and hooks
import { CatalogItem } from '@/types/asyncSelect';
import { useManageCatalogs } from '@/hooks/useManageCatalogs';
import { PART_TYPES } from '@/types/asyncSelect';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { createActionsColumn } from '@/components/ui/table';

// Utility functions
const getPartTypeLabel = (partType: string) => {
    const found = PART_TYPES.find(pt => pt.value === partType);
    return found ? found.label : partType;
};

const getMasterCatalogBadgeColor = (masterCatalog: string): 'primary' | 'success' | 'warning' | 'error' | 'info' | 'light' | 'dark' => {
    switch (masterCatalog) {
        case 'cabin': return 'primary';
        case 'engine': return 'error';
        case 'transmission': return 'warning';
        case 'axle': return 'success';
        case 'steering': return 'info';
        default: return 'light';
    }
};

export default function ManageCatalogs() {
    const navigate = useNavigate();
    const handleCreate = () => {
        navigate('/epc/manage/create');
    };
    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMasterCatalog, setSelectedMasterCatalog] = useState('');

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

    // Handle master catalog filter change
    const handleMasterCatalogChange = (selectedOption: { value: string; label: string } | null) => {
        const value = selectedOption?.value || '';
        setSelectedMasterCatalog(value);
        handleFilterChange('master_catalog', value);
    };

    // Handle clear filters
    const handleClearFilters = () => {
        setSearchTerm('');
        setSelectedMasterCatalog('');
        clearFilters();
    };

    // Handle row actions
    const handleView = (catalog: CatalogItem) => {
        // TODO: Implement view details
        console.log('View catalog:', catalog);
    };

    const handleEdit = (catalog: CatalogItem) => {
        // Navigate to edit page with catalog ID
        navigate(`/epc/manage/edit/${catalog.master_pdf_id}`);
    };

    const handleDelete = (catalog: CatalogItem) => {
        // TODO: Implement delete catalog
        console.log('Delete catalog:', catalog);
    };

    // Define table columns
    const columns: TableColumn<CatalogItem>[] = useMemo(() => [
        // {
        //     name: 'Code Cabin',
        //     selector: (row: CatalogItem) => row.name_pdf,
        //     cell: (row: CatalogItem) => (
        //         <div className="py-2">
        //             <div className="font-medium text-gray-900">{row.name_pdf}</div>
        //         </div>
        //     ),
        //     wrap: true,
        // },
        {
            name: 'Type',
            selector: (row: CatalogItem) => row.master_catalog,
            cell: (row: CatalogItem) => (
                <Badge
                    color={getMasterCatalogBadgeColor(row.master_catalog)}
                    variant="light"
                    size="sm"
                >
                    {getPartTypeLabel(row.master_catalog)}
                </Badge>
            ),
        },
        {
            name: 'Part Number',
            selector: (row: CatalogItem) => row.category_name_en,
            cell: (row: CatalogItem) => (
                <div className="py-2">
                    <div className="font-medium text-gray-900">{row.part_number}</div>
                </div>
            ),
            wrap: true,
        },
        {
            name: 'Name',
            selector: (row: CatalogItem) => row.category_name_en,
            cell: (row: CatalogItem) => (
                <div className="py-2">
                    <div className="font-medium text-gray-500">
                        {row.category_name_en}
                        {row.category_name_cn && (
                            <span className="block text-xs text-gray-400">{row.category_name_cn}</span>
                        )}
                    </div>
                </div>
            ),
            wrap: true,
        },
        {
            name: 'Quantity',
            selector: (row: CatalogItem) => row.quantity,
            cell: (row: CatalogItem) => (
                <div className="py-2">
                    <div className="font-medium text-gray-900">{row.quantity}</div>
                </div>
            ),
            sortable: true,
            wrap: true,
            width: '180px'
        },
        createActionsColumn([
            {
                icon: MdVisibility,
                onClick: (row) => handleView(row),
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Read',
                permission: 'update'
            },
            {
                icon: MdEdit,
                onClick: (row) => handleEdit(row),
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: (row) => handleDelete(row),
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ], []);

    // Search and filter component
    const SearchAndFilters = useMemo(() => (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Input */}
                {/* <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <Input
                        type="text"
                        placeholder="Search catalogs..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="pl-10"
                    />
                </div> */}

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

                {/* Master Catalog Filter */}
                <div>
                    <CustomSelect
                        placeholder="Filter by Type"
                        value={selectedMasterCatalog ? PART_TYPES.find(pt => pt.value === selectedMasterCatalog) : null}
                        onChange={handleMasterCatalogChange}
                        options={PART_TYPES}
                    />
                </div>
            </div>
        </div>
    ), [searchTerm, selectedMasterCatalog, loading]);
    
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

                <div className="p-6 font-secondary">
                    {/* Search and Filters */}
                    {SearchAndFilters}

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
                    />
                </div>
            </div>
        </>
    );
}

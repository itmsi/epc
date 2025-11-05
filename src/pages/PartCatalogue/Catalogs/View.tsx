import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { MdOutlineSaveAs, MdEdit, MdCancel, MdKeyboardArrowLeft, MdDelete, MdAdd, MdDeleteOutline, MdClear, MdSearch } from 'react-icons/md';
import { IoIosCopy } from "react-icons/io";
import PageMeta from '@/components/common/PageMeta';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

// Import organized types, hooks, and services
import { 
    CatalogDetailData,
    CatalogDetailItem
} from '@/types/asyncSelect';
import { CatalogManageService } from '@/services/partCatalogueService';
import { useConfirmation } from '@/hooks/useConfirmation';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { TableColumn } from 'react-data-table-component';
import toast from 'react-hot-toast';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { createActionsColumn } from '@/components/ui/table';
import { Tooltip } from '@/components/ui/tooltip';

export default function ViewCatalog() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // State for catalog detail data
    const [catalogData, setCatalogData] = useState<CatalogDetailData | null>(null);
    const [loadingCatalog, setLoadingCatalog] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // State for edit document name
    const [editName, setEditName] = useState(true);
    const [editedDocumentName, setEditedDocumentName] = useState('');
    
    // State for search and sort
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<string>('');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    // Use confirmation hook for delete action
    const { showConfirmation, modalProps } = useConfirmation();
    
    const fetchCatalogData = async (searchParams?: {
        search?: string;
        sort_by?: string;
        sort_order?: 'asc' | 'desc';
        page?: number;
        limit?: number;
    }) => {
        if (!id) return;
        
        try {
            setLoadingCatalog(true);
            setError(null);
            
            let response;
            if (searchParams && (searchParams.search || searchParams.sort_by)) {
                // Use search method when there are search/sort parameters
                response = await CatalogManageService.searchCatalogItems(id, searchParams);
            } else {
                // Use regular method for initial load
                response = await CatalogManageService.getItemsById(id);
            }
            
            if (response.success) {
                setCatalogData(response.data);
            } else {
                setError(response.message || 'Failed to fetch catalog data');
            }
        } catch (error) {
            console.error('Error fetching catalog:', error);
            setError('Failed to load catalog data');
        } finally {
            setLoadingCatalog(false);
        }
    };

    useEffect(() => {
        fetchCatalogData();
    }, [id]);

    // Debounce search term and trigger server search
    // useEffect(() => {
    //     const timer = setTimeout(() => {
    //         setDebouncedSearchTerm(searchTerm);
    //     }, 300);

    //     return () => clearTimeout(timer);
    // }, [searchTerm]);


    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };
    
    const handleManualSearch = useCallback(() => {
         if (searchTerm || sortField) {
            const searchParams = {
                search: searchTerm,
                sort_by: sortField,
                sort_order: sortDirection,
                page: currentPage,
                limit: itemsPerPage
            };
            fetchCatalogData(searchParams);
        } else if (searchTerm === '' && !sortField) {
            // Reload without search when search is cleared
            fetchCatalogData();
        }
    }, [searchTerm, sortField, sortDirection, currentPage, itemsPerPage]);


    // Handle sort column click
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Clear search and sort
    const handleClearSearch = async () => {
        setSearchTerm('');
        setSortField('');
        setSortDirection('asc');
        setCurrentPage(1);
        await fetchCatalogData();
    };

    // Handle delete individual catalog item
    const handleDeleteCategoryItems = useCallback(async (row: CatalogDetailItem) => {
        if (!row.item_category_id) {
            toast.error('Item ID is required');
            return;
        }

        const confirmed = await showConfirmation({
            title: 'Delete Catalog Item',
            message: `Are you sure you want to delete "${row.category_name_en}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await CatalogManageService.deleteItemsCatalog(row.item_category_id);
            
            if (response.data?.success) {
                toast.success('Catalog item deleted successfully!');
                await fetchCatalogData();
            } else {
                toast.error(response.data?.message || 'Failed to delete catalog item');
            }
        } catch (error) {
            console.error('Error deleting catalog item:', error);
            toast.error('Failed to delete catalog item');
        }
    }, [showConfirmation]);


    // Define table columns for items
    const columns: TableColumn<CatalogDetailItem>[] = React.useMemo(() => [
        {
            name: (
                <div 
                    className="flex items-center cursor-pointer hover:text-blue-600 select-none"
                    onClick={() => handleSort('category_name_en')}
                >
                    Part
                    {sortField === 'category_name_en' && (
                        <span className="ml-1 text-blue-600">
                            {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                    )}
                    {sortField !== 'category_name_en' && (
                        <span className="ml-1 text-gray-300">▲▼</span>
                    )}
                </div>
            ),
            selector: (row: CatalogDetailItem) => row.category_name_en || '',
            cell: (row: CatalogDetailItem) => (
                <div className="py-2">
                    <div className="font-medium text-gray-900">{row.category_name_en}</div>
                    <div className="text-xs text-gray-400">{row.category_name_cn}</div>
                </div>
            ),
            wrap: true,
        },
        {
            name: (
                <div 
                    className="flex items-center cursor-pointer hover:text-blue-600 select-none"
                    onClick={() => handleSort('type_category_name_en')}
                >
                    Type
                    {sortField === 'type_category_name_en' && (
                        <span className="ml-1 text-blue-600">
                            {sortDirection === 'asc' ? '▲' : '▼'}
                        </span>
                    )}
                    {sortField !== 'type_category_name_en' && (
                        <span className="ml-1 text-gray-300">▲▼</span>
                    )}
                </div>
            ),
            selector: (row: CatalogDetailItem) => row.type_category_name_en || '',
            cell: (row: CatalogDetailItem) => (
                <div className="py-2">
                    <div className="font-medium text-gray-900">{row.type_category_name_en}</div>
                    <div className="text-xs text-gray-400">{row.type_category_name_cn}</div>
                </div>
            ),
            wrap: true,
        },
        createActionsColumn([
            {
                icon: MdDeleteOutline,
                onClick: handleDeleteCategoryItems,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ], [handleDeleteCategoryItems, sortField, sortDirection, handleSort]);

    const handleView = (row: CatalogDetailItem) => {
        navigate(`/epc/manage/edit/${row.item_category_id}`);
    }

    const handleSaveDocumentName = async () => {
        if (!id) {
            toast.error('Catalog ID is required');
            return;
        }

        if (!editedDocumentName.trim()) {
            toast.error('Document name cannot be empty');
            return;
        }

        try {
            const response = await CatalogManageService.renameCatalog(id, editedDocumentName.trim());
            
            if (response.data?.success) {
                toast.success('Document name updated successfully!');
                // Update local state
                setCatalogData(prev => prev ? {
                    ...prev,
                    dokumen_name: editedDocumentName.trim()
                } : null);
                // Reset edit mode
                setEditName(true);
                setEditedDocumentName('');
            } else {
                toast.error(response.data?.message || 'Failed to update document name');
            }
        } catch (error) {
            console.error('Error updating document name:', error);
            toast.error('Failed to update document name');
        }
    };
    
    // Handle Duplicate catalog
    const handleDuplicate = async () => {
        if (!id) {
            toast.error('Catalog ID is required');
            return;
        }

        if (!catalogData?.dokumen_name) {
            toast.error('Catalog data not available');
            return;
        }

        const confirmed = await showConfirmation({
            title: 'Duplicate Catalog',
            message: `Are you sure you want to duplicate "${catalogData.dokumen_name}"?`,
            confirmText: 'Duplicate',
            cancelText: 'Cancel',
            type: 'info'
        });

        if (!confirmed) return;

        try {
            const response = await CatalogManageService.duplicateCatalog(id);
            
            if (response.data?.success) {
                toast.success('Catalog duplicated successfully!');
                // Navigate back to manage page or refresh current data
                navigate('/epc/manage');
            } else {
                toast.error(response.data?.message || 'Failed to duplicate catalog');
            }
        } catch (error) {
            console.error('Error duplicating catalog:', error);
            toast.error('Failed to duplicate catalog');
        }
    };

    // Handle delete catalog
    const handleDelete = useCallback(async () => {
        if (!id) {
            toast.error('Catalog ID is required');
            return;
        }

        const confirmed = await showConfirmation({
            title: 'Delete Catalog',
            message: 'Are you sure you want to delete this catalog? This action cannot be undone.',
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await CatalogManageService.deleteCatalog(id);
            
            if (response.data?.success) {
                toast.success('Catalog deleted successfully!');
                navigate('/epc/manage');
            } else {
                toast.error(response.data?.message || 'Failed to delete catalog');
            }
        } catch (error) {
            console.error('Error deleting catalog:', error);
            toast.error('Failed to delete catalog');
        }
    }, [id, navigate, showConfirmation]);

    // Handle edit document name
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditedDocumentName(e.target.value);
    };

    const handleEditDocumentName = () => {
        setEditName(false);
        setEditedDocumentName(catalogData?.dokumen_name || '');
    };

    const handleCancelEdit = () => {
        setEditName(true);
        setEditedDocumentName('');
    };

    // Show loading screen while fetching catalog data
    if (loadingCatalog) {
        return (
            <>
                <PageMeta
                    title="View Catalog"
                    description="View catalog for part catalogue"
                    image=""
                />
                <div className="bg-gray-50 overflow-auto">
                    <div className="mx-auto p-4 sm:px-3">
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading catalog data...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show error if there's an error
    if (error) {
        return (
            <>
                <PageMeta
                    title="View Catalog"
                    description="View catalog for part catalogue"
                    image=""
                />
                <div className="bg-gray-50 overflow-auto">
                    <div className="mx-auto p-4 sm:px-3">
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="text-red-600 text-lg font-medium mb-4">Error loading catalog</div>
                            <div className="text-red-500 text-sm mb-4">{error}</div>
                            <div className="flex gap-4">
                                <Button
                                    variant="outline"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </Button>
                                <Link to="/epc/manage">
                                    <Button variant="outline">
                                        Back to Manage Catalogs
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Show error if catalog not found
    if (!catalogData && !loadingCatalog) {
        return (
            <>
                <PageMeta
                    title="View Catalog"
                    description="View catalog for part catalogue"
                    image=""
                />
                <div className="bg-gray-50 overflow-auto">
                    <div className="mx-auto p-4 sm:px-3">
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="text-red-600 text-lg font-medium mb-4">Catalog not found</div>
                            <Link to="/epc/manage">
                                <Button variant="outline">
                                    Back to Manage Catalogs
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }


    return (
        <>
            <PageMeta
                title="View Catalog"
                description="View catalog for part catalogue"
                image=""
            />
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto p-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/epc/manage">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">
                                View Catalog
                            </h1>
                            
                        </div>
                        <div className='flex gap-3'>
                            <Button
                                variant="outline"
                                className="group rounded-lg w-full flex items-center justify-center gap-2 ring-[#5FAC09] font-secondary py-2 hover:bg-[#5FAC09] hover:text-white"
                                onClick={handleDuplicate}
                            >
                                <IoIosCopy size={20} className="text-[#5FAC09] group-hover:text-white" /> Duplicate
                            </Button>
                            <Button
                                variant="outline"
                                className="group rounded-lg w-full flex items-center justify-center gap-2 ring-[#e7000b] font-secondary py-2 hover:bg-red-600 hover:text-white"
                                onClick={() => handleDelete()}
                            >
                                <MdDelete size={20} className="text-red-600 group-hover:text-white" /> Delete
                            </Button>
                        </div>
                    </div>

                    {/* Catalog Information Section */}
                    <div className="bg-white rounded-2xl shadow-sm mb-6">
                        <div className="p-6">
                            <h2 className="text-xl font-primary-bold font-medium text-gray-900 mb-4">
                                Catalog Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-secondary">
                                <div>
                                    <Label>Document Name</Label>
                                    <div className='relative d-flex'>
                                        <Input
                                            type="text"
                                            value={editName ? (catalogData?.dokumen_name || '') : editedDocumentName}
                                            readonly={editName}
                                            onChange={handleInputChange}
                                            className={`${editName ? 'bg-gray-50' : ''}`}
                                        />
                                        {editName ? 
                                        <div className='absolute right-2 top-1/9'>
                                            <Tooltip content={'Edit'} position="top">
                                                <PermissionGate permission="create">
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-lg font-secondary border-0 ring-0 bg-transparent p-2"
                                                        onClick={handleEditDocumentName}
                                                    >
                                                        <MdEdit size={20} className="text-primary" />
                                                    </Button>
                                                </PermissionGate>
                                            </Tooltip>
                                        </div>
                                        : 
                                        <div className='absolute right-2 top-1/9 grid-cols-2'>
                                            <Tooltip content={'Save'} position="top">
                                                <PermissionGate permission="create">
                                                    <Button
                                                        variant="outline"
                                                        className="rounded-lg font-secondary border-0 ring-0 bg-transparent p-2"
                                                        onClick={handleSaveDocumentName}
                                                    >
                                                        <MdOutlineSaveAs size={20} className="text-primary" />
                                                    </Button>
                                                </PermissionGate>
                                            </Tooltip>

                                            <Tooltip content={'Cancel'} position="top">
                                                <Button
                                                    variant="outline"
                                                    className="rounded-lg font-secondary border-0 ring-0 bg-transparent p-2"
                                                    onClick={handleCancelEdit}
                                                >
                                                    <MdCancel size={20} className="text-[#9B9B9B]" />
                                                </Button>
                                            </Tooltip>
                                        </div>
                                        }

                                    </div>
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <Input
                                        type="text"
                                        value={`${catalogData?.master_category_name_en || ''} ${catalogData?.master_category_name_cn ? `- ${catalogData?.master_category_name_cn}` : ''}`}
                                        readonly={true}
                                        className="bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Items Table Section */}
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-primary-bold font-medium text-gray-900">
                                    Catalog Items
                                </h2>
                                <PermissionGate permission="create">
                                    <Button
                                        variant="primary"
                                        className="flex items-center gap-2 rounded-lg"
                                        onClick={() => navigate(`/epc/manage/${id}/add-items`)}
                                    >
                                        <MdAdd size={20} />
                                        Add Items
                                    </Button>
                                </PermissionGate>
                            </div>
                            
                            {/* Search and Filter Controls */}
                            <div className="pb-4">
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                                    <div className="flex-1">
                                        <div className="relative flex">
                                            <div className="relative flex-1">
                                                <Input
                                                    type="text"
                                                    placeholder="Search by part name or type..."
                                                    value={searchTerm}
                                                    // onChange={handleSearchChange}
                                                    // className="pl-10 pr-10"
                                                    onChange={handleSearchChange}
                                                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleManualSearch();
                                                        }
                                                    }}
                                                    className={`py-2 w-full rounded-r-none`}
                                                />
                                                {searchTerm && (
                                                    <button
                                                        onClick={handleClearSearch}
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
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <CustomDataTable
                                columns={columns}
                                data={catalogData?.items || []}
                                loading={loadingCatalog}
                                pagination={true}
                                paginationServer={false}
                                paginationPerPage={itemsPerPage}
                                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                                onChangeRowsPerPage={(newPerPage) => {
                                    setItemsPerPage(newPerPage);
                                    setCurrentPage(1);
                                }}
                                responsive
                                highlightOnHover
                                striped={false}
                                persistTableHead
                                borderRadius="8px"
                                fixedHeader={true}
                                fixedHeaderScrollHeight={`calc(100vh/1.75)`}
                                noDataComponent={
                                    <div className="text-center py-8 text-gray-500">
                                        {searchTerm ? (
                                            <div>
                                                <p className="mb-2">No items found matching "{searchTerm}"</p>
                                                <button
                                                    onClick={handleClearSearch}
                                                    className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                                                >
                                                    Clear search to see all items
                                                </button>
                                            </div>
                                        ) : (
                                            <p>No items found in this catalog.</p>
                                        )}
                                    </div>
                                }
                                onRowClicked={handleView}
                            />
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-4 pt-6 mt-6">
                        <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => navigate('/epc/manage')}
                            className="px-6 rounded-full"
                        >
                            Back to Manage
                        </Button>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal for Delete */}
            <ConfirmationModal {...modalProps} />
        </>
    );
}
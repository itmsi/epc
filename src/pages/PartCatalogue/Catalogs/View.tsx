import React from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import { MdEdit, MdKeyboardArrowLeft, MdDelete } from 'react-icons/md';
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

export default function ViewCatalog() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // State for catalog detail data
    const [catalogData, setCatalogData] = React.useState<CatalogDetailData | null>(null);
    const [loadingCatalog, setLoadingCatalog] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);
    
    // Use confirmation hook for delete action
    const { showConfirmation, modalProps } = useConfirmation();

    // Fetch catalog data by ID
    React.useEffect(() => {
        const fetchCatalogData = async () => {
            if (!id) return;
            
            try {
                setLoadingCatalog(true);
                setError(null);
                const response = await CatalogManageService.getItemsById(id);
                
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

        fetchCatalogData();
    }, [id]);

    // Define table columns for items
    const columns: TableColumn<CatalogDetailItem>[] = React.useMemo(() => [
        {
            name: 'Part',
            selector: (row: CatalogDetailItem) => row.item_category_id,
            cell: (row: CatalogDetailItem) => (
                <div className="py-2">
                    <div className="font-medium text-gray-900">{row.category_name_en}</div>
                    <div className="text-xs text-gray-400">{row.category_name_cn}</div>
                </div>
            ),
            wrap: true,
        },
        {
            name: 'Type',
            selector: (row: CatalogDetailItem) => row.dokumen_id,
            cell: (row: CatalogDetailItem) => (
                <div className="py-2">
                    <div className="font-medium text-gray-900">{row.type_category_name_en}</div>
                    <div className="text-xs text-gray-400">{row.type_category_name_cn}</div>
                </div>
            ),
            wrap: true,
        }
    ], []);

    // Handle edit mode toggle
    const handleEditToggle = () => {
        // Navigate to edit page instead of toggling edit mode in this view
        navigate(`/epc/manage/edit/${id}`);
    };

    // Handle view item - navigate to item detail or edit
    const handleView = (row: CatalogDetailItem) => {
        // Navigate to edit page with the selected item's category ID
        navigate(`/epc/manage/edit/${row.item_category_id}`);
    };

    // Handle delete catalog
    const handleDelete = React.useCallback(async () => {
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
                                className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary py-2 hover:bg-[#0253a5] hover:text-white"
                                onClick={handleEditToggle}
                            >
                                <MdEdit size={20} className="text-primary group-hover:text-white" /> Edit
                            </Button>
                            <Button
                                variant="outline"
                                className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#e7000b] font-secondary py-2 hover:bg-red-600 hover:text-white"
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
                                    <Input
                                        type="text"
                                        value={catalogData?.dokumen_name || ''}
                                        readonly={true}
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <Label>Master Category (English)</Label>
                                    <Input
                                        type="text"
                                        value={catalogData?.master_category_name_en || ''}
                                        readonly={true}
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <Label>Master Category (Chinese)</Label>
                                    <Input
                                        type="text"
                                        value={catalogData?.master_category_name_cn || ''}
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
                            </div>
                            
                            <CustomDataTable
                                columns={columns}
                                data={catalogData?.items || []}
                                loading={loadingCatalog}
                                pagination={true}
                                paginationServer={false}
                                paginationPerPage={10}
                                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                                responsive
                                highlightOnHover
                                striped={false}
                                persistTableHead
                                borderRadius="8px"
                                fixedHeader={true}
                                fixedHeaderScrollHeight={`calc(100vh/1.75)`}
                                noDataComponent={
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No items found in this catalog.</p>
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
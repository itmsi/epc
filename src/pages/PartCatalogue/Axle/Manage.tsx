import { PermissionGate } from "@/components/common/PermissionComponents";
import Input from "@/components/form/input/InputField";
import CustomSelect from "@/components/form/select/CustomSelect";
import Button from "@/components/ui/button/Button";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import CustomDataTable, { createActionsColumn } from "@/components/ui/table";
import { TableColumn } from "react-data-table-component";
import { MdAdd, MdDeleteOutline, MdEdit, MdSearch, MdClear } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useAxle } from "@/hooks/usePartCatalogue";
import { useConfirmation } from "@/hooks/useConfirmation";
import { Axle } from "@/types/partCatalogue";

export default function Manage() {
    const navigate = useNavigate();
    const {
        axles,
        loading,
        pagination,
        filters,
        handleDeleteAxle,
        handleFilterChange,
        handleSearchChange,
        handleManualSearch,
        clearSearch,
        fetchAxles
    } = useAxle();

    const confirmation = useConfirmation();

    const handleAddAxle = () => {
        navigate('/epc/axle/create');
    };

    const handleEditAxle = (axle: Axle) => {
        navigate(`/epc/axle/edit/${axle.axel_id}`);
    };

    const handleDeleteWithConfirmation = async (axle: Axle) => {
        const confirmed = await confirmation.showConfirmation({
            title: 'Delete Axle',
            message: `Are you sure you want to delete "${axle.axel_name_en}"? This action cannot be undone.`,
            confirmText: 'Delete',
            type: 'danger'
        });

        if (confirmed) {
            await handleDeleteAxle(axle.axel_id);
        }
    };

    const handlePageChange = (page: number) => {
        fetchAxles(page, pagination?.limit || 10);
    };

    const axleColumns: TableColumn<Axle>[] = [
        {
            name: 'Axle Name (EN)',
            selector: row => row.axel_name_en || '-',
        },
        {
            name: 'Axle Name (CN)',
            selector: row => row.axel_name_cn || '-',
        },
        {
            name: 'Description',
            selector: row => row.axel_description || '-',
            width: '550px',
            wrap: true,
        },
        {
            name: 'Type Axels',
            selector: row => row.type_axels?.length || 0,
            center: true,
            cell: (row: Axle) => (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {row.type_axels?.length || 0} types
                </span>
            )
        },
        createActionsColumn([
            {
                icon: MdEdit,
                onClick: handleEditAxle,
                className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50',
                tooltip: 'Edit',
                permission: 'update'
            },
            {
                icon: MdDeleteOutline,
                onClick: handleDeleteWithConfirmation,
                className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                tooltip: 'Delete',
                permission: 'delete'
            }
        ])
    ];
    return (
        <>
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                Axle Management
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage system axles and their configurations
                            </p>
                        </div>
                        <PermissionGate permission="create">
                            <Button
                                onClick={handleAddAxle}
                                className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="w-4 h-4 mr-2" />
                                Add Axle
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Filter Section */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                        {/* Search Input */}
                        <div className="flex-1">
                            <div className="relative flex">
                                <div className="relative flex-1">
                                    <Input
                                        type="text"
                                        placeholder="Search axels..."
                                        value={filters.search}
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
                <div className="p-6 font-secondary">
                    <CustomDataTable
                        columns={axleColumns}
                        data={axles}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.per_page || 10}
                        paginationDefaultPage={pagination?.current_page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={(newPerPage) => {
                            // Fetch axles with new per_page limit and reset to page 1
                            fetchAxles(1, newPerPage);
                        }}
                        responsive
                        highlightOnHover
                        striped={false}
                        persistTableHead
                        headerBackground="rgba(2, 83, 165, 0.1)"
                        hoverBackground="rgba(223, 232, 242, 0.3)"
                        borderRadius="8px"
                    />
                </div>
            </div>

            <ConfirmationModal {...confirmation.modalProps} />
        </>
    );
}
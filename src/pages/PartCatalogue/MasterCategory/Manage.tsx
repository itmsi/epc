import { PermissionGate } from "@/components/common/PermissionComponents";
import Input from "@/components/form/input/InputField";
import CustomSelect from "@/components/form/select/CustomSelect";
import Button from "@/components/ui/button/Button";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import CustomDataTable from "@/components/ui/table";
import { TableColumn } from "react-data-table-component";
import { MdAdd, MdSearch, MdClear } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useMasterCategory } from "@/hooks/usePartCatalogue";
import { useConfirmation } from "@/hooks/useConfirmation";
import { MasterCategory } from "@/types/partCatalogue";

export default function Manage() {
    const navigate = useNavigate();
    const {
        mastercategory,
        loading,
        pagination,
        filters,
        handleFilterChange,
        handleSearchChange,
        handleManualSearch,
        clearSearch,
        fetchMasterCategories
    } = useMasterCategory();

    const confirmation = useConfirmation();

    const handleAddMasterCategory = () => {
        navigate('/epc/master-category/create');
    };

    const handleEditMasterCategory = (masterCategory: MasterCategory) => {
        navigate(`/epc/master-category/view/${masterCategory.master_category_id}`);
    };

    const handlePageChange = (page: number) => {
        fetchMasterCategories(page, pagination?.limit || 10);
    };

    const masterCategoryColumns: TableColumn<MasterCategory>[] = [
        {
            name: 'Master Category Name (EN)',
            selector: row => row.master_category_name_en || '-',
        },
        {
            name: 'Master Category Name (CN)',
            selector: row => row.master_category_name_cn || '-',
        },
        {
            name: 'Description',
            selector: row => row.master_category_description || '-',
            width: '550px',
            wrap: true,
        }
    ];

    return (
        <>
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                                Master Category Management
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage system master categories and their configurations
                            </p>
                        </div>
                        <PermissionGate permission="create">
                            <Button
                                onClick={handleAddMasterCategory}
                                className="rounded-md w-full md:w-60 flex items-center justify-center gap-2"
                                size="sm"
                            >
                                <MdAdd className="w-4 h-4 mr-2" />
                                Add Master Category
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
                                    
                                    <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <Input
                                        type="text"
                                        placeholder="Search master categories..."
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
                        columns={masterCategoryColumns}
                        data={mastercategory || []}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination?.total || 0}
                        paginationPerPage={pagination?.per_page || 10}
                        paginationDefaultPage={pagination?.current_page || 1}
                        paginationRowsPerPageOptions={[5, 10, 15, 20, 25, 50]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={(newPerPage) => {
                            // Fetch master categories with new per_page limit and reset to page 1
                            fetchMasterCategories(1, newPerPage);
                        }}
                        responsive
                        highlightOnHover
                        striped={false}
                        persistTableHead
                        headerBackground="rgba(2, 83, 165, 0.1)"
                        hoverBackground="rgba(223, 232, 242, 0.3)"
                        borderRadius="8px"
                        onRowClicked={handleEditMasterCategory}
                    />
                </div>
            </div>

            <ConfirmationModal {...confirmation.modalProps} />
        </>
    );
}
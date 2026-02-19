import { Link } from 'react-router-dom';
import { MdArrowBack, MdEdit, MdSave, MdCancel, MdDelete } from 'react-icons/md';
import { FaSave } from 'react-icons/fa';
import Button from '@/components/ui/button/Button';
import PageMeta from '@/components/common/PageMeta';
import { useViewVinCustomer } from './hooks/useViewVinCustomer';
import { CustomerSelectSection, VinManagementSection } from './components';
import { PermissionGate } from '@/components/common/PermissionComponents';
import { useConfirmation } from '@/hooks/useConfirmation';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

export default function VinIdentifierCustomerView() {
    const { showConfirmation, modalProps } = useConfirmation();
    
    const {
        vinCustomerData,
        loading,
        error,
        isEditMode,
        setIsEditMode,
        isSubmitting,
        formData,
        validationErrors,
        isVinAlreadySelected,
        handleCustomerChange,
        addSelectedVin,
        removeSelectedVin,
        handleDelete: originalHandleDelete,
        handleSave,
        handleCancelEdit
    } = useViewVinCustomer();

    // Handle delete with confirmation
    const handleDelete = async () => {
        if (!vinCustomerData) return;

        const confirmed = await showConfirmation({
            title: 'Delete VIN Customer',
            message: `Are you sure you want to delete VIN Customer "${vinCustomerData.customer_name}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        await originalHandleDelete();
    };

    // Loading state
    if (loading) {
        return (
            <>
                <PageMeta
                    title="View VIN Customer | MSI"
                    description="View VIN Customer data"
                    image="/motor-sights-international.png"
                />
                <div className="bg-gray-50 overflow-auto">
                    <div className="mx-auto p-4 sm:px-3">
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading data...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Error state
    if (error || !vinCustomerData) {
        return (
            <>
                <PageMeta
                    title="View VIN Customer | MSI"
                    description="View VIN Customer data"
                    image="/motor-sights-international.png"
                />
                <div className="bg-gray-50 overflow-auto">
                    <div className="mx-auto p-4 sm:px-3">
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="text-red-600 text-lg font-medium mb-4">
                                {error || 'Data tidak ditemukan'}
                            </div>
                            <Link to="/epc/vehicle-identification">
                                <Button variant="outline">
                                    Kembali ke Daftar
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Customer value for select
    const customerValue = {
        value: vinCustomerData.customer_id,
        label: vinCustomerData.customer_name
    };

    return (
        <>
            <PageMeta
                title={`VIN Customer: ${vinCustomerData.customer_name} | MSI`}
                description="View VIN Customer data"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto p-4 sm:px-3 space-y-6">
                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/epc/vehicle-identification">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdArrowBack className="w-4 h-4" />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">
                                {vinCustomerData.customer_name}
                            </h1>
                            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                {vinCustomerData.count} VINs
                            </span>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            {!isEditMode ? (<>
                                <PermissionGate permission={["update"]}>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditMode(true)}
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary py-2 hover:bg-[#0253a5] hover:text-white"
                                    >
                                        <MdEdit size={20} className="text-primary group-hover:text-white" /> Edit
                                    </Button>
                                </PermissionGate>
                                <PermissionGate permission={["delete"]}>
                                    <Button
                                        variant="outline"
                                        className="group rounded-lg w-full flex items-center justify-center gap-2 ring-[#e7000b] font-secondary py-2 hover:bg-red-600 hover:text-white"
                                        onClick={() => handleDelete()}
                                    >
                                        <MdDelete size={20} className="text-red-600 group-hover:text-white" /> Delete
                                    </Button>
                                </PermissionGate>
                            </>) : (
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={handleSave}
                                        disabled={isSubmitting}
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary py-2 bg-[#0253a5] text-white"
                                    >
                                        <MdSave className="w-4 h-4 text-white" />
                                        {isSubmitting ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelEdit}
                                        disabled={isSubmitting}
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 font-secondary py-2"
                                    >
                                        <MdCancel className="w-4 h-4" />
                                        Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="p-8">
                            <div className='md:min-h-[500px]'>

                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">
                                    {isEditMode ? 'Edit VIN Customer Vehicle' : 'VIN Customer Vehicle Information'}
                                </h2>

                                {/* Configuration */}
                                <div className="space-y-4 my-5">
                                    <div className="grid grid-cols-1 gap-4">
                                        <CustomerSelectSection 
                                            error={isEditMode ? validationErrors.customer_id : undefined}
                                            onCustomerChange={handleCustomerChange}
                                            initialValue={customerValue}
                                            readonly={!isEditMode}
                                        />
                                        
                                        <VinManagementSection 
                                            selectedVins={formData.selectedVins}
                                            error={isEditMode ? validationErrors.selectedVins : undefined}
                                            isVinAlreadySelected={isVinAlreadySelected}
                                            onAddVin={addSelectedVin}
                                            onRemoveVin={removeSelectedVin}
                                            readonly={!isEditMode}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form Actions - only in edit mode */}
                    {isEditMode && (
                        <div className="flex justify-end gap-4 p-4 bg-white rounded-2xl shadow-sm mb-8">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="px-6 rounded-full"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            
                            <PermissionGate permission={["create", "update"]}>
                                <Button
                                    onClick={handleSave}
                                    className="px-6 flex items-center gap-2 rounded-full"
                                    disabled={isSubmitting}
                                >
                                    <FaSave />
                                    {isSubmitting ? 'Updating...' : 'Update VIN Customer Vehicle'}
                                </Button>
                            </PermissionGate>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal for Delete */}
            <ConfirmationModal {...modalProps} />
        </>
    );
}

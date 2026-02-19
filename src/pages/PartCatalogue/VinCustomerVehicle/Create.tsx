import { Link } from 'react-router-dom';
import { MdArrowBack, MdAdd } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import PageMeta from '@/components/common/PageMeta';
import { useCreateVinCustomerVehicle } from './hooks/useCreateVinCustomerVehicle';
import FormActions from '@/components/form/FormActions';
import { CustomerSelectSection, VinManagementSection } from './components';

export default function VinIdentifierCustomerCreate() {
    const {
        formData,
        validationErrors,
        isSubmitting,
        addSelectedVin,
        removeSelectedVin,
        isVinAlreadySelected,
        handleCustomerChange,
        handleSubmit
    } = useCreateVinCustomerVehicle();

    return (
        <>
            <PageMeta
                title="Create VIN | MSI"
                description="Create new VIN production data"
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
                            <MdAdd size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create New Customer VIN Vehicle</h1>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="p-8">
                            <div className='md:min-h-[500px]'>

                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">
                                    VIN Customer Vehicle Configuration
                                </h2>

                                {/* Configuration */}
                                <div className="space-y-4 my-5">
                                    <div className="grid grid-cols-1 gap-4">
                                        <CustomerSelectSection 
                                            error={validationErrors.customer_id}
                                            onCustomerChange={handleCustomerChange}
                                        />
                                        
                                        <VinManagementSection 
                                            selectedVins={formData.selectedVins}
                                            error={validationErrors.selectedVins}
                                            isVinAlreadySelected={isVinAlreadySelected}
                                            onAddVin={addSelectedVin}
                                            onRemoveVin={removeSelectedVin}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        

                    </div>
                    {/* Form Actions */}
                    <FormActions
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        cancelRoute="/epc/vehicle-identification"
                        submitText="Create VIN Customer Vehicle"
                        submittingText="Creating..."
                    />
                </div>
            </div>
        </>
    );
}
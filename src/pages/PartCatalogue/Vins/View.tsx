import { Link } from 'react-router-dom';
import { MdArrowBack, MdEdit, MdDelete, MdSave, MdCancel, MdAdd, MdOutlineArrowRightAlt } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import PageMeta from '@/components/common/PageMeta';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';
import { useViewVin } from '@/hooks/useViewVin';
import { useMasterVinManager } from '@/hooks/useManageVins';
import { useConfirmation } from '@/hooks/useConfirmation';
import TextArea from '@/components/form/input/TextArea';
import Label from '@/components/form/Label';

export default function ViewVin() {
    // Use confirmation hook for delete action
    const { showConfirmation, modalProps } = useConfirmation();
    
    // Use custom hooks for state and actions
    const {
        vinData,
        loading,
        error,
        isEditMode,
        formData,
        errors,
        submitting,
        searchInputValues,
        setIsEditMode,
        handleInputChange,
        addMasterPdf,
        removeMasterPdf,
        updateMasterPdfSelection,
        handleSearchInputChange,
        handleSave,
        handleDelete: originalHandleDelete,
        handleCancel
    } = useViewVin();

    // Master PDF management
    const {
        loading: masterPdfLoading,
        loadMasterPdfOptions,
        handleMenuScrollToBottom,
        createMasterPdfOptions
    } = useMasterVinManager();

    // Custom delete handler with confirmation modal
    const handleDelete = async () => {
        if (!vinData) {
            return;
        }

        const confirmed = await showConfirmation({
            title: 'Delete VIN',
            message: `Are you sure you want to delete VIN "${vinData.vin_number}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        // Call the original delete handler from the hook
        await originalHandleDelete();
    };

    // Loading state
    if (loading) {
        return (
            <>
                <PageMeta
                    title="View VIN | MSI"
                    description="View VIN production data"
                    image="/motor-sights-international.png"
                />
                <div className="bg-gray-50 overflow-auto">
                    <div className="mx-auto p-4 sm:px-3">
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading VIN data...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    // Error state
    if (error || !vinData) {
        return (
            <>
                <PageMeta
                    title="View VIN | MSI"
                    description="View VIN production data"
                    image="/motor-sights-international.png"
                />
                <div className="bg-gray-50 overflow-auto">
                    <div className="mx-auto p-4 sm:px-3">
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="text-red-600 text-lg font-medium mb-4">
                                {error || 'VIN not found'}
                            </div>
                            <Link to="/epc/vins">
                                <Button variant="outline">
                                    Back to VIN Management
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
                title={`VIN: ${vinData.vin_number} | MSI`}
                description="View VIN production data"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto p-4 sm:px-3">
                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/epc/vins">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdArrowBack className="w-4 h-4" />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">
                                VIN: {vinData.vin_number}
                            </h1>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            {!isEditMode ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditMode(true)}
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary py-2 hover:bg-[#0253a5] hover:text-white"
                                    >
                                        <MdEdit size={20} className="text-primary group-hover:text-white" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleDelete}
                                        disabled={submitting}
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#e7000b] font-secondary py-2 hover:bg-red-600 hover:text-white"
                                    >
                                        <MdDelete size={20} className="text-red-600 group-hover:text-white" /> Delete
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={handleSave}
                                        disabled={submitting}
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary py-2 bg-[#0253a5] text-white"
                                    >
                                        <MdSave className="w-4 h-4 text-white" />
                                        {submitting ? 'Saving...' : 'Save'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={submitting}
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
                            <div className='md:min-h-[600px]'>

                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">
                                    {isEditMode ? 'Edit VIN Information' : 'VIN Information'}
                                </h2>

                                {/* VIN Details */}
                                <div className="space-y-4 my-5">
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* VIN Number */}
                                        <div>
                                            <Label htmlFor="vin_number">
                                                VIN Number {isEditMode && <span className="text-red-500">*</span>}
                                            </Label>
                                            <Input
                                                id="vin_number"
                                                name="vin_number"
                                                type="text"
                                                value={formData.vin_number}
                                                onChange={(e) => handleInputChange('vin_number', e.target.value)}
                                                placeholder="Enter VIN number"
                                                error={!!errors.vin_number}
                                                readonly={!isEditMode}
                                            />
                                            {errors.vin_number && (
                                                <p className="mt-1 text-sm text-red-600">{errors.vin_number}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Production Name EN */}
                                            <div>
                                                <Label htmlFor="production_name_en">
                                                    Production Name (English) {isEditMode && <span className="text-red-500">*</span>}
                                                </Label>
                                                <Input
                                                    id="production_name_en"
                                                    name="production_name_en"
                                                    type="text"
                                                    value={formData.production_name_en}
                                                    onChange={(e) => handleInputChange('production_name_en', e.target.value)}
                                                    placeholder="Enter production name in English"
                                                    error={!!errors.production_name_en}
                                                    readonly={!isEditMode}
                                                />
                                                {errors.production_name_en && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.production_name_en}</p>
                                                )}
                                            </div>

                                            {/* Production Name CN */}
                                            <div>
                                                <Label htmlFor="production_name_cn">
                                                    Production Name (Chinese) {isEditMode && <span className="text-red-500">*</span>}
                                                </Label>
                                                <Input
                                                    id="production_name_cn"
                                                    name="production_name_cn"
                                                    type="text"
                                                    value={formData.production_name_cn}
                                                    onChange={(e) => handleInputChange('production_name_cn', e.target.value)}
                                                    placeholder="Enter production name in Chinese"
                                                    error={!!errors.production_name_cn}
                                                    readonly={!isEditMode}
                                                />
                                                {errors.production_name_cn && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.production_name_cn}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <Label htmlFor='production_description'>
                                            Production Description
                                        </Label>
                                        <TextArea
                                            id='production_description'
                                            name="production_description"
                                            value={formData.production_description || ''}
                                            onChange={(e) => handleInputChange('production_description', e.target.value)}
                                            placeholder="Enter production description"
                                            rows={5}
                                            readonly={!isEditMode}
                                        />
                                    </div>
                                </div>

                                {/* Master PDF Details */}
                                <div className="mt-8 space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Book Part Details
                                        </h3>
                                        {isEditMode && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={addMasterPdf}
                                                className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                                                size="sm"
                                            >
                                                <MdAdd className="w-4 h-4" />
                                                Add Cabin
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-4 font-secondary md:h-[500px] overflow-y-auto">
                                        {isEditMode ? (
                                            // Edit Mode - Show form fields
                                            formData.master_pdf && formData.master_pdf.length > 0 ? (
                                                formData.master_pdf.map((pdf, index) => (
                                                    <div 
                                                        key={index} 
                                                        className={`border rounded-lg p-4 space-y-4 ${
                                                            pdf.isNew 
                                                                ? 'border-green-300 bg-green-50' 
                                                                : 'border-gray-200 bg-gray-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <h4 className={`text-md font-medium ${
                                                                pdf.isNew ? 'text-green-700' : 'text-gray-700'
                                                            }`}>
                                                                Master Cabin #{index + 1}
                                                                {pdf.isNew && (
                                                                    <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                                                        New
                                                                    </span>
                                                                )}
                                                            </h4>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => removeMasterPdf(index)}
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50 h-[42px] border-[#d1d5db]"
                                                            >
                                                                <MdDelete className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        <div className="flex-1">
                                                            <CustomAsyncSelect
                                                                name={`master_pdf_${index}`}
                                                                placeholder="Select master PDF from catalogs"
                                                                value={pdf.master_pdf_id ? 
                                                                    createMasterPdfOptions().find(opt => opt.value === pdf.master_pdf_id) || null 
                                                                    : null
                                                                }
                                                                onChange={(selectedOption) => updateMasterPdfSelection(index, selectedOption)}
                                                                defaultOptions={createMasterPdfOptions()}
                                                                loadOptions={loadMasterPdfOptions}
                                                                onMenuScrollToBottom={handleMenuScrollToBottom}
                                                                isLoading={masterPdfLoading}
                                                                noOptionsMessage={() => masterPdfLoading ? 'Loading master PDFs...' : 'No master PDFs found'}
                                                                loadingMessage={() => 'Loading master PDFs...'}
                                                                isSearchable={true}
                                                                isClearable={true}
                                                                inputValue={searchInputValues[index] || ''}
                                                                onInputChange={handleSearchInputChange(index)}
                                                            />
                                                            {errors.master_pdf && typeof errors.master_pdf === 'string' && (
                                                                <div className="mt-2">
                                                                    <span className="text-red-500 text-sm">
                                                                        {errors.master_pdf}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <p>No master PDF details added yet.</p>
                                                    <p className="text-sm">Click "Add PDF" to add master PDF details.</p>
                                                </div>
                                            )
                                        ) : (
                                            // View Mode - Show read-only data
                                            vinData.master_pdf && vinData.master_pdf.length > 0 ? (
                                                vinData.master_pdf.map((pdf, index) => (
                                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="mb-1.5 block text-sm text-gray-700">
                                                                Book Part #{index + 1}
                                                            </h4>
                                                        </div>
                                                        <Link target='_blank' to={`/epc/manage/view/${pdf.master_pdf_id}`} className="inline-flex items-center justify-center p-5 py-3 text-base font-medium text-gray-500 rounded-lg bg-teal-50 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700 dark:hover:text-white">
                                                            <span className="w-full">{pdf.master_pdf_name}</span>
                                                            <MdOutlineArrowRightAlt className='text-[24px]' />
                                                        </Link> 
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-gray-500">
                                                    <p>No book part details available.</p>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>
                            </div>
                            {isEditMode && (
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="px-6 rounded-full"   
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    onClick={handleSave}
                                    className="px-6 flex items-center gap-2 rounded-full"
                                >
                                    <MdSave className="w-4 h-4" />
                                    {submitting ? 'Update...' : 'Update VIN'}
                                </Button>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal for Delete */}
            <ConfirmationModal {...modalProps} />
        </>
    );
}
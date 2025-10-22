import React from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import FileUpload from '@/components/ui/FileUpload/FileUpload';
import { MdEdit, MdKeyboardArrowLeft, MdDelete, MdSave, MdCancel, MdAdd } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import ConfirmationModal from '@/components/ui/modal/ConfirmationModal';

// Import organized types, hooks, and services
import { 
    PART_TYPES
} from '@/types/asyncSelect';
import { useEditCatalogEnhanced } from '@/hooks/useEditCatalogEnhanced';
import { CatalogManageService } from '@/services/partCatalogueService';
import { useConfirmation } from '@/hooks/useConfirmation';
import toast from 'react-hot-toast';

export default function ViewCatalog() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // Edit mode state - local to this component
    const [isEditMode, setIsEditMode] = React.useState(false);
    
    // Use the enhanced hook for all business logic
    const {
        // Search state
        searchInputValue,
        handleSearchInputChange,
        
        // Part options management
        partOptions,
        loadPartOptions,
        
        // CSV handling
        handleCSVUpload,
        
        // Form management from existing edit hook
        formData,
        setFormData,
        validationErrors,
        setValidationErrors,
        catalogueDataLoading,
        selectedPartData,
        subTypes,
        getSubTypeOptions,
        handleSelectChange,
        handleInputChange,
        handleAddPart,
        handleRemovePart,
        handlePartChange,
        handleSubmit,
        loadingCatalog,
        submitting,
        catalogData,
        
        // Async select hook
        asyncSelectHook
    } = useEditCatalogEnhanced();
    
    // Use confirmation hook for delete action
    const { showConfirmation, modalProps } = useConfirmation();

    // Handle edit mode toggle
    const handleEditToggle = () => {
        setIsEditMode(!isEditMode);
    };

    // Handle save in edit mode
    const handleSaveClick = async () => {
        const fakeEvent = {
            preventDefault: () => {}
        } as React.FormEvent;
        
        await handleSubmit(fakeEvent);
        
        if (Object.keys(validationErrors).length === 0) {
            setIsEditMode(false); // Exit edit mode on successful save
            toast.success('Catalog updated successfully!');
        }
    };

    // Handle cancel edit mode
    const handleCancel = () => {
        setIsEditMode(false);
        // You might want to reset form data here if needed
        // toast.info('Edit cancelled');
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

    // Check if data is loading
    const isDataLoading = () => {
        return catalogueDataLoading || asyncSelectHook.isLoading || loadingCatalog;
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
                title={isEditMode ? "Edit Catalog" : "View Catalog"}
                description={isEditMode ? "Edit catalog for part catalogue" : "View catalog for part catalogue"}
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
                                {isEditMode ? 'Edit Catalog' : 'View Catalog'}
                            </h1>
                            
                        </div>
                        <div className='flex gap-3'>
                            {!isEditMode ? (
                                // View mode buttons
                                <>
                                    <Button
                                        variant="outline"
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary py-2 hover:bg-[#0253a5] hover:text-white"
                                        onClick={handleEditToggle}
                                        disabled={submitting}
                                    >
                                        <MdEdit size={20} className="text-primary group-hover:text-white" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#e7000b] font-secondary py-2 hover:bg-red-600 hover:text-white"
                                        onClick={() => handleDelete()}
                                        disabled={submitting}
                                    >
                                        <MdDelete size={20} className="text-red-600 group-hover:text-white" /> Delete
                                    </Button>
                                </>
                            ) : (
                                // Edit mode buttons
                                <>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary py-2 bg-[#0253a5] text-white"
                                        disabled={submitting}
                                        onClick={handleSaveClick}
                                    >
                                        <MdSave size={20} /> Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 font-secondary py-2"
                                        onClick={handleCancel}
                                        disabled={submitting}
                                    >
                                        <MdCancel size={20} /> Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Form Section */}
                    <form 
                        id="edit-catalog-form"
                        className="bg-white rounded-2xl shadow-sm" 
                        onSubmit={(e) => e.preventDefault()}
                    >
                        <div className="p-8">
                            <div className='min-h-[800px]' >
                                    
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">
                                    Part Configuration
                                </h2>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-5 font-secondary'>
                                    <div>
                                        <Label htmlFor="code_cabin">Code Cabin *</Label>
                                        <Input
                                            type="text"
                                            name="code_cabin"
                                            id="code_cabin"
                                            placeholder="Enter Code Cabin"
                                            value={formData.code_cabin}
                                            onChange={handleInputChange}
                                            readonly={!isEditMode}
                                        />
                                        {validationErrors.code_cabin && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.code_cabin}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="part_type">Part Type *</Label>
                                        {isEditMode ? (
                                            <CustomSelect
                                                placeholder="Select Part Type"
                                                onChange={handleSelectChange('part_type')}
                                                options={PART_TYPES}
                                                value={formData.part_type ? PART_TYPES.find(pt => pt.value === formData.part_type) : null}
                                                error={validationErrors.part_type}
                                            />
                                        ) : (
                                            <Input
                                                type="text"
                                                name="part_type"
                                                id="part_type"
                                                placeholder="Part Type"
                                                value={PART_TYPES.find(pt => pt.value === formData.part_type)?.label || formData.part_type}
                                                readonly={true}
                                            />
                                        )}
                                        {validationErrors.part_type && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.part_type}
                                            </p>
                                        )}
                                    </div>

                                    {/* Part Selection */}
                                    {formData.part_type && (
                                        <div>
                                            <Label htmlFor="part_id">Select {PART_TYPES.find(pt => pt.value === formData.part_type)?.label} *</Label>
                                            {isEditMode ? (
                                                <CustomAsyncSelect
                                                    name='part_id'
                                                    placeholder={`Select ${PART_TYPES.find(pt => pt.value === formData.part_type)?.label}`}
                                                    onChange={handleSelectChange('part_id')}
                                                    value={formData.part_id ? partOptions.find((po: any) => String(po.value) === formData.part_id) : null}
                                                    error={validationErrors.part_id}
                                                    defaultOptions={partOptions}
                                                    loadOptions={loadPartOptions}
                                                    onMenuScrollToBottom={asyncSelectHook.handleScrollToBottom}
                                                    isLoading={isDataLoading()}
                                                    noOptionsMessage={() => catalogueDataLoading ? `Loading ${formData.part_type} data...` : `No ${formData.part_type} found`}
                                                    loadingMessage={() => `Loading ${formData.part_type} data...`}
                                                    isSearchable={true}
                                                    inputValue={searchInputValue}
                                                    onInputChange={handleSearchInputChange}
                                                />
                                            ) : (
                                                <Input
                                                    type="text"
                                                    name="part_id_display"
                                                    placeholder="Selected Part"
                                                    value={formData.part_id ? (partOptions.find((po: any) => String(po.value) === formData.part_id)?.label || 'Selected part') : 'No part selected'}
                                                    readonly={true}
                                                />
                                            )}
                                            {isDataLoading() && (
                                                <p className="mt-1 text-sm text-gray-500">Loading {formData.part_type} data...</p>
                                            )}
                                            {validationErrors.part_id && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {validationErrors.part_id}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    
                                    {/* Sub Type Selection */}
                                    {formData.part_id && (
                                        <div>
                                            <Label htmlFor="type_id" className='font-secondary'>Select Type *</Label>
                                            {isEditMode ? (
                                                <CustomSelect
                                                    placeholder="Select Type"
                                                    onChange={handleSelectChange('type_id')}
                                                    options={getSubTypeOptions()}
                                                    value={formData.type_id ? getSubTypeOptions().find((sto: any) => sto.value === formData.type_id) : null}
                                                    isLoading={catalogueDataLoading}
                                                />
                                            ) : (
                                                <Input
                                                    type="text"
                                                    name="type_id_display"
                                                    placeholder="Selected Type"
                                                    value={formData.type_id ? (getSubTypeOptions().find((sto: any) => sto.value === formData.type_id)?.label || 'Selected type') : 'No type selected'}
                                                    readonly={true}
                                                />
                                            )}
                                            {validationErrors.type_id && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {validationErrors.type_id}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Display selected part information */}
                                    {selectedPartData && formData.type_id && subTypes.length > 0 && (
                                        <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <h3 className="font-medium text-gray-900 mb-2">Selected Configuration</h3>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p>
                                                    <strong>Part Type:</strong> {formData.part_type}
                                                </p>
                                                <p><strong>Part:</strong> {
                                                    formData.part_type === 'cabin' ? `${selectedPartData.cabines_name_en} - ${selectedPartData.cabines_name_cn}` :
                                                    formData.part_type === 'engine' ? `${selectedPartData.engines_name_en} - ${selectedPartData.engines_name_cn}` :
                                                    formData.part_type === 'axle' ? `${selectedPartData.axel_name_en} - ${selectedPartData.axel_name_cn}` :
                                                    formData.part_type === 'transmission' ? `${selectedPartData.transmission_name_en} - ${selectedPartData.transmission_name_cn}` :
                                                    formData.part_type === 'steering' ? `${selectedPartData.steering_name_en} - ${selectedPartData.steering_name_cn}` : ''
                                                }</p>
                                                <p>
                                                    <strong>Type:</strong> {
                                                        subTypes.find(subType => {
                                                            switch (formData.part_type) {
                                                                case 'cabin': return subType.type_cabine_id === formData.type_id;
                                                                case 'engine': return subType.type_engine_id === formData.type_id;
                                                                case 'axle': return subType.type_axel_id === formData.type_id;
                                                                case 'transmission': return subType.type_transmission_id === formData.type_id;
                                                                case 'steering': return subType.type_steeringwheel_id === formData.type_id;
                                                                default: return false;
                                                            }
                                                        })?.[
                                                            formData.part_type === 'cabin' ? 'type_cabine_name_en' :
                                                            formData.part_type === 'engine' ? 'type_engine_name_en' :
                                                            formData.part_type === 'axle' ? 'type_axel_name_en' :
                                                            formData.part_type === 'transmission' ? 'type_transmission_name_en' :
                                                            formData.part_type === 'steering' ? 'type_steeringwheel_name_en' : ''
                                                        ]
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* SVG Image Upload & Parts Section - Show after type selection */}
                                    {selectedPartData && formData.type_id && (
                                        <>
                                            {/* SVG Image Upload */}
                                            <div className="md:col-span-2">
                                                <FileUpload
                                                    id="svg_image"
                                                    name="svg_image"
                                                    label="Upload SVG Image (Optional)"
                                                    accept=".svg,image/svg+xml"
                                                    acceptedFormats={['svg', 'image/svg+xml']}
                                                    maxSize={5}
                                                    currentFile={formData.svg_image}
                                                    existingImageUrl={formData.parts.length > 0 ? formData.parts[0].file_foto : null}
                                                    onFileChange={(file) => {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            svg_image: file
                                                        }));
                                                        if (validationErrors.svg_image) {
                                                            setValidationErrors(prev => {
                                                                const newErrors = { ...prev };
                                                                delete newErrors.svg_image;
                                                                return newErrors;
                                                            });
                                                        }
                                                    }}
                                                    showPreview={true}
                                                    previewSize="lg"
                                                    viewMode={!isEditMode}
                                                    disabled={!isEditMode}
                                                />
                                            </div>

                                            {/* CSV Upload for Parts - Only in edit mode */}
                                            {isEditMode && (
                                                <div className="md:col-span-2">
                                                    <FileUpload
                                                        id="csv_file"
                                                        name="csv_file"
                                                        label="Upload CSV File (Optional)"
                                                        accept=".csv,text/csv"
                                                        acceptedFormats={['csv', 'text/csv']}
                                                        maxSize={10}
                                                        currentFile={formData.csv_file}
                                                        onFileChange={handleCSVUpload}
                                                        description="CSV file containing parts data"
                                                    />
                                                </div>
                                            )}

                                            {/* Parts Table Section */}
                                            <div className="md:col-span-2">
                                                <div className="mb-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-medium text-gray-900">Parts Management</h3>
                                                        {isEditMode && (
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={handleAddPart}
                                                                disabled={submitting}
                                                                className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                                                            >
                                                                <MdAdd className="w-4 h-4" />
                                                                Add Part
                                                            </Button>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Parts List */}
                                                    <div className="space-y-4 max-h-96 overflow-y-auto font-secondary">
                                                        {formData.parts.length > 0 ? (
                                                            <>
                                                                {formData.parts.map((part, index) => (
                                                                    <div
                                                                        key={part.id}
                                                                        className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4"
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <h4 className="text-md font-medium text-gray-700">
                                                                                Part #{index + 1}
                                                                            </h4>
                                                                            {isEditMode && (
                                                                                <Button
                                                                                    type="button"
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    onClick={() => handleRemovePart(part.id)}
                                                                                    disabled={submitting}
                                                                                    className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                                                                                >
                                                                                    <MdDelete className="w-4 h-4" />
                                                                                </Button>
                                                                            )}
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                                                            {/* Part Target */}
                                                                            <div className='md:col-span-2'>
                                                                                <Label htmlFor={`part_target_${part.id}`}>Part Target *</Label>
                                                                                <Input
                                                                                    type="text"
                                                                                    value={part.part_target}
                                                                                    onChange={(e) => handlePartChange(part.id, 'part_target', e.target.value)}
                                                                                    placeholder="e.g., part-1"
                                                                                    className="mt-1"
                                                                                    readonly={!isEditMode}
                                                                                />
                                                                            </div>

                                                                            {/* Part Number */}
                                                                            <div className='md:col-span-2'>
                                                                                <Label htmlFor={`code_product_${part.id}`}>Part Number *</Label>
                                                                                <Input
                                                                                    type="text"
                                                                                    value={part.code_product}
                                                                                    onChange={(e) => handlePartChange(part.id, 'code_product', e.target.value)}
                                                                                    placeholder="Part number"
                                                                                    className="mt-1"
                                                                                    readonly={!isEditMode}
                                                                                />
                                                                            </div>

                                                                            {/* Quantity */}
                                                                            <div className='md:col-span-2'>
                                                                                <Label htmlFor={`quantity_${part.id}`}>Quantity *</Label>
                                                                                <Input
                                                                                    id={`quantity_${part.id}`}
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={part.quantity}
                                                                                    onChange={(e) => handlePartChange(part.id, 'quantity', parseInt(e.target.value) || 0)}
                                                                                    placeholder="Qty"
                                                                                    className="mt-1"
                                                                                    readonly={!isEditMode}
                                                                                />
                                                                            </div>

                                                                            {/* Name English */}
                                                                            <div className='md:col-span-3'>
                                                                                <Label htmlFor={`name_english_${part.id}`}>Name (English) *</Label>
                                                                                <Input
                                                                                    type="text"
                                                                                    value={part.name_english}
                                                                                    onChange={(e) => handlePartChange(part.id, 'name_english', e.target.value)}
                                                                                    placeholder="Enter English Name"
                                                                                    className="mt-1"
                                                                                    readonly={!isEditMode}
                                                                                />
                                                                            </div>

                                                                            {/* Name Chinese */}
                                                                            <div className='md:col-span-3'>
                                                                                <Label htmlFor={`name_chinese_${part.id}`}>Name (Chinese) *</Label>
                                                                                <Input
                                                                                    id={`name_chinese_${part.id}`}
                                                                                    type="text"
                                                                                    value={part.name_chinese}
                                                                                    onChange={(e) => handlePartChange(part.id, 'name_chinese', e.target.value)}
                                                                                    placeholder="Enter Chinese Name"
                                                                                    className="mt-1"
                                                                                    readonly={!isEditMode}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-8 text-gray-500">
                                                                <p>{isEditMode ? 'No parts added yet. Click "Add Part" to get started.' : 'No parts in this catalog.'}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Footer - Only show in view mode */}
                            {!isEditMode && (
                                <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => navigate('/epc/manage')}
                                        className="px-6 rounded-full"
                                        disabled={submitting}
                                    >
                                        Back to Manage
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        onClick={handleSaveClick}
                                        className="px-6 flex items-center gap-2 rounded-full"
                                    >
                                        <MdSave className="w-4 h-4" />
                                        {submitting ? 'Update...' : 'Update Catalog'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </form>

                </div>
            </div>

            {/* Confirmation Modal for Delete */}
            <ConfirmationModal {...modalProps} />
        </>
    );
}
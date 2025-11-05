import React from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import FileUpload from '@/components/ui/FileUpload/FileUpload';
import { MdEdit, MdKeyboardArrowLeft, MdSave, MdDelete, MdAdd } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';

// Import hook yang proper untuk Edit mode
import { useEditCatalog } from '@/hooks/useEditCatalog';
import { handleKeyPress } from '@/helpers/generalHelper';

export default function EditCatalog() {
    const navigate = useNavigate();
    const { id } = useParams();
    
    // Use hook khusus untuk Edit yang extend useCreateCatalog
    const {
        // Search state
        searchInputValue,
        handleSearchInputChange,
        
        // Part options management
        partOptions,
        loadPartOptions,
        
        // CSV handling
        handleCSVUpload,
        
        // Form management
        formData,
        setFormData,
        validationErrors,
        setValidationErrors,
        catalogueDataLoading,
        handleSelectChange,
        handleInputChange,
        handleAddPart,
        handleRemovePart,
        handlePartChange,
        handleSubmit,
        loading,
        
        // Edit-specific
        loadingCatalog,
        existingImageUrl,
        
        // Async select hook
        asyncSelectHook
    } = useEditCatalog();
    
    // Use catalog data from form
    const catalogData = { dokumen_name: formData.code_cabin || 'Edit Catalog' };
    const submitting = loading;

    // Handle form submission with navigation
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await handleSubmit(e);
        
        if (success) {
            navigate(`/epc/manage/view/${formData.dokumen_id}`);
        }
    };

    // Check if data is loading
    const isDataLoading = () => {
        return loading || catalogueDataLoading || loadingCatalog;
    };

    // Show loading screen while fetching catalog data
    if (loadingCatalog) {
        return (
            <>
                <PageMeta
                    title="Edit Catalog"
                    description="Edit catalog for part catalogue"
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
                    title="Edit Catalog"
                    description="Edit catalog for part catalogue"
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
                title="Edit Catalog"
                description="Edit catalog for part catalogue"
                image=""
            />
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto p-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to={`/epc/manage/view/${formData.dokumen_id || id}`}>
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdEdit size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Catalog</h1>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form className="bg-white rounded-2xl shadow-sm" onSubmit={onSubmit}>
                        <div className="p-8">
                            <div className='min-h-[800px]' >
                                    
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">
                                    Part Configuration
                                </h2>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-5 font-secondary'>
                                    <div>
                                        <Label htmlFor="code_cabin">Document Name *</Label>
                                        <Input
                                            type="text"
                                            name="code_cabin"
                                            id="code_cabin"
                                            placeholder="Enter Document Name"
                                            value={formData.code_cabin}
                                            onChange={handleInputChange}
                                            readonly={true}
                                            className="bg-gray-50"
                                        />
                                        {validationErrors.code_cabin && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.code_cabin}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="master_category">Category *</Label>
                                        <CustomAsyncSelect
                                            name='master_category'
                                            placeholder="Select Category"
                                            onChange={handleSelectChange('master_category')}
                                            value={formData.master_category ? 
                                                asyncSelectHook.masterCategoryOptions?.find((mc) => String(mc.value) === formData.master_category) 
                                                : null
                                            }
                                            error={validationErrors.master_category}
                                            defaultOptions={asyncSelectHook.masterCategoryOptions || []}
                                            loadOptions={asyncSelectHook.loadMasterCategoryOptions}
                                            onMenuScrollToBottom={asyncSelectHook.handleMasterCategoryScrollToBottom}
                                            isLoading={asyncSelectHook.masterCategoryLoading}
                                            noOptionsMessage={() => asyncSelectHook.masterCategoryLoading ? "Loading master categories..." : "No master categories found"}
                                            loadingMessage={() => "Loading categories..."}
                                            isSearchable={true}
                                            inputValue={asyncSelectHook.masterCategorySearchValue}
                                            onInputChange={asyncSelectHook.handleMasterCategorySearchChange}
                                            disabled={true}
                                        />
                                        {validationErrors.master_category && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.master_category}
                                            </p>
                                        )}
                                    </div>

                                    {/* Part Selection */}
                                    {formData.master_category && (
                                        <div>
                                            <Label htmlFor="part_id">Select Part *</Label>
                                            <CustomAsyncSelect
                                                name='part_id'
                                                placeholder="Select Part"
                                                onChange={handleSelectChange('part_id')}
                                                value={formData.part_id ? partOptions?.find((po) => String(po.value) === formData.part_id) : null}
                                                error={validationErrors.part_id}
                                                defaultOptions={partOptions}
                                                loadOptions={loadPartOptions}
                                                onMenuScrollToBottom={asyncSelectHook.handleScrollToBottom}
                                                isLoading={isDataLoading()}
                                                noOptionsMessage={() => isDataLoading() ? "Loading parts..." : "No parts found"}
                                                loadingMessage={() => "Loading parts..."}
                                                isSearchable={true}
                                                inputValue={searchInputValue}
                                                onInputChange={handleSearchInputChange}
                                            />
                                            {isDataLoading() && (
                                                <p className="mt-1 text-sm text-gray-500">Loading parts...</p>
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
                                            <CustomAsyncSelect
                                                name='type_id'
                                                placeholder="Select Type"
                                                onChange={handleSelectChange('type_id')}
                                                value={formData.type_id ? asyncSelectHook.detailCatalogOptions?.find(dco => String(dco.value) === formData.type_id) : null}
                                                error={validationErrors.type_id}
                                                defaultOptions={asyncSelectHook.detailCatalogOptions || []}
                                                loadOptions={asyncSelectHook.loadDetailCatalogOptions}
                                                onMenuScrollToBottom={asyncSelectHook.handleDetailCatalogScrollToBottom}
                                                isLoading={asyncSelectHook.detailCatalogLoading}
                                                noOptionsMessage={() => asyncSelectHook.detailCatalogLoading ? "Loading types..." : "No types found"}
                                                loadingMessage={() => "Loading types..."}
                                                isSearchable={true}
                                                inputValue={asyncSelectHook.detailCatalogSearchValue}
                                                onInputChange={asyncSelectHook.handleDetailCatalogSearchChange}
                                            />
                                            {validationErrors.type_id && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {validationErrors.type_id}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Display selected part information */}
                                    {formData.master_category && formData.part_id && (
                                        <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <h3 className="font-medium text-gray-900 mb-2">Selected Configuration</h3>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p>
                                                    <strong>Category:</strong> {
                                                        asyncSelectHook.masterCategoryOptions?.find((mc: { value: string | number; label: string }) => mc.value === formData.master_category)?.label ||
                                                        'N/A'
                                                    }
                                                </p>
                                                <p>
                                                    <strong>Part:</strong> {
                                                        partOptions?.find((po: { value: string | number; label: string }) => po.value === formData.part_id)?.label || 'N/A'
                                                    }
                                                </p>
                                                <p>
                                                    <strong>Type:</strong> {
                                                        asyncSelectHook.detailCatalogOptions?.find((dco: { value: string | number; label: string }) => dco.value === formData.type_id)?.label || 'N/A'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* SVG Upload Section - Show after type selection */}
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
                                                    existingImageUrl={existingImageUrl}
                                                    onFileChange={(file) => {
                                                        // Update form data dengan file baru atau null
                                                        setFormData((prev: any) => ({
                                                            ...prev,
                                                            svg_image: file // file bisa null jika user hapus
                                                        }));
                                                        
                                                        // Clear validation error jika ada
                                                        if (validationErrors.svg_image) {
                                                            setValidationErrors((prev: any) => {
                                                                const newErrors = { ...prev };
                                                                delete newErrors.svg_image;
                                                                return newErrors;
                                                            });
                                                        }
                                                    }}
                                                    showPreview={true}
                                                    previewSize="lg"
                                                />
                                            </div>

                                            {/* CSV Upload for Parts */}
                                            <div className="md:col-span-2">
                                                <FileUpload
                                                    id="csv_file"
                                                    name="csv_file"
                                                    label="Upload CSV File (Optional)"
                                                    accept=".csv,text/csv"
                                                    acceptedFormats={['csv', 'text/csv']}
                                                    maxSize={10}
                                                    currentFile={null}
                                                    onFileChange={handleCSVUpload}
                                                    description="CSV file containing parts data (will be converted to parts automatically)"
                                                />
                                            </div>

                                            {/* Parts Table Section */}
                                            <div className="md:col-span-2">
                                                <div className="mb-6">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-medium text-gray-900">Parts Management</h3>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={handleAddPart}
                                                            disabled={submitting}
                                                            className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                                                            size="sm"
                                                        >
                                                            <MdAdd className="w-4 h-4" />
                                                            Add Part
                                                        </Button>
                                                    </div>
                                                    
                                                    {/* Parts List */}
                                                    <div className="space-y-4 max-h-96 overflow-y-auto font-secondary">
                                                        {formData.parts.length > 0 ? (
                                                            <>
                                                                {formData.parts.map((part: any, index: number) => {                                                                    
                                                                    return (
                                                                    <div
                                                                        key={part.id}
                                                                        data-part-id={part.id}
                                                                        data-index={index}
                                                                        className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4"
                                                                    >
                                                                        <div className="flex items-center justify-between">
                                                                            <h4 className="text-md font-medium text-gray-700">
                                                                                Part #{index + 1}
                                                                            </h4>
                                                                            <Button
                                                                                type="button"
                                                                                onClick={() => handleRemovePart(part.id)}
                                                                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                                                variant="outline"
                                                                                size="sm"
                                                                            >
                                                                                <MdDelete className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>

                                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                                                                            {/* Part Target */}
                                                                            <div className='md:col-span-2'>
                                                                                <Label htmlFor={`target_id_${part.id}`}>Part Target *</Label>
                                                                                <Input
                                                                                    type="text"
                                                                                    value={part.target_id}
                                                                                    onChange={(e) => handlePartChange(part.id, 'target_id', e.target.value)}
                                                                                    placeholder="e.g., part-1"
                                                                                    className="mt-1"
                                                                                />
                                                                            </div>

                                                                            {/* Part Number */}
                                                                            <div className='md:col-span-2'>
                                                                                <Label htmlFor={`part_number_${part.id}`}>Part Number *</Label>
                                                                                <Input
                                                                                    type="text"
                                                                                    value={part.part_number}
                                                                                    onChange={(e) => handlePartChange(part.id, 'part_number', e.target.value)}
                                                                                    placeholder="Part number"
                                                                                    className="mt-1"
                                                                                />
                                                                            </div>

                                                                            {/* Quantity */}
                                                                            <div className='md:col-span-2'>
                                                                                <Label htmlFor={`quantity_${part.id}`}>Quantity *</Label>
                                                                                <Input
                                                                                    id={`quantity_${part.id}`}
                                                                                    type="text"
                                                                                    min="1"
                                                                                    value={part.quantity}
                                                                                    onChange={(e) => handlePartChange(part.id, 'quantity', parseInt(e.target.value) || 0)}
                                                                                    placeholder="Qty"
                                                                                    className="mt-1"
                                                                                    onKeyPress={handleKeyPress}
                                                                                />
                                                                            </div>

                                                                            {/* Name English */}
                                                                            <div className='md:col-span-3'>
                                                                                <Label htmlFor={`catalog_item_name_en_${part.id}`}>Name (English) *</Label>
                                                                                <Input
                                                                                    type="text"
                                                                                    value={part.catalog_item_name_en}
                                                                                    onChange={(e) => handlePartChange(part.id, 'catalog_item_name_en', e.target.value)}
                                                                                    placeholder="Enter English Name"
                                                                                    className="mt-1"
                                                                                />
                                                                            </div>

                                                                            {/* Name Chinese */}
                                                                            <div className='md:col-span-3'>
                                                                                <Label htmlFor={`catalog_item_name_ch_${part.id}`}>Name (Chinese)</Label>
                                                                                <Input
                                                                                    id={`catalog_item_name_ch_${part.id}`}
                                                                                    type="text"
                                                                                    value={part.catalog_item_name_ch}
                                                                                    onChange={(e) => handlePartChange(part.id, 'catalog_item_name_ch', e.target.value)}
                                                                                    placeholder="Enter Chinese Name"
                                                                                    className="mt-1"
                                                                                />
                                                                            </div>

                                                                            {/* Description */}
                                                                            <div className='md:col-span-3'>
                                                                                <Label htmlFor={`description_${part.id}`}>Description</Label>
                                                                                <Input
                                                                                    id={`description_${part.id}`}
                                                                                    type="text"
                                                                                    value={part.description || ''}
                                                                                    onChange={(e) => handlePartChange(part.id, 'description', e.target.value)}
                                                                                    placeholder="Enter description"
                                                                                    className="mt-1"
                                                                                />
                                                                            </div>

                                                                            {/* Unit */}
                                                                            <div className='md:col-span-3'>
                                                                                <Label htmlFor={`unit_${part.id}`}>Unit</Label>
                                                                                <Input
                                                                                    id={`unit_${part.id}`}
                                                                                    type="text"
                                                                                    value={part.unit || ''}
                                                                                    onChange={(e) => handlePartChange(part.id, 'unit', e.target.value)}
                                                                                    placeholder="Enter unit"
                                                                                    className="mt-1"
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    );
                                                                })}
                                                            </>
                                                        ) : (
                                                            <div className="text-center py-8 text-gray-500">
                                                                <p>No parts added yet. Click "Add Part" or upload a CSV file to get started.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => navigate(`/epc/manage/view/${formData.dokumen_id || id}`)}
                                    className="px-6 rounded-full"
                                    disabled={submitting}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="primary"
                                    disabled={submitting}
                                    className="px-6 flex items-center gap-2 rounded-full"
                                >
                                    <MdSave className="w-4 h-4" />
                                    {submitting ? 'Updating...' : 'Update Catalog'}
                                </Button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}
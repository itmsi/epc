import { useNavigate, Link } from 'react-router-dom';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import FileUpload from '@/components/ui/FileUpload/FileUpload';
import { MdAdd, MdKeyboardArrowLeft, MdDelete } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';

// Import organized types and new hook
import { useCreateCatalog } from '@/hooks/useCreateCatalog';

export default function CreateCatalog() {
    const navigate = useNavigate();
    
    // Use the new organized hook that contains all business logic
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
        
        // Async select hook
        asyncSelectHook
    } = useCreateCatalog();

    // Handle form submission
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const success = await handleSubmit(e);
        
        if (success) {
            navigate('/epc/manage');
        }
    };

    return (
        <>
            <PageMeta 
                title="Create Catalog" 
                description="Create a new catalog by selecting part type and adding parts details"
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
                            <MdAdd size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Catalog</h1>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form className="bg-white rounded-2xl shadow-sm" onSubmit={onSubmit}>
                        <div className="p-8">
                            <div className='md:min-h-[800px]' >
                                    
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
                                            value={formData.master_category ? asyncSelectHook.masterCategoryOptions?.find((mc) => String(mc.value) === formData.master_category) : null}
                                            error={validationErrors.master_category}
                                            defaultOptions={asyncSelectHook.masterCategoryOptions}
                                            loadOptions={asyncSelectHook.loadMasterCategoryOptions}
                                            onMenuScrollToBottom={asyncSelectHook.handleMasterCategoryScrollToBottom}
                                            isLoading={asyncSelectHook.masterCategoryLoading}
                                            noOptionsMessage={() => asyncSelectHook.masterCategoryLoading ? "Loading master categories..." : "No master categories found"}
                                            loadingMessage={() => "Loading categories..."}
                                            isSearchable={true}
                                            inputValue={asyncSelectHook.masterCategorySearchValue}
                                            onInputChange={asyncSelectHook.handleMasterCategorySearchChange}
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
                                                isLoading={catalogueDataLoading}
                                                noOptionsMessage={() => catalogueDataLoading ? "Loading parts..." : "No parts found"}
                                                loadingMessage={() => "Loading parts..."}
                                                isSearchable={true}
                                                inputValue={searchInputValue}
                                                onInputChange={handleSearchInputChange}
                                            />
                                            {catalogueDataLoading && (
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
                                                defaultOptions={asyncSelectHook.detailCatalogOptions}
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
                                    {formData.master_category && formData.part_id && formData.type_id && (
                                        <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <h3 className="font-medium text-gray-900 mb-2">Selected Configuration</h3>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p>
                                                    <strong>Category:</strong> {
                                                        asyncSelectHook.masterCategoryOptions?.find(mc => mc.value === formData.master_category)?.label || 'N/A'
                                                    }
                                                </p>
                                                <p>
                                                    <strong>Part:</strong> {
                                                        partOptions?.find(po => po.value === formData.part_id)?.label || 'N/A'
                                                    }
                                                </p>
                                                <p>
                                                    <strong>Type:</strong> {
                                                        asyncSelectHook.detailCatalogOptions?.find(dco => dco.value === formData.type_id)?.label || 'N/A'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* CSV Upload Section - Show after type selection */}
                                    {formData.master_category && formData.part_id && formData.type_id && (
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
                                                            disabled={loading}
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
                                                                {formData.parts.map((part, index) => (
                                                                    <div
                                                                        key={part.id}
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
                                                                                    type="number"
                                                                                    min="1"
                                                                                    value={part.quantity}
                                                                                    onChange={(e) => handlePartChange(part.id, 'quantity', parseInt(e.target.value) || 0)}
                                                                                    placeholder="Qty"
                                                                                    className="mt-1"
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
                                                                                <Label htmlFor={`catalog_item_name_ch_${part.id}`}>Name (Chinese) *</Label>
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
                                                                ))}
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
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-gray-200">
                                <Button 
                                    type="button" 
                                    variant="outline"
                                    onClick={() => navigate('/epc/manage')}
                                    className="px-6 rounded-full"
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button 
                                    type="submit" 
                                    variant="primary"
                                    disabled={loading}
                                    className="px-6 flex items-center gap-2 rounded-full"
                                >
                                    
                                    {loading ? 'Creating...' : 'Create Catalog'}
                                </Button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}
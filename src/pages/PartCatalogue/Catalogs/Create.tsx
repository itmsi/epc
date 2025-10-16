import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import FileUpload from '@/components/ui/FileUpload';
import { MdAdd, MdKeyboardArrowLeft, MdSave, MdDelete } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';

// Import organized types, hooks, and services
import { 
    PART_TYPES, 
    PartType, 
    SelectOption 
} from '@/types/asyncSelect';
import { usePartCatalogueManagement } from '@/hooks/usePartCatalogueManagement';
import { useAsyncSelect } from '@/hooks/useCustomAsyncSelect';
import { AsyncSelectService } from '@/services/customAsyncSelectService';

export default function CreateCatalog() {
    const navigate = useNavigate();
    
    // Use the organized hooks
    const {
        formData,
        validationErrors,
        partCatalogueData,
        catalogueDataLoading,
        selectedPartData,
        subTypes,
        getSubTypeOptions,
        handleSelectChange,
        handleInputChange,
        handleCheckboxChange,
        handleAddPart,
        handleRemovePart,
        handlePartChange,
        handleSubmit,
        loading
    } = usePartCatalogueManagement();

    // Use the async select hook for pagination and search
    const asyncSelectHook = useAsyncSelect({
        partType: formData.part_type as PartType,
        partCatalogueData
    });

    // Get options for part selection
    const getPartOptions = (): SelectOption[] => {
        if (!formData.part_type) return [{ value: '', label: 'Select Part Type First' }];

        const baseOptions = AsyncSelectService.createDefaultOptions(formData.part_type);
        const partData = getPartDataByType();
        
        if (!partData.length) return baseOptions;

        const transformedOptions = AsyncSelectService.transformPartDataToOptions(
            formData.part_type as PartType, 
            partData
        );
        
        return baseOptions.concat(transformedOptions);
    };

    // Helper to get part data by type
    const getPartDataByType = () => {
        switch (formData.part_type) {
            case 'cabin': return partCatalogueData.cabins || [];
            case 'engine': return partCatalogueData.engines || [];
            case 'axle': return partCatalogueData.axles || [];
            case 'transmission': return partCatalogueData.transmissions || [];
            case 'steering': return partCatalogueData.steerings || [];
            default: return [];
        }
    };

    // Create load options function for AsyncSelect with search capability
    const loadPartOptions = async (searchQuery: string): Promise<SelectOption[]> => {
        const allOptions = getPartOptions();
        return AsyncSelectService.createLoadOptions(allOptions, true)(searchQuery);
    };

    // Check if data is loading
    const isDataLoading = () => {
        return catalogueDataLoading || asyncSelectHook.isLoading;
    };

    // Handle form submission with navigation
    const onSubmit = async (e: React.FormEvent) => {
        await handleSubmit(e);
        // Navigate on success (handleSubmit will show success toast)
        if (Object.keys(validationErrors).length === 0) {
            navigate('/epc/manage');
        }
    };

    // Get part options with fallback to async select hook options
    const partOptions = asyncSelectHook.partOptions.length > 0 ? 
        asyncSelectHook.partOptions : getPartOptions();

    return (
        <>
            <PageMeta
                title="Create Catalog | MSI"
                description="Create new catalog for part catalogue"
                image="/motor-sights-international.png"
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

                    {/* FORM */}
                    <form onSubmit={onSubmit} className="bg-white rounded-2xl shadow-sm">
                        <div className="p-8">
                            <div className='min-h-[800px]' >
                                    
                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">
                                    Part Configuration
                                </h2>

                                <div className='grid grid-cols-1 md:grid-cols-2 gap-6 my-5 font-secondary'>
                                    {/* Part Type Selection */}
                                    <div>
                                        <Label htmlFor="code_cabin">Code Cabin *</Label>
                                        <Input
                                            id="code_cabin"
                                            name="code_cabin"
                                            type="text"
                                            value={formData.code_cabin}
                                            onChange={handleInputChange}
                                            placeholder="e.g., CAB-001"
                                        />
                                        {validationErrors.code_cabin && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.code_cabin}
                                            </p>
                                        )}
                                    </div>
                                    <div>
                                        <Label htmlFor="part_type">Part Type *</Label>
                                        <CustomSelect
                                            placeholder="Select Part Type"
                                            onChange={handleSelectChange('part_type')}
                                            options={PART_TYPES}
                                            value={formData.part_type ? PART_TYPES.find(pt => pt.value === formData.part_type) : null}
                                            error={validationErrors.part_type}
                                        />
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
                                            <CustomAsyncSelect
                                                name='part_id'
                                                placeholder={`Select ${PART_TYPES.find(pt => pt.value === formData.part_type)?.label}`}
                                                onChange={handleSelectChange('part_id')}
                                                value={formData.part_id ? partOptions.find((po) => String(po.value) === formData.part_id) : null}
                                                error={validationErrors.part_id}
                                                defaultOptions={partOptions}
                                                loadOptions={loadPartOptions}
                                                onMenuScrollToBottom={asyncSelectHook.handleScrollToBottom}
                                                isLoading={isDataLoading()}
                                                noOptionsMessage={() => catalogueDataLoading ? `Loading ${formData.part_type} data...` : `No ${formData.part_type} found`}
                                                loadingMessage={() => `Loading ${formData.part_type} data...`}
                                                isSearchable={true}
                                            />
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
                                            <CustomSelect
                                                name='type_id'
                                                placeholder="Select Type"
                                                onChange={handleSelectChange('type_id')}
                                                options={getSubTypeOptions()}
                                                value={formData.type_id ? getSubTypeOptions().find((option) => String(option.value) === formData.type_id) : null}
                                                error={validationErrors.type_id}
                                            />
                                            {validationErrors.type_id && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {validationErrors.type_id}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Selected Data Preview */}
                                    {selectedPartData && formData.type_id && (
                                        <div className="md:col-span-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <h3 className="font-medium text-gray-900 mb-2">Selected Configuration</h3>
                                            <div className="text-sm text-gray-600 space-y-1">
                                                <p><strong>Part Type:</strong> {PART_TYPES.find(pt => pt.value === formData.part_type)?.label}</p>
                                                <p><strong>Part:</strong> {
                                                    formData.part_type === 'cabin' ? `${selectedPartData.cabines_name_en} - ${selectedPartData.cabines_name_cn}` :
                                                    formData.part_type === 'engine' ? `${selectedPartData.engines_name_en} - ${selectedPartData.engines_name_cn}` :
                                                    formData.part_type === 'axle' ? `${selectedPartData.axel_name_en} - ${selectedPartData.axel_name_cn}` :
                                                    formData.part_type === 'transmission' ? `${selectedPartData.transmission_name_en} - ${selectedPartData.transmission_name_cn}` :
                                                    formData.part_type === 'steering' ? `${selectedPartData.steering_name_en} - ${selectedPartData.steering_name_cn}` : ''
                                                }</p>
                                                <p><strong>Type:</strong> {
                                                    subTypes.find(type => {
                                                        switch (formData.part_type) {
                                                            case 'cabin': return type.type_cabine_id === formData.type_id;
                                                            case 'engine': return type.type_engine_id === formData.type_id;
                                                            case 'axle': return type.type_axel_id === formData.type_id;
                                                            case 'transmission': return type.type_transmission_id === formData.type_id;
                                                            case 'steering': return type.type_steeringwheel_id === formData.type_id;
                                                            default: return false;
                                                        }
                                                    })?.[
                                                        formData.part_type === 'cabin' ? 'type_cabine_name_en' :
                                                        formData.part_type === 'engine' ? 'type_engine_name_en' :
                                                        formData.part_type === 'axle' ? 'type_axel_name_en' :
                                                        formData.part_type === 'transmission' ? 'type_transmission_name_en' :
                                                        formData.part_type === 'steering' ? 'type_steeringwheel_name_en' : ''
                                                    ]
                                                }</p>
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
                                                    icon="image"
                                                    acceptedFormats={['svg', 'image/svg+xml']}
                                                    maxSize={5}
                                                    currentFile={formData.svg_image}
                                                    onFileChange={(file) => {
                                                        formData.svg_image = file;
                                                        if (validationErrors.svg_image) {
                                                            delete validationErrors.svg_image;
                                                        }
                                                    }}
                                                    validationError={validationErrors.svg_image}
                                                    description="SVG image for the catalog part (optional)"
                                                    showPreview={true}
                                                    previewSize="lg"
                                                />
                                            </div>

                                            {/* CSV Upload Toggle */}
                                            <div className="md:col-span-2">
                                                <div className="flex items-center">
                                                    <input
                                                        id="use_csv_upload"
                                                        name="use_csv_upload"
                                                        type="checkbox"
                                                        checked={formData.use_csv_upload}
                                                        onChange={handleCheckboxChange}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <Label htmlFor="use_csv_upload" className="ml-2 cursor-pointer mb-0">
                                                        Upload CSV file for parts data
                                                    </Label>
                                                </div>
                                            </div>

                                            {/* CSV File Upload */}
                                            {formData.use_csv_upload && (
                                                <div className="md:col-span-2">
                                                    <FileUpload
                                                        id="csv_file"
                                                        name="csv_file"
                                                        label="Upload CSV File"
                                                        accept=".csv"
                                                        icon="upload"
                                                        acceptedFormats={['csv', '.csv']}
                                                        maxSize={10}
                                                        currentFile={formData.csv_file}
                                                        onFileChange={(file) => {
                                                            formData.csv_file = file;
                                                            if (validationErrors.csv_file) {
                                                                delete validationErrors.csv_file;
                                                            }
                                                        }}
                                                        validationError={validationErrors.csv_file}
                                                        required
                                                        description="CSV file containing parts data"
                                                        showPreview={true}
                                                        previewSize="md"
                                                    />
                                                </div>
                                            )}

                                            {/* Manual Parts Input */}
                                            {!formData.use_csv_upload && (
                                                <div className="md:col-span-2">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h3 className="text-lg font-medium text-gray-900">Parts Information</h3>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={handleAddPart}
                                                            className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                                                            size="sm"
                                                        >
                                                            <MdAdd className="w-4 h-4" />
                                                            Add Part
                                                        </Button>
                                                    </div>

                                                    {/* Parts List */}
                                                    <div className="space-y-4 max-h-96 overflow-y-auto font-secondary">
                                                        {formData.parts.length === 0 && (
                                                            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                                                                <p>No parts added. Click "Add Part" to add parts information.</p>
                                                            </div>
                                                        )}

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
                                                                        <Label htmlFor={`part_target_${part.id}`}>Part Target *</Label>
                                                                        <Input
                                                                            id={`part_target_${part.id}`}
                                                                            type="text"
                                                                            value={part.part_target}
                                                                            onChange={(e) => handlePartChange(part.id, 'part_target', e.target.value)}
                                                                            placeholder="e.g., part-1"
                                                                            className="mt-1"
                                                                        />
                                                                    </div>

                                                                    {/* Part Number */}
                                                                    <div className='md:col-span-2'>
                                                                        <Label htmlFor={`code_product_${part.id}`}>Part Number *</Label>
                                                                        <Input
                                                                            id={`code_product_${part.id}`}
                                                                            type="text"
                                                                            value={part.code_product}
                                                                            onChange={(e) => handlePartChange(part.id, 'code_product', e.target.value)}
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
                                                                            onChange={(e) => handlePartChange(part.id, 'quantity', e.target.value)}
                                                                            className="mt-1"
                                                                        />
                                                                    </div>

                                                                    {/* Name English */}
                                                                    <div className='md:col-span-3'>
                                                                        <Label htmlFor={`name_english_${part.id}`}>Name (English) *</Label>
                                                                        <Input
                                                                            id={`name_english_${part.id}`}
                                                                            type="text"
                                                                            value={part.name_english}
                                                                            onChange={(e) => handlePartChange(part.id, 'name_english', e.target.value)}
                                                                            placeholder="English name"
                                                                            className="mt-1"
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
                                                                            placeholder="Chinese name"
                                                                            className="mt-1"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {validationErrors.parts && (
                                                        <p className="mt-2 text-sm text-red-600">
                                                            {validationErrors.parts}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* General Error */}
                                    {validationErrors.general && (
                                        <div className="md:col-span-2">
                                            <p className="text-sm text-red-600">
                                                {validationErrors.general}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Form Actions */}
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
                                    disabled={loading}
                                    className="px-6 flex items-center gap-2 rounded-full"
                                >
                                    <MdSave className="w-4 h-4" />
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

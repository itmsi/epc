import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import FileUpload from '@/components/ui/FileUpload';
import { MdEdit, MdKeyboardArrowLeft, MdSave, MdDelete, MdAdd } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';

// Import organized types, hooks, and services
import { 
    PART_TYPES, 
    PartType, 
    SelectOption 
} from '@/types/asyncSelect';
// import { useEditCatalog } from '@/hooks/useEditCatalog';
import { useAsyncSelect } from '@/hooks/useCustomAsyncSelect';
import { AsyncSelectService } from '@/services/customAsyncSelectService';
import { CatalogAsyncSelectService } from '@/services/catalogAsyncSelectService';
import { useEditCatalog } from '@/hooks/useManageCatalogs';

export default function EditCatalog() {
    const navigate = useNavigate();
    
    // Use the edit catalog hook
    const {
        formData,
        setFormData,
        validationErrors,
        setValidationErrors,
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
        loading,
        loadingCatalog,
        catalogData
    } = useEditCatalog();

    // Use the async select hook for pagination and search
    const asyncSelectHook = useAsyncSelect({
        partType: formData.part_type as PartType,
        partCatalogueData
    });

    // Helper to get part data by type
    const getPartDataByType = React.useCallback(() => {
        switch (formData.part_type) {
            case 'cabin': return partCatalogueData.cabins || [];
            case 'engine': return partCatalogueData.engines || [];
            case 'axle': return partCatalogueData.axles || [];
            case 'transmission': return partCatalogueData.transmissions || [];
            case 'steering': return partCatalogueData.steerings || [];
            default: return [];
        }
    }, [formData.part_type, partCatalogueData]);

    // Get options for part selection
    const getPartOptions = React.useCallback((): SelectOption[] => {
        if (!formData.part_type) return [{ value: '', label: 'Select Part Type First' }];

        const baseOptions = AsyncSelectService.createDefaultOptions(`Select ${formData.part_type}`);
        const partData = getPartDataByType();
        
        if (!partData.length) return baseOptions;

        const transformedOptions = CatalogAsyncSelectService.transformPartDataToOptions(
            formData.part_type as PartType, 
            partData
        );
        
        return baseOptions.concat(transformedOptions);
    }, [formData.part_type, getPartDataByType]);

    // Memoize part options to prevent unnecessary recalculations
    const partOptions = React.useMemo(() => {
        if (asyncSelectHook.partOptions.length > 0) {
            return asyncSelectHook.partOptions;
        }
        return getPartOptions();
    }, [asyncSelectHook.partOptions, getPartOptions]);

    // Create load options function for AsyncSelect with search capability
    const loadPartOptions = React.useCallback(async (searchQuery: string): Promise<SelectOption[]> => {
        const allOptions = getPartOptions();
        return AsyncSelectService.createLoadOptions(allOptions, true)(searchQuery);
    }, [getPartOptions]);

    // Check if data is loading
    const isDataLoading = () => {
        return catalogueDataLoading || asyncSelectHook.isLoading || loadingCatalog;
    };

    // Handle form submission with navigation
    const onSubmit = async (e: React.FormEvent) => {
        await handleSubmit(e);
    };

    // Show loading screen while fetching catalog data
    if (loadingCatalog) {
        return (
            <>
                <PageMeta
                    title="Edit Catalog | MSI"
                    description="Edit catalog for part catalogue"
                    image="/motor-sights-international.png"
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
                    title="Edit Catalog | MSI"
                    description="Edit catalog for part catalogue"
                    image="/motor-sights-international.png"
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
                title="Edit Catalog | MSI"
                description="Edit catalog for part catalogue"
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
                            <MdEdit size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Catalog</h1>
                            {catalogData && (
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full ml-3">
                                    {catalogData.name_pdf}
                                </span>
                            )}
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
                                    {/* Code Cabin */}
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

                                    {/* Part Type Selection */}
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
                                        <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <h3 className="font-medium text-gray-900 mb-2">Current Configuration</h3>
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
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                csv_file: file
                                                            }));
                                                            if (validationErrors.csv_file) {
                                                                setValidationErrors(prev => {
                                                                    const newErrors = { ...prev };
                                                                    delete newErrors.csv_file;
                                                                    return newErrors;
                                                                });
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

                                                                    {/* Code Product */}
                                                                    <div className='md:col-span-2'>
                                                                        <Label htmlFor={`code_product_${part.id}`}>Code Product *</Label>
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
                                    {loading ? 'Updating...' : 'Update Catalog'}
                                </Button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}

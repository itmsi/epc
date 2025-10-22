import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import CustomSelect from '@/components/form/select/CustomSelect';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import FileUpload from '@/components/ui/FileUpload/FileUpload';
import { MdEdit, MdKeyboardArrowLeft, MdSave, MdDelete, MdAdd } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import Papa from 'papaparse';
import toast from 'react-hot-toast';

// Import organized types, hooks, and services
import { 
    PART_TYPES, 
    PartType, 
    SelectOption 
} from '@/types/asyncSelect';
import { CatalogAsyncSelectService, useAsyncSelect } from '@/hooks/useCustomAsyncSelect';
import { AsyncSelectService } from '@/services/customAsyncSelectService';
import { useEditCatalog } from '@/hooks/useManageCatalogs';

export default function EditCatalog() {
    const navigate = useNavigate();
    
    // State untuk search input
    const [searchInputValue, setSearchInputValue] = React.useState('');
    
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
        handleAddPart,
        handleRemovePart,
        handlePartChange,
        handleSubmit,
        loadingCatalog,
        submitting,
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

    // Handle search input change
    const handleSearchInputChange = (inputValue: string) => {
        setSearchInputValue(inputValue);
        console.log('Search input changed to:', `"${inputValue}"`);
    };

    // Clear search input when part type changes
    React.useEffect(() => {
        setSearchInputValue('');
    }, [formData.part_type]);

    // Parse CSV file and convert to parts data
    const parseCSVFile = (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            Papa.parse<Record<string, string>>(file, {
                header: true,
                skipEmptyLines: true,
                transform: (value: string) => {
                    // Trim whitespace from all values
                    return typeof value === 'string' ? value.trim() : value;
                },
                complete: (results: Papa.ParseResult<Record<string, string>>) => {
                    if (results.errors.length > 0) {
                        console.error('CSV parsing errors:', results.errors);
                        toast.error('CSV parsing failed: ' + results.errors[0].message);
                        reject(new Error('CSV parsing failed: ' + results.errors[0].message));
                        return;
                    }

                    try {
                        // Map CSV data to internal part structure
                        const parsedParts: any[] = results.data.map((row: any, index: number) => {
                            // Validate required fields
                            const requiredFields = ['target_id', 'part_number', 'catalog_item_name_en', 'catalog_item_name_ch', 'quantity'];
                            const missingFields = requiredFields.filter(field => !row[field]);
                            
                            if (missingFields.length > 0) {
                                throw new Error(`Row ${index + 1}: Missing required fields: ${missingFields.join(', ')}`);
                            }

                            // Convert to internal format
                            return {
                                id: `csv-${Date.now()}-${index}`,
                                part_target: row.target_id || '',
                                code_product: row.part_number || '',
                                quantity: parseInt(row.quantity) || 1,
                                name_english: row.catalog_item_name_en || '',
                                name_chinese: row.catalog_item_name_ch || '',
                                file_foto: null
                            };
                        });

                        toast.success(`Successfully parsed ${parsedParts.length} parts from CSV`);
                        resolve(parsedParts);
                    } catch (error: any) {
                        toast.error('Error processing CSV data: ' + error.message);
                        reject(error);
                    }
                },
                error: (error: Error) => {
                    toast.error('Failed to parse CSV file: ' + error.message);
                    reject(new Error('Failed to parse CSV file: ' + error.message));
                }
            });
        });
    };

    // Handle CSV file upload and parsing
    const handleCSVUpload = React.useCallback(async (file: File | null) => {
        if (!file) return;

        // Update form data with the file
        setFormData(prev => ({
            ...prev,
            csv_file: file
        }));

        // Clear CSV validation errors
        if (validationErrors.csv_file) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.csv_file;
                return newErrors;
            });
        }

        try {
            // Parse CSV and populate parts
            const parsedParts = await parseCSVFile(file);
            
            // Update form data with parsed parts
            setFormData(prev => ({
                ...prev,
                parts: parsedParts
            }));

            toast.success(`Successfully imported ${parsedParts.length} parts from CSV`);
        } catch (error: any) {
            console.error('CSV upload error:', error);
            toast.error('Failed to process CSV file: ' + error.message);
            
            // Clear the file from form data if parsing failed
            setFormData(prev => ({
                ...prev,
                csv_file: null
            }));
        }
    }, [setFormData, validationErrors.csv_file, setValidationErrors]);

    // Check if data is loading
    const isDataLoading = () => {
        return catalogueDataLoading || asyncSelectHook.isLoading || loadingCatalog;
    };

    // Handle form submission with navigation
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await handleSubmit(e);
        
        if (Object.keys(validationErrors).length === 0) {
            navigate('/epc/manage');
        }
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

                    {/* Form Section */}
                    <form className="bg-white rounded-2xl shadow-sm" onSubmit={onSubmit}>
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
                                                inputValue={searchInputValue}
                                                onInputChange={handleSearchInputChange}
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
                                                placeholder="Select Type"
                                                onChange={handleSelectChange('type_id')}
                                                options={getSubTypeOptions()}
                                                value={formData.type_id ? getSubTypeOptions().find(sto => sto.value === formData.type_id) : null}
                                                isLoading={catalogueDataLoading}
                                            />
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
                                                    currentFile={formData.csv_file}
                                                    onFileChange={handleCSVUpload}
                                                    description="CSV file containing parts data"
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
                                                                                <Label htmlFor={`part_target_${part.id}`}>Part Target *</Label>
                                                                                <Input
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
                                                                                    onChange={(e) => handlePartChange(part.id, 'quantity', parseInt(e.target.value) || 0)}
                                                                                    placeholder="Qty"
                                                                                    className="mt-1"
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
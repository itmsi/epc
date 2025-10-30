import { Link, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdSave, MdAdd, MdDelete } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import PageMeta from '@/components/common/PageMeta';
import { useCreateVin, useMasterVinManager } from '@/hooks/useManageVins';
import TextArea from '@/components/form/input/TextArea';

export default function CreateVin() {
    const navigate = useNavigate();
    
    // Use custom hooks for state and actions
    const {
        formData,
        errors,
        submitting,
        searchInputValues,
        handleInputChange,
        addMasterPdf,
        removeMasterPdf,
        updateMasterPdfSelection,
        handleDetailInputChange,
        handleSearchInputChange,
        handleSubmit
    } = useCreateVin();

    const {
        loading,
        loadCatalogOptions,
        handleMenuScrollToBottom,
        createCatalogOptions
    } = useMasterVinManager();

    return (
        <>
            <PageMeta
                title="Create VIN | MSI"
                description="Create new VIN production data"
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
                            <MdAdd size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create New VIN</h1>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm">
                        <div className="p-8">
                            <div className='md:min-h-[800px]'>

                                <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">
                                    Vin Configuration
                                </h2>

                                {/* Vin Configuration */}
                                <div className="space-y-4 my-5">
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* VIN Number */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                VIN Number <span className="text-red-500">*</span>
                                            </label>
                                            <Input
                                                name="vin_number"
                                                type="text"
                                                value={formData.vin_number}
                                                onChange={(e) => handleInputChange('vin_number', e.target.value)}
                                                placeholder="Enter VIN number"
                                                error={!!errors.vin_number}
                                            />
                                            {errors.vin_number && (
                                                <p className="mt-1 text-sm text-red-600">{errors.vin_number}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Production Name EN */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Product Name (English)
                                                </label>
                                                <Input
                                                    name="product_name_en"
                                                    type="text"
                                                    value={formData.product_name_en}
                                                    onChange={(e) => handleInputChange('product_name_en', e.target.value)}
                                                    placeholder="Enter production name in English"
                                                    error={!!errors.product_name_en}
                                                />
                                                {errors.product_name_en && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.product_name_en}</p>
                                                )}
                                            </div>

                                            {/* Production Name CN */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Product Name (Chinese)
                                                </label>
                                                <Input
                                                    name="product_name_cn"
                                                    type="text"
                                                    value={formData.product_name_cn}
                                                    onChange={(e) => handleInputChange('product_name_cn', e.target.value)}
                                                    placeholder="Enter production name in Chinese"
                                                    error={!!errors.product_name_cn}
                                                />
                                                {errors.product_name_cn && (
                                                    <p className="mt-1 text-sm text-red-600">{errors.product_name_cn}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Production Description
                                        </label>
                                        <TextArea
                                            name="product_description"
                                            value={formData.product_description || ''}
                                            onChange={(e) => handleInputChange('product_description', e.target.value)}
                                            placeholder="Enter production description"
                                            rows={3}
                                        />
                                    </div>
                                </div>

                                {/* Master Catalog Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Master Catalog Documents
                                        </h3>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addMasterPdf}
                                            className="rounded-md w-full md:w-40 flex items-center justify-center gap-2"
                                            size="sm"
                                        >
                                            <MdAdd className="w-4 h-4" />
                                            Add Catalog
                                        </Button>
                                    </div>

                                    <div className="space-y-4 font-secondary">
                                        {formData.data_details && formData.data_details.length > 0 ? (
                                            <>
                                                {formData.data_details.map((detail, index) => (
                                                    <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="text-md font-medium text-gray-700">
                                                                Catalog Document #{index + 1}
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
                                                        
                                                        {/* Catalog Selection */}
                                                        <div className="space-y-4">
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Select Catalog Document <span className="text-red-500">*</span>
                                                                </label>
                                                                <CustomAsyncSelect
                                                                    name={`dokumen_${index}`}
                                                                    placeholder="Select catalog document"
                                                                    value={detail.dokumen_id ? 
                                                                        createCatalogOptions().find(opt => opt.value === detail.dokumen_id) || null 
                                                                        : null
                                                                    }
                                                                    onChange={(selectedOption) => updateMasterPdfSelection(index, selectedOption)}
                                                                    defaultOptions={createCatalogOptions()}
                                                                    loadOptions={loadCatalogOptions}
                                                                    onMenuScrollToBottom={handleMenuScrollToBottom}
                                                                    isLoading={loading}
                                                                    noOptionsMessage={() => loading ? 'Loading catalogs...' : 'No catalogs found'}
                                                                    loadingMessage={() => 'Loading catalogs...'}
                                                                    isSearchable={true}
                                                                    isClearable={true}
                                                                    inputValue={searchInputValues[index] || ''}
                                                                    onInputChange={handleSearchInputChange(index)}
                                                                />
                                                            </div>
                                                            
                                                            {/* Detail Information */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Product Detail Name (English) <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <Input
                                                                        name={`product_detail_name_en_${index}`}
                                                                        type="text"
                                                                        value={detail.product_detail_name_en}
                                                                        onChange={(e) => handleDetailInputChange(index, 'product_detail_name_en', e.target.value)}
                                                                        placeholder="Enter product detail name in English"
                                                                    />
                                                                </div>
                                                                
                                                                <div>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                        Product Detail Name (Chinese) <span className="text-red-500">*</span>
                                                                    </label>
                                                                    <Input
                                                                        name={`product_detail_name_cn_${index}`}
                                                                        type="text"
                                                                        value={detail.product_detail_name_cn}
                                                                        onChange={(e) => handleDetailInputChange(index, 'product_detail_name_cn', e.target.value)}
                                                                        placeholder="Enter product detail name in Chinese"
                                                                    />
                                                                </div>
                                                            </div>
                                                            
                                                            <div>
                                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                                    Product Detail Description <span className="text-red-500">*</span>
                                                                </label>
                                                                <TextArea
                                                                    name={`product_detail_description_${index}`}
                                                                    value={detail.product_detail_description}
                                                                    onChange={(e) => handleDetailInputChange(index, 'product_detail_description', e.target.value)}
                                                                    placeholder="Enter product detail description"
                                                                    rows={3}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <p>No catalog documents added yet.</p>
                                                <p className="text-sm">Click "Add Catalog" to add catalog documents.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/epc/vins')}
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
                                    {submitting ? 'Creating...' : 'Create VIN'}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
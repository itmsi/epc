import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { TypeCategoryForm } from "@/components/form/TypeForms";
import { CategoryService } from "@/services/partCatalogueService";
import { useEditCategory } from "@/hooks/usePartCatalogue";
import { Category } from "@/types/partCatalogue";
import { MdEdit, MdKeyboardArrowLeft, MdSave, MdDelete, MdCancel } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import CustomAsyncSelect from "@/components/form/select/CustomAsyncSelect";
import { useCreateCategoryEnhanced } from '@/hooks/useCreateCategoryEnhanced';

export default function View() {
    const navigate = useNavigate();
    const { CategoryId } = useParams<{ CategoryId: string }>();
    const [category, setCategory] = useState<Category | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);

    // Fetch category data
    useEffect(() => {
        const fetchCategory = async () => {
            if (!CategoryId) {
                toast.error('Category ID is required');
                return;
            }

            try {
                setFetchLoading(true);
                const response = await CategoryService.getCategoryById(CategoryId);
                
                if (response.data.success) {
                    const categoryData = response.data.data;
                    setCategory(categoryData);
                } else {
                    throw new Error('Failed to fetch category data');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transmission data';
                toast.error(errorMessage);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchCategory();
    }, [CategoryId]);

    // Use edit category hook for form functionality
    const {
        formData,
        validationErrors,
        loading,
        handleInputChange,
        handleTypeCategorysChange,
        handleSubmit: originalHandleSubmit
    } = useEditCategory(category, () => {
        setIsEditMode(false);
        toast.success('Category updated successfully');
    });

    // Use enhanced hook for async select functionality
    const {
        searchInputValue,
        handleSearchInputChange,
        masterCategoryOptions,
        loadMasterCategoryOptions,
        masterCategoryLoading,
        handleSelectChange,
        handleScrollToBottom
    } = useCreateCategoryEnhanced();

    // Custom submit handler for edit mode only
    const handleSubmit = (e?: React.FormEvent) => {
        if (e) {
            e.preventDefault();
        }
        if (isEditMode) {
            // Create a synthetic form event for originalHandleSubmit
            const syntheticEvent = {
                preventDefault: () => {},
                currentTarget: {},
                target: {}
            } as React.FormEvent;
            originalHandleSubmit(syntheticEvent);
        }
    };

    // Handle delete category
    const handleDelete = async () => {
        if (!CategoryId) return;
        
        const confirmed = window.confirm('Are you sure you want to delete this category?');
        if (!confirmed) return;

        try {
            const response = await CategoryService.deleteCategory(CategoryId);
            if (response.data.success) {
                toast.success('Category deleted successfully');
                navigate('/epc/category');
            } else {
                throw new Error('Failed to delete category');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete category';
            toast.error(errorMessage);
        }
    };

    // Toggle edit mode
    const toggleEditMode = () => {
        setIsEditMode(!isEditMode);
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        <p className="text-gray-500">Category not found</p>
                        <Button
                            onClick={() => navigate('/epc/category')}
                            className="mt-4"
                        >
                            Back to Categories
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
    const handleCancel = () => {
        setIsEditMode(false);
    };
    return (
        <>
            <PageMeta
                title={`${isEditMode ? 'Edit' : 'View'} Category - ${category.category_name_en} | MSI`}
                description={`${isEditMode ? 'Edit' : 'View'} category information for ${category.category_name_en}`}
                image="/motor-sights-international.png"
            />
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto p-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/epc/category">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">
                                {isEditMode ? 'Edit Category' : 'View Category'}
                            </h1>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className='flex gap-3'>
                            {!isEditMode ? (
                                // View mode buttons
                                <>
                                    <Button
                                        variant="outline"
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary py-2 hover:bg-[#0253a5] hover:text-white"
                                        onClick={toggleEditMode}
                                        disabled={loading}
                                    >
                                        <MdEdit size={20} className="text-primary group-hover:text-white" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#e7000b] font-secondary py-2 hover:bg-red-600 hover:text-white"
                                        onClick={handleDelete}
                                        disabled={loading}
                                    >
                                        <MdDelete size={20} className="text-red-600 group-hover:text-white" /> Delete
                                    </Button>
                                </>
                            ) : (
                                // Edit mode buttons
                                <>
                                    <Button
                                        variant="primary"
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary py-2 bg-[#0253a5] text-white"
                                        disabled={loading}
                                        onClick={handleSubmit}
                                    >
                                        <MdSave size={20} /> Save
                                    </Button>
                                    <Link to="/epc/category">
                                        <Button
                                            variant="outline"
                                            className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 font-secondary py-2"
                                            disabled={loading}
                                            onClick={handleCancel}
                                        >
                                            <MdCancel size={20} /> Cancel
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Form/View Container */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="md:col-span-1 p-8 relative space-y-5 min-h-[770px]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Type Category</h2>
                                    
                                    {/* Master Category Selection */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="master_category_id">Master Category *</Label>
                                        {isEditMode ? (
                                            <CustomAsyncSelect
                                                name='master_category_id'
                                                placeholder={`Select Master Category`}
                                                onChange={handleSelectChange('master_category_id')}
                                                value={formData.master_category_id ? masterCategoryOptions.find((po: any) => String(po.value) === formData.master_category_id) : null}
                                                error={validationErrors.master_category_id}
                                                defaultOptions={masterCategoryOptions}
                                                loadOptions={loadMasterCategoryOptions}
                                                onMenuScrollToBottom={handleScrollToBottom}
                                                isLoading={masterCategoryLoading}
                                                noOptionsMessage={() => masterCategoryLoading ? `Loading master category data...` : `No master category found`}
                                                loadingMessage={() => `Loading master category data...`}
                                                isSearchable={true}
                                                inputValue={searchInputValue}
                                                onInputChange={handleSearchInputChange}
                                            />
                                        ) : (
                                            <Input
                                                id="master_category_id"
                                                name="master_category_id"
                                                type="text"
                                                value={formData.master_category_name_en}
                                                onChange={handleInputChange}
                                                placeholder="Enter category name in English"
                                                readonly={!isEditMode}
                                                className={validationErrors.category_name_en ? 'border-red-500 focus:border-red-500' : ''}
                                            />
                                        )}
                                        {masterCategoryLoading && (
                                            <p className="mt-1 text-sm text-gray-500">Loading master category data...</p>
                                        )}
                                        {isEditMode && validationErrors.master_category_id && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.master_category_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Category Name English */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="category_name_en">Category Name - English *</Label>
                                        <Input
                                            id="category_name_en"
                                            name="category_name_en"
                                            type="text"
                                            value={formData.category_name_en}
                                            onChange={handleInputChange}
                                            placeholder="Enter category name in English"
                                            readonly={!isEditMode}
                                            className={validationErrors.category_name_en ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                    </div>

                                    {/* Category Name Chinese */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="category_name_cn">Category Name - Chinese</Label>
                                        <Input
                                            id="category_name_cn"
                                            name="category_name_cn"
                                            type="text"
                                            value={formData.category_name_cn}
                                            onChange={handleInputChange}
                                            placeholder="Enter category name in Chinese"
                                            className={validationErrors.category_name_cn ? 'border-red-500 focus:border-red-500' : ''}
                                            readonly={!isEditMode}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="category_description">Description *</Label>
                                        <TextArea
                                            value={formData.category_description}
                                            onChange={(e) => handleInputChange({
                                                target: { name: 'category_description', value: e.target.value }
                                            } as React.ChangeEvent<HTMLInputElement>)}
                                            placeholder="Enter category description"
                                            rows={4}
                                            className={validationErrors.category_description ? 'border-red-500 focus:border-red-500' : ''}
                                            readonly={!isEditMode}
                                        />
                                    </div>
                                </div>
                                <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                            </div>
                            <div className="md:col-span-2 p-8 lg:ps-0">
                                {/* Type Categories */}
                                <TypeCategoryForm
                                    typeCategory={formData.data_type}
                                    onTypeCategoryChange={handleTypeCategorysChange}
                                    errors={validationErrors}
                                    modeEdit={!isEditMode}
                                />
                            </div>
                            
                            {/* Footer - Only show in view mode */}
                            {!isEditMode && (
                                <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => navigate('/epc/category')}
                                        className="px-6 rounded-full"
                                        disabled={loading}
                                    >
                                        Back to Categories
                                    </Button>
                                </div>
                            )}
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}
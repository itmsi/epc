import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import ConfirmationModal from "@/components/ui/modal/ConfirmationModal";
import { MasterCategoryService } from "@/services/partCatalogueService";
import { useEditMasterCategory } from "@/hooks/usePartCatalogue";
import { useConfirmation } from "@/hooks/useConfirmation";
import { MasterCategory } from "@/types/partCatalogue";
import { MdEdit, MdKeyboardArrowLeft, MdSave, MdCancel, MdDelete } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";

export default function ViewMasterCategory() {
    const navigate = useNavigate();
    const { masterCategoryId } = useParams<{ masterCategoryId: string }>();
    const [masterCategory, setMasterCategory] = useState<MasterCategory | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);
    
    // Edit mode state - local to this component
    const [isEditMode, setIsEditMode] = useState(false);
    
    // Use confirmation hook for delete action
    const { showConfirmation, modalProps } = useConfirmation();

    // Fetch master category data
    useEffect(() => {
        const fetchMasterCategory = async () => {
            if (!masterCategoryId) {
                toast.error('Master Category ID is required');
                return;
            }

            try {
                setFetchLoading(true);
                const response = await MasterCategoryService.getMasterCategoryById(masterCategoryId);
                
                if (response.data.success) {
                    const masterCategoryData = response.data.data;
                    setMasterCategory(masterCategoryData);
                } else {
                    throw new Error('Failed to fetch master category data');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch master category data';
                toast.error(errorMessage);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchMasterCategory();
    }, [masterCategoryId]);

    // Use edit master category hook with callback for navigation
    const {
        formData,
        validationErrors,
        loading,
        handleInputChange,
        handleSubmit
    } = useEditMasterCategory(masterCategory, () => navigate('/epc/master-category'));

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
            toast.success('Master Category updated successfully!');
        }
    };

    // Handle cancel edit mode
    const handleCancel = () => {
        setIsEditMode(false);
    };

    // Handle delete master category
    const handleDelete = async () => {
        if (!masterCategoryId) {
            toast.error('Master Category ID is required');
            return;
        }

        const confirmed = await showConfirmation({
            title: 'Delete Master Category',
            message: `Are you sure you want to delete "${masterCategory?.master_category_name_en}"? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await MasterCategoryService.deleteMasterCategory(masterCategoryId);
            
            if (response.data?.success) {
                toast.success('Master Category deleted successfully!');
                navigate('/epc/master-category');
            } else {
                toast.error(response.data?.message || 'Failed to delete master category');
            }
        } catch (error) {
            console.error('Error deleting master category:', error);
            toast.error('Failed to delete master category');
        }
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

    if (!masterCategory) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        <p className="text-gray-500">Master Category not found</p>
                        <Button
                            onClick={() => navigate('/epc/master-category')}
                            className="mt-4"
                        >
                            Back to Master Categories
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={isEditMode ? `Edit Master Category - ${masterCategory.master_category_name_en} | MSI` : `View Master Category - ${masterCategory.master_category_name_en} | MSI`}
                description={isEditMode ? `Edit master category information for ${masterCategory.master_category_name_en}` : `View master category information for ${masterCategory.master_category_name_en}`}
                image="/motor-sights-international.png"
            />
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto p-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/epc/master-category">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">
                                {isEditMode ? 'Edit Master Category' : 'View Master Category'}
                            </h1>
                        </div>
                        <div className='flex gap-3'>
                            {!isEditMode ? (
                                // View mode buttons
                                <>
                                    <Button
                                        variant="outline"
                                        className="rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary"
                                        onClick={handleEditToggle}
                                        disabled={loading}
                                    >
                                        <MdEdit size={20} className="text-primary" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#e7000b] font-secondary py-2"
                                        onClick={handleDelete}
                                        disabled={loading}
                                    >
                                        <MdDelete size={20} className="text-red-600" /> Delete
                                    </Button>
                                </>
                            ) : (
                                // Edit mode buttons
                                <>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        className="rounded-lg w-full md:w-30 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 font-secondary"
                                        disabled={loading}
                                        onClick={handleSaveClick}
                                    >
                                        <MdSave size={20} /> Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-gray-400 font-secondary"
                                        onClick={handleCancel}
                                        disabled={loading}
                                    >
                                        <MdCancel size={20} /> Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    <form onSubmit={(e) => e.preventDefault()} className="bg-white rounded-2xl shadow-sm">
                        <div className="md:grid-cols-3">
                            <div className="md:col-span-1 p-8 relative space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Type Master Category</h2>
                                    {/* Master Category Name English */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="master_category_name_en">Master Category Name - English *</Label>
                                        <Input
                                            id="master_category_name_en"
                                            name="master_category_name_en"
                                            type="text"
                                            value={formData.master_category_name_en}
                                            onChange={handleInputChange}
                                            placeholder="Enter master category name in English"
                                            readonly={!isEditMode}
                                            className={validationErrors.master_category_name_en ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.master_category_name_en && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.master_category_name_en}
                                            </p>
                                        )}
                                    </div>

                                    {/* Master Category Name Chinese */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="master_category_name_cn">Master Category Name - Chinese *</Label>
                                        <Input
                                            id="master_category_name_cn"
                                            name="master_category_name_cn"
                                            type="text"
                                            value={formData.master_category_name_cn}
                                            onChange={handleInputChange}
                                            placeholder="Enter master category name in Chinese"
                                            readonly={!isEditMode}
                                            className={validationErrors.master_category_name_cn ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.master_category_name_cn && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.master_category_name_cn}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="master_category_description">Description *</Label>
                                        <TextArea
                                            value={formData.master_category_description}
                                            onChange={(e) => handleInputChange({
                                                target: { name: 'master_category_description', value: e.target.value }
                                            } as React.ChangeEvent<HTMLInputElement>)}
                                            placeholder="Enter master category description"
                                            rows={4}
                                            readonly={!isEditMode}
                                            className={validationErrors.master_category_description ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.master_category_description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.master_category_description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {/* Footer - Only show in view mode */}
                            {!isEditMode && (
                                <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                                    <Button 
                                        type="button" 
                                        variant="outline"
                                        onClick={() => navigate('/epc/master-category')}
                                        className="px-6 rounded-full"
                                        disabled={loading}
                                    >
                                        Back to Master Categories
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
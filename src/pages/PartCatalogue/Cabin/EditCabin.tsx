import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { TypeCabineForm } from "@/components/form/TypeForms";
import { CabinService } from "@/services/partCatalogueService";
import { useEditCabin } from "@/hooks/usePartCatalogue";
import { Cabin } from "@/types/partCatalogue";
import { MdEdit, MdKeyboardArrowLeft, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";

export default function EditCabin() {
    const navigate = useNavigate();
    const { cabinId } = useParams<{ cabinId: string }>();
    const [cabin, setCabin] = useState<Cabin | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);

    // Fetch cabin data
    useEffect(() => {
        const fetchCabin = async () => {
            if (!cabinId) {
                toast.error('Cabin ID is required');
                return;
            }

            try {
                setFetchLoading(true);
                const response = await CabinService.getCabinById(cabinId);
                
                if (response.data.success) {
                    const cabinData = response.data.data;
                    setCabin(cabinData);
                } else {
                    throw new Error('Failed to fetch cabin data');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch cabin';
                toast.error(errorMessage);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchCabin();
    }, [cabinId]);

    // Use edit cabin hook with callback for navigation
    const {
        formData,
        validationErrors,
        loading,
        handleInputChange,
        handleTypeCabinesChange,
        handleSubmit
    } = useEditCabin(cabin, () => navigate('/epc/cabin'));

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

    if (!cabin) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        <p className="text-gray-500">Cabin not found</p>
                        <Button
                            onClick={() => navigate('/epc/cabin')}
                            className="mt-4"
                        >
                            Back to Cabins
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Edit Cabin - ${cabin.cabines_name_en} | MSI`}
                description={`Edit cabin information for ${cabin.cabines_name_en}`}
                image="/motor-sights-international.png"
            />
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto p-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/epc/cabin">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdEdit size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Cabin</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="md:col-span-1 p-8 relative space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Type Cabine</h2>
                                    {/* Cabin Name English */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="cabines_name_en">Cabin Name - English *</Label>
                                        <Input
                                            id="cabines_name_en"
                                            name="cabines_name_en"
                                            type="text"
                                            value={formData.cabines_name_en}
                                            onChange={handleInputChange}
                                            placeholder="Enter cabin name in English"
                                            className={validationErrors.cabines_name_en ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.cabines_name_en && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.cabines_name_en}
                                            </p>
                                        )}
                                    </div>

                                    {/* Cabin Name Chinese */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="cabines_name_cn">Cabin Name - Chinese *</Label>
                                        <Input
                                            id="cabines_name_cn"
                                            name="cabines_name_cn"
                                            type="text"
                                            value={formData.cabines_name_cn}
                                            onChange={handleInputChange}
                                            placeholder="Enter cabin name in Chinese"
                                            className={validationErrors.cabines_name_cn ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.cabines_name_cn && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.cabines_name_cn}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="cabines_description">Description *</Label>
                                        <TextArea
                                            value={formData.cabines_description}
                                            onChange={(e) => handleInputChange({
                                                target: { name: 'cabines_description', value: e.target.value }
                                            } as React.ChangeEvent<HTMLInputElement>)}
                                            placeholder="Enter cabin description"
                                            rows={4}
                                            className={validationErrors.cabines_description ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.cabines_description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.cabines_description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                            </div>
                            <div className="md:col-span-2 p-8 lg:ps-0">
                                {/* Type Cabines */}
                                <TypeCabineForm
                                    typeCabines={formData.type_cabines}
                                    onTypeCabinesChange={handleTypeCabinesChange}
                                    errors={validationErrors}
                                />
                            </div>
                            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                                {/* Form Actions */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/epc/cabin')}
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
                                    {loading ? 'Updating...' : 'Update Cabin'}
                                </Button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}
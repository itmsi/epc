import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { TypeAxleForm } from "@/components/form/TypeForms";
import { AxleService } from "@/services/partCatalogueService";
import { Axle } from "@/types/partCatalogue";
import { useEditAxle } from "@/hooks/usePartCatalogue";
import { MdEdit, MdKeyboardArrowLeft, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";

export default function Edit() {
    const navigate = useNavigate();
    const { axelId } = useParams<{ axelId: string }>();
    const [axel, setAxel] = useState<Axle | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);

    // Fetch axel data
    useEffect(() => {
        const fetchAxel = async () => {
            if (!axelId) {
                toast.error('Axel ID is required');
                return;
            }

            try {
                setFetchLoading(true);
                const response = await AxleService.getAxelById(axelId);
                
                if (response.data.success) {
                    const axelData = response.data.data;
                    setAxel(axelData);
                } else {
                    throw new Error('Failed to fetch axel data');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch axel';
                toast.error(errorMessage);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchAxel();
    }, [axelId]);

    // Use edit axel hook with callback for navigation
    const {
        formData,
        validationErrors,
        loading,
        handleInputChange,
        handleTypeAxlesChange,
        handleSubmit
    } = useEditAxle(axel, () => navigate('/epc/axle'));

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading axle data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!axel) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        <p className="text-gray-500">Axle not found</p>
                        <Button
                            onClick={() => navigate('/epc/axle')}
                            className="mt-4"
                        >
                            Back to Axles
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Edit Axle - ${axel.axel_name_en} | MSI`}
                description={`Edit axle information for ${axel.axel_name_en}`}
                image="/motor-sights-international.png"
            />
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto p-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/epc/axle">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdEdit size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Axle</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="md:col-span-1 p-8 relative space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Axle Information</h2>
                                    {/* Axel Name English */}
                                    <div>
                                        <Label htmlFor="axel_name_en">Axle Name (EN) *</Label>
                                        <Input
                                            type="text"
                                            name="axel_name_en"
                                            value={formData.axel_name_en}
                                            onChange={handleInputChange}
                                            placeholder="Enter axel name in English"
                                            className={validationErrors.axel_name_en ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.axel_name_en && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.axel_name_en}
                                            </p>
                                        )}
                                    </div>

                                    {/* Axel Name Chinese */}
                                    <div>
                                        <Label htmlFor="axel_name_cn">Axle Name (CN) *</Label>
                                        <Input
                                            type="text"
                                            name="axel_name_cn"
                                            value={formData.axel_name_cn}
                                            onChange={handleInputChange}
                                            placeholder="Enter axel name in Chinese"
                                            className={validationErrors.axel_name_cn ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.axel_name_cn && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.axel_name_cn}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="axel_description">Description *</Label>
                                        <TextArea
                                            value={formData.axel_description}
                                            onChange={(e) => handleInputChange({
                                                target: { name: 'axel_description', value: e.target.value }
                                            } as React.ChangeEvent<HTMLInputElement>)}
                                            placeholder="Enter axel description"
                                            rows={4}
                                            className={validationErrors.axel_description ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.axel_description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.axel_description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                            </div>
                            <div className="md:col-span-2 p-8 lg:ps-0">
                                {/* Type Axles */}
                                <TypeAxleForm
                                    typeAxles={formData.type_axels}
                                    onTypeAxlesChange={handleTypeAxlesChange}
                                    errors={validationErrors}
                                />
                            </div>
                            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                                {/* Form Actions */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/epc/axle')}
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
                                    {loading ? 'Updating...' : 'Update Axle'}
                                </Button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}
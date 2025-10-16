import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { TypeTransmissionForm } from "@/components/form/TypeForms";
import { TransmissionService } from "@/services/partCatalogueService";
import { useEditTransmission } from "@/hooks/usePartCatalogue";
import { Transmission } from "@/types/partCatalogue";
import { MdEdit, MdKeyboardArrowLeft, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";

export default function Edit() {
    const navigate = useNavigate();
    const { transmissionId } = useParams<{ transmissionId: string }>();
    const [transmission, setTransmission] = useState<Transmission | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);

    // Fetch transmission data
    useEffect(() => {
        const fetchTransmission = async () => {
            if (!transmissionId) {
                toast.error('Transmission ID is required');
                return;
            }

            try {
                setFetchLoading(true);
                const response = await TransmissionService.getTransmissionById(transmissionId);
                
                if (response.data.success) {
                    const transmissionData = response.data.data;
                    setTransmission(transmissionData);
                } else {
                    throw new Error('Failed to fetch transmission data');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch transmission data';
                toast.error(errorMessage);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchTransmission();
    }, [transmissionId]);

    // Use edit transmission hook with callback for navigation
    const {
        formData,
        validationErrors,
        loading,
        handleInputChange,
        handleTypeTransmissionsChange,
        handleSubmit
    } = useEditTransmission(transmission, () => navigate('/epc/transmission'));

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

    if (!transmission) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        <p className="text-gray-500">Transmission not found</p>
                        <Button
                            onClick={() => navigate('/epc/transmission')}
                            className="mt-4"
                        >
                            Back to Transmissions
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Edit Transmission - ${transmission.transmission_name_en} | MSI`}
                description={`Edit transmission information for ${transmission.transmission_name_en}`}
                image="/motor-sights-international.png"
            />
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto p-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/epc/transmission">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdEdit size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Transmission</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="md:col-span-1 p-8 relative space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Type Transmission</h2>
                                    {/* Transmission Name English */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="transmission_name_en">Transmission Name - English *</Label>
                                        <Input
                                            id="transmission_name_en"
                                            name="transmission_name_en"
                                            type="text"
                                            value={formData.transmission_name_en}
                                            onChange={handleInputChange}
                                            placeholder="Enter transmission name in English"
                                            className={validationErrors.transmission_name_en ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.transmission_name_en && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.transmission_name_en}
                                            </p>
                                        )}
                                    </div>

                                    {/* Transmission Name Chinese */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="transmission_name_cn">Transmission Name - Chinese *</Label>
                                        <Input
                                            id="transmission_name_cn"
                                            name="transmission_name_cn"
                                            type="text"
                                            value={formData.transmission_name_cn}
                                            onChange={handleInputChange}
                                            placeholder="Enter transmission name in Chinese"
                                            className={validationErrors.transmission_name_cn ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.transmission_name_cn && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.transmission_name_cn}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="transmission_description">Description *</Label>
                                        <TextArea
                                            value={formData.transmission_description}
                                            onChange={(e) => handleInputChange({
                                                target: { name: 'transmission_description', value: e.target.value }
                                            } as React.ChangeEvent<HTMLInputElement>)}
                                            placeholder="Enter transmission description"
                                            rows={4}
                                            className={validationErrors.transmission_description ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.transmission_description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.transmission_description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                            </div>
                            <div className="md:col-span-2 p-8 lg:ps-0">
                                {/* Type Transmissions */}
                                <TypeTransmissionForm
                                    typeTransmissions={formData.type_transmissions}
                                    onTypeTransmissionsChange={handleTypeTransmissionsChange}
                                    errors={validationErrors}
                                />
                            </div>
                            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                                {/* Form Actions */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/epc/transmission')}
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
                                    {loading ? 'Updating...' : 'Update Transmission'}
                                </Button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}
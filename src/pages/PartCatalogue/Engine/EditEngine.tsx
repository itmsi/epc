import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { TypeEngineForm } from "@/components/form/TypeForms";
import { EngineService } from "@/services/partCatalogueService";
import { Engine } from "@/types/partCatalogue";
import { useEditEngine } from "@/hooks/usePartCatalogue";
import { MdEdit, MdKeyboardArrowLeft, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";

export default function EditEngine() {
    const navigate = useNavigate();
    const { engineId } = useParams<{ engineId: string }>();
    const [engine, setEngine] = useState<Engine | null>(null);
    const [fetchLoading, setFetchLoading] = useState(true);

    // Fetch engine data
    useEffect(() => {
        const fetchEngine = async () => {
            if (!engineId) {
                toast.error('Engine ID is required');
                return;
            }

            try {
                setFetchLoading(true);
                const response = await EngineService.getEngineById(engineId);
                
                if (response.data.success) {
                    const engineData = response.data.data;
                    setEngine(engineData);
                } else {
                    throw new Error('Failed to fetch engine data');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to fetch engine';
                toast.error(errorMessage);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchEngine();
    }, [engineId]);

    // Use edit engine hook with callback for navigation
    const {
        formData,
        validationErrors,
        loading,
        handleInputChange,
        handleTypeEnginesChange,
        handleSubmit
    } = useEditEngine(engine, () => navigate('/epc/engine'));

    if (fetchLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                        <p className="mt-4 text-gray-500">Loading engine data...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!engine) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-6 text-center">
                        <p className="text-gray-500">Engine not found</p>
                        <Button
                            onClick={() => navigate('/epc/engine')}
                            className="mt-4"
                        >
                            Back to Engines
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title={`Edit Engine - ${engine.engines_name_en} | MSI`}
                description={`Edit engine information for ${engine.engines_name_en}`}
                image="/motor-sights-international.png"
            />
            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto p-4 sm:px-3">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6 mb-8">
                        <div className="flex items-center gap-1">
                            <Link to="/epc/engine">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdKeyboardArrowLeft size={20} />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <MdEdit size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Edit Engine</h1>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="md:col-span-1 p-8 relative space-y-5">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Engine Information</h2>
                                    {/* Engine Name English */}
                                    <div>
                                        <Label htmlFor="engines_name_en">Engine Name (EN) *</Label>
                                        <Input
                                            type="text"
                                            name="engines_name_en"
                                            value={formData.engines_name_en}
                                            onChange={handleInputChange}
                                            placeholder="Enter engine name in English"
                                            className={validationErrors.engines_name_en ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.engines_name_en && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.engines_name_en}
                                            </p>
                                        )}
                                    </div>

                                    {/* Engine Name Chinese */}
                                    <div>
                                        <Label htmlFor="engines_name_cn">Engine Name (CN) *</Label>
                                        <Input
                                            type="text"
                                            name="engines_name_cn"
                                            value={formData.engines_name_cn}
                                            onChange={handleInputChange}
                                            placeholder="Enter engine name in Chinese"
                                            className={validationErrors.engines_name_cn ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.engines_name_cn && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.engines_name_cn}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="engines_description">Description *</Label>
                                        <TextArea
                                            value={formData.engines_description}
                                            onChange={(e) => handleInputChange({
                                                target: { name: 'engines_description', value: e.target.value }
                                            } as React.ChangeEvent<HTMLInputElement>)}
                                            placeholder="Enter engine description"
                                            rows={4}
                                            className={validationErrors.engines_description ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.engines_description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.engines_description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                            </div>
                            <div className="md:col-span-2 p-8 lg:ps-0">
                                {/* Type Engines */}
                                <TypeEngineForm
                                    typeEngines={formData.type_engines}
                                    onTypeEnginesChange={handleTypeEnginesChange}
                                    errors={validationErrors}
                                />
                            </div>
                            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                                {/* Form Actions */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/epc/engine')}
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
                                    {loading ? 'Updating...' : 'Update Engine'}
                                </Button>
                            </div>
                        </div>
                    </form>

                </div>
            </div>
        </>
    );
}
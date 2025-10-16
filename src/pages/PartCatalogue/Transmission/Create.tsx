import { Link } from "react-router-dom";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { TypeTransmissionForm } from "@/components/form/TypeForms";
import { useCreateTransmission } from "@/hooks/usePartCatalogue";
import { MdAdd, MdKeyboardArrowLeft, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";

export default function Create() {
    const {
        formData,
        validationErrors,
        loading,
        handleInputChange,
        handleTypeTransmissionsChange,
        handleSubmit
    } = useCreateTransmission();

    return (
        <>
            <PageMeta
                title={`Create Transmission | MSI`}
                description={`Create transmission information`}
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
                            <MdAdd size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Transmission</h1>
                        </div>
                    </div>

                    {/* Form Card */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="md:col-span-1 p-8 relative space-y-5 min-h-[770px]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Type Transmission</h2>

                                    {/* Show general error message if exists */}
                                    {validationErrors.general && (
                                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg md:col-span-2">
                                            <p className="text-sm text-red-600">{validationErrors.general}</p>
                                        </div>
                                    )}

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
                                            onChange={(e) => {
                                                const syntheticEvent = {
                                                    target: {
                                                        name: 'transmission_description',
                                                        value: e.target.value
                                                    }
                                                } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
                                                handleInputChange(syntheticEvent);
                                            }}
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

                            {/* Form Actions */}
                            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                                <Link to="/epc/transmission">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex items-center gap-2"
                                >
                                    <MdSave className="w-4 h-4" />
                                    {loading ? 'Creating...' : 'Create Transmission'}
                                </Button>
                            </div>
                        </div>
                    </form>
                            
                </div>
            </div>
        </>
    );
}
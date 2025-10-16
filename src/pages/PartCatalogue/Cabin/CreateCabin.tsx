import { Link } from "react-router-dom";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { TypeCabineForm } from "@/components/form/TypeForms";
import { useCreateCabin } from "@/hooks/usePartCatalogue";
import { MdAdd, MdKeyboardArrowLeft, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";

export default function CreateCabin() {
    const {
        formData,
        validationErrors,
        loading,
        handleInputChange,
        handleTypeCabinesChange,
        handleSubmit
    } = useCreateCabin();

    return (
        <>
            <PageMeta
                title={`Create Cabin | MSI`}
                description={`Create cabin information`}
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
                            <MdAdd size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Cabin</h1>
                        </div>
                    </div>

                    {/* Form Card */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="md:col-span-1 p-8 relative space-y-5 min-h-[770px]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    
                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Type Cabine</h2>
                                    
                                    {/* Show general error message if exists */}
                                    {validationErrors.general && (
                                        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg md:col-span-2">
                                            <p className="text-sm text-red-600">{validationErrors.general}</p>
                                        </div>
                                    )}

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
                                            onChange={(e) => {
                                                const syntheticEvent = {
                                                    target: {
                                                        name: 'cabines_description',
                                                        value: e.target.value
                                                    }
                                                } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
                                                handleInputChange(syntheticEvent);
                                            }}
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

                            {/* Form Actions */}
                            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                                <Link to="/epc/cabin">
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
                                    {loading ? 'Creating...' : 'Create Cabin'}
                                </Button>
                            </div>
                        </div>
                    </form>
                            
                </div>
            </div>
        </>
    );
}
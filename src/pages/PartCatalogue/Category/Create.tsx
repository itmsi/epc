import React from "react";
import { Link } from "react-router-dom";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { TypeCategoryForm } from "@/components/form/TypeForms";
import { useCreateCategoryEnhanced } from '@/hooks/useCreateCategoryEnhanced';
import { MdAdd, MdKeyboardArrowLeft, MdSave } from "react-icons/md";
import PageMeta from "@/components/common/PageMeta";
import CustomAsyncSelect from "@/components/form/select/CustomAsyncSelect";

export default function Create() {
    const {
        formData,
        validationErrors,
        loading,
        handleInputChange,
        handleTypeCategorysChange,
        handleSubmit,
        // Enhanced hook additions
        searchInputValue,
        handleSearchInputChange,
        masterCategoryOptions,
        loadMasterCategoryOptions,
        masterCategoryLoading,
        handleSelectChange,
        handleScrollToBottom
    } = useCreateCategoryEnhanced();

    return (
        <>
            <PageMeta
                title={`Create Category | MSI`}
                description={`Create category information`}
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
                            <MdAdd size={20} className="text-primary" />
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">Create Category</h1>
                        </div>
                    </div>

                    {/* Form Card */}
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm">
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                            <div className="md:col-span-1 p-8 relative space-y-5 min-h-[770px]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 md:col-span-2">Type Category</h2>
                                    <div className="md:col-span-2">
                                        <Label htmlFor="master_category_id">Select Master Category *</Label>
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
                                        {masterCategoryLoading && (
                                            <p className="mt-1 text-sm text-gray-500">Loading master category data...</p>
                                        )}
                                        {validationErrors.master_category_id && (
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
                                            className={validationErrors.category_name_en ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.category_name_en && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.category_name_en}
                                            </p>
                                        )}
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
                                        />
                                        {validationErrors.category_name_cn && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.category_name_cn}
                                            </p>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className="md:col-span-2">
                                        <Label htmlFor="category_description">Description</Label>
                                        <TextArea
                                            value={formData.category_description}
                                            onChange={(e) => {
                                                const syntheticEvent = {
                                                    target: {
                                                        name: 'category_description',
                                                        value: e.target.value
                                                    }
                                                } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
                                                handleInputChange(syntheticEvent);
                                            }}
                                            placeholder="Enter category description"
                                            rows={4}
                                            className={validationErrors.category_description ? 'border-red-500 focus:border-red-500' : ''}
                                        />
                                        {validationErrors.category_description && (
                                            <p className="mt-1 text-sm text-red-600">
                                                {validationErrors.category_description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute top-7 bottom-7 right-0 border-r border-gray-300 hidden lg:block mx-3"></div>
                            </div>
                            <div className="md:col-span-2 p-8 lg:ps-0">
                                {/* Type Category */}
                                <TypeCategoryForm
                                    typeCategory={formData.data_type}
                                    onTypeCategoryChange={handleTypeCategorysChange}
                                    errors={validationErrors}
                                />
                            </div>

                            {/* Form Actions */}
                            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 md:col-span-3">
                                <Link to="/epc/category">
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
                                    {loading ? 'Creating...' : 'Create Category'}
                                </Button>
                            </div>
                        </div>
                    </form>
                            
                </div>
            </div>
        </>
    );
}
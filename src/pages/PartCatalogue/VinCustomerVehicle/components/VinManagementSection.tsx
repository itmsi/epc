import { useEffect, useState } from 'react';
import { MdAdd, MdDeleteOutline } from 'react-icons/md';
import Button from '@/components/ui/button/Button';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import Label from '@/components/form/Label';
import { useVinSelect, VinSelectOption } from '@/hooks/useVinSelect';
import { VinCustomerVehicleItem } from '../types/vinCustomerVehicle';
import { createActionsColumn } from '@/components/ui/table';
import { TableColumn } from 'react-data-table-component';
import toast from 'react-hot-toast';

interface VinManagementSectionProps {
    selectedVins: VinCustomerVehicleItem[];
    error?: string;
    isVinAlreadySelected: (vinId: string) => boolean;
    onAddVin: (vin: VinCustomerVehicleItem) => void;
    onRemoveVin: (row: VinCustomerVehicleItem | string) => void;
    readonly?: boolean;
}

// Helper function untuk parse description VIN
const parseVinDescription = (description: string) => {
    const modelUnitMatch = description.match(/Model Unit\s*:\s*([^\n]*)/i);
    const engineNumberMatch = description.match(/No\. Engine\s*:\s*([^\n]*)/i);
    const engineTypeMatch = description.match(/Type Engine\s*:\s*([^\n]*)/i);

    return {
        modelUnit: modelUnitMatch?.[1]?.trim() || '-',
        engineNumber: engineNumberMatch?.[1]?.trim() || '-',
        engineType: engineTypeMatch?.[1]?.trim() || '-'
    };
};

export default function VinManagementSection({ 
    selectedVins, 
    error, 
    isVinAlreadySelected, 
    onAddVin, 
    onRemoveVin,
    readonly = false
}: VinManagementSectionProps) {
    // VIN Select Hook
    const {
        vinOptions,
        pagination: vinPagination,
        inputValue: vinInputValue,
        handleInputChange: handleVinInputChange,
        handleMenuScrollToBottom: handleVinMenuScrollToBottom,
        initializeOptions: initializeVinOptions
    } = useVinSelect();
    
    useEffect(() => {
        if (!readonly) {
            initializeVinOptions();
        }
    }, [initializeVinOptions, readonly]);
    
    const [selectedVin, setSelectedVin] = useState<any>(null);

    // Handle add VIN
    const handleAddVin = () => {
        if (!selectedVin) return;

        if (isVinAlreadySelected(selectedVin.value)) {
            toast.error('VIN sudah dipilih');
            return;
        }

        // Find full VIN data from vinOptions
        const vinData = vinOptions.find((option: VinSelectOption) => option.value === selectedVin.value);
        const fullVinData = vinData?.data;
        
        // Parse description untuk extract detail
        const description = fullVinData?.product_description || '';
        const parsed = parseVinDescription(description);

        const vinItem: VinCustomerVehicleItem = {
            id: selectedVin.value,
            vin_number: fullVinData?.vin_number || selectedVin.label.split(' (')[0] || selectedVin.label,
            product_name: fullVinData?.product_name_en || selectedVin.label.split('(')[1]?.replace(')', '') || '-',
            model_unit: parsed.modelUnit,
            engine_number: parsed.engineNumber,
            engine_type: parsed.engineType,
            description: description || '-',
            label: selectedVin.label
        };

        onAddVin(vinItem);
        setSelectedVin(null);
    };

    // Table columns - conditionally show actions
    const baseColumns: TableColumn<VinCustomerVehicleItem>[] = [
        {
            name: 'VIN Number',
            selector: (row) => row.vin_number,
        },
        {
            name: 'Product Name',
            selector: (row) => row.product_name,
        }
    ];

    const columns: TableColumn<VinCustomerVehicleItem>[] = readonly 
        ? baseColumns 
        : [
            ...baseColumns,
            createActionsColumn([
                {
                    icon: MdDeleteOutline,
                    onClick: onRemoveVin,
                    className: 'text-red-600 hover:text-red-700 hover:bg-red-50',
                    tooltip: 'Remove VIN',
                }
            ])
        ];

    return (
        <div className="space-y-4">
            {/* VIN Selector - hide in readonly mode */}
            {!readonly && (
            <div>
                <Label>Select VIN <span className="text-red-500">*</span></Label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <CustomAsyncSelect
                            name="vin_id"
                            placeholder="Select VIN..."
                            value={selectedVin}
                            defaultOptions={vinOptions}
                            loadOptions={handleVinInputChange}
                            onMenuScrollToBottom={handleVinMenuScrollToBottom}
                            isLoading={vinPagination.loading}
                            noOptionsMessage={() => "No VINs found"}
                            loadingMessage={() => "Loading VINs..."}
                            isSearchable={true}
                            inputValue={vinInputValue}
                            onInputChange={(inputValue) => {
                                handleVinInputChange(inputValue);
                            }}
                            onChange={(option: any) => {
                                setSelectedVin(option);
                            }}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={handleAddVin}
                        disabled={!selectedVin}
                        className="flex items-center gap-2 px-4 h-[44px]"
                    >
                        <MdAdd className="w-4 h-4" />
                        Add
                    </Button>
                </div>
            </div>
            )}

            {/* Selected VINs Table */}
            <div className="mt-6">
                <h3 className="text-md font-primary-bold font-medium text-gray-900 mb-4">
                    {readonly ? 'VINs' : 'Selected VINs'} ({selectedVins.length}) {error && ( <span className="text-sm text-red-500 font-primary">{error}</span>)}
                </h3>

                <div className="font-secondary">
                    <CustomDataTable
                        columns={columns}
                        data={selectedVins}
                        pagination={false}
                        highlightOnHover
                        striped
                        responsive
                        noDataComponent={
                            <div className="py-12 text-center text-gray-500">
                                <MdAdd className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium mb-2">No VINs Selected</p>
                                <p className="text-sm">Choose a VIN from the dropdown above and click 'Add' to get started.</p>
                            </div>
                        }
                    />
                </div>
            </div>
        </div>
    );
}
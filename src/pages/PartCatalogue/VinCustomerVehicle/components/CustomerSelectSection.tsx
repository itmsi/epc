import { useEffect, useState } from 'react';
import CustomAsyncSelect from '@/components/form/select/CustomAsyncSelect';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import { useCustomerSelect } from '@/hooks/useCustomerSelect';

interface CustomerSelectSectionProps {
    error?: string;
    onCustomerChange: (option: any) => void;
    initialValue?: { value: string; label: string } | null;
    readonly?: boolean;
}

export default function CustomerSelectSection({ 
    error, 
    onCustomerChange, 
    initialValue = null,
    readonly = false 
}: CustomerSelectSectionProps) {
    const {
        customerOptions,
        pagination: customerPagination,
        inputValue: customerInputValue,
        handleInputChange: handleCustomerInputChange,
        handleMenuScrollToBottom: handleCustomerMenuScrollToBottom,
        initializeOptions: initializeCustomerOptions
    } = useCustomerSelect();
    
    useEffect(() => {
        if (!readonly) {
            initializeCustomerOptions();
        }
    }, [initializeCustomerOptions, readonly]);
    
    const [selectedCustomer, setSelectedCustomer] = useState<any>(initialValue);
    
    // Update when initialValue changes
    useEffect(() => {
        if (initialValue) {
            setSelectedCustomer(initialValue);
        }
    }, [initialValue]);

    // Readonly mode - show as input
    if (readonly) {
        return (
            <div>
                <Label>Customer</Label>
                <Input
                    type="text"
                    value={selectedCustomer?.label || '-'}
                    readonly
                    className="bg-gray-50"
                />
            </div>
        );
    }

    return (
        <div>
            <Label>Select Customers <span className="text-red-500">*</span></Label>
            <CustomAsyncSelect
                name="customer_id"
                placeholder="Select customer..."
                value={selectedCustomer}
                error={error}
                defaultOptions={customerOptions}
                loadOptions={handleCustomerInputChange}
                onMenuScrollToBottom={handleCustomerMenuScrollToBottom}
                isLoading={customerPagination.loading}
                noOptionsMessage={() => "No customers found"}
                loadingMessage={() => "Loading customers..."}
                isSearchable={true}
                inputValue={customerInputValue}
                onInputChange={(inputValue) => {
                    handleCustomerInputChange(inputValue);
                }}
                onChange={(option: any) => {
                    setSelectedCustomer(option);
                    onCustomerChange(option);
                }}
            />
            {error && (
                <span className="text-sm text-red-500">{error}</span>
            )}
        </div>
    );
}
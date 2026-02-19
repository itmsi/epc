import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
    VinCustomerVehicleFormData, 
    VinCustomerVehicleValidationErrors,
    VinCustomerVehicleItem 
} from '../types/vinCustomerVehicle';
import { VinCustomerVehicleService } from '../services/vinCustomerVehicleService';

// interface UseCreateVinCustomerVehicleReturn {
//     formData: VinCustomerVehicleFormData;
//     setFormData: React.Dispatch<React.SetStateAction<VinCustomerVehicleFormData>>;
//     validationErrors: VinCustomerVehicleValidationErrors;
//     setValidationErrors: React.Dispatch<React.SetStateAction<VinCustomerVehicleValidationErrors>>;
//     isSubmitting: boolean;
    
//     // VIN Management Functions
//     addSelectedVin: (vin: VinCustomerVehicleItem) => void;
//     removeSelectedVin: (vinId: string) => void;
//     isVinAlreadySelected: (vinId: string) => boolean;
    
//     // Form Handlers
//     handleCustomerChange: (option: any) => void;
//     handleSubmit: (e: React.FormEvent) => Promise<void>;
    
//     // Validation
//     validateForm: () => boolean;
// }

export const useCreateVinCustomerVehicle = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState<VinCustomerVehicleFormData>({
        customer_id: '',
        product_ids: [],
        selectedVins: []
    });
    
    const [validationErrors, setValidationErrors] = useState<VinCustomerVehicleValidationErrors>({});
    
    // Add selected VIN to list
    const addSelectedVin = useCallback((vin: VinCustomerVehicleItem) => {
        if (!isVinAlreadySelected(vin.id)) {
            setFormData(prev => ({
                ...prev,
                selectedVins: [...prev.selectedVins, vin],
                product_ids: [...prev.product_ids, vin.id]
            }));
            
            // Clear VIN validation error if exists
            if (validationErrors.selectedVins) {
                setValidationErrors(prev => ({
                    ...prev,
                    selectedVins: undefined
                }));
            }
        } else {
            toast.error('VIN sudah dipilih');
        }
    }, [formData.selectedVins, validationErrors.selectedVins]);
    
    // Remove selected VIN from list
    const removeSelectedVin = useCallback((row: VinCustomerVehicleItem | string) => {
        const vinId = typeof row === 'string' ? row : row.id;
        
        setFormData(prev => ({
            ...prev,
            selectedVins: prev.selectedVins.filter(vin => vin.id !== vinId),
            product_ids: prev.product_ids.filter(id => id !== vinId)
        }));
    }, []);
    
    // Check if VIN is already selected
    const isVinAlreadySelected = useCallback((vinId: string) => {
        return formData.selectedVins.some(vin => vin.id === vinId);
    }, [formData.selectedVins]);
    
    // Handle customer selection change
    const handleCustomerChange = useCallback((option: any) => {
        setFormData(prev => ({
            ...prev,
            customer_id: option?.value || ''
        }));
        
        // Clear customer validation error if exists
        if (validationErrors.customer_id) {
            setValidationErrors(prev => ({
                ...prev,
                customer_id: undefined
            }));
        }
    }, [validationErrors.customer_id]);
    
    // Validate form before submit
    const validateForm = useCallback((): boolean => {
        const errors: VinCustomerVehicleValidationErrors = {};
        
        if (!formData.customer_id) {
            errors.customer_id = 'Customer harus dipilih';
        }
        
        if (formData.selectedVins.length === 0) {
            errors.selectedVins = 'Minimal pilih 1 VIN';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);
    
    // Handle form submit
    const handleSubmit = useCallback(async () => {
        
        if (!validateForm()) {
            toast.error('Mohon periksa form yang belum lengkap');
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const response = await VinCustomerVehicleService.createVinCustomerVehicle(formData);
            
            if (response.data.success) {
                toast.success(response.message || 'VIN Customer Vehicle berhasil dibuat');
                navigate('/epc/vehicle-identification');
            } else {
                toast.error(response.message || 'Gagal membuat VIN Customer Vehicle');
            }
        } catch (error: any) {
            console.error('Error creating VIN Customer Vehicle:', error);
            
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error('Terjadi kesalahan saat membuat VIN Customer Vehicle');
            }
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, validateForm, navigate]);
    
    return {
        formData,
        setFormData,
        validationErrors,
        setValidationErrors,
        isSubmitting,
        addSelectedVin,
        removeSelectedVin,
        isVinAlreadySelected,
        handleCustomerChange,
        handleSubmit,
        validateForm
    };
};
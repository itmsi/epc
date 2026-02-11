import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    VinCustomerDetail, 
    VinCustomerVehicleItem,
    VinCustomerVehicleFormData,
    VinCustomerVehicleValidationErrors
} from '../types/vinCustomerVehicle';
import { VinCustomerVehicleService } from '../services/vinCustomerVehicleService';

export const useViewVinCustomer = () => {
    const navigate = useNavigate();
    const { customerId } = useParams<{ customerId: string }>();

    // State
    const [vinCustomerData, setVinCustomerData] = useState<VinCustomerDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state untuk edit mode
    const [formData, setFormData] = useState<VinCustomerVehicleFormData>({
        customer_id: '',
        product_ids: [],
        selectedVins: []
    });
    const [validationErrors, setValidationErrors] = useState<VinCustomerVehicleValidationErrors>({});

    // Fetch detail data
    const fetchVinCustomerDetail = useCallback(async () => {
        if (!customerId) {
            setError('Customer ID tidak ditemukan');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const response = await VinCustomerVehicleService.getVinCustomerDetail(customerId);

            if (response?.success) {
                setVinCustomerData(response.data);
                
                // Set form data for edit mode
                const selectedVins: VinCustomerVehicleItem[] = response.data.products.map(product => ({
                    id: product.product_id,
                    vin_number: product.vin_number,
                    product_name: product.product_name_en,
                    label: `${product.vin_number} (${product.product_name_en})`
                }));

                setFormData({
                    customer_id: response.data.customer_id,
                    product_ids: response.data.products.map(p => p.product_id),
                    selectedVins
                });
            } else {
                throw new Error(response?.message || 'Gagal mengambil data');
            }
        } catch (err: any) {
            console.error('Error fetching VIN Customer detail:', err);
            setError(err.message || 'Gagal mengambil data');
            toast.error('Gagal mengambil data VIN Customer');
        } finally {
            setLoading(false);
        }
    }, [customerId]);

    // Initial fetch
    useEffect(() => {
        fetchVinCustomerDetail();
    }, [fetchVinCustomerDetail]);

    // Check if VIN already selected
    const isVinAlreadySelected = useCallback((vinId: string): boolean => {
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

    // Add selected VIN
    const addSelectedVin = useCallback((vin: VinCustomerVehicleItem) => {
        setFormData(prev => ({
            ...prev,
            selectedVins: [...prev.selectedVins, vin],
            product_ids: [...prev.product_ids, vin.id]
        }));
        setValidationErrors(prev => ({ ...prev, selectedVins: undefined }));
    }, []);

    // Remove selected VIN
    const removeSelectedVin = useCallback((item: VinCustomerVehicleItem | string) => {
        const vinId = typeof item === 'string' ? item : item.id;
        setFormData(prev => ({
            ...prev,
            selectedVins: prev.selectedVins.filter(vin => vin.id !== vinId),
            product_ids: prev.product_ids.filter(id => id !== vinId)
        }));
    }, []);

    // Handle save (update)
    const handleSave = useCallback(async () => {
        // Validation
        const errors: VinCustomerVehicleValidationErrors = {};
        
        if (!formData.customer_id) {
            errors.customer_id = 'Customer harus dipilih';
        }
        if (formData.selectedVins.length === 0) {
            errors.selectedVins = 'Minimal 1 VIN harus dipilih';
        }

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            toast.error('Mohon lengkapi data yang diperlukan');
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Call update API
            const response = await VinCustomerVehicleService.updateVinCustomerVehicle(
                formData.customer_id,
                formData.product_ids
            );

            if (response?.success) {
                toast.success(response.message || 'Data berhasil diperbarui');
                setIsEditMode(false);
                navigate('/epc/vehicle-identification');
                // fetchVinCustomerDetail(); // Refresh data
            } else {
                throw new Error(response?.message || 'Gagal memperbarui data');
            }
        } catch (err: any) {
            console.error('Error updating VIN Customer:', err);
            toast.error(err.message || 'Gagal memperbarui data');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, fetchVinCustomerDetail]);

    // Handle cancel edit
    const handleCancelEdit = useCallback(() => {
        setIsEditMode(false);
        setValidationErrors({});
        
        // Reset form data ke original data
        if (vinCustomerData) {
            const selectedVins: VinCustomerVehicleItem[] = vinCustomerData.products.map(product => ({
                id: product.product_id,
                vin_number: product.vin_number,
                product_name: product.product_name_en,
                label: `${product.vin_number} (${product.product_name_en})`
            }));

            setFormData({
                customer_id: vinCustomerData.customer_id,
                product_ids: vinCustomerData.products.map(p => p.product_id),
                selectedVins
            });
        }
    }, [vinCustomerData]);

    // Refresh data
    const refreshData = useCallback(() => {
        fetchVinCustomerDetail();
    }, [fetchVinCustomerDetail]);

    // Handle delete
    const handleDelete = useCallback(async () => {
        if (!customerId) return;

        try {
            setIsSubmitting(true);
            
            const response = await VinCustomerVehicleService.deleteVinCustomerVehicle(customerId);

            if (response?.success) {
                toast.success(response.message || 'Data berhasil dihapus');
                navigate('/epc/vehicle-identification');
            } else {
                throw new Error(response?.message || 'Gagal menghapus data');
            }
        } catch (err: any) {
            console.error('Error deleting VIN Customer:', err);
            toast.error(err.message || 'Gagal menghapus data');
        } finally {
            setIsSubmitting(false);
        }
    }, [customerId, navigate]);

    return {
        // Data
        vinCustomerData,
        loading,
        error,
        
        // Edit mode
        isEditMode,
        setIsEditMode,
        isSubmitting,
        
        // Form
        formData,
        validationErrors,
        
        // Actions
        isVinAlreadySelected,
        handleCustomerChange,
        addSelectedVin,
        removeSelectedVin,
        handleDelete,
        handleSave,
        handleCancelEdit,
        refreshData
    };
};

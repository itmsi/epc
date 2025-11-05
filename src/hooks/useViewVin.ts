import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { VinService } from '@/services/partCatalogueService';
import { VinFormData, VinDetailItem } from '@/types/partCatalogue';
import { SelectOption } from '@/types/asyncSelect';

// Error interface for better type safety
interface VinFormErrors {
    vin_number?: string;
    product_name_en?: string;
    product_name_cn?: string;
    product_description?: string;
    data_details?: string;
}

// Extended detail item interface for editing with isNew flag
interface VinDetailItemEdit extends VinDetailItem {
    isNew?: boolean;
}

// Extended form data interface for editing  
interface VinFormDataEdit {
    vin_number: string;
    product_name_en: string;
    product_name_cn: string;
    product_description?: string;
    data_details?: VinDetailItemEdit[];
    // Keeping master_pdf for backward compatibility if needed
    master_pdf?: Array<{
        master_pdf_id: string;
        master_pdf_name: string;
        isNew?: boolean;
    }>;
}

// Response type based on the provided API structure
interface VinDetailData {
    product_id: string;
    vin_number: string;
    product_name_en: string;
    product_name_cn: string;
    product_description: string;
    created_at: string;
    created_by: string | null;
    updated_at: string;
    updated_by: string | null;
    deleted_at: string | null;
    deleted_by: string | null;
    is_delete: boolean;
    details: Array<{
        product_detail_id: string;
        product_id: string;
        dokumen_id: string;
        product_detail_name_en: string;
        product_detail_name_cn: string;
        product_detail_description: string;
        created_at: string;
        created_by: string | null;
        updated_at: string;
        updated_by: string | null;
        deleted_at: string | null;
        deleted_by: string | null;
        is_delete: boolean;
        dokumen_name: string;
        dokumen_description: string;
    }>;
    // Keeping master_pdf for backward compatibility if needed
    master_pdf?: Array<{
        master_pdf_id: string;
        master_pdf_name: string;
    }>;
}

interface UseViewVinReturn {
    // Data state
    vinData: VinDetailData | null;
    loading: boolean;
    error: string | null;
    
    // Edit mode state
    isEditMode: boolean;
    formData: VinFormDataEdit;
    errors: VinFormErrors;
    submitting: boolean;
    
    // Search state for edit mode
    searchInputValues: { [key: number]: string };
    
    // Actions
    setIsEditMode: (mode: boolean) => void;
    handleInputChange: (name: keyof VinFormDataEdit, value: string) => void;
    addMasterPdf: () => void;
    removeMasterPdf: (index: number) => void;
    updateMasterPdfSelection: (index: number, selectedOption: SelectOption | null) => void;
    handleDetailInputChange: (index: number, field: keyof Omit<VinDetailItem, 'dokumen_id'>, value: string) => void;
    handleSearchInputChange: (index: number) => (inputValue: string) => void;
    handleSave: () => Promise<void>;
    handleDelete: () => Promise<void>;
    handleCancel: () => void;
    fetchVinData: () => Promise<void>;
    validateForm: () => boolean;
}

export const useViewVin = (): UseViewVinReturn => {
    const navigate = useNavigate();
    const { vin_id: vinId } = useParams<{ vin_id: string }>();

    // Data state
    const [vinData, setVinData] = useState<VinDetailData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Edit mode state
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState<VinFormDataEdit>({
        vin_number: '',
        product_name_en: '',
        product_name_cn: '',
        product_description: '',
        master_pdf: []
    });
    const [errors, setErrors] = useState<VinFormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    
    // Search state for edit mode
    const [searchInputValues, setSearchInputValues] = useState<{ [key: number]: string }>({});

    // Fetch VIN data by ID
    const fetchVinData = useCallback(async () => {
        if (!vinId) {
            setError('VIN ID is required');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const response = await VinService.getVinById(vinId);
            
            if (response.data?.success && response.data?.data) {
                const data = response.data.data as unknown as VinDetailData;
                setVinData(data);
                
                // Initialize form data for potential edit mode
                setFormData({
                    vin_number: data.vin_number,
                    product_name_en: data.product_name_en,
                    product_name_cn: data.product_name_cn,
                    product_description: data.product_description || '',
                    data_details: data.details?.map(detail => ({
                        dokumen_id: detail.dokumen_id,
                        product_detail_name_en: detail.product_detail_name_en,
                        product_detail_name_cn: detail.product_detail_name_cn,
                        product_detail_description: detail.product_detail_description,
                        isNew: false // Existing data is not new
                    })) || [],
                    // Keep backward compatibility
                    master_pdf: data.master_pdf?.map(pdf => ({
                        master_pdf_id: pdf.master_pdf_id,
                        master_pdf_name: pdf.master_pdf_name,
                        isNew: false
                    })) || []
                });
            } else {
                setError(response.data?.message || 'Failed to fetch VIN data');
            }
        } catch (error: any) {
            console.error('Error fetching VIN data:', error);
            setError('An error occurred while fetching VIN data');
        } finally {
            setLoading(false);
        }
    }, [vinId]);

    // Handle input changes for form fields
    const handleInputChange = useCallback((name: keyof VinFormDataEdit, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing (only for basic form fields)
        if (name in errors) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    // Add catalog detail in edit mode (add to top)
    const addMasterPdf = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            data_details: [
                { 
                    dokumen_id: '',
                    product_detail_name_en: '',
                    product_detail_name_cn: '',
                    product_detail_description: '',
                    isNew: true 
                }, // Add new item at the beginning (top)
                ...(prev.data_details || []).map(detail => ({ ...detail, isNew: false })) // Mark existing items as not new
            ]
        }));
    }, []);

    // Remove catalog detail from edit mode
    const removeMasterPdf = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            data_details: prev.data_details?.filter((_, i) => i !== index) || []
        }));
        
        // Clean up search input value for removed field
        setSearchInputValues(prev => {
            const newValues = { ...prev };
            delete newValues[index];
            // Reindex remaining values
            const reindexed: { [key: number]: string } = {};
            Object.keys(newValues)
                .map(k => parseInt(k))
                .filter(k => k > index)
                .forEach(k => {
                    reindexed[k - 1] = newValues[k];
                });
            Object.keys(newValues)
                .map(k => parseInt(k))
                .filter(k => k < index)
                .forEach(k => {
                    reindexed[k] = newValues[k];
                });
            return reindexed;
        });
    }, []);

    // Update catalog selection in edit mode
    const updateMasterPdfSelection = useCallback((index: number, selectedOption: SelectOption | null) => {
        const dokumen_id = selectedOption ? String(selectedOption.value) : '';
        
        setFormData(prev => ({
            ...prev,
            data_details: prev.data_details?.map((item, i) => 
                i === index ? { ...item, dokumen_id } : item
            ) || []
        }));
    }, []);

    // Handle detail input change
    const handleDetailInputChange = useCallback((index: number, field: keyof Omit<VinDetailItem, 'dokumen_id'>, value: string) => {
        setFormData(prev => ({
            ...prev,
            data_details: prev.data_details?.map((item, i) => 
                i === index ? { ...item, [field]: value } : item
            ) || []
        }));
    }, []);

    // Handle search input change in edit mode
    const handleSearchInputChange = useCallback((index: number) => (inputValue: string) => {
        setSearchInputValues(prev => ({
            ...prev,
            [index]: inputValue
        }));
    }, []);

    // Validate form in edit mode
    const validateForm = useCallback((): boolean => {
        const newErrors: VinFormErrors = {};

        if (!formData.vin_number.trim()) {
            newErrors.vin_number = 'VIN Number is required';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    // Handle save in edit mode
    const handleSave = useCallback(async () => {
        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!vinId) {
            toast.error('VIN ID is required for update');
            return;
        }

        setSubmitting(true);

        try {
            // Convert to API format by removing isNew property
            const apiFormData: VinFormData = {
                vin_number: formData.vin_number,
                product_name_en: formData.product_name_en,
                product_name_cn: formData.product_name_cn,
                product_description: formData.product_description,
                data_details: formData.data_details?.map(detail => ({
                    dokumen_id: detail.dokumen_id,
                    product_detail_name_en: detail.product_detail_name_en,
                    product_detail_name_cn: detail.product_detail_name_cn,
                    product_detail_description: detail.product_detail_description
                }))
            };
            
            const response = await VinService.updateVin(vinId, apiFormData);

            if (response.data?.success) {
                toast.success(response.data?.message || 'VIN updated successfully');
                setIsEditMode(false);
                // Refresh data after successful update
                await fetchVinData();
            } else {
                toast.error(response.data?.message || response.message || 'Failed to update VIN');
            }
        } catch (error: any) {
            console.error('Error updating VIN:', error);
            toast.error('An error occurred while updating VIN');
        } finally {
            setSubmitting(false);
        }
    }, [formData, validateForm, vinId, fetchVinData]);

    // Handle delete
    const handleDelete = useCallback(async () => {
        if (!vinId) {
            toast.error('VIN ID is required for deletion');
            return;
        }

        setSubmitting(true);

        try {
            const response = await VinService.deleteVin(vinId);

            if (response.data?.success) {
                toast.success(response.data?.message || 'VIN deleted successfully');
                navigate('/epc/vins');
            } else {
                toast.error(response.data?.message || response.message || 'Failed to delete VIN');
            }
        } catch (error: any) {
            console.error('Error deleting VIN:', error);
            toast.error('An error occurred while deleting VIN');
        } finally {
            setSubmitting(false);
        }
    }, [vinId, navigate]);

    // Handle cancel edit mode
    const handleCancel = useCallback(() => {
        setIsEditMode(false);
        setErrors({});
        setSearchInputValues({});
        
        // Reset form data to original values
        if (vinData) {
            setFormData({
                vin_number: vinData.vin_number,
                product_name_en: vinData.product_name_en,
                product_name_cn: vinData.product_name_cn,
                product_description: vinData.product_description || '',
                data_details: vinData.details?.map(detail => ({
                    dokumen_id: detail.dokumen_id,
                    product_detail_name_en: detail.product_detail_name_en,
                    product_detail_name_cn: detail.product_detail_name_cn,
                    product_detail_description: detail.product_detail_description,
                    isNew: false
                })) || [],
                master_pdf: vinData.master_pdf?.map(pdf => ({
                    master_pdf_id: pdf.master_pdf_id,
                    master_pdf_name: pdf.master_pdf_name,
                    isNew: false // Reset to not new
                })) || []
            });
        }
    }, [vinData]);

    // Fetch data on component mount
    useEffect(() => {
        fetchVinData();
    }, [fetchVinData]);

    return {
        // Data state
        vinData,
        loading,
        error,
        
        // Edit mode state
        isEditMode,
        formData,
        errors,
        submitting,
        
        // Search state
        searchInputValues,
        
        // Actions
        setIsEditMode,
        handleInputChange,
        addMasterPdf,
        removeMasterPdf,
        updateMasterPdfSelection,
        handleDetailInputChange,
        handleSearchInputChange,
        handleSave,
        handleDelete,
        handleCancel,
        fetchVinData,
        validateForm
    };
};
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { VinService } from '@/services/partCatalogueService';
import { VinFormData } from '@/types/partCatalogue';
import { SelectOption } from '@/types/asyncSelect';

// Error interface for better type safety
interface VinFormErrors {
    vin_number?: string;
    production_name_en?: string;
    production_name_cn?: string;
    production_description?: string;
    master_pdf?: string;
}

// Extended master PDF interface for editing with isNew flag
interface MasterPdfEdit {
    master_pdf_id: string;
    isNew?: boolean;
}

// Extended form data interface for editing
interface VinFormDataEdit {
    vin_number: string;
    production_name_en: string;
    production_name_cn: string;
    production_description?: string;
    master_pdf?: MasterPdfEdit[];
}

// Response type based on the provided API structure
interface VinDetailData {
    production_id: string;
    vin_number: string;
    production_name_en: string;
    production_name_cn: string;
    production_description: string;
    master_pdf: Array<{
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
        production_name_en: '',
        production_name_cn: '',
        production_description: '',
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
                // Cast response data to our expected type since API has master_pdf field
                // The API response includes master_pdf but the Vin type doesn't have it
                const data = response.data.data as unknown as VinDetailData;
                setVinData(data);
                
                // Initialize form data for potential edit mode
                setFormData({
                    vin_number: data.vin_number,
                    production_name_en: data.production_name_en,
                    production_name_cn: data.production_name_cn,
                    production_description: data.production_description || '',
                    master_pdf: data.master_pdf.map(pdf => ({
                        master_pdf_id: pdf.master_pdf_id,
                        isNew: false // Existing data is not new
                    }))
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

    // Handle input changes in edit mode
    const handleInputChange = useCallback((name: keyof VinFormDataEdit, value: string) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    // Add master PDF in edit mode (add to top)
    const addMasterPdf = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            master_pdf: [
                { master_pdf_id: '', isNew: true }, // Add new item at the beginning (top)
                ...(prev.master_pdf || []).map(pdf => ({ ...pdf, isNew: false })) // Mark existing items as not new
            ]
        }));
    }, []);

    // Remove master PDF in edit mode
    const removeMasterPdf = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            master_pdf: prev.master_pdf?.filter((_, i) => i !== index) || []
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

    // Update master PDF selection in edit mode
    const updateMasterPdfSelection = useCallback((index: number, selectedOption: SelectOption | null) => {
        const master_pdf_id = selectedOption ? String(selectedOption.value) : '';
        
        setFormData(prev => ({
            ...prev,
            master_pdf: prev.master_pdf?.map((item, i) => 
                i === index ? { master_pdf_id, isNew: item.isNew } : item
            ) || []
        }));
    }, []);

    // Handle search input change in edit mode
    const handleSearchInputChange = useCallback((index: number) => (inputValue: string) => {
        setSearchInputValues(prev => ({
            ...prev,
            [index]: inputValue
        }));
        console.log(`Search input for field ${index} changed to:`, `"${inputValue}"`);
    }, []);

    // Validate form in edit mode
    const validateForm = useCallback((): boolean => {
        const newErrors: VinFormErrors = {};

        if (!formData.vin_number.trim()) {
            newErrors.vin_number = 'VIN Number is required';
        }

        if (!formData.production_name_en.trim()) {
            newErrors.production_name_en = 'Production Name (EN) is required';
        }

        if (!formData.production_name_cn.trim()) {
            newErrors.production_name_cn = 'Production Name (CN) is required';
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
                production_name_en: formData.production_name_en,
                production_name_cn: formData.production_name_cn,
                production_description: formData.production_description,
                master_pdf: formData.master_pdf?.map(pdf => ({
                    master_pdf_id: pdf.master_pdf_id
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
                production_name_en: vinData.production_name_en,
                production_name_cn: vinData.production_name_cn,
                production_description: vinData.production_description || '',
                master_pdf: vinData.master_pdf.map(pdf => ({
                    master_pdf_id: pdf.master_pdf_id,
                    isNew: false // Reset to not new
                }))
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
        handleSearchInputChange,
        handleSave,
        handleDelete,
        handleCancel,
        fetchVinData,
        validateForm
    };
};
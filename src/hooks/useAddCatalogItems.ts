import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateCatalog } from './useCreateCatalog';
import { CatalogManageService } from '@/services/partCatalogueService';
import { CatalogValidationErrors } from '@/types';

export const useAddCatalogItems = () => {
    const { id: catalogId } = useParams();
    
    // Loading states
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [formSubmitLoading, setFormSubmitLoading] = useState(false);
    const [catalogData, setCatalogData] = useState<any>(null);
    
    // Inherit functionality dari create catalog hook
    const createHook = useCreateCatalog();
    const { setFormData, formData, setValidationErrors } = createHook;
    
    // Load catalog data untuk mendapatkan master_category dan code_cabin
    const loadCatalogData = useCallback(async () => {
        if (!catalogId) {
            setIsLoadingData(false);
            return;
        }
        
        setIsLoadingData(true);
        try {
            const response = await CatalogManageService.getItemsById(catalogId);
            
            if (response.success && response.data) {
                const catalogInfo = response.data;
                
                setCatalogData(catalogInfo);
                
                // Set form data dengan info dari catalog induk
                setFormData(prev => ({
                    ...prev,
                    code_cabin: catalogInfo.dokumen_name || '',
                    master_category: catalogInfo.master_category_id?.toString() || '',
                    // Reset fields lainnya untuk item baru
                    part_id: '',
                    type_id: '',
                    svg_image: null,
                    parts: []
                }));
                
            } else {
                toast.error('Failed to load catalog data');
            }
        } catch (error) {
            console.error('Error loading catalog:', error);
            toast.error('Failed to load catalog data');
        } finally {
            setIsLoadingData(false);
        }
    }, [catalogId, setFormData]);

    // Load data saat component mount
    useEffect(() => {
        loadCatalogData();
    }, [loadCatalogData]);

    const validateCreateCatalogForm = useCallback((): CatalogValidationErrors => {
            const errors: CatalogValidationErrors = {};
    
            if (!formData.code_cabin.trim()) {
                errors.code_cabin = 'Document Name is required';
            }    

            if (formData.parts.length === 0) {
                toast.error('At least one part is required');
                errors.parts = 'At least one part is required';
            } else {
                formData.parts.forEach((part, index) => {
                    if (!part.target_id.trim()) {
                        toast.error(`Part #${index + 1} - Part target is required`);
                        (errors as any)[`part_${index}_target`] = `Part #${index + 1} target is required`;
                    }
                    if (!part.part_number.trim()) {
                        toast.error(`Part #${index + 1} - Part number is required`);
                        (errors as any)[`part_${index}_code`] = `Part #${index + 1}number is required`;
                    }
                    if (!part.catalog_item_name_en.trim()) {
                        toast.error(`Part #${index + 1} - English name is required`);
                        (errors as any)[`part_${index}_name_en`] = `Part #${index + 1} English name is required`;
                    }
                    if (part.quantity <= 0) {
                        toast.error(`Part #${index + 1} - Quantity must be greater than 0`);
                        (errors as any)[`part_${index}_quantity`] = `Part ${index + 1} quantity must be greater than 0`;
                    }
                });
            }
            
            if (!formData.part_id) {
                toast.error('Part selection is required');
                errors.part_id = 'Part selection is required';
            }
            
            if (!formData.master_category) {
                toast.error('Master Category is required');
                errors.master_category = 'Master Category is required';
            }
    
            return errors;
        }, [formData]);
    // Handle submit untuk add items ke catalog existing
    const handleAddItemsToCatalog = useCallback(async (e: React.FormEvent): Promise<boolean> => {
        e.preventDefault();
        const errors = validateCreateCatalogForm();
        setValidationErrors(errors);
        if (!catalogId) {
            toast.error('Catalog ID tidak valid');
            return false;
        }
        if (Object.keys(errors).length > 0) {
            return false;
        }
        
        setFormSubmitLoading(true);
        try {
            const response = await CatalogManageService.addItemsToCatalog(catalogId, formData);
            
            if (response?.data?.success) {
                toast.success('Items berhasil ditambahkan ke catalog');
                setValidationErrors({});
                return true;
            } else {
                // Handle server response with success: false
                const errorMessage = response?.data?.message || 'Gagal menambahkan items';
                
                if (errorMessage.includes('Kombinasi dokumen_name, master_category_id, category_id, dan type_category_id sudah ada') ||
                    errorMessage.includes('dokumen_name, master_category_id, category_id, dan type_category_id')) {
                    toast.error('The combination of Code Cabin, Master Category, Category, and Type Category already exists. Please use a different combination.');
                } else {
                    toast.error(errorMessage);
                }
                
                setValidationErrors({ general: errorMessage });
                return false;
            }
        } catch (error: any) {
            setValidationErrors({ general: 'Failed to add items to catalog' });
            console.error('Add items error:', error);
            
            // Check for specific error message from API error response
            const errorMessage = error.message || 'Failed to add items to catalog';
            
            if (errorMessage.includes('Kombinasi dokumen_name, master_category_id, category_id, dan type_category_id sudah ada') ||
                errorMessage.includes('dokumen_name, master_category_id, category_id, dan type_category_id')) {
                toast.error('The combination of Code Cabin, Master Category, Category, and Type Category already exists. Please use a different combination.');
            } else {
                toast.error(errorMessage);
            }
            return false;
        } finally {
            setFormSubmitLoading(false);
        }
    }, [catalogId, formData]);

    return {
        ...createHook,
        // Override submit handler untuk add items
        handleSubmit: handleAddItemsToCatalog,
        // Override loading state
        loading: formSubmitLoading || createHook.loading,
        // Add Items specific data
        catalogId,
        catalogData,
        loadingCatalog: isLoadingData,
        // Debug helper
        reloadData: loadCatalogData
    };
};
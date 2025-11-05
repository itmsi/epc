import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateCatalog } from './useCreateCatalog';
import { CatalogManageService } from '@/services/partCatalogueService';
import { PartItem } from '@/types/asyncSelect';

export const useEditCatalog = () => {
    const { id: catalogId } = useParams();
    
    // Loading states - terpisah dari create catalog hook
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [formSubmitLoading, setFormSubmitLoading] = useState(false);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    
    // Inherit semua functionality dari create catalog
    const createHook = useCreateCatalog();
    const { setFormData, formData } = createHook;

    // Load data catalog untuk edit
    const loadCatalogData = useCallback(async () => {
        if (!catalogId) {
            setIsLoadingData(false);
            return;
        }
        
        setIsLoadingData(true);
        
        try {
            const response = await CatalogManageService.getCatalogForEdit(catalogId);
            
            if (response.success && response.data) {
                const catalogData = response.data;
    
                // Set gambar existing kalau ada
                if (catalogData.item_category_foto) {
                    setExistingImageUrl(catalogData.item_category_foto);
                }
                
                // Transform parts data
                const transformedParts: PartItem[] = [];
                if (catalogData.details && catalogData.details.length > 0) {
                    catalogData.details.forEach((detail: any, index: number) => {
                        // Generate unique ID to prevent reference issues - combine item_category_id with index
                        const uniqueId = detail.item_category_id ? `${detail.item_category_id}_${index}` : `part_${Date.now()}_${index}`;
                        
                        transformedParts.push({
                            id: uniqueId,
                            target_id: detail.target_id || '',
                            part_number: detail.part_number || '',
                            catalog_item_name_en: detail.catalog_item_name_en || '',
                            catalog_item_name_ch: detail.catalog_item_name_ch || '',
                            description: detail.description || '',
                            quantity: detail.quantity || 1,
                            unit: detail.unit || '',
                            file_foto: null
                        });
                    });
                }
                
                // Populate form dengan data dari API
                setFormData(prev => ({
                    ...prev,
                    code_cabin: catalogData.dokumen_name || '',
                    dokumen_id: catalogData.dokumen_id || '',
                    master_category: catalogData.master_category_id?.toString() || '',
                    part_id: catalogData.category_id?.toString() || '',
                    type_id: catalogData.type_category_id?.toString() || '',
                    svg_image: undefined, // undefined = keep existing image, null = remove, File = new upload
                    parts: transformedParts
                }));
                
            } else {
                toast.error(response.message || 'Catalog tidak ditemukan');
            }
        } catch (error) {
            console.error('Error loading catalog:', error);
            toast.error('Gagal memuat data catalog');
        } finally {
            setIsLoadingData(false);
        }
    }, [catalogId, setFormData]);
    
    // Load data saat mount atau catalogId berubah
    useEffect(() => {
        loadCatalogData();
    }, [loadCatalogData]);
    
    // Handle submit untuk update catalog
    const handleUpdateCatalog = useCallback(async (e: React.FormEvent): Promise<boolean> => {
        e.preventDefault();
        
        if (!catalogId) {
            toast.error('ID catalog tidak valid');
            return false;
        }
        
        // Validasi basic
        if (!formData.code_cabin || !formData.master_category) {
            toast.error('Mohon lengkapi field yang wajib');
            return false;
        }
        
        setFormSubmitLoading(true);
        try {
            // Gunakan update service yang proper
            const response = await CatalogManageService.updateItemsById(catalogId, formData);
            
            // Handle different response structures
            if (response?.data?.success) {
                toast.success('Catalog berhasil diupdate');
                return true;
            } else {
                const errorMessage = response?.data?.message || 'Update gagal';
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            console.error('Update error:', error);
            toast.error(error.message || 'Gagal update catalog');
            return false;
        } finally {
            setFormSubmitLoading(false);
        }
    }, [catalogId, formData]);

    return {
        ...createHook,
        // Override submit handler untuk update
        handleSubmit: handleUpdateCatalog,
        // Override loading to include form submit loading
        loading: formSubmitLoading || createHook.loading,
        // Extra data untuk edit mode
        catalogId,
        loadingCatalog: isLoadingData,
        existingImageUrl,
        // Debug helper
        reloadData: loadCatalogData
    };
};
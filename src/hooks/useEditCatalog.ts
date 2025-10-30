import { useEffect, useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCreateCatalog } from './useCreateCatalog';
import { CatalogManageService } from '@/services/partCatalogueService';
import { PartItem } from '@/types/asyncSelect';

/**
 * Hook untuk Edit Catalog yang extend useCreateCatalog
 * Menambahkan functionality untuk load dan populate data existing catalog
 */
export const useEditCatalog = () => {
    const { id: catalogId } = useParams();
    
    // State untuk menyimpan existing image URL
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    
    // Extend semua functionality dari useCreateCatalog
    const createCatalogHook = useCreateCatalog();
    const { setFormData, loading } = createCatalogHook;
    
    // Load catalog data untuk editing
    const loadCatalogForEdit = useCallback(async () => {
        if (!catalogId) return;
        
        try {
            const response = await CatalogManageService.getCatalogForEdit(catalogId);
            
            if (response.success) {
                // Set existing image URL
                const imageUrl = response.data.item_category_foto || null;
                setExistingImageUrl(imageUrl);
                
                // Transform API response ke format form
                if (response.data.details && response.data.details.length > 0) {
                    const parts: PartItem[] = response.data.details.map((detail: any, index: number) => ({
                        id: `part-${index}`,
                        target_id: detail.target_id,
                        part_number: detail.part_number,
                        catalog_item_name_en: detail.catalog_item_name_en,
                        catalog_item_name_ch: detail.catalog_item_name_ch,
                        description: detail.description || '',
                        quantity: detail.quantity || 1,
                        unit: detail.unit || '',
                        file_foto: null
                    }));
                    
                    // Populate form data
                    setFormData(prev => ({
                        ...prev,
                        code_cabin: response.data.dokumen_name || '',
                        master_category: response.data.master_category_id || '',
                        part_id: response.data.category_id || '',
                        type_id: response.data.type_category_id || '',
                        parts: parts
                    }));
                }
                
                return {
                    dokumen_name: response.data.dokumen_name,
                    master_category_name_en: response.data.master_category_name_en,
                    master_category_name_cn: response.data.master_category_name_cn
                };
            } else {
                toast.error(response.message || 'Failed to load catalog data');
                return null;
            }
        } catch (error) {
            console.error('Error loading catalog for edit:', error);
            toast.error('Failed to load catalog data');
            return null;
        }
    }, [catalogId, setFormData]);
    
    // Load data saat component mount
    useEffect(() => {
        if (catalogId) {
            loadCatalogForEdit();
        }
    }, [catalogId, loadCatalogForEdit]);
    
    // Override handleSubmit untuk Update instead of Create
    const handleSubmitEdit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!catalogId) {
            toast.error('Catalog ID is required');
            return;
        }
        
        try {
            // For now, kita bisa gunakan create endpoint dengan modification
            // Nanti bisa diganti dengan update endpoint yang proper
            console.log('Updating catalog:', catalogId, createCatalogHook.formData);
            toast.success('Catalog updated successfully (demo)');
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update catalog');
        }
    }, [catalogId, createCatalogHook.formData]);
    
    return {
        ...createCatalogHook,
        // Override handleSubmit untuk Edit mode
        handleSubmit: handleSubmitEdit,
        // Extra data untuk Edit mode
        catalogId,
        loadCatalogForEdit,
        // Loading state khusus Edit
        loadingCatalog: loading,
        // Existing image URL untuk FileUpload component
        existingImageUrl
    };
};
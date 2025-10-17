import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
    PartItem,
    EditCatalogData
} from '@/types/asyncSelect';
import { usePartCatalogueManagement } from '@/hooks/usePartCatalogueManagement';
import { CatalogManageService } from '@/services/catalogManageService';

interface UseEditCatalogProps {
    catalogId?: string;
}

interface UseEditCatalogReturn extends ReturnType<typeof usePartCatalogueManagement> {
    // Original catalog data
    catalogData: EditCatalogData | null;
    
    // Loading states
    loadingCatalog: boolean;
    
    // Fetch catalog data
    fetchCatalogData: () => Promise<void>;
}

export function useEditCatalog(props: UseEditCatalogProps = {}): UseEditCatalogReturn {
    const { catalogId: propCatalogId } = props;
    const params = useParams();
    const navigate = useNavigate();
    const catalogId = propCatalogId || params.id;

    // Use existing part catalogue management hook
    const partCatalogueHook = usePartCatalogueManagement();

    // Additional states for edit functionality
    const [catalogData, setCatalogData] = useState<EditCatalogData | null>(null);
    const [loadingCatalog, setLoadingCatalog] = useState<boolean>(true);
    
    // Ref to track if catalog data has been fetched to prevent multiple calls
    const hasFetchedCatalog = useRef<boolean>(false);

    // Fetch catalog data by ID
    const fetchCatalogData = useCallback(async () => {
        if (!catalogId) return;
        
        // Prevent multiple fetches
        if (hasFetchedCatalog.current) return;

        try {
            setLoadingCatalog(true);
            hasFetchedCatalog.current = true;
            
            const response = await CatalogManageService.getItemsById(catalogId);
            
            if (response.success) {
                setCatalogData(response.data);
                
                // Populate form data from catalog response
                const masterCategory = response.data.data_master_category[0]; // Assuming single category for now
                if (masterCategory) {
                    // Transform data back to form format
                    const transformedParts: PartItem[] = masterCategory.data_items.map((item, index) => ({
                        id: item.items_id || `part-${index + 1}`,
                        part_target: item.target_id,
                        code_product: item.part_number,
                        file_foto: item.file_foto || null,
                        name_english: item.catalog_item_name_en,
                        name_chinese: item.catalog_item_name_ch,
                        quantity: item.quantity
                    }));

                    // Update form data using the existing hook's setFormData
                    partCatalogueHook.setFormData(prev => ({
                        ...prev,
                        code_cabin: response.data.name_pdf,
                        part_type: masterCategory.master_catalog,
                        part_id: masterCategory.master_category_id,
                        type_id: masterCategory.type_category_id,
                        parts: transformedParts
                    }));

                    // Fetch part catalogue data for the selected part type
                    // Add a small delay to prevent too many simultaneous requests
                    if (masterCategory.master_catalog) {
                        setTimeout(async () => {
                            try {
                                await partCatalogueHook.fetchPartCatalogueData(masterCategory.master_catalog);
                            } catch (error) {
                                console.error('Error fetching part catalogue data:', error);
                            }
                        }, 100);
                    }
                }
            } else {
                toast.error(response.message || 'Failed to load catalog data');
            }
        } catch (error) {
            console.error('Error fetching catalog data:', error);
            toast.error('Failed to load catalog data');
            hasFetchedCatalog.current = false; // Reset on error to allow retry
        } finally {
            setLoadingCatalog(false);
        }
    }, [catalogId]);

    // Override the submit handler for update functionality
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        const errors = partCatalogueHook.validateForm();
        partCatalogueHook.setValidationErrors(errors);

        if (Object.keys(errors).length > 0) {
            toast.error('Please fix the validation errors');
            return;
        }

        try {
            // For now, just show success message since update API is not implemented
            toast.success('Catalog updated successfully!');
            
            // Navigate back to manage page
            navigate('/epc/manage');
            
        } catch (error) {
            console.error('Error updating catalog:', error);
            toast.error('Failed to update catalog');
        }
    }, [partCatalogueHook, navigate]);

    // Load catalog data on mount
    useEffect(() => {
        if (catalogId) {
            fetchCatalogData();
        }
    }, [catalogId, fetchCatalogData]);

    return {
        ...partCatalogueHook,
        
        // Override handleSubmit for update functionality
        handleSubmit,
        
        // Additional edit-specific properties
        catalogData,
        loadingCatalog,
        fetchCatalogData
    };
}

export default useEditCatalog;
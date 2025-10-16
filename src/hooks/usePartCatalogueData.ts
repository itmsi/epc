import { useState, useCallback } from 'react';
import { 
    useCabin, 
    useEngine, 
    useAxle,
    useTransmission,
    useSteering
} from '@/hooks/usePartCatalogue';

interface UsePartCatalogueDataReturn {
    // Data
    cabins: any[] | null;
    engines: any[] | null;
    axles: any[] | null;
    transmissions: any[] | null;
    steerings: any[] | null;
    
    // Loading states
    cabinsLoading: boolean;
    enginesLoading: boolean;
    axlesLoading: boolean;
    transmissionsLoading: boolean;
    steeringLoading: boolean;
    
    // Functions
    loadPartTypeData: (partType: string) => Promise<void>;
    isDataLoading: (partType: string) => boolean;
}

/**
 * Custom hook untuk lazy loading part catalogue data
 * Hanya fetch data ketika part type dipilih untuk menghindari duplicate API calls
 */
export const usePartCatalogueData = (): UsePartCatalogueDataReturn => {
    const [loadedPartTypes, setLoadedPartTypes] = useState<Set<string>>(new Set());

    // Initialize hooks tapi jangan fetch otomatis
    const { cabins, loading: cabinsLoading, fetchCabins } = useCabin();
    const { engines, loading: enginesLoading, fetchEngines } = useEngine();
    const { axles, loading: axlesLoading, fetchAxles } = useAxle();
    const { transmissions, loading: transmissionsLoading, fetchTransmissions } = useTransmission();
    const { steerings, loading: steeringLoading, fetchSteerings } = useSteering();

    // Function untuk load data berdasarkan part type
    const loadPartTypeData = useCallback(async (partType: string) => {
        if (!partType || loadedPartTypes.has(partType)) {
            return; // Skip jika sudah di-load
        }

        try {
            switch (partType) {
                case 'cabin':
                    if (!cabins || cabins.length === 0) {
                        await fetchCabins();
                    }
                    break;
                case 'engine':
                    if (!engines || engines.length === 0) {
                        await fetchEngines();
                    }
                    break;
                case 'axle':
                    if (!axles || axles.length === 0) {
                        await fetchAxles();
                    }
                    break;
                case 'transmission':
                    if (!transmissions || transmissions.length === 0) {
                        await fetchTransmissions();
                    }
                    break;
                case 'steering':
                    if (!steerings || steerings.length === 0) {
                        await fetchSteerings();
                    }
                    break;
            }

            // Mark as loaded
            setLoadedPartTypes(prev => new Set([...prev, partType]));
        } catch (error) {
            console.error(`Error loading ${partType} data:`, error);
        }
    }, [
        loadedPartTypes,
        cabins, engines, axles, transmissions, steerings,
        fetchCabins, fetchEngines, fetchAxles, fetchTransmissions, fetchSteerings
    ]);

    // Function untuk check loading state
    const isDataLoading = useCallback((partType: string): boolean => {
        switch (partType) {
            case 'cabin': return cabinsLoading;
            case 'engine': return enginesLoading;
            case 'axle': return axlesLoading;
            case 'transmission': return transmissionsLoading;
            case 'steering': return steeringLoading;
            default: return false;
        }
    }, [cabinsLoading, enginesLoading, axlesLoading, transmissionsLoading, steeringLoading]);

    return {
        // Data
        cabins,
        engines,
        axles,
        transmissions,
        steerings,
        
        // Loading states
        cabinsLoading,
        enginesLoading,
        axlesLoading,
        transmissionsLoading,
        steeringLoading,
        
        // Functions
        loadPartTypeData,
        isDataLoading
    };
};
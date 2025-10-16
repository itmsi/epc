import { useState, useEffect } from 'react';
import { 
    useCabin, 
    useEngine, 
    useAxle,
    useTransmission,
    useSteering
} from '@/hooks/usePartCatalogue';

interface UsePartDataReturn {
    cabins: any[] | null;
    engines: any[] | null;
    axles: any[] | null;
    transmissions: any[] | null;
    steerings: any[] | null;
    loading: boolean;
    currentPartData: any[] | null;
    getCurrentPartLoading: (partType: string) => boolean;
}

/**
 * Custom hook untuk mengelola data part catalogue dengan lazy loading
 * Hanya fetch data ketika part type dipilih
 */
export const usePartData = (selectedPartType: string): UsePartDataReturn => {
    const [loadedPartTypes, setLoadedPartTypes] = useState<Set<string>>(new Set());

    // Conditional hooks - hanya panggil ketika diperlukan
    const shouldLoadCabin = selectedPartType === 'cabin' || loadedPartTypes.has('cabin');
    const shouldLoadEngine = selectedPartType === 'engine' || loadedPartTypes.has('engine');
    const shouldLoadAxle = selectedPartType === 'axle' || loadedPartTypes.has('axle');
    const shouldLoadTransmission = selectedPartType === 'transmission' || loadedPartTypes.has('transmission');
    const shouldLoadSteering = selectedPartType === 'steering' || loadedPartTypes.has('steering');

    // Panggil hooks hanya jika diperlukan
    const cabinData = shouldLoadCabin ? useCabin() : { cabins: null, loading: false };
    const engineData = shouldLoadEngine ? useEngine() : { engines: null, loading: false };
    const axleData = shouldLoadAxle ? useAxle() : { axles: null, loading: false };
    const transmissionData = shouldLoadTransmission ? useTransmission() : { transmissions: null, loading: false };
    const steeringData = shouldLoadSteering ? useSteering() : { steerings: null, loading: false };

    // Track loaded part types
    useEffect(() => {
        if (selectedPartType && !loadedPartTypes.has(selectedPartType)) {
            setLoadedPartTypes(prev => new Set([...prev, selectedPartType]));
        }
    }, [selectedPartType, loadedPartTypes]);

    // Get current part data berdasarkan selected part type
    const getCurrentPartData = (): any[] | null => {
        switch (selectedPartType) {
            case 'cabin': return cabinData.cabins;
            case 'engine': return engineData.engines;
            case 'axle': return axleData.axles;
            case 'transmission': return transmissionData.transmissions;
            case 'steering': return steeringData.steerings;
            default: return null;
        }
    };

    // Get loading state for specific part type
    const getCurrentPartLoading = (partType: string): boolean => {
        switch (partType) {
            case 'cabin': return cabinData.loading;
            case 'engine': return engineData.loading;
            case 'axle': return axleData.loading;
            case 'transmission': return transmissionData.loading;
            case 'steering': return steeringData.loading;
            default: return false;
        }
    };

    const currentPartData = getCurrentPartData();
    const loading = getCurrentPartLoading(selectedPartType);

    return {
        cabins: cabinData.cabins,
        engines: engineData.engines,
        axles: axleData.axles,
        transmissions: transmissionData.transmissions,
        steerings: steeringData.steerings,
        loading,
        currentPartData,
        getCurrentPartLoading
    };
};
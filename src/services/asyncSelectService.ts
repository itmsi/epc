import { AxleService, CabinService, EngineService, SteeringService, TransmissionService } from '@/services/partCatalogueService';

interface Option {
    value: string | number;
    label: string;
}

export const fetchPartCatalogueOptions = async (
    partType: string,
    searchTerm: string = '',
    page: number = 1,
    pageSize: number = 20
): Promise<{
    items: Option[];
    hasNextPage: boolean;
    totalItems: number;
}> => {
    try {
        let response;
        let items: Option[] = [];
        
        const filters = {
            search: searchTerm,
            sort_order: 'asc' as const
        };

        switch (partType) {
            case 'cabin':
                response = await CabinService.getCabins(page, pageSize, filters);
                if (response.data.success) {
                    items = response.data.data.items.map((cabin: any) => ({
                        value: cabin.cabines_id,
                        label: `${cabin.cabines_name_en} - ${cabin.cabines_name_cn}`
                    }));
                }
                break;
                
            case 'engine':
                response = await EngineService.getEngines(page, pageSize, filters);
                if (response.data.success) {
                    items = response.data.data.items.map((engine: any) => ({
                        value: engine.engines_id,
                        label: `${engine.engines_name_en} - ${engine.engines_name_cn}`
                    }));
                }
                break;
                
            case 'axle':
                response = await AxleService.getAxles(page, pageSize, filters);
                if (response.data.success) {
                    items = response.data.data.items.map((axle: any) => ({
                        value: axle.axel_id,
                        label: `${axle.axel_name_en} - ${axle.axel_name_cn}`
                    }));
                }
                break;
                
            case 'transmission':
                response = await TransmissionService.getTransmissions(page, pageSize, filters);
                if (response.data.success) {
                    items = response.data.data.items.map((transmission: any) => ({
                        value: transmission.transmission_id,
                        label: `${transmission.transmission_name_en} - ${transmission.transmission_name_cn}`
                    }));
                }
                break;
                
            case 'steering':
                response = await SteeringService.getSteerings(page, pageSize, filters);
                if (response.data.success) {
                    items = response.data.data.items.map((steering: any) => ({
                        value: steering.steering_id,
                        label: `${steering.steering_name_en} - ${steering.steering_name_cn}`
                    }));
                }
                break;
                
            default:
                throw new Error(`Unsupported part type: ${partType}`);
        }

        if (!response || !response.data.success) {
            throw new Error('Failed to fetch data');
        }

        const pagination = response.data.data.pagination;
        
        return {
            items,
            hasNextPage: pagination.page < pagination.totalPages,
            totalItems: pagination.total
        };
        
    } catch (error) {
        console.error(`Error fetching ${partType} options:`, error);
        return {
            items: [],
            hasNextPage: false,
            totalItems: 0
        };
    }
};

export const fetchSubTypeOptions = async (
    partType: string,
    partId: string,
    searchTerm: string = '',
    page: number = 1,
    pageSize: number = 20
): Promise<{
    items: Option[];
    hasNextPage: boolean;
    totalItems: number;
}> => {
    try {
        // For sub-types, we need to get the parent part data first
        // This is a simplified approach - in a real app, you might have separate APIs for sub-types
        
        let response;
        let subTypes: any[] = [];
        
        const filters = {
            search: '',
            sort_order: '' as const
        };

        switch (partType) {
            case 'cabin':
                response = await CabinService.getCabins(1, 10, filters); // Get all to find the specific one
                if (response.data.success) {
                    const selectedCabin = response.data.data.items.find((cabin: any) => cabin.cabines_id === partId);
                    subTypes = selectedCabin?.type_cabines || [];
                }
                break;
                
            case 'engine':
                response = await EngineService.getEngines(1, 10, filters);
                if (response.data.success) {
                    const selectedEngine = response.data.data.items.find((engine: any) => engine.engines_id === partId);
                    subTypes = selectedEngine?.type_engines || [];
                }
                break;
                
            case 'axle':
                response = await AxleService.getAxles(1, 10, filters);
                if (response.data.success) {
                    const selectedAxle = response.data.data.items.find((axle: any) => axle.axel_id === partId);
                    subTypes = selectedAxle?.type_axels || [];
                }
                break;
                
            case 'transmission':
                response = await TransmissionService.getTransmissions(1, 10, filters);
                if (response.data.success) {
                    const selectedTransmission = response.data.data.items.find((transmission: any) => transmission.transmission_id === partId);
                    subTypes = selectedTransmission?.type_transmissions || [];
                }
                break;
                
            case 'steering':
                response = await SteeringService.getSteerings(1, 10, filters);
                if (response.data.success) {
                    const selectedSteering = response.data.data.items.find((steering: any) => steering.steering_id === partId);
                    subTypes = selectedSteering?.type_steerings || [];
                }
                break;
                
            default:
                throw new Error(`Unsupported part type: ${partType}`);
        }

        // Filter by search term if provided
        if (searchTerm) {
            subTypes = subTypes.filter((type: any) => {
                const nameEn = getSubTypeName(type, partType, 'en').toLowerCase();
                const nameCn = getSubTypeName(type, partType, 'cn').toLowerCase();
                return nameEn.includes(searchTerm.toLowerCase()) || nameCn.includes(searchTerm.toLowerCase());
            });
        }

        // Apply pagination
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedSubTypes = subTypes.slice(startIndex, endIndex);

        const items: Option[] = paginatedSubTypes.map((type: any) => ({
            value: getSubTypeId(type, partType),
            label: `${getSubTypeName(type, partType, 'en')} - ${getSubTypeName(type, partType, 'cn')}`
        }));

        return {
            items,
            hasNextPage: endIndex < subTypes.length,
            totalItems: subTypes.length
        };
        
    } catch (error) {
        console.error(`Error fetching ${partType} sub-type options:`, error);
        return {
            items: [],
            hasNextPage: false,
            totalItems: 0
        };
    }
};

// Helper functions to get sub-type data based on part type
function getSubTypeId(type: any, partType: string): string {
    switch (partType) {
        case 'cabin': return type.type_cabine_id;
        case 'engine': return type.type_engine_id;
        case 'axle': return type.type_axel_id;
        case 'transmission': return type.type_transmission_id;
        case 'steering': return type.type_steeringwheel_id;
        default: return '';
    }
}

function getSubTypeName(type: any, partType: string, language: 'en' | 'cn'): string {
    const suffix = language === 'en' ? '_name_en' : '_name_cn';
    
    switch (partType) {
        case 'cabin': return type[`type_cabine${suffix}`] || '';
        case 'engine': return type[`type_engine${suffix}`] || '';
        case 'axle': return type[`type_axel${suffix}`] || '';
        case 'transmission': return type[`type_transmission${suffix}`] || '';
        case 'steering': return type[`type_steeringwheel${suffix}`] || '';
        default: return '';
    }
}
import { SelectOption, PartType } from '@/types/asyncSelect';

/**
 * Catalog-specific AsyncSelect Service
 */
export class CatalogAsyncSelectService {
    /**
     * Transform part catalogue data to select options
     */
    static transformPartDataToOptions(partType: PartType, data: any[]): SelectOption[] {
        if (!data || !Array.isArray(data)) return [];

        switch (partType) {
            case 'cabin':
                return data.map((cabin: any) => ({
                    value: cabin.cabines_id,
                    label: `${cabin.cabines_name_en} - ${cabin.cabines_name_cn}`
                }));
            case 'engine':
                return data.map((engine: any) => ({
                    value: engine.engines_id,
                    label: `${engine.engines_name_en} - ${engine.engines_name_cn}`
                }));
            case 'axle':
                return data.map((axle: any) => ({
                    value: axle.axel_id,
                    label: `${axle.axel_name_en} - ${axle.axel_name_cn}`
                }));
            case 'transmission':
                return data.map((transmission: any) => ({
                    value: transmission.transmission_id,
                    label: `${transmission.transmission_name_en} - ${transmission.transmission_name_cn}`
                }));
            case 'steering':
                return data.map((steering: any) => ({
                    value: steering.steering_id,
                    label: `${steering.steering_name_en} - ${steering.steering_name_cn}`
                }));
            default:
                return [];
        }
    }

    /**
     * Transform sub-type data to select options
     */
    static transformSubTypeDataToOptions(partType: PartType, subTypes: any[]): SelectOption[] {
        if (!subTypes || !Array.isArray(subTypes)) return [];

        const baseOptions = [{ value: '', label: 'Select Type' }];

        switch (partType) {
            case 'cabin':
                return baseOptions.concat(
                    subTypes.map((type: any) => ({
                        value: type.type_cabine_id,
                        label: `${type.type_cabine_name_en} - ${type.type_cabine_name_cn}`
                    }))
                );
            case 'engine':
                return baseOptions.concat(
                    subTypes.map((type: any) => ({
                        value: type.type_engine_id,
                        label: `${type.type_engine_name_en} - ${type.type_engine_name_cn}`
                    }))
                );
            case 'axle':
                return baseOptions.concat(
                    subTypes.map((type: any) => ({
                        value: type.type_axel_id,
                        label: `${type.type_axel_name_en} - ${type.type_axel_name_cn}`
                    }))
                );
            case 'transmission':
                return baseOptions.concat(
                    subTypes.map((type: any) => ({
                        value: type.type_transmission_id,
                        label: `${type.type_transmission_name_en} - ${type.type_transmission_name_cn}`
                    }))
                );
            case 'steering':
                return baseOptions.concat(
                    subTypes.map((type: any) => ({
                        value: type.type_steeringwheel_id,
                        label: `${type.type_steeringwheel_name_en} - ${type.type_steeringwheel_name_cn}`
                    }))
                );
            default:
                return baseOptions;
        }
    }

    /**
     * Create default options for part types
     */
    static createDefaultPartOptions(partType: string): SelectOption[] {
        return [{ value: '', label: `Select ${partType}` }];
    }

    /**
     * Get part type display name
     */
    static getPartTypeDisplayName(partType: PartType): string {
        const partTypeNames = {
            cabin: 'Cabin',
            engine: 'Engine', 
            axle: 'Axle',
            transmission: 'Transmission',
            steering: 'Steering'
        };

        return partTypeNames[partType] || partType;
    }

    /**
     * Validate part type selection
     */
    static validatePartType(partType: string): partType is PartType {
        const validPartTypes: PartType[] = ['cabin', 'engine', 'axle', 'transmission', 'steering'];
        return validPartTypes.includes(partType as PartType);
    }

    /**
     * Get field mappings for each part type
     */
    static getPartTypeFieldMappings(partType: PartType) {
        const mappings = {
            cabin: {
                id: 'cabines_id',
                nameEn: 'cabines_name_en',
                nameCn: 'cabines_name_cn',
                typeId: 'type_cabine_id',
                typeNameEn: 'type_cabine_name_en',
                typeNameCn: 'type_cabine_name_cn'
            },
            engine: {
                id: 'engines_id',
                nameEn: 'engines_name_en',
                nameCn: 'engines_name_cn',
                typeId: 'type_engine_id',
                typeNameEn: 'type_engine_name_en',
                typeNameCn: 'type_engine_name_cn'
            },
            axle: {
                id: 'axel_id',
                nameEn: 'axel_name_en',
                nameCn: 'axel_name_cn',
                typeId: 'type_axel_id',
                typeNameEn: 'type_axel_name_en',
                typeNameCn: 'type_axel_name_cn'
            },
            transmission: {
                id: 'transmission_id',
                nameEn: 'transmission_name_en',
                nameCn: 'transmission_name_cn',
                typeId: 'type_transmission_id',
                typeNameEn: 'type_transmission_name_en',
                typeNameCn: 'type_transmission_name_cn'
            },
            steering: {
                id: 'steering_id',
                nameEn: 'steering_name_en',
                nameCn: 'steering_name_cn',
                typeId: 'type_steeringwheel_id',
                typeNameEn: 'type_steeringwheel_name_en',
                typeNameCn: 'type_steeringwheel_name_cn'
            }
        };

        return mappings[partType];
    }
}
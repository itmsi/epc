import { SelectOption, PartType } from '@/types/asyncSelect';

/**
 * Service for AsyncSelect operations including search, filtering, and data transformation
 */
export class AsyncSelectService {
    /**
     * Filter options based on search query (case-insensitive)
     */
    static filterOptions(options: SelectOption[], searchQuery: string): SelectOption[] {
        if (!searchQuery) return options;
        
        const query = searchQuery.toLowerCase();
        return options.filter(option => 
            option.label.toLowerCase().includes(query) ||
            String(option.value).toLowerCase().includes(query)
        );
    }

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
     * Create a load options function for AsyncSelect
     */
    static createLoadOptions(
        allOptions: SelectOption[], 
        searchEnabled: boolean = true
    ) {
        return async (searchQuery: string): Promise<SelectOption[]> => {
            if (!searchEnabled) {
                return Promise.resolve(allOptions);
            }
            
            const filteredOptions = this.filterOptions(allOptions, searchQuery);
            return Promise.resolve(filteredOptions);
        };
    }

    /**
     * Get the selected option value for form data
     */
    static getSelectedOption(
        value: string | number, 
        options: SelectOption[]
    ): SelectOption | null {
        if (!value) return null;
        return options.find(option => option.value === value) || null;
    }

    /**
     * Create default options with placeholder
     */
    static createDefaultOptions(
        partType: string, 
        data: any[] | null = null
    ): SelectOption[] {
        const placeholder = { value: '', label: `Select ${partType}` };
        
        if (!data || !Array.isArray(data)) {
            return [placeholder];
        }

        return [placeholder];
    }

    /**
     * Debounce function for search input
     */
    static debounce<T extends (...args: any[]) => any>(
        func: T, 
        wait: number
    ): (...args: Parameters<T>) => void {
        let timeout: NodeJS.Timeout;
        
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    /**
     * Validate if an option exists in the available options
     */
    static validateOption(
        value: string | number, 
        options: SelectOption[]
    ): boolean {
        return options.some(option => option.value === value);
    }
}
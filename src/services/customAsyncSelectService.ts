import { SelectOption } from '@/types/asyncSelect';

/**
 * Generic Master AsyncSelect Service
 * Provides universal functionality for AsyncSelect components across different modules
 */
export class AsyncSelectService {
    /**
     * Filter options based on search query (case-insensitive)
     */
    static filterOptions(options: SelectOption[], searchQuery: string): SelectOption[] {
        if (!searchQuery?.trim()) return options;
        
        const query = searchQuery.toLowerCase().trim();
        return options.filter(option => 
            option.label.toLowerCase().includes(query) ||
            String(option.value).toLowerCase().includes(query)
        );
    }

    /**
     * Generic data transformation to SelectOption
     */
    static transformToOptions<T extends Record<string, any>>(
        data: T[],
        valueKey: keyof T,
        labelKey?: keyof T,
        labelKeys?: (keyof T)[],
        labelSeparator: string = ' - '
    ): SelectOption[] {
        if (!data || !Array.isArray(data)) return [];

        return data.map((item: T) => {
            let label: string;
            
            if (labelKeys && labelKeys.length > 0) {
                label = labelKeys
                    .map(key => String(item[key] || ''))
                    .filter(Boolean)
                    .join(labelSeparator);
            } else if (labelKey) {
                label = String(item[labelKey] || '');
            } else {
                label = String(item[valueKey] || '');
            }

            return {
                value: item[valueKey],
                label: label || String(item[valueKey])
            };
        });
    }

    /**
     * Transform sub-type data to select options for hierarchical data
     */
    static transformSubTypeToOptions<T extends Record<string, any>>(
        subTypes: T[],
        valueKey: keyof T,
        labelKeys: (keyof T)[],
        includeEmptyOption: boolean = true,
        emptyOptionText: string = 'Select Type',
        labelSeparator: string = ' - '
    ): SelectOption[] {
        if (!subTypes || !Array.isArray(subTypes)) return [];

        const baseOptions = includeEmptyOption ? [{ value: '', label: emptyOptionText }] : [];
        
        const transformedOptions = this.transformToOptions(
            subTypes, 
            valueKey, 
            undefined, 
            labelKeys, 
            labelSeparator
        );

        return [...baseOptions, ...transformedOptions];
    }

    /**
     * Create load options function for AsyncSelect with search capability
     */
    static createLoadOptions(
        allOptions: SelectOption[], 
        searchEnabled: boolean = true
    ) {
        return async (searchQuery: string = ''): Promise<SelectOption[]> => {
            await new Promise(resolve => setTimeout(resolve, 0));
            
            if (!searchEnabled) {
                return allOptions;
            }
            
            return this.filterOptions(allOptions, searchQuery);
        };
    }

    /**
     * Get selected option from options array by value
     */
    static getSelectedOption(
        value: string | number | null | undefined, 
        options: SelectOption[]
    ): SelectOption | null {
        if (value === null || value === undefined || value === '') return null;
        return options.find(option => String(option.value) === String(value)) || null;
    }

    /**
     * Create default options with placeholder
     */
    static createDefaultOptions(
        placeholderText: string = 'Select option',
        includeEmpty: boolean = true
    ): SelectOption[] {
        return includeEmpty ? [{ value: '', label: placeholderText }] : [];
    }

    /**
     * Debounce function for search input
     */
    static debounce<T extends (...args: any[]) => any>(
        func: T, 
        wait: number = 300
    ): (...args: Parameters<T>) => void {
        let timeout: NodeJS.Timeout;
        
        return (...args: Parameters<T>) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    /**
     * Validate if option value exists in available options
     */
    static validateOption(
        value: string | number | null | undefined, 
        options: SelectOption[]
    ): boolean {
        if (value === null || value === undefined || value === '') return false;
        return options.some(option => String(option.value) === String(value));
    }

    /**
     * Sort options alphabetically
     */
    static sortOptions(
        options: SelectOption[], 
        direction: 'asc' | 'desc' = 'asc'
    ): SelectOption[] {
        return [...options].sort((a, b) => {
            const comparison = a.label.localeCompare(b.label);
            return direction === 'asc' ? comparison : -comparison;
        });
    }

    /**
     * Group options by specified criteria
     */
    static groupOptions(
        options: SelectOption[],
        groupBy: (option: SelectOption) => string
    ): Record<string, SelectOption[]> {
        return options.reduce((groups, option) => {
            const group = groupBy(option);
            if (!groups[group]) {
                groups[group] = [];
            }
            groups[group].push(option);
            return groups;
        }, {} as Record<string, SelectOption[]>);
    }

    /**
     * Paginate options for large datasets
     */
    static paginateOptions(
        options: SelectOption[],
        page: number = 1,
        pageSize: number = 50
    ): {
        data: SelectOption[];
        totalPages: number;
        currentPage: number;
        totalItems: number;
        hasMore: boolean;
    } {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const data = options.slice(startIndex, endIndex);
        const totalPages = Math.ceil(options.length / pageSize);

        return {
            data,
            totalPages,
            currentPage: page,
            totalItems: options.length,
            hasMore: page < totalPages
        };
    }

    /**
     * Create options from enum or constant object
     */
    static createOptionsFromEnum<T extends Record<string, string | number>>(
        enumObject: T,
        labelTransform?: (key: string, value: string | number) => string
    ): SelectOption[] {
        return Object.entries(enumObject).map(([key, value]) => ({
            value: value,
            label: labelTransform ? labelTransform(key, value) : key
        }));
    }

    /**
     * Merge multiple option arrays while removing duplicates
     */
    static mergeOptions(...optionArrays: SelectOption[][]): SelectOption[] {
        const seen = new Set<string>();
        const merged: SelectOption[] = [];

        for (const options of optionArrays) {
            for (const option of options) {
                const key = String(option.value);
                if (!seen.has(key)) {
                    seen.add(key);
                    merged.push(option);
                }
            }
        }

        return merged;
    }
}
import React, { useState } from 'react';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Button from '@/components/ui/button/Button';
import Label from '@/components/form/Label';

interface TypeFormConfig {
    entityName: string;
    entityDisplayName: string;
    fields: {
        nameEn: string;
        nameCn: string;
        description: string;
    };
    labels: {
        nameEn: string;
        nameCn: string;
        description: string;
    };
    placeholders: {
        nameEn: string;
        nameCn: string;
        description: string;
    };
}

interface ReusableTypeFormProps<T> {
    typeData: T[];
    onTypeDataChange: (typeData: T[]) => void;
    config: TypeFormConfig;
    errors?: Record<string, string>;
    className?: string;
    modeEdit?: boolean;
}

function ReusableTypeForm<T extends Record<string, any>>({ 
    typeData, 
    onTypeDataChange,
    config,
    errors = {},
    className = "",
    modeEdit = false
}: ReusableTypeFormProps<T>) {
    const [newlyAddedIndexes, setNewlyAddedIndexes] = useState<Set<number>>(new Set());

    const handleAddType = () => {
        const newType = {
            [config.fields.nameEn]: '',
            [config.fields.nameCn]: '',
            [config.fields.description]: ''
        } as T;
        const newData = [newType, ...typeData];
        onTypeDataChange(newData);
        
        setNewlyAddedIndexes(new Set([0]));
        
        setTimeout(() => {
            setNewlyAddedIndexes(new Set());
        }, 3000);
    };

    const handleRemoveType = (index: number) => {
        const updatedTypes = typeData.filter((_, i) => i !== index);
        onTypeDataChange(updatedTypes);
    };

    const handleTypeChange = (index: number, field: string, value: string) => {
        const updatedTypes = [...typeData];
        updatedTypes[index] = {
            ...updatedTypes[index],
            [field]: value
        };
        onTypeDataChange(updatedTypes);
    };

    return (
        <div className={`space-y-6 ${className}`}>
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-primary-bold font-medium text-gray-900">
                    Sub Type {config.entityDisplayName}
                </h3>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddType}
                >
                    + Add Type {config.entityDisplayName}
                </Button>
            </div>
            
            <div className='space-y-4 max-h-[770px] overflow-y-auto'>
                {typeData.length === 0 && (
                    <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                        <p>No type {config.entityName}s added. Click "Add Type {config.entityDisplayName}" to add one.</p>
                    </div>
                )}

                {typeData.map((type, index) => {
                    const isNewlyAdded = newlyAddedIndexes.has(index);
                    return (
                        <div 
                            key={index} 
                            className={`border rounded-lg p-6 space-y-4 shadow-[inset 0px 0px 6px -4px #5f5f5f, 0px 10px 11px -15px #797979] transition-colors duration-500 ${
                                isNewlyAdded 
                                    ? 'border-green-400 bg-green-100' 
                                    : 'border-gray-200 bg-white'
                            }`}
                        >
                        <div className="flex items-center justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveType(index)}
                                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            >
                                Remove
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor={`${config.fields.nameEn}_${index}`}>
                                    {config.labels.nameEn} *
                                </Label>
                                <Input
                                    id={`${config.fields.nameEn}_${index}`}
                                    name={`${config.fields.nameEn}_${index}`}
                                    placeholder={config.placeholders.nameEn}
                                    value={type[config.fields.nameEn] || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        handleTypeChange(index, config.fields.nameEn, e.target.value)
                                    }
                                    error={!!errors[`type_${config.entityName}s.${index}.${config.fields.nameEn}`]}
                                    hint={errors[`type_${config.entityName}s.${index}.${config.fields.nameEn}`]}
                                    readonly={modeEdit}
                                />
                            </div>

                            <div>
                                <Label htmlFor={`${config.fields.nameCn}_${index}`}>
                                    {config.labels.nameCn}
                                </Label>
                                <Input
                                    id={`${config.fields.nameCn}_${index}`}
                                    name={`${config.fields.nameCn}_${index}`}
                                    placeholder={config.placeholders.nameCn}
                                    value={type[config.fields.nameCn] || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                                        handleTypeChange(index, config.fields.nameCn, e.target.value)
                                    }
                                    error={!!errors[`type_${config.entityName}s.${index}.${config.fields.nameCn}`]}
                                    hint={errors[`type_${config.entityName}s.${index}.${config.fields.nameCn}`]}
                                    readonly={modeEdit}
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor={`${config.fields.description}_${index}`}>
                                {config.labels.description}
                            </Label>
                            <TextArea
                                placeholder={config.placeholders.description}
                                value={type[config.fields.description] || ''}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                                    handleTypeChange(index, config.fields.description, e.target.value)
                                }
                                error={!!errors[`type_${config.entityName}s.${index}.${config.fields.description}`]}
                                hint={errors[`type_${config.entityName}s.${index}.${config.fields.description}`]}
                                rows={3}
                                readonly={modeEdit}
                            />
                        </div>
                    </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ReusableTypeForm;
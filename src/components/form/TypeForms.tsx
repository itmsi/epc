import React from 'react';
import ReusableTypeForm from './TypeCabineForm';
import { TypeAxleFormData, TypeCabinFormData, TypeEngineFormData, TypeSteeringFormData, TypeTransmissionFormData } from '@/types/partCatalogue';

// Configuration untuk Cabin
const cabinConfig = {
    entityName: 'cabin',
    entityDisplayName: 'Cabin',
    fields: {
        nameEn: 'type_cabine_name_en',
        nameCn: 'type_cabine_name_cn',
        description: 'type_cabine_description'
    },
    labels: {
        nameEn: 'Type Cabin Name (EN)',
        nameCn: 'Type Cabin Name (CN)',
        description: 'Type Cabin Description'
    },
    placeholders: {
        nameEn: 'Enter type cabin name in English',
        nameCn: 'Enter type cabin name in Chinese',
        description: 'Enter type cabin description'
    }
};

// Configuration untuk Engine
const engineConfig = {
    entityName: 'engine',
    entityDisplayName: 'Engine',
    fields: {
        nameEn: 'type_engine_name_en',
        nameCn: 'type_engine_name_cn',
        description: 'type_engine_description'
    },
    labels: {
        nameEn: 'Type Engine Name (EN)',
        nameCn: 'Type Engine Name (CN)',
        description: 'Type Engine Description'
    },
    placeholders: {
        nameEn: 'Enter type engine name in English',
        nameCn: 'Enter type engine name in Chinese',
        description: 'Enter type engine description'
    }
};

// Configuration untuk Axel
const axelConfig = {
    entityName: 'axel',
    entityDisplayName: 'Axle',
    fields: {
        nameEn: 'type_axel_name_en',
        nameCn: 'type_axel_name_cn',
        description: 'type_axel_description'
    },
    labels: {
        nameEn: 'Type Axle Name (EN)',
        nameCn: 'Type Axle Name (CN)',
        description: 'Type Axle Description'
    },
    placeholders: {
        nameEn: 'Enter type axle name in English',
        nameCn: 'Enter type axle name in Chinese',
        description: 'Enter type axle description'
    }
};

// Configuration untuk Transmission
const transmissionConfig = {
    entityName: 'transmission',
    entityDisplayName: 'Transmission',
    fields: {
        nameEn: 'type_transmission_name_en',
        nameCn: 'type_transmission_name_cn',
        description: 'type_transmission_description'
    },
    labels: {
        nameEn: 'Type Transmission Name (EN)',
        nameCn: 'Type Transmission Name (CN)',
        description: 'Type Transmission Description'
    },
    placeholders: {
        nameEn: 'Enter type transmission name in English',
        nameCn: 'Enter type transmission name in Chinese',
        description: 'Enter type transmission description'
    }
};

// Configuration untuk Steering
const steeringConfig = {
    entityName: 'steering',
    entityDisplayName: 'Steering',
    fields: {
        nameEn: 'type_steering_name_en',
        nameCn: 'type_steering_name_cn',
        description: 'type_steering_description'
    },
    labels: {
        nameEn: 'Type Steering Name (EN)',
        nameCn: 'Type Steering Name (CN)',
        description: 'Type Steering Description'
    },
    placeholders: {
        nameEn: 'Enter type steering name in English',
        nameCn: 'Enter type steering name in Chinese',
        description: 'Enter type steering description'
    }
};

// Wrapper untuk Type Cabin Form
interface TypeCabineFormProps {
    typeCabines: TypeCabinFormData[];
    onTypeCabinesChange: (typeCabines: TypeCabinFormData[]) => void;
    errors?: Record<string, string>;
    className?: string;
}

export const TypeCabineForm: React.FC<TypeCabineFormProps> = ({ 
    typeCabines, 
    onTypeCabinesChange,
    errors = {},
    className = ""
}) => {
    return (
        <ReusableTypeForm<TypeCabinFormData>
            typeData={typeCabines}
            onTypeDataChange={onTypeCabinesChange}
            config={cabinConfig}
            errors={errors}
            className={className}
        />
    );
};

// Wrapper untuk Type Engine Form
interface TypeEngineFormProps {
    typeEngines: TypeEngineFormData[];
    onTypeEnginesChange: (typeEngines: TypeEngineFormData[]) => void;
    errors?: Record<string, string>;
    className?: string;
}

export const TypeEngineForm: React.FC<TypeEngineFormProps> = ({ 
    typeEngines, 
    onTypeEnginesChange,
    errors = {},
    className = ""
}) => {
    return (
        <ReusableTypeForm<TypeEngineFormData>
            typeData={typeEngines}
            onTypeDataChange={onTypeEnginesChange}
            config={engineConfig}
            errors={errors}
            className={className}
        />
    );
};

// Wrapper untuk Type Axel Form
interface TypeAxleFormProps {
    typeAxles: TypeAxleFormData[];
    onTypeAxlesChange: (typeAxles: TypeAxleFormData[]) => void;
    errors?: Record<string, string>;
    className?: string;
}

export const TypeAxleForm: React.FC<TypeAxleFormProps> = ({ 
    typeAxles, 
    onTypeAxlesChange,
    errors = {},
    className = ""
}) => {
    return (
        <ReusableTypeForm<TypeAxleFormData>
            typeData={typeAxles}
            onTypeDataChange={onTypeAxlesChange}
            config={axelConfig}
            errors={errors}
            className={className}
        />
    );
};

// Wrapper untuk Type Transmission Form
interface TypeTransmissionFormProps {
    typeTransmissions: TypeTransmissionFormData[];
    onTypeTransmissionsChange: (typeTransmissions: TypeTransmissionFormData[]) => void;
    errors?: Record<string, string>;
    className?: string;
}

export const TypeTransmissionForm: React.FC<TypeTransmissionFormProps> = ({ 
    typeTransmissions, 
    onTypeTransmissionsChange,
    errors = {},
    className = ""
}) => {
    return (
        <ReusableTypeForm<TypeTransmissionFormData>
            typeData={typeTransmissions}
            onTypeDataChange={onTypeTransmissionsChange}
            config={transmissionConfig}
            errors={errors}
            className={className}
        />
    );
};

// Wrapper untuk Type Steering Form
interface TypeSteeringFormProps {
    typeSteerings: TypeSteeringFormData[];
    onTypeSteeringsChange: (typeSteerings: TypeSteeringFormData[]) => void;
    errors?: Record<string, string>;
    className?: string;
}

export const TypeSteeringForm: React.FC<TypeSteeringFormProps> = ({ 
    typeSteerings, 
    onTypeSteeringsChange,
    errors = {},
    className = ""
}) => {
    return (
        <ReusableTypeForm<TypeSteeringFormData>
            typeData={typeSteerings}
            onTypeDataChange={onTypeSteeringsChange}
            config={steeringConfig}
            errors={errors}
            className={className}
        />
    );
};

// Export default untuk backward compatibility
export default TypeCabineForm;
import React from 'react';
import ReusableTypeForm from './TypeCabineForm';
import { TypeAxleFormData, TypeCabinFormData, TypeCategoryFormData, TypeEngineFormData, TypeSteeringFormData, TypeTransmissionFormData } from '@/types/partCatalogue';

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
        nameEn: 'Type Cabin Name - English',
        nameCn: 'Type Cabin Name - Chinese',
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
        nameEn: 'Type Engine Name - English',
        nameCn: 'Type Engine Name - Chinese',
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
        nameEn: 'Type Axle Name - English',
        nameCn: 'Type Axle Name - Chinese',
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
        nameEn: 'Type Transmission Name - English',
        nameCn: 'Type Transmission Name - Chinese',
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
        nameEn: 'Type Steering Name - English',
        nameCn: 'Type Steering Name - Chinese',
        description: 'Type Steering Description'
    },
    placeholders: {
        nameEn: 'Enter type steering name in English',
        nameCn: 'Enter type steering name in Chinese',
        description: 'Enter type steering description'
    }
};

// Configuration untuk Steering
const categoryConfig = {
    entityName: 'category',
    entityDisplayName: 'Category',
    fields: {
        nameEn: 'type_category_name_en',
        nameCn: 'type_category_name_cn',
        description: 'type_category_description'
    },
    labels: {
        nameEn: 'Type Category Name - English',
        nameCn: 'Type Category Name - Chinese',
        description: 'Type Category Description'
    },
    placeholders: {
        nameEn: 'Enter type category name in English',
        nameCn: 'Enter type category name in Chinese',
        description: 'Enter type category description'
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

// INTERFACE DAN WRAPPER UNTUK TYPE CATEGORY FORM
interface TypeCategoryFormProps {
    typeCategory: TypeCategoryFormData[];
    onTypeCategoryChange: (typeCategory: TypeCategoryFormData[]) => void;
    errors?: Record<string, string>;
    className?: string;
    modeEdit?: boolean;
}
export const TypeCategoryForm: React.FC<TypeCategoryFormProps> = ({ 
    typeCategory, 
    onTypeCategoryChange,
    errors = {},
    className = "",
    modeEdit
}) => {
    return (
        <ReusableTypeForm<TypeCategoryFormData>
            typeData={typeCategory}
            onTypeDataChange={onTypeCategoryChange}
            config={categoryConfig}
            errors={errors}
            className={className}
            modeEdit={modeEdit}
        />
    );
};
// Export default untuk backward compatibility
export default TypeCabineForm;
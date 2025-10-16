# Edit Catalog Implementation

## Overview
This document describes the implementation of the Edit Catalog functionality that allows users to edit existing catalogs in the Part Catalogue system.

## Components Created

### 1. Types (`/types/asyncSelect.ts`)
- **EditCatalogItem**: Interface for individual catalog items in edit mode
- **EditCatalogMasterCategory**: Interface for master category data
- **EditCatalogData**: Interface for complete catalog data
- **EditCatalogResponse**: Interface for API response structure

### 2. Service (`/services/catalogManageService.ts`)
- **getItemsById()**: Fetches catalog data by ID using `apiGet`
- **Endpoint**: `${API_BASE_URL}/catalogs/all-item-catalogs/${id}`
- **Method**: GET
- **Returns**: EditCatalogResponse

### 3. Hook (`/hooks/useEditCatalog.ts`)
- **useEditCatalog()**: Custom hook for managing edit catalog state
- **Features**:
  - Fetches catalog data by ID from URL params
  - Pre-populates form with existing data
  - Extends usePartCatalogueManagement functionality
  - Handles loading states for catalog data
  - Transforms API response to form format

### 4. Component (`/pages/PartCatalogue/Catalogs/Edit.tsx`)
- **EditCatalog**: React component for editing catalogs
- **Features**:
  - Same UI as Create.tsx but with pre-populated data
  - Loading screen while fetching catalog data
  - Error handling for catalog not found
  - Form validation and submission
  - Navigation back to manage page

### 5. Integration (`/pages/PartCatalogue/Catalogs/Manage.tsx`)
- **handleEdit()**: Navigate to edit page with catalog ID
- **Route**: `/epc/catalog/edit/${catalog.master_pdf_id}`

### 6. Routes (`/Routes/index.ts`)
- **Path**: `/epc/catalog/edit/:id`
- **Component**: EditPartCatalogue
- **Layout**: AppLayout

## API Response Structure

```typescript
{
  "success": true,
  "message": "Success",
  "data": {
    "name_pdf": "Part Configuration",
    "master_pdf_id": "d052084c-47fc-4895-aeda-9e70d9684a98",
    "data_master_category": [
      {
        "master_catalog": "axle",
        "master_category_id": "3f88090d-99bd-457f-8bf2-448faf9ffdf4",
        "master_category_name": "AX-5000 Drive Pro",
        "type_category_id": "d4b66b37-178b-418f-87f6-e58d13d4705f",
        "type_category_name": "Drive Axle",
        "data_items": [
          {
            "items_id": "9704f651-6f70-4887-afa9-2dbfeb0035a1",
            "master_pdf_id": "d052084c-47fc-4895-aeda-9e70d9684a98",
            "target_id": "Part #1",
            "diagram_serial_number": null,
            "part_number": "Part Product #1",
            "catalog_item_name_en": "Product (English) *",
            "catalog_item_name_ch": "Part (Chinese) *",
            "description": null,
            "quantity": 1235,
            "file_foto": "https://minio-bucket.motorsights.com/..."
          }
        ]
      }
    ]
  },
  "timestamp": "2025-10-16T09:40:12.383Z"
}
```

## Data Transformation

The hook transforms API response data back to form format:

```typescript
// API Response -> Form Data
const transformedParts: PartItem[] = masterCategory.data_items.map((item, index) => ({
    id: item.items_id || `part-${index + 1}`,
    part_target: item.target_id,
    code_product: item.part_number,
    name_english: item.catalog_item_name_en,
    name_chinese: item.catalog_item_name_ch,
    quantity: item.quantity
}));

setFormData(prev => ({
    ...prev,
    code_cabin: response.data.name_pdf,
    part_type: masterCategory.master_catalog,
    part_id: masterCategory.master_category_id,
    type_id: masterCategory.type_category_id,
    parts: transformedParts
}));
```

## Features

### ✅ Implemented
- Fetches catalog data by ID
- Pre-populates form with existing data
- Same UI/UX as Create catalog
- Loading states and error handling
- Form validation
- Navigation integration
- Route configuration

### 🚧 TODO (Future Implementation)
- Update catalog API endpoint
- File upload handling for existing images
- Audit trail for changes
- Version history
- Bulk edit functionality

## Usage

1. **Navigate to Edit**: Click edit button in Manage Catalogs table
2. **Auto-load Data**: Form automatically populates with existing catalog data
3. **Make Changes**: Edit any fields as needed
4. **Submit**: Save changes (currently shows success message)
5. **Navigate Back**: Return to manage catalogs page

## Consistency

The implementation follows the same patterns and structure as:
- ✅ Create catalog functionality
- ✅ Existing hook patterns
- ✅ Service layer architecture
- ✅ Component structure
- ✅ Route configuration
- ✅ Type definitions

## Notes

- Currently uses placeholder for update API call
- SVG image handling needs update API support
- Form validation matches create catalog requirements
- All loading states and error handling implemented
- Follows existing project conventions and patterns
// Interface untuk item parts dari API
export interface PartItem {
    item_category_detail_id: string;
    target_id: string;
    quantity: number;
    master_item_name_en: string;
    master_item_name_ch: string;
    part_number: string;
    description: string;
}

// Interface untuk header dari API
export interface CatalogueHeader {
    item_category_foto: string;
    category_name_en: string;
    category_name_cn: string;
    type_category_name_cn: string | null;
    type_category_name_en: string | null;
}

// Interface untuk tabel row
export interface PartTableRow {
    id: string;
    target_id: string;
    quantity: number;
    part_number: string;
    name_en: string;
    name_cn: string;
}

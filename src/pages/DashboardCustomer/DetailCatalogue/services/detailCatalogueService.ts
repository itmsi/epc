import { apiGet } from '@/helpers/apiHelper';
import { PartItem, CatalogueHeader } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interface response dari API
export interface DetailCatalogueResponse {
    success: boolean;
    message: string;
    data: {
        header: CatalogueHeader;
        items: PartItem[];
    };
}

/**
 * Service untuk mengakses API Detail Catalogue
 */
export class DetailCatalogueService {
    /**
     * Ambil detail parts catalog berdasarkan master category id (id_link)
     */
    static async getByMasterCategoryId(idLink: string): Promise<DetailCatalogueResponse> {
        try {
            const response = await apiGet<DetailCatalogueResponse>(
                `${API_BASE_URL}/epc/parts-catalogs/get-by-master-category-id/${idLink}`
            );
            return response.data;
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Gagal memuat data katalog',
                data: {
                    header: {
                        item_category_foto: '',
                        category_name_en: '',
                        category_name_cn: '',
                        type_category_name_cn: null,
                        type_category_name_en: null,
                    },
                    items: [],
                },
            };
        }
    }

    /**
     * Fetch SVG content dari URL
     */
    static async fetchSvgContent(svgUrl: string): Promise<string | null> {
        try {
            const response = await fetch(svgUrl);
            if (!response.ok) {
                throw new Error('Gagal memuat gambar SVG');
            }
            return await response.text();
        } catch (error) {
            console.error('Error loading SVG:', error);
            return null;
        }
    }
}

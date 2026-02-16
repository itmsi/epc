import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { DetailCatalogueService } from '../services/detailCatalogueService';
import { PartItem, CatalogueHeader } from '../types';

interface UseDetailCatalogueReturn {
    header: CatalogueHeader | null;
    items: PartItem[];
    loading: boolean;
    error: string | null;
    svgContent: string | null;
    svgLoading: boolean;
    refetch: () => Promise<void>;
}

export const useDetailCatalogue = (): UseDetailCatalogueReturn => {
    const { id_link } = useParams<{ id_link: string }>();
    
    const [header, setHeader] = useState<CatalogueHeader | null>(null);
    const [items, setItems] = useState<PartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [svgContent, setSvgContent] = useState<string | null>(null);
    const [svgLoading, setSvgLoading] = useState(false);

    // Fetch SVG content dari URL
    const fetchSvgContent = useCallback(async (svgUrl: string) => {
        setSvgLoading(true);
        const content = await DetailCatalogueService.fetchSvgContent(svgUrl);
        setSvgContent(content);
        setSvgLoading(false);
    }, []);

    // Fetch data dari API
    const fetchData = useCallback(async () => {
        if (!id_link) {
            setError('ID Link tidak ditemukan');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await DetailCatalogueService.getByMasterCategoryId(id_link);

            if (response.success) {
                const { header, items } = response.data;
                setHeader(header);
                setItems(items);

                // Load SVG jika ada
                if (header.item_category_foto) {
                    fetchSvgContent(header.item_category_foto);
                }
            } else {
                throw new Error(response.message || 'Gagal mengambil data');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data katalog';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [id_link, fetchSvgContent]);

    // Auto fetch saat mount atau id_link berubah
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        header,
        items,
        loading,
        error,
        svgContent,
        svgLoading,
        refetch: fetchData,
    };
};

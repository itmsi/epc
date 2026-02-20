import { useState, useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { LoadingSpinner } from '@/components/common/Loading';
import { useDetailCatalogue } from './hooks/useDetailCatalogue';
import { SvgViewer, PartsTable, DetailCatalogueHeader } from './components';
import { PartTableRow } from './types';
import Breadcrumbs from '@/components/common/Breadcrumbs';

/**
 * Halaman Detail Catalogue - menampilkan diagram SVG dan tabel parts
 */
export default function DetailCatalogView() {
    const { vinId, categorySlug, masterCategoryId } = useParams<{
        vinId: string;
        categorySlug: string;
        masterCategoryId: string;
        id_link: string;
    }>();
    
    const [searchParams] = useSearchParams();
    
    // Extract dokumen_ids from query parameters untuk breadcrumb navigation
    const dokumenIdsParam = searchParams.get('dokumen_ids');
    const categorySelectionPath = dokumenIdsParam 
        ? `/vin/${vinId}/${categorySlug}/${masterCategoryId}?dokumen_ids=${encodeURIComponent(dokumenIdsParam)}`
        : `/vin/${vinId}/${categorySlug}/${masterCategoryId}`;
    
    const { header, items, loading, error, svgContent, svgLoading } = useDetailCatalogue();
    const [selected, setSelected] = useState<string | null>(null);

    // Helper untuk mendapatkan nama kategori dari header
    const getCategoryName = useCallback(() => {
        if (!header) return 'Detail Catalogue';
        return header.category_name_en || header.category_name_cn || 'Detail Catalogue';
    }, [header]);

    // Transform items API ke format tabel
    const parts: PartTableRow[] = useMemo(() => {
        return items.map((item) => ({
            id: item.item_category_detail_id,
            target_id: item.target_id,
            quantity_needs: item.quantity_needs,
            quantity_stock: item.quantity_stock,
            part_number: item.part_number,
            name_en: item.master_item_name_en,
            name_cn: item.master_item_name_ch,
        }));
    }, [items]);

    // Handle selection dari SVG atau tabel
    const handlePartSelect = useCallback((targetId: string, source: 'table' | 'svg') => {
        setSelected(current => current === targetId ? null : targetId);

        // Scroll ke komponen yang berlawanan
        if (source === 'svg') {
            // Dari SVG, scroll ke tabel
            setTimeout(() => {
                const partIndex = parts.findIndex(part => part.target_id === targetId);
                
                if (partIndex !== -1) {
                    const tableBody = document.querySelector('.rdt_TableBody') as HTMLElement;
                    
                    if (tableBody) {
                        const rows = tableBody.querySelectorAll('.rdt_TableRow');
                        
                        if (rows[partIndex]) {
                            (rows[partIndex] as HTMLElement).scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                            });
                        }
                    }
                }
            }, 100);
        }
    }, [parts]);

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" color="text-brand-500" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-500 text-lg">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm border-b rounded-2xl">
                <div className="px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Breadcrumb */}
                        <Breadcrumbs
                            items={[
                                { label: 'Home', path: '/' },
                                ...(vinId ? [{ label: `VIN: ${vinId}`, path: `/vin/${vinId}` }] : []),
                                ...(categorySlug ? [{ label: categorySlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), path: categorySelectionPath }] : []),
                                { label: getCategoryName() },
                            ]}
                        />
                    </div>
                </div>
            </div>
            
            <DetailCatalogueHeader header={header} />

            <div className="grid grid-cols-1 lg:grid-cols-8 gap-2 px-6 py-4">
                <SvgViewer
                    svgContent={svgContent}
                    svgLoading={svgLoading}
                    selected={selected}
                    onPartSelect={handlePartSelect}
                />

                <PartsTable
                    parts={parts}
                    loading={loading}
                    selected={selected}
                    onRowSelect={(targetId) => handlePartSelect(targetId, 'table')}
                />
            </div>
        </div>
    );
}

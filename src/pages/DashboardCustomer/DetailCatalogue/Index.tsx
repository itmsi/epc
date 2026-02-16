import { useState, useMemo, useCallback } from 'react';
import { LoadingSpinner } from '@/components/common/Loading';
import { useDetailCatalogue } from './hooks/useDetailCatalogue';
import { SvgViewer, PartsTable, DetailCatalogueHeader } from './components';
import { PartTableRow } from './types';

/**
 * Halaman Detail Catalogue - menampilkan diagram SVG dan tabel parts
 */
export default function DetailCatalogView() {
    const { header, items, loading, error, svgContent, svgLoading } = useDetailCatalogue();
    const [selected, setSelected] = useState<string | null>(null);

    // Transform items API ke format tabel
    const parts: PartTableRow[] = useMemo(() => {
        return items.map((item) => ({
            id: item.item_category_detail_id,
            target_id: item.target_id,
            quantity: item.quantity,
            part_number: item.part_number,
            name_en: item.master_item_name_en,
            name_cn: item.master_item_name_ch,
        }));
    }, [items]);

    // Handle selection dari SVG atau tabel
    const handlePartSelect = useCallback((targetId: string, source: 'table' | 'svg') => {
        console.log('handlePartSelect called:', { targetId, source });
        setSelected(current => current === targetId ? null : targetId);

        // Scroll ke komponen yang berlawanan
        if (source === 'svg') {
            console.log('Scrolling to table for targetId:', targetId);
            // Dari SVG, scroll ke tabel
            setTimeout(() => {
                const partIndex = parts.findIndex(part => part.target_id === targetId);
                console.log('Found part index:', partIndex, 'in parts array length:', parts.length);
                
                if (partIndex !== -1) {
                    const tableBody = document.querySelector('.rdt_TableBody') as HTMLElement;
                    console.log('Table body found:', !!tableBody);
                    
                    if (tableBody) {
                        const rows = tableBody.querySelectorAll('.rdt_TableRow');
                        console.log('Found rows count:', rows.length, 'looking for index:', partIndex);
                        
                        if (rows[partIndex]) {
                            console.log('Scrolling to row:', partIndex);
                            (rows[partIndex] as HTMLElement).scrollIntoView({
                                behavior: 'smooth',
                                block: 'center',
                            });
                        } else {
                            console.log('Row not found at index:', partIndex);
                        }
                    } else {
                        console.log('Table body not found, searching alternative selectors...');
                        const altTableBody = document.querySelector('[class*="TableBody"]');
                        console.log('Alternative table body:', !!altTableBody);
                    }
                } else {
                    console.log('Part not found in array for targetId:', targetId);
                    console.log('Available target_ids:', parts.map(p => p.target_id));
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
        <div className="bg-white shadow rounded-lg">
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

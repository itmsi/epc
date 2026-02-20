import { useRef } from 'react';
import { TableColumn } from 'react-data-table-component';
import { CustomDataTable } from '@/components/ui/table';
import { PartTableRow } from '../types';
import { MdAddShoppingCart } from 'react-icons/md';
import toast from 'react-hot-toast';
import { useCartContext } from '@/context/CartContext';

interface PartsTableProps {
    parts: PartTableRow[];
    loading: boolean;
    selected: string | null;
    onRowSelect: (targetId: string) => void;
    // Grouping context
    vin_number: string;
    categorySlug: string;
    categoryName: string;
}

/**
 * Komponen tabel untuk menampilkan daftar parts
 */
export const PartsTable = ({
    parts,
    loading,
    selected,
    onRowSelect,
    vin_number,
    categorySlug,
    categoryName,
}: PartsTableProps) => {
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const { addToCart } = useCartContext();

    const columns: TableColumn<PartTableRow>[] = [
        {
            name: 'No',
            selector: row => row.target_id,
            width: '70px',
            center: true,
        },
        {
            name: 'Part Number',
            selector: row => row.part_number,
            wrap: true,
        },
        {
            name: 'Name (EN)',
            selector: row => row.name_en,
            wrap: true,
        },
        {
            name: 'Name (CN)',
            selector: row => row.name_cn,
            wrap: true,
        },
        {
            name: 'Qty Needs',
            selector: row => row.quantity_needs,
            center: true,
        },
        {
            name: 'Qty Stock',
            selector: row => row.quantity_stock,
            center: true,
        },
        {
            name: 'Action',
            center: true,
            cell: (row: PartTableRow) => (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        addToCart({
                            id: row.id,
                            part_number: row.part_number,
                            name_en: row.name_en,
                            name_cn: row.name_cn,
                            quantity_needs: row.quantity_needs,
                            quantity_stock: row.quantity_stock,
                            vin_number,
                            categorySlug,
                            categoryName,
                        });
                        toast.success(`${row.part_number} added to cart!`);
                    }}
                    title="Add to Cart"
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all duration-200"
                >
                    <MdAddShoppingCart className="w-5 h-5" />
                </button>
            ),
        },
    ];

    return (
        <div className="bg-white p-4 md:col-span-4">
            <div ref={tableContainerRef} className="max-h-[600px] overflow-y-auto">
                <CustomDataTable
                    columns={columns}
                    data={parts}
                    loading={loading}
                    pagination={false}
                    responsive
                    highlightOnHover
                    striped={false}
                    persistTableHead
                    borderRadius="8px"
                    fixedHeader={true}
                    className="w-full"
                    onRowClicked={(row: PartTableRow) => onRowSelect(row.target_id)}
                    fixedHeaderScrollHeight="600px"
                    conditionalRowStyles={[
                        {
                            when: (row: PartTableRow) => row.target_id === selected,
                            style: {
                                backgroundColor: 'rgba(255, 235, 59, 0.3)',
                                borderLeft: '4px solid #FFC107',
                            },
                        },
                    ]}
                />
            </div>
        </div>
    );
};

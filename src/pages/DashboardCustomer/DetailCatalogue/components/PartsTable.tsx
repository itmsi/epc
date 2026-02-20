import { useRef } from 'react';
import { TableColumn } from 'react-data-table-component';
import { CustomDataTable } from '@/components/ui/table';
import { PartTableRow } from '../types';

interface PartsTableProps {
    parts: PartTableRow[];
    loading: boolean;
    selected: string | null;
    onRowSelect: (targetId: string) => void;
}

/**
 * Komponen tabel untuk menampilkan daftar parts
 */
export const PartsTable = ({
    parts,
    loading,
    selected,
    onRowSelect,
}: PartsTableProps) => {
    const tableContainerRef = useRef<HTMLDivElement>(null);

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
            width: '90px',
            center: true,
        },
        {
            name: 'Qty Stock',
            selector: row => row.quantity_stock,
            width: '90px',
            center: true,
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

import React from 'react';
import { TableColumn } from 'react-data-table-component';
import { TransactionOrder, Pagination } from '../types/transaction';
import CustomDataTable from '@/components/ui/table';
import { formatDate } from '@/helpers/generalHelper';
import { useNavigate } from 'react-router';

interface TransactionListTableProps {
    transactions: TransactionOrder[];
    pagination: Pagination;
    onPageChange: (page: number) => void;
    onLimitChange: (limit: number) => void;
}

const TransactionListTable: React.FC<TransactionListTableProps> = ({
    transactions,
    pagination,
    onPageChange,
    onLimitChange
}) => {
    const navigate = useNavigate();
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'submission':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'submit_order':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'processing':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'delivered':
                return 'bg-red-100 text-red-800 border-red-200';
            case 'received':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Format status text
    const formatStatus = (status: string) => {
        switch (status) {
            case 'submission':
                return 'Submission';
            case 'submit_order':
                return 'Processing';
            case 'processing':
                return 'Processing';
            case 'delivered':
                return 'Delivered';
            case 'received':
                return 'Received';
            default:
                return status;
        }
    };

    const columns: TableColumn<TransactionOrder>[] = [
        {
            name: 'No. Transaksi',
            selector: row => row.transaction_order_no,
            cell: row => (
                <div className="font-medium text-gray-900">
                    #{row.transaction_order_no}
                </div>
            )
        },
        {
            name: 'Tanggal Transaksi',
            selector: row => row.transaction_order_date,
            cell: row => (
                <div className="text-sm text-gray-600">
                    {formatDate(row.transaction_order_date)}
                </div>
            )
        },
        {
            name: 'Status',
            selector: row => row.transaction_order_status,
            cell: row => (
                <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(row.transaction_order_status)}`}
                >
                    {formatStatus(row.transaction_order_status)}
                </span>
            ),
            center: true,
        },
        {
            name: 'Total Item',
            selector: row => row.transaction_order_items_total,
            cell: row => (
                <div className="text-sm text-gray-900 font-medium">
                    {row.transaction_order_items_total} item{row.transaction_order_items_total > 1 ? 's' : ''}
                </div>
            ),
            center: true,
        }
        
    ];

    const handleViewDetail = (transaction: TransactionOrder) => {
        navigate(`/transaction/${transaction.transaction_order_id}`);
    };
    const controlHeight = 1.75;
    return (
        <div className="p-6 font-secondary">
            <CustomDataTable
                columns={columns}
                data={transactions}
                pagination={true}
                paginationServer={true}
                paginationTotalRows={pagination?.total || 0}
                paginationPerPage={pagination?.limit || 10}
                paginationDefaultPage={pagination?.page || 1}
                paginationRowsPerPageOptions={[10, 25, 50, 100]}
                onChangePage={onPageChange}
                onChangeRowsPerPage={(newLimit: number, newPage: number) => {
                    onLimitChange(newLimit);
                    onPageChange(newPage);
                }}
                striped
                highlightOnHover
                responsive
                fixedHeader={true}
                fixedHeaderScrollHeight={`calc(100vh/${controlHeight})`}
                headerBackground="rgba(2, 83, 165, 0.1)"
                hoverBackground="rgba(223, 232, 242, 0.3)"
                borderRadius="8px"
                onRowClicked={handleViewDetail}
            />
        </div>
    );
};

export default TransactionListTable;
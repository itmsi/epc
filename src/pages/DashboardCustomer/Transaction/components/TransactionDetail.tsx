import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTransactionDetail } from '../hooks/useTransactionDetail';
import { formatDate } from '@/helpers/generalHelper';
import  Loading  from '@/components/common/Loading';
import  useGoBack  from '@/hooks/useGoBack';
import { MdLocalShipping, MdDateRange, MdDescription, MdSettings } from 'react-icons/md';
import HeaderAksi from '@/components/common/HeaderAksi';
import { TransactionOrderItem } from '../types/transaction';
import { TableColumn } from 'react-data-table-component';
import CustomDataTable from '@/components/ui/table/CustomDataTable';

const TransactionDetail: React.FC = () => {
    const { transactionOrderId } = useParams<{ transactionOrderId: string }>();
    const goBack = useGoBack();
    
    const {
        transactionDetail,
        loading,
        error,
        fetchTransactionDetail,
        hasData
    } = useTransactionDetail();

    useEffect(() => {
        if (transactionOrderId) {
            fetchTransactionDetail(transactionOrderId);
        }
    }, [transactionOrderId, fetchTransactionDetail]);

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'submission':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'submit_order':
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

    const columns: TableColumn<TransactionOrderItem>[] = [
        {
            name: 'Part Number',
            selector: row => row.part_number,
            cell: row => (
                <div className="font-medium text-gray-900">
                    {row.part_number}
                </div>
            )
        },
        {
            name: 'Nama Item',
            selector: row => row.master_item_name_en || row.master_item_name_ch,
            cell: row => (
                <div className="text-sm text-gray-600">
                    {row.master_item_name_en || row.master_item_name_ch}
                    {row.master_item_name_en && row.master_item_name_ch && 
                        row.master_item_name_en !== row.master_item_name_ch && (
                        <div className="text-sm text-gray-500 mt-1">
                            {row.master_item_name_ch}
                        </div>
                    )}
                </div>
            )
        },
        {
            name: 'Qty Dibutuhkan',
            selector: row => row.quantity_needs,
            cell: row => <div className="text-sm text-gray-900 font-medium">{row.quantity_needs}</div>,
            center: true,
        },
        {
            name: 'Qty Dipesan',
            selector: row => row.quantity_order,
            cell: row => (
                <div className="text-sm text-gray-900 font-medium">
                    {row.quantity_order}
                </div>
            ),
            center: true,
        }
        
    ];
    if (loading) {
        return <Loading />;
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64 text-red-600">
                <p>{error}</p>
            </div>
        );
    }

    if (!hasData || !transactionDetail) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-600">
                <p>Data transaksi tidak ditemukan</p>
            </div>
        );
    }

    const controlHeight = 1.75;
    return (
        <div className="bg-gray-50 overflow-auto">
            <div className="mx-auto p-4 sm:px-3">
            
                {/* HEADER */}
                <HeaderAksi
                    judul={`Detail Transaksi #${transactionDetail.transaction_order_no}`}
                    urlKembali={goBack}
                    loading={loading}
                />

                {/* Transaction Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <MdDescription className="text-blue-600" size={20} />
                                </div>
                                <div className='ml-3'>
                                    <p className="text-sm text-gray-500">No. Transaksi</p>
                                    <p className="font-medium text-gray-900">#{transactionDetail.transaction_order_no}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <MdDateRange className="text-green-600" size={20} />
                                </div>
                                <div className='ml-3'>
                                    <p className="text-sm text-gray-500">Tanggal</p>
                                    <p className="font-medium text-gray-900">
                                        {formatDate(transactionDetail.transaction_order_date)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <MdSettings className="text-purple-600" size={20} />
                                </div>
                                <div className='ml-3'>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transactionDetail.transaction_order_status)}`}
                                    >
                                        {formatStatus(transactionDetail.transaction_order_status)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-50 rounded-lg">
                                    <MdLocalShipping className="text-orange-600" size={20} />
                                </div>
                                <div className='ml-3'>
                                    <p className="text-sm text-gray-500">Total Item</p>
                                    <p className="font-medium text-gray-900">
                                        {transactionDetail.transaction_order_items_total} item{transactionDetail.transaction_order_items_total > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {transactionDetail.transaction_order_description && (
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Deskripsi</h3>
                                            <p className="text-sm text-gray-600">{transactionDetail.transaction_order_description}</p>
                                        </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* VIN Items */}
                <div className="space-y-3 md:col-span-2">
                    {transactionDetail.transaction_order_items.data.map((vinData, vinIndex) => (
                        <div key={`vin-${vinIndex}`} className="bg-white shadow rounded-lg">
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4 justify-between">
                                    <h3 className="text-md font-secondary text-gray-900">VIN: <span className="font-primary-bold">{vinData.vin_number}</span></h3>
                                    <span className="px-3 py-1 bg-green-100 leading-4 text-gray-700 text-sm rounded-lg">
                                        {vinData.item.length} item{vinData.item.length > 1 ? 's' : ''}
                                    </span>
                                </div>
                                
                                {/* Item table */}
                                <div className="font-secondary">
                                    <CustomDataTable
                                        columns={columns}
                                        data={vinData.item}
                                        pagination={false}
                                        striped={false}
                                        highlightOnHover
                                        responsive
                                        fixedHeader={true}
                                        fixedHeaderScrollHeight={`calc(100vh/${controlHeight})`}
                                        headerBackground="rgba(2, 83, 165, 0.1)"
                                        hoverBackground="rgba(223, 232, 242, 0.3)"
                                        borderRadius="8px"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>


            </div>
        </div>
    );
};

export default TransactionDetail;
import { LoadingSpinner } from '@/components/common/Loading';
import { useTransaction } from './hooks/useTransaction';
import { 
    TransactionListHeader, 
    TransactionSearchFilter, 
    TransactionListTable 
} from './components';
import PageMeta from '@/components/common/PageMeta';

export default function TransactionView() {
    const {
        transactions,
        loading,
        error,
        pagination,
        handlePageChange,
        handleLimitChange,
        handleSearch,
        isEmpty
    } = useTransaction({
        initialPage: 1,
        initialLimit: 10
    });

    // Loading state untuk initial load
    if (loading && transactions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <LoadingSpinner size="lg" color="text-brand-500" />
            </div>
        );
    }

    // Error state
    if (error && transactions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-400 text-4xl mb-4">⚠️</div>
                    <p className="text-red-600 text-lg font-medium mb-2">Gagal Memuat Data</p>
                    <p className="text-gray-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                 transition-colors text-sm font-medium"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <PageMeta
                title="Transaksi | EPC Dashboard"
                description="Kelola dan pantau transaksi Anda"
                image="/motor-sights-international.png"
            />
            
            <div className="bg-white shadow rounded-lg">

                {/* Header Section */}
                <TransactionListHeader />

                {/* Search Filter */}
                <TransactionSearchFilter 
                    onSearch={handleSearch}
                    loading={loading}
                    placeholder="Cari berdasarkan nomor transaksi, status, atau deskripsi..."
                />
                    {/* Data Table */}
                    {isEmpty ? (
                        <div className="bg-white rounded-xl border border-gray-200 py-16">
                            <div className="text-center">
                                <div className="text-gray-400 text-5xl mb-4">📋</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Belum ada transaksi
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Transaksi Anda akan muncul di sini setelah Anda melakukan pemesanan
                                </p>
                                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                                                    transition-colors text-sm font-medium">
                                    Mulai Berbelanja
                                </button>
                            </div>
                        </div>
                    ) : (
                        <TransactionListTable 
                            transactions={transactions}
                            pagination={pagination}
                            onPageChange={handlePageChange}
                            onLimitChange={handleLimitChange}
                        />
                    )}
            </div>
        </>
    );
}

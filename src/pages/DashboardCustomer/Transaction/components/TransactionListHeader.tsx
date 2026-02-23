import React from 'react';

const TransactionListHeader: React.FC = () => {
    return (
        <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                        Daftar Transaksi
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Kelola dan pantau transaksi Anda
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TransactionListHeader;
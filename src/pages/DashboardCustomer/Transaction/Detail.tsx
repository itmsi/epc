import React from 'react';
import { TransactionDetail } from './components';
import PageMeta from '@/components/common/PageMeta';

const TransactionDetailPage: React.FC = () => {
    return (
        <>
            <PageMeta
                title="Detail Transaksi | EPC Dashboard"
                description="Halaman detail transaksi untuk melihat informasi lengkap transaksi"
                image="/motor-sights-international.png"
            />
            <TransactionDetail />
        </>
    );
};

export default TransactionDetailPage;
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { TableColumn } from 'react-data-table-component';
import { VinSearchService, VinManagementItem } from '@/services/vinSearchService';
import CustomDataTable from '@/components/ui/table/CustomDataTable';
import { MdSearch, MdClear } from 'react-icons/md';
import Input from '@/components/form/input/InputField';
import CustomSelect from '@/components/form/select/CustomSelect';

const VinManagement = () => {
    const navigate = useNavigate();
    
    // State
    const [vinData, setVinData] = useState<VinManagementItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortOrder] = useState<'asc' | 'desc'>('desc');
    
    // Pagination state
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    });

    // Get customer ID from localStorage
    const getCustomerId = useCallback((): string | null => {
        const authUserStr = localStorage.getItem('auth_user');
        if (!authUserStr) {
            toast.error('User not authenticated');
            return null;
        }

        try {
            const authUser = JSON.parse(authUserStr);
            const customerId = authUser.id;

            if (!customerId) {
                toast.error('Customer ID not found');
                return null;
            }

            return customerId;
        } catch (error) {
            console.error('Error parsing auth_user:', error);
            toast.error('Authentication error');
            return null;
        }
    }, []);

    // Fetch VIN data
    const fetchVinData = useCallback(async () => {
        const customerId = getCustomerId();
        if (!customerId) return;

        setLoading(true);
        try {
            const response = await VinSearchService.getVinManagement({
                customer_id: customerId,
                search: searchTerm,
                page: pagination.page,
                limit: pagination.limit,
                sort_by: 'created_at',
                sort_order: sortOrder,
                status: statusFilter || undefined,
            });

            if (response.data.success) {
                setVinData(response.data.data.items);
                setPagination(prev => ({
                    ...prev,
                    total: response.data.data.pagination.total,
                    totalPages: response.data.data.pagination.totalPages,
                }));
            } else {
                toast.error(response.data.message || 'Failed to fetch VIN data');
            }
        } catch (error) {
            console.error('Error fetching VIN data:', error);
            toast.error('An error occurred while fetching VIN data');
        } finally {
            setLoading(false);
        }
    }, [getCustomerId, searchTerm, statusFilter, pagination.page, pagination.limit, sortOrder]);

    // Initial load
    useEffect(() => {
        fetchVinData();
    }, [fetchVinData]);

    // Handle pagination
    const handlePageChange = (page: number) => {
        setPagination(prev => ({ ...prev, page }));
    };

    const handleRowsPerPageChange = (newPerPage: number) => {
        setPagination(prev => ({ ...prev, limit: newPerPage, page: 1 }));
    };

    const handleSearch = () => {
        setSearchTerm(searchInput);
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleClearSearch = () => {
        setSearchInput('');
        setSearchTerm('');
        setStatusFilter('');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    // Handle view details - show coming soon
    const handleViewDetails = (productId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(productId){
            navigate(`/vin-management/detail/${productId}`);
        }else{
            toast.error('Product ID not found');
        }
    };
    
    // Handle VIN click - navigate to detail page
    const handleVinClick = (vinNumber: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigate(`/vin/${vinNumber}`);
    };

    // Define table columns
    const columns = useMemo<TableColumn<VinManagementItem>[]>(
        () => [
            {
                name: 'VIN Number',
                selector: (row) => row.vin_number,
                cell: (row) => (
                    <div className="flex items-center gap-2 py-2">
                        <button
                            onClick={(e) => handleVinClick(row.vin_number, e)}
                            className="flex items-center gap-1.5 text-sm font-mono font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                            title="View VIN Details"
                        >
                            {row.vin_number}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </button>
                    </div>
                ),
            },
            {
                name: 'Body Number',
                selector: (row) => row.body_number || '-',
                cell: (row) => (
                    <span className="text-sm font-mono text-slate-600">
                        {row.body_number || '-'}
                    </span>
                ),
            },
            {
                name: 'Vehicle Model',
                selector: (row) => row.product_name_en,
                cell: (row) => (
                    <div className="flex flex-col py-2">
                        <span className="text-sm font-semibold text-slate-900">
                            {row.product_name_en}
                        </span>
                        {row.model_type && (
                            <span className="text-xs text-slate-400">
                                Class: {row.model_type}
                            </span>
                        )}
                    </div>
                ),
                maxWidth: '150px',
            },
            {
                name: 'Build Year',
                selector: (row) => row.created_at,
                cell: (row) => {
                    const year = new Date(row.created_at).getFullYear();
                    return <span className="text-sm text-slate-600">{year}</span>;
                },
                center: true,
                maxWidth: '80px',
            },
            {
                name: 'Status',
                selector: (row) => row.status || '',
                cell: (row) => {
                    const status = row.status?.toLowerCase();
                    const styleMap: Record<string, string> = {
                        active: 'bg-green-100 text-green-700',
                        inactive: 'bg-red-100 text-red-600',
                    };
                    const style = styleMap[status ?? ''] ?? 'bg-gray-100 text-gray-500';
                    const label = row.status
                        ? row.status.charAt(0).toUpperCase() + row.status.slice(1)
                        : '-';
                    return (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}>
                            {label}
                        </span>
                    );
                },
                center: true,
                maxWidth: '110px',
            },
            {
                name: 'Updated By',
                selector: (row) => row.updated_at,
                sortable: false,
                cell: (row) => {
                    const date = row.updated_at ? new Date(row.updated_at) : null;
                    const formatted = date
                        ? date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
                          ' ' +
                          date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                        : '-';
                    return (
                        <div className="flex flex-col py-2">
                            <span className="font-medium text-gray-900">
                                {row.updated_by_name || '-'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatted}
                            </span>
                        </div>
                    );
                },
                width: '200px',
            },
            {
                name: 'Actions',
                cell: (row) => (
                    <div className="flex items-center !justify-center gap-2">
                        <button
                            onClick={(e) => handleViewDetails(row.product_id, e)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                        </button>
                    </div>
                ),
                center: true,
            },
        ],
        [navigate]
    );

    return (
        <>
            <Helmet>
                <title>VIN Management</title>
            </Helmet>

            <div className="bg-white shadow rounded-lg">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div>
                        <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                            VIN Management
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Comprehensive internal registry for mining truck fleet tracking and technical profiling.
                        </p>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex gap-3 items-center">
                        <div className="relative flex-1">
                            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                type="text"
                                placeholder="Search body no or VIN number..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className={`pl-10 ${searchInput ? 'pr-10' : 'pr-4'}`}
                            />
                            {searchInput && (
                                <button
                                    onClick={handleClearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    type="button"
                                >
                                    <MdClear className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                        <div className="w-48">
                            <CustomSelect
                                options={[
                                    { value: 'active', label: 'Active' },
                                    { value: 'inactive', label: 'Inactive' },
                                ]}
                                value={statusFilter ? { value: statusFilter, label: statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) } : null}
                                onChange={(opt) => {
                                    setStatusFilter(opt?.value || '');
                                    setPagination(prev => ({ ...prev, page: 1 }));
                                }}
                                placeholder="Status"
                                isSearchable={false}
                                isClearable={true}
                            />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="p-6 font-secondary">
                    <CustomDataTable
                        columns={columns}
                        data={vinData}
                        loading={loading}
                        pagination
                        paginationServer
                        paginationTotalRows={pagination.total}
                        paginationPerPage={pagination.limit}
                        paginationDefaultPage={pagination.page}
                        paginationRowsPerPageOptions={[10, 25, 50, 100]}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handleRowsPerPageChange}
                        fixedHeader
                        fixedHeaderScrollHeight="600px"
                        responsive
                        highlightOnHover
                        striped={false}
                        persistTableHead
                        borderRadius="8px"
                    />
                </div>
            </div>
        </>
    );
};

export default VinManagement;

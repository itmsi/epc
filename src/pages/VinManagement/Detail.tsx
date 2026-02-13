import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
    VinSearchService,
    VinDetailMaintenanceResponse,
    MaintenanceActivity,
} from '@/services/vinSearchService';

const VinManagementDetail = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();

    // State
    const [vinResponse, setVinResponse] = useState<VinDetailMaintenanceResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [partsSearch, setPartsSearch] = useState('');
    const [partsPage, setPartsPage] = useState(1);
    const partsPerPage = 10;

    // Edit Body Number State
    const [isEditingBodyNo, setIsEditingBodyNo] = useState(false);
    const [tempBodyNo, setTempBodyNo] = useState('');

    // Get customer ID from localStorage
    const getCustomerId = (): string | null => {
        const authUserStr = localStorage.getItem('auth_user');
        if (!authUserStr) {
            toast.error('User not authenticated');
            return null;
        }

        try {
            const authUser = JSON.parse(authUserStr);
            
            // Strict check for customer access
            if (!authUser.is_customer) {
                toast.error('Unauthorized access');
                navigate('/vin-management/manage');
                return null;
            }

            return authUser.id || null;
        } catch (error) {
            console.error('Error parsing auth_user:', error);
            toast.error('Authentication error');
            return null;
        }
    };

    // Fetch VIN detail data
    useEffect(() => {
        const fetchData = async () => {
            if (!productId) {
                toast.error('Product ID is required');
                navigate('/vin-management/manage');
                return;
            }

            const customerId = getCustomerId();
            if (!customerId) {
                navigate('/vin-management/manage');
                return;
            }

            setLoading(true);
            try {
                const response = await VinSearchService.getVinDetailMaintenance({
                    product_id: productId,
                    customer_id: customerId,
                });

                if (response.data && response.data.success) {
                    setVinResponse(response.data);
                } else {
                    toast.error(response.message || 'Failed to fetch VIN details');
                    navigate('/vin-management/manage');
                }
            } catch (error) {
                console.error('Error fetching VIN details:', error);
                toast.error('An error occurred while fetching VIN details');
                navigate('/vin-management/manage');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [productId, navigate]);

    // Filter parts by search term
    const filteredParts = useMemo(() => {
        if (!vinResponse?.part_replacements) return [];
        if (!partsSearch.trim()) return vinResponse.part_replacements;

        const search = partsSearch.toLowerCase();
        return vinResponse.part_replacements.filter(
            (part) =>
                part.part_number.toLowerCase().includes(search) ||
                part.description.toLowerCase().includes(search)
        );
    }, [vinResponse, partsSearch]);

    // Paginate parts
    const paginatedParts = useMemo(() => {
        const startIndex = (partsPage - 1) * partsPerPage;
        const endIndex = startIndex + partsPerPage;
        return filteredParts.slice(startIndex, endIndex);
    }, [filteredParts, partsPage]);

    const totalPartsPages = Math.ceil(filteredParts.length / partsPerPage);

    // Get icon for maintenance type
    const getMaintenanceIcon = (type: MaintenanceActivity['service_type']) => {
        switch (type) {
            case 'repair':
                return { icon: '🔧', color: 'bg-blue-100 text-blue-600 border-blue-200' };
            case 'inspection':
                return { icon: '✓', color: 'bg-emerald-100 text-emerald-600 border-emerald-200' };
            case 'overhaul':
                return { icon: '🔨', color: 'bg-amber-100 text-amber-600 border-amber-200' };
            case 'routine':
                return { icon: '🔄', color: 'bg-slate-100 text-slate-600 border-slate-200' };
            default:
                return { icon: '•', color: 'bg-gray-100 text-gray-600 border-gray-200' };
        }
    };

    // Mock action handlers
    const handleComingSoon = () => {
        toast.success('Coming soon!');
    };

    // Edit Body Number Handlers
    const handleEditBodyNo = () => {
        setTempBodyNo(vinResponse?.data.body_number || '');
        setIsEditingBodyNo(true);
    };

    const handleSaveBodyNo = async () => {
        if (!vinResponse) return;
        try {
            const res = await VinSearchService.updateVinBodyNumber(vinResponse.data.product_id, tempBodyNo);
            if (res.data.success) {
                 toast.success(res.data.message || 'Body number updated successfully');
                 setVinResponse(prev => prev ? {
                     ...prev,
                     data: { ...prev.data, body_number: tempBodyNo }
                 } : null);
                 setIsEditingBodyNo(false);
            } else {
                 toast.error(res.data.message || 'Failed to update body number');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error updating body number');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="mt-4 text-gray-600">Loading VIN details...</p>
                </div>
            </div>
        );
    }

    if (!vinResponse) {
        return null;
    }

    return (
        <>
            <Helmet>
                <title>{`VIN Detail: ${vinResponse.data?.vin_number || '-'}`}</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50 p-6">
                {/* Header Summary Card */}
                <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-5 w-full">
                            {/* Truck Icon */}
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center">
                                <svg className="w-16 h-16 text-gray-400" viewBox="0 0 200 200" fill="currentColor">
                                    <path d="M20 120 L50 120 L50 80 L100 80 L120 100 L160 100 L160 120 L180 120 L180 140 L160 140 L160 160 L140 160 L140 140 L60 140 L60 160 L40 160 L40 140 L20 140 Z M110 90 L140 90 L150 100 L110 100 Z" />
                                    <circle cx="50" cy="150" r="15" fill="currentColor" opacity="0.5" />
                                    <circle cx="150" cy="150" r="15" fill="currentColor" opacity="0.5" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-bold">VIN: {vinResponse.data.vin_number}</h2>
                                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded uppercase">
                                        {vinResponse.data.is_delete ? 'Inactive' : 'Active'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-1">
                                    <p className="text-sm">
                                        <span className="text-gray-500">Model:</span>{' '}
                                        <span className="font-semibold">{vinResponse.data.product_name_en || '-'}</span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="text-gray-500">Model Type:</span>{' '}
                                        <span className="font-semibold">{vinResponse.data.model_type || '-'}</span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="text-gray-500">Dimension:</span>{' '}
                                        <span className="font-semibold">{vinResponse.data.dimensi || '-'}</span>
                                    </p>
                                    <p className="text-sm">
                                        <span className="text-gray-500">Model Engine:</span>{' '}
                                        <span className="font-semibold">{vinResponse.data.model_engine || '-'}</span>
                                    </p>
                                    <div className="text-sm flex items-center gap-2 h-6">
                                        <span className="text-gray-500">Body No:</span>
                                        {isEditingBodyNo ? (
                                            <div className="flex items-center gap-1">
                                                <input 
                                                    type="text" 
                                                    value={tempBodyNo}
                                                    onChange={(e) => setTempBodyNo(e.target.value)}
                                                    className="border border-gray-300 rounded px-2 py-0.5 text-sm w-32 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                                    autoFocus
                                                />
                                                <button 
                                                    onClick={handleSaveBodyNo} 
                                                    className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                                    title="Save"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => setIsEditingBodyNo(false)} 
                                                    className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                                    title="Cancel"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold">{vinResponse.data.body_number || '-'}</span>
                                                <button 
                                                    onClick={handleEditBodyNo} 
                                                    className="p-1 text-primary-400 hover:text-primary hover:bg-primary/5 rounded"
                                                    title="Edit Body Number"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm col-span-2 md:col-span-3 mt-1">
                                        <span className="text-gray-500 block mb-1">Description:</span>
                                        <span className="font-semibold text-gray-700 whitespace-pre-wrap text-xs md:text-sm leading-relaxed">
                                            {vinResponse.data.product_description || '-'}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Maintenance Activity Timeline */}
                    <div className="lg:col-span-5 space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            Maintenance Activity
                        </h3>
                        <div className="bg-white rounded-xl border border-gray-200 p-6 relative">
                            <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-gray-100"></div>
                            <div className="space-y-8 relative">
                                {vinResponse.maintenance_activities?.map((activity) => {
                                    const { icon, color } = getMaintenanceIcon(activity.service_type);
                                    return (
                                        <div key={activity.id} className="flex gap-4 relative group">
                                            <div
                                                className={`z-10 ${color} p-2 rounded-full border-2 border-white w-10 h-10 flex items-center justify-center text-lg flex-shrink-0`}
                                            >
                                                {icon}
                                            </div>
                                            <div className="flex-1 pb-2">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-gray-900">{activity.title}</h4>
                                                    <span className="text-xs font-medium text-gray-400">
                                                        {new Date(activity.service_date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                                <div className="mt-2 flex gap-2">
                                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded font-medium text-gray-500">
                                                        ID: {activity.service_id}
                                                    </span>
                                                    <span className="text-[10px] px-2 py-0.5 bg-gray-100 rounded font-medium text-gray-500">
                                                        Tech: {activity.technician}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                onClick={handleComingSoon}
                                className="w-full mt-6 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded transition-colors"
                            >
                                View Older Activity
                            </button>
                        </div>
                    </div>

                    {/* Part Replacement History */}
                    <div className="lg:col-span-7 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                                    />
                                </svg>
                                Part Replacement History
                            </h3>
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                    />
                                </svg>
                                <input
                                    className="pl-9 pr-4 py-1.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-primary focus:border-primary w-full sm:w-64"
                                    placeholder="Search Part No..."
                                    type="text"
                                    value={partsSearch}
                                    onChange={(e) => {
                                        setPartsSearch(e.target.value);
                                        setPartsPage(1);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 font-semibold text-gray-700">Date</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Part Number</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Description</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700">Qty</th>
                                        <th className="px-6 py-4 font-semibold text-gray-700 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {paginatedParts.map((part, index) => (
                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-gray-500">
                                                {new Date(part.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-primary font-medium">{part.part_number}</span>
                                            </td>
                                            <td className="px-6 py-4">{part.description}</td>
                                            <td className="px-6 py-4">{part.quantity}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={handleComingSoon}
                                                    className="text-gray-400 hover:text-primary transition-colors"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    Showing {paginatedParts.length} of {filteredParts.length} records
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setPartsPage((p) => Math.max(1, p - 1))}
                                        disabled={partsPage === 1}
                                        className="px-3 py-1 text-xs font-semibold bg-white border border-gray-200 rounded shadow-sm disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setPartsPage((p) => Math.min(totalPartsPages, p + 1))}
                                        disabled={partsPage >= totalPartsPages}
                                        className="px-3 py-1 text-xs font-semibold bg-white border border-gray-200 rounded shadow-sm disabled:opacity-50 hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VinManagementDetail;

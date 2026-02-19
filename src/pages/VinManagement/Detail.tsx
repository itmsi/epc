import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { MdArrowBack, MdEdit, MdSave, MdCancel } from 'react-icons/md';
import PageMeta from '@/components/common/PageMeta';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import TextArea from '@/components/form/input/TextArea';
import CustomSelect from '@/components/form/select/CustomSelect';
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
    const [tempStatus, setTempStatus] = useState('');

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
        setTempStatus(vinResponse?.data.status || '');
        setIsEditingBodyNo(true);
    };

    const handleSaveBodyNo = async () => {
        if (!vinResponse) return;
        try {
            const res = await VinSearchService.updateVinBodyNumber(vinResponse.data.product_id, 
                tempBodyNo,
                tempStatus
            );
            if (res.data.success) {
                toast.success(res.data.message || 'Updated successfully');
                setVinResponse(prev => prev ? {
                    ...prev,
                    data: { ...prev.data, 
                        body_number: tempBodyNo,
                        status: tempStatus 
                    }
                } : null);
                setIsEditingBodyNo(false);
            } else {
                toast.error(res.data.message || 'Failed to update');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error updating VIN information');
        }
    };

    // Loading state
    if (loading) {
        return (
            <>
                <PageMeta
                    title="VIN Detail | MSI"
                    description="View VIN detail and maintenance history"
                    image="/motor-sights-international.png"
                />
                <div className="bg-gray-50 overflow-auto">
                    <div className="mx-auto p-4 sm:px-3">
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            <span className="ml-3 text-gray-600">Loading VIN details...</span>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    if (!vinResponse) {
        return null;
    }

    const vinData = vinResponse.data;

    return (
        <>
            <PageMeta
                title={`VIN Detail: ${vinData?.vin_number || '-'} | MSI`}
                description="View VIN detail and maintenance history"
                image="/motor-sights-international.png"
            />

            <div className="bg-gray-50 overflow-auto">
                <div className="mx-auto p-4 sm:px-3 space-y-6">

                    {/* HEADER */}
                    <div className="flex items-center justify-between h-16 bg-white shadow-sm border-b rounded-2xl p-6">
                        <div className="flex items-center gap-1">
                            <Link to="/vin-management/manage">
                                <Button
                                    variant="outline"
                                    className="flex items-center gap-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 ring-0 border-none shadow-none me-1"
                                >
                                    <MdArrowBack className="w-4 h-4" />
                                </Button>
                            </Link>
                            <div className="border-l border-gray-300 h-6 mx-3"></div>
                            <h1 className="ms-2 font-primary-bold font-normal text-xl">
                                VIN: {vinData.vin_number}
                            </h1>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            {!isEditingBodyNo ? (
                                <Button
                                    variant="outline"
                                    onClick={handleEditBodyNo}
                                    className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary py-2 hover:bg-[#0253a5] hover:text-white"
                                >
                                    <MdEdit size={20} className="text-primary group-hover:text-white" /> Edit
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        variant="primary"
                                        onClick={handleSaveBodyNo}
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 ring-[#0253a5] font-secondary py-2 bg-[#0253a5] text-white"
                                    >
                                        <MdSave className="w-4 h-4 text-white" /> Save
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditingBodyNo(false)}
                                        className="group rounded-lg w-full md:w-30 flex items-center justify-center gap-2 font-secondary py-2"
                                    >
                                        <MdCancel className="w-4 h-4" /> Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* VIN Summary Card */}
                    <div className="bg-white rounded-2xl shadow-sm">
                        <div className="p-8">
                            <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6">
                                VIN Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 font-secondary">
                                <div>
                                    <Label>VIN Number</Label>
                                    <Input
                                        type="text"
                                        value={vinData.vin_number || ''}
                                        readonly={true}
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <Label>Model</Label>
                                    <Input
                                        type="text"
                                        value={vinData.product_name_en || ''}
                                        readonly={true}
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <Label>Model Type</Label>
                                    <Input
                                        type="text"
                                        value={vinData.model_type || ''}
                                        readonly={true}
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <Label>Dimension</Label>
                                    <Input
                                        type="text"
                                        value={vinData.dimensi || ''}
                                        readonly={true}
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <Label>Model Engine</Label>
                                    <Input
                                        type="text"
                                        value={vinData.model_engine || ''}
                                        readonly={true}
                                        className="bg-gray-50"
                                    />
                                </div>
                                <div>
                                    <Label>Body No</Label>
                                    <Input
                                        type="text"
                                        value={isEditingBodyNo ? tempBodyNo : (vinData.body_number || '')}
                                        readonly={!isEditingBodyNo}
                                        onChange={(e) => setTempBodyNo(e.target.value)}
                                        className={isEditingBodyNo ? '' : 'bg-gray-50'}
                                        placeholder={isEditingBodyNo ? 'Enter body number' : '-'}
                                    />
                                </div>
                                <div>
                                    <Label>Status</Label>
                                    <CustomSelect
                                        options={[
                                            { value: 'active', label: 'Active' },
                                            { value: 'inactive', label: 'Inactive' },
                                        ]}
                                        value={(() => {
                                            const val = isEditingBodyNo ? tempStatus : (vinData.status || '');
                                            if (!val) return null;
                                            return { value: val, label: val.charAt(0).toUpperCase() + val.slice(1) };
                                        })()}
                                        onChange={(opt) => setTempStatus(opt?.value || '')}
                                        isSearchable={false}
                                        isClearable={false}
                                        disabled={!isEditingBodyNo}
                                        placeholder="-- Select Status --"
                                    />
                                </div> 
                            </div>

                            {/* Product Description */}
                            <div className="pt-6 mt-6 border-t border-gray-100 font-secondary">
                                <Label>Unit Description</Label>
                                <TextArea
                                    value={vinData.product_description || ''}
                                    rows={5}
                                    readonly={true}
                                    className="bg-gray-50"
                                />
                            </div>
                        </div>
                    </div>


                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                        {/* Maintenance Activity Timeline */}
                        <div className="lg:col-span-5">
                            <div className="bg-white rounded-2xl shadow-sm">
                                <div className="p-6">
                                    <h2 className="text-lg font-primary-bold font-medium text-gray-900 mb-6 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Maintenance Activity
                                    </h2>

                                    <div className="relative">
                                        <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gray-100"></div>
                                        <div className="space-y-8 relative">
                                            {vinResponse.maintenance_activities?.length ? (
                                                vinResponse.maintenance_activities.map((activity) => {
                                                    const { icon, color } = getMaintenanceIcon(activity.service_type);
                                                    return (
                                                        <div key={activity.id} className="flex gap-4 relative">
                                                            <div className={`z-10 ${color} p-2 rounded-full border-2 border-white w-10 h-10 flex items-center justify-center text-lg flex-shrink-0`}>
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
                                                })
                                            ) : (
                                                <div className="text-center py-8 text-gray-500 text-sm">
                                                    No maintenance activity recorded.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleComingSoon}
                                        className="w-full mt-6 py-2 text-sm font-semibold text-primary hover:bg-primary/5 rounded transition-colors"
                                    >
                                        View Older Activity
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Part Replacement History */}
                        <div className="lg:col-span-7">
                            <div className="bg-white rounded-2xl shadow-sm">
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                        <h2 className="text-lg font-primary-bold font-medium text-gray-900 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            Part Replacement History
                                        </h2>
                                        <div className="relative">
                                            <svg
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                            <input
                                                className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-primary focus:border-primary w-full sm:w-64 focus:outline-none"
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

                                    <div className="overflow-hidden rounded-xl border border-gray-200">
                                        <table className="w-full text-left text-sm border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50 border-b border-gray-200">
                                                    <th className="px-5 py-3 font-semibold text-gray-700">Date</th>
                                                    <th className="px-5 py-3 font-semibold text-gray-700">Part Number</th>
                                                    <th className="px-5 py-3 font-semibold text-gray-700">Description</th>
                                                    <th className="px-5 py-3 font-semibold text-gray-700">Qty</th>
                                                    <th className="px-5 py-3 font-semibold text-gray-700 text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {paginatedParts.length ? (
                                                    paginatedParts.map((part, index) => (
                                                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-5 py-4 text-gray-500">
                                                                {new Date(part.date).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })}
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <span className="font-mono text-primary font-medium">{part.part_number}</span>
                                                            </td>
                                                            <td className="px-5 py-4 text-gray-700">{part.description}</td>
                                                            <td className="px-5 py-4 text-gray-700">{part.quantity}</td>
                                                            <td className="px-5 py-4 text-right">
                                                                <button
                                                                    onClick={handleComingSoon}
                                                                    className="text-gray-400 hover:text-primary transition-colors"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={5} className="px-5 py-8 text-center text-gray-500 text-sm">
                                                            No part replacement records found.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>

                                        {/* Pagination */}
                                        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                Showing {paginatedParts.length} of {filteredParts.length} records
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPartsPage((p) => Math.max(1, p - 1))}
                                                    disabled={partsPage === 1}
                                                    className="px-3 py-1 text-xs rounded-lg"
                                                >
                                                    Previous
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setPartsPage((p) => Math.min(totalPartsPages, p + 1))}
                                                    disabled={partsPage >= totalPartsPages}
                                                    className="px-3 py-1 text-xs rounded-lg"
                                                >
                                                    Next
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
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

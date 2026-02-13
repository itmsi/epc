import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { VinSearchService, VinDetailResponse } from '@/services/vinSearchService';
import { toast } from 'react-hot-toast';

const VinDetail = () => {
    const { vinId } = useParams<{ vinId: string }>();
    const navigate = useNavigate();
    const [vehicleData, setVehicleData] = useState<VinDetailResponse['data'] | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchVehicleData = async () => {
            if (!vinId) {
                toast.error('VIN number is required');
                navigate('/search-vin');
                return;
            }

            // Get customer_id from auth_user in localStorage
            const authUserStr = localStorage.getItem('auth_user');
            if (!authUserStr) {
                toast.error('User not authenticated');
                navigate('/search-vin');
                return;
            }

            try {
                const authUser = JSON.parse(authUserStr);
                const customerId = authUser.id; // customer_id = auth_user.id

                if (!customerId) {
                    toast.error('Customer ID not found');
                    navigate('/search-vin');
                    return;
                }

                setIsLoading(true);
                const response = await VinSearchService.getVinDetail(vinId, customerId);

                if (response.data.success) {
                    setVehicleData(response.data.data);
                } else {
                    toast.error(response.data.message || 'Vehicle not found');
                    navigate('/search-vin');
                }
            } catch (error) {
                console.error('Error fetching vehicle data:', error);
                toast.error('Failed to load vehicle information');
                navigate('/search-vin');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicleData();
    }, [vinId, navigate]);

    const handleChangeVin = () => {
        navigate('/search-vin');
    };

    // Helper function to get category icon based on name
    const getCategoryIcon = (categoryName: string) => {
        const name = categoryName.toLowerCase();
        if (name.includes('engine')) {
            return (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
            );
        } else if (name.includes('transmission')) {
            return (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
            );
        } else if (name.includes('cabin') || name.includes('chassis')) {
            return (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            );
        } else if (name.includes('axle') || name.includes('brake')) {
            return (
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            );
        }
        // Default icon
        return (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        );
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
                    <p className="mt-4 text-gray-600">Loading vehicle information...</p>
                </div>
            </div>
        );
    }

    if (!vehicleData) {
        return null;
    }

    return (
        <>
            <Helmet>
                <title>{vehicleData ? `VIN: ${vehicleData.data_vin.vin_number} - EPC` : 'VIN Detail - EPC'}</title>
            </Helmet>

            <div className="min-h-screen bg-gray-50">
                {/* Header with Actions */}
                <div className="bg-white border-b border-gray-200">
                    <div className="px-8 py-4">
                        <div className="flex items-center justify-between">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-sm">
                                <Link to="/" className="text-gray-500 hover:text-brand-500 flex items-center gap-1">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Home
                                </Link>
                                <span className="text-gray-400">/</span>
                                <span className="text-brand-600 font-semibold">VIN: {vehicleData.data_vin.vin_number}</span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleChangeVin}
                                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Change VIN
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="px-8 py-8">
                    {/* Vehicle Information Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Main Category Selection</h1>
                        <p className="text-gray-600 mb-4">
                            Vehicle identified: <span className="font-semibold text-gray-900">{vehicleData.data_vin.product_name_en}</span>. 
                            Please select a primary system below to browse specific parts and assemblies for this configuration.
                        </p>
                        
                        {/* Vehicle Badges */}
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                                <span className="text-xs font-semibold text-gray-500 uppercase">VIN Number</span>
                                <span className="text-sm font-bold text-gray-900">{vehicleData.data_vin.vin_number}</span>
                            </div>
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                                <span className="text-xs font-semibold text-gray-500 uppercase">Model</span>
                                <span className="text-sm font-bold text-gray-900">{vehicleData.data_vin.product_name_cn}</span>
                            </div>
                        </div>
                    </div>

                    {/* Category Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {vehicleData.items.map((category) => (
                            <Link
                                key={category.master_category_id}
                                to={`/${vinId}/${category.master_category_id}`}
                                className="group bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer flex flex-col"
                            >
                                {/* Icon - Left aligned at top */}
                                <div className="flex justify-start mb-4">
                                    <div className="w-20 h-20 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-500 group-hover:bg-brand-100 transition-colors">
                                        {getCategoryIcon(category.master_category_name_en)}
                                    </div>
                                </div>

                                {/* Title - Left aligned */}
                                <h3 className="text-xl font-bold text-gray-900 mb-3 text-start">{category.master_category_name_en}</h3>
                                
                                {/* Description - Left aligned */}
                                <p className="text-sm text-gray-600 leading-relaxed text-start mb-6 flex-grow">
                                    Browse all parts and components for {category.master_category_name_en.toLowerCase()}
                                </p>

                                {/* Footer - Part count and arrow - Always at bottom */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                                    <span className="text-sm font-semibold text-gray-500">View Parts</span>
                                    <svg
                                        className="w-5 h-5 text-brand-500 group-hover:translate-x-1 transition-all"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Truck Illustration */}
                    <div className="mt-8 flex justify-end">
                        <svg className="w-32 h-32 text-gray-200" viewBox="0 0 200 200" fill="currentColor">
                            <path d="M20 120 L50 120 L50 80 L100 80 L120 100 L160 100 L160 120 L180 120 L180 140 L160 140 L160 160 L140 160 L140 140 L60 140 L60 160 L40 160 L40 140 L20 140 Z M110 90 L140 90 L150 100 L110 100 Z" />
                            <circle cx="50" cy="150" r="15" fill="currentColor" opacity="0.5" />
                            <circle cx="150" cy="150" r="15" fill="currentColor" opacity="0.5" />
                        </svg>
                    </div>
                </div>
            </div>
        </>
    );
};

export default VinDetail;

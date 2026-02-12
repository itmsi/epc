import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { VinSearchService, VinSearchData } from '@/services/vinSearchService';
import { toast } from 'react-hot-toast';

const SearchVin = () => {
    const [vinInput, setVinInput] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<VinSearchData | null>(null);

    const handleSearch = async () => {
        if (!vinInput.trim()) {
            toast.error('Please enter a VIN number');
            return;
        }

        // Get customer_id from auth_user in localStorage
        const authUserStr = localStorage.getItem('auth_user');
        if (!authUserStr) {
            toast.error('User not authenticated');
            return;
        }

        try {
            const authUser = JSON.parse(authUserStr);
            const customerId = authUser.id || authUser.user_id;

            if (!customerId) {
                toast.error('Customer ID not found');
                return;
            }

            setIsSearching(true);
            const response = await VinSearchService.searchByVin(
                vinInput.trim(),
                customerId,
                100
            );

            if (response.data.success) {
                if (response.data.data.items && response.data.data.items.length > 0) {
                    setSearchResult(response.data.data.items[0]);
                    toast.success(response.data.message || 'VIN search completed');
                } else {
                    toast.error('No vehicle found with this VIN');
                    setSearchResult(null);
                }
            } else {
                toast.error(response.data.message || 'Search failed');
                setSearchResult(null);
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('An error occurred while searching');
            setSearchResult(null);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Sample truck data for "Recently Viewed"
    // const recentTrucks = [
    //     {
    //         id: 1,
    //         model: 'HD785-7',
    //         vin: 'KOM-785-1192-A',
    //         status: 'Operational',
    //         statusColor: 'bg-success-500',
    //         lastServiced: '12 Oct 2023',
    //         image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800',
    //     },
    //     {
    //         id: 2,
    //         model: 'CAT 797F',
    //         vin: 'CAT-797-0098-X',
    //         status: 'Maintenance',
    //         statusColor: 'bg-warning-500',
    //         lastServiced: '05 Nov 2023',
    //         image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800',
    //     },
    //     {
    //         id: 3,
    //         model: 'EH4000AC-3',
    //         vin: 'HIT-400-9921-M',
    //         status: 'Operational',
    //         statusColor: 'bg-success-500',
    //         lastServiced: '29 Oct 2023',
    //         image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=800',
    //     },
    // ];

    return (
        <>
            <Helmet>
                <title>Search VIN - EPC</title>
            </Helmet>

            <div className="max-h-screen bg-gray-50">
                {/* Hero Search Section */}
                <section className="text-center py-12 px-8">
                    <div className="max-w-6xl mx-auto w-full">
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Identify Vehicle
                        </h2>
                        <p className="text-gray-500 mb-8 max-w-xl mx-auto">
                            Enter a specific Vehicle Identification Number (VIN) to access the complete 
                            spare parts breakdown and maintenance history.
                        </p>
                        
                        <div className="max-w-3xl mx-auto">
                            <div className="relative group">
                                {/* Search Icon */}
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <svg 
                                        className="w-5 h-5 text-gray-400 group-focus-within:text-brand-500 transition-colors"
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
                                </div>
                                
                                {/* Input */}
                                <input
                                    type="text"
                                    value={vinInput}
                                    onChange={(e) => setVinInput(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Enter VIN (e.g., LZGJR4V61RX035044)"
                                    disabled={isSearching}
                                    className="block w-full pl-14 pr-32 py-5 bg-white border border-gray-200 rounded-xl text-lg font-medium shadow-theme-xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 transition-all"
                                />
                                
                                {/* Search Button Inside Input */}
                                <div className="absolute inset-y-2 right-2 flex">
                                    <button
                                        onClick={handleSearch}
                                        disabled={!vinInput.trim() || isSearching}
                                        className="bg-brand-500 text-white px-8 rounded-lg font-bold hover:bg-brand-600 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSearching ? 'Searching...' : 'Search'}
                                    </button>
                                </div>
                            </div>
                            
                            {/* Popular Tags */}
                            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
                                <span>Popular Tags:</span>
                                <button className="hover:text-brand-500 underline transition-colors">
                                    Rigid Haulers
                                </button>
                                <button className="hover:text-brand-500 underline transition-colors">
                                    Komatsu Series
                                </button>
                                <button className="hover:text-brand-500 underline transition-colors">
                                    Cat 797F
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Search Results Section */}
                {searchResult && (
                    <section className="mt-12 px-8">
                        <div className="max-w-6xl mx-auto w-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <svg
                                        className="w-6 h-6 text-brand-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                    <h3 className="text-xl font-bold">Search Result</h3>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div 
                                    onClick={() => {
                                        if (searchResult.product_id) {
                                            window.location.href = `/${searchResult.product_id}`;
                                        } else {
                                            toast.error('Product ID not found');
                                        }
                                    }}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                                >
                                    {/* Image Section */}
                                    <div className="h-48 relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                        
                                        {/* Status Badge */}
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className="bg-success-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                                                Operational
                                            </span>
                                        </div>

                                        {/* Vehicle Image - Using placeholder from same source */}
                                        <img
                                            src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800"
                                            alt={`${searchResult.product_name_en} mining truck`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />

                                        {/* VIN Info Overlay */}
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <p className="text-white font-bold text-lg">{searchResult.product_name_en}</p>
                                            <p className="text-gray-300 text-xs">VIN: {searchResult.vin_number}</p>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                                Last Updated
                                            </span>
                                            <span className="text-sm font-medium">
                                                {new Date(searchResult.updated_at || searchResult.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <svg
                                            className="w-6 h-6 text-gray-300 group-hover:text-brand-500 transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                    
                                    {/* Additional Info - Expandable on click */}
                                    {searchResult.product_description && (
                                        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                {searchResult.product_description.split('\n')[0]}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* <section className="mt-12 px-8">
                    <div className="max-w-6xl mx-auto w-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <svg
                                    className="w-6 h-6 text-brand-500"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <h3 className="text-xl font-bold">Recently Viewed Trucks</h3>
                            </div>
                            <button className="text-sm font-bold text-brand-500 hover:underline">
                                View Fleet History
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentTrucks.map((truck) => (
                                <div
                                    key={truck.id}
                                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                                >
                                    <div className="h-48 relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                                        <div className="absolute top-4 left-4 z-20">
                                            <span className={`${truck.statusColor} text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase`}>
                                                {truck.status}
                                            </span>
                                        </div>

                                        <img
                                            src={truck.image}
                                            alt={`${truck.model} mining truck`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />

                                        <div className="absolute bottom-4 left-4 z-20">
                                            <p className="text-white font-bold text-lg">{truck.model}</p>
                                            <p className="text-gray-300 text-xs">VIN: {truck.vin}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 flex items-center justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
                                                Last Serviced
                                            </span>
                                            <span className="text-sm font-medium">
                                                {truck.lastServiced}
                                            </span>
                                        </div>
                                        <svg
                                            className="w-6 h-6 text-gray-300 group-hover:text-brand-500 transition-colors"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5l7 7-7 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section> */}
            </div>
        </>
    );
};

export default SearchVin;

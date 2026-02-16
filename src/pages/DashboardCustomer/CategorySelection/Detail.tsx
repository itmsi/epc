import { useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useVehicleData } from './hooks/useVehicleData';
import { useCategorySelection } from './hooks/useCategorySelection';
import { LoadingSpinner } from '@/components/common/Loading';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { CategoryCard, EmptyState, NavigationAccordion, Pagination } from './components';
import { CategoryChildItem } from './types/categorySelection';

const CategorySelectionDetail = () => {
    const { vinId, categorySlug, masterCategoryId } = useParams<{ vinId: string; categorySlug: string; masterCategoryId: string }>();
    // const navigate = useNavigate();

    const { vehicleData, productId, loading: vehicleLoading } = useVehicleData(vinId);

    // Hook untuk navigation (semua data)
    const {
        items: navItems,
        loading: navLoading,
    } = useCategorySelection({
        masterCategoryId,
        productId,
        initialLimit: 1000,
    });

    // Hook untuk cards (dengan paging dari API)
    const {
        items,
        loading,
        currentPage,
        // totalItems,
        totalPages,
        goToPage,
    } = useCategorySelection({
        masterCategoryId,
        productId,
        initialLimit: 12,
    });

    // Extract child items dari response (langsung tanpa slice)
    const childItems = useMemo(() => {
        const allChildren: { child: CategoryChildItem; parentName: string }[] = [];
        items.forEach((category) => {
            category.child.forEach((child) => {
                if (child.id_link) {
                    allChildren.push({ child, parentName: category.name });
                }
            });
        });
        return allChildren;
    }, [items]);

    // Handle page change dengan scroll to top
    const handlePageChange = useCallback((page: number) => {
        goToPage(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [goToPage]);

    const getMasterCategoryName = () => {
        return categorySlug?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Category';
    };

    if (vehicleLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <LoadingSpinner size="lg" color="text-brand-500" />
                    <p className="mt-4 text-gray-600">Loading category data...</p>
                </div>
            </div>
        );
    }

    if (!vehicleData) return null;

    return (
        <>
        <Helmet>
            {getMasterCategoryName()} - {vehicleData.data_vin.vin_number} - EPC
        </Helmet>

        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm border-b rounded-2xl">
                <div className="px-8 py-4">
                    <div className="flex items-center justify-between">
                        {/* Breadcrumb */}
                        <Breadcrumbs
                            items={[
                            { label: 'Home', path: '/' },
                            { label: `VIN: ${vehicleData.data_vin.vin_number}`, path: `/vin/${vinId}` },
                            { label: getMasterCategoryName() },
                            ]}
                        />

                        {/* Back Button */}
                        {/* <button
                            onClick={() => navigate(`/${vinId}`)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <MdArrowBack className="w-4 h-4" />
                            Back
                        </button> */}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-8">
                <div className="flex gap-6">
                    {/* Navigation Sidebar */}
                    <div className="w-80 flex-shrink-0 sticky top-0 self-start font-secondary">
                        <NavigationAccordion items={navItems} loading={navLoading} />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        {/* Header Info */}
                        {/* <div className="mb-4 text-sm text-gray-600">
                            Showing <span className="font-semibold">{childItems.length}</span> of{' '}
                            <span className="font-semibold">{totalItems}</span> items
                        </div> */}

                        {childItems.length === 0 && !loading ? (
                            <EmptyState title="No parts found" description="Try adjusting your search or filters" />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {childItems.map(({ child, parentName }) => (
                                    <CategoryCard
                                        key={child.id_link}
                                        item={child}
                                        parentName={parentName}
                                        linkTo={`/${vinId}/${categorySlug}/${masterCategoryId}/${child.id_link}`}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            loading={loading}
                            onPageChange={handlePageChange}
                        />

                        {/* Loading Indicator */}
                        {/* {loading && (
                            <div className="py-8 flex justify-center">
                                <div className="flex items-center gap-3">
                                    <LoadingSpinner size="md" color="text-brand-500" />
                                    <span className="text-gray-600">Loading...</span>
                                </div>
                            </div>
                        )} */}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default CategorySelectionDetail;

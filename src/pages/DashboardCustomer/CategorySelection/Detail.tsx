import { useMemo, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useVehicleData } from './hooks/useVehicleData';
import { useCategorySelection } from './hooks/useCategorySelection';
import { LoadingSpinner } from '@/components/common/Loading';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import { CategoryCard, EmptyState, NavigationAccordion, Pagination } from './components';
import { CategoryChildItem } from './types/categorySelection';

const CategorySelectionDetail = () => {
    const { vinId, categorySlug, masterCategoryId } = useParams<{ vinId: string; categorySlug: string; masterCategoryId: string }>();
    const [searchParams] = useSearchParams();
    // const navigate = useNavigate();

    // Extract dokumen_ids from query parameters
    const dokumenIdsParam = searchParams.get('dokumen_ids');
    const dokumenIds = dokumenIdsParam ? dokumenIdsParam.split(',') : [];

    const { vehicleData, productId, loading: vehicleLoading } = useVehicleData(vinId);

    // Hook untuk navigation (semua data)
    const {
        items: navItems,
        loading: navLoading,
    } = useCategorySelection({
        dokumenIds,
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
        dokumenIds,
        productId,
        initialLimit: 12,
    });

    // Extract items yang bisa ditampilkan (kategori dengan id_link + children dengan id_link)
    const childItems = useMemo(() => {
        const allItems: { child: CategoryChildItem; parentName: string }[] = [];
        
        items.forEach((category) => {
            // Jika kategori sendiri memiliki id_link, tambahkan sebagai item
            if (category.id_link) {
                allItems.push({ 
                    child: {
                        id: category.id,
                        id_link: category.id_link,
                        name: category.name,
                        name_cn: category.name_cn,
                        description: category.description,
                        child: []
                    }, 
                    parentName: ''
                });
            }
            
            // Jika ada children, iterasi dan tambahkan yang memiliki id_link
            const categoryChildren = category.child || [];
            categoryChildren.forEach((child) => {
                if (child.id_link) {
                    allItems.push({ child, parentName: category.name });
                }
            });
        });
        
        return allItems;
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

        <div className="bg-gray-50">
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
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="py-8">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                    {/* Navigation Sidebar */}
                    <div className="md:col-span-2 flex-shrink-0 md:sticky top-0 self-start font-secondary">
                        <NavigationAccordion 
                            items={navItems} 
                            loading={navLoading}
                            dokumenIds={dokumenIds}
                            vinId={vinId}
                            categorySlug={categorySlug}
                            masterCategoryId={masterCategoryId}
                        />
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0 md:col-span-5">
                        {childItems.length === 0 && !loading ? (
                            <EmptyState title="No parts found" description="Try adjusting your search or filters" />
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {childItems.map(({ child, parentName }) => {
                                    // Construct linkTo dengan dokumen_ids parameter
                                    const detailCatalogueLink = dokumenIdsParam 
                                        ? `/vin/${vinId}/${categorySlug}/${masterCategoryId}/${child.id_link}?dokumen_ids=${encodeURIComponent(dokumenIdsParam)}`
                                        : `/vin/${vinId}/${categorySlug}/${masterCategoryId}/${child.id_link}`;
                                    
                                    return (
                                        <CategoryCard
                                            key={child.id_link}
                                            item={child}
                                            parentName={parentName}
                                            linkTo={detailCatalogueLink}
                                        />
                                    );
                                })}
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

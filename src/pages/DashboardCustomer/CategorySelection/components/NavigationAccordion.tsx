import { useState, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MdExpandMore, MdChevronRight, MdSearch, MdClose } from 'react-icons/md';
import { CategoryItem, CategoryChildItem } from '../types/categorySelection';
import Input from '@/components/form/input/InputField';

interface NavigationAccordionProps {
    items: CategoryItem[];
    loading?: boolean;
    dokumenIds?: string[];
    vinId?: string;
    categorySlug?: string;
    masterCategoryId?: string;
    onSearch?: (query: string) => void;
    searchLoading?: boolean;
    currentSearchQuery?: string;
}

const NavigationAccordion: React.FC<NavigationAccordionProps> = ({ 
    items, 
    loading, 
    dokumenIds,
    vinId,
    categorySlug,
    masterCategoryId,
    onSearch,
    searchLoading = false,
    currentSearchQuery = ''
}) => {
    const params = useParams();
    // Use passed params or fallback to URL params
    const finalVinId = vinId || params.vinId;
    const finalCategorySlug = categorySlug || params.categorySlug;
    const finalMasterCategoryId = masterCategoryId || params.masterCategoryId;
    
    // Generate dokumen_ids query parameter
    const dokumenIdsParam = dokumenIds && dokumenIds.length > 0 
        ? `?dokumen_ids=${encodeURIComponent(dokumenIds.join(','))}`
        : '';
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState(currentSearchQuery);

    // Auto-expand saat ada search results
    useMemo(() => {
        if (currentSearchQuery.trim() && items.length > 0) {
            const newExpanded = new Set<string>();
            items.forEach((item) => newExpanded.add(item.id));
            setExpandedItems(newExpanded);
        }
    }, [currentSearchQuery, items]);

    // Handle search by Enter
    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && onSearch) {
            e.preventDefault();
            onSearch(searchQuery.trim());
        }
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchQuery('');
        if (onSearch) {
            onSearch('');
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedItems((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const renderChildItem = (child: CategoryChildItem) => {
        if (!child.id_link) return null;

        return (
            <Link
                key={child.id}
                to={`/vin/${finalVinId}/${finalCategorySlug}/${finalMasterCategoryId}/${child.id_link}${dokumenIdsParam}`}
                className="flex items-center gap-2 px-4 py-2 pl-10 text-sm text-gray-600 hover:bg-brand-50 hover:text-[#0253a5] transition-colors rounded-md"
            >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                <span className="flex-1">{child.name}</span>
            </Link>
        );
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="animate-pulse space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 bg-gray-100 rounded-lg"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl border border-gray-200">
            {/* Search Input */}
            <div className="p-4 border-b border-gray-100">
                <div className="relative">
                    <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search navigation... (Press Enter to search)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSearch(e);
                            }
                        }}
                        className="pl-10 pr-10 py-2"
                        disabled={searchLoading}
                    />
                    {searchLoading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-600"></div>
                        </div>
                    )}
                    {!searchLoading && (searchQuery || currentSearchQuery) && (
                        <button
                            onClick={handleClearSearch}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <MdClose className="w-5 h-5" />
                        </button>
                    )}
                </div>
                {currentSearchQuery && (
                    <p className="text-xs text-gray-500 mt-2">
                        Search results for: "{currentSearchQuery}"
                    </p>
                )}
            </div>

            {/* Accordion List */}
            <div className="p-2 max-h-[700px] overflow-y-auto">
                {items.length === 0 && !loading ? (
                    <div className="text-center py-8 text-gray-500 text-sm">
                        {currentSearchQuery ? 'No search results found' : 'No categories found'}
                    </div>
                ) : (
                    items.map((category) => {
                        const isExpanded = expandedItems.has(category.id);
                        const categoryChildren = category.child || [];
                        const childrenWithLink = categoryChildren.filter((c) => c.id_link);
                        const hasCategoryLink = !!category.id_link;
                        const hasChildrenWithLink = childrenWithLink.length > 0;

                        return (
                            <div key={category.id} className="mb-1">
                                {/* Parent Item */}
                                {hasCategoryLink ? (
                                    // Kategori dengan id_link - render sebagai Link langsung
                                    <Link
                                        to={`/vin/${finalVinId}/${finalCategorySlug}/${finalMasterCategoryId}/${category.id_link}${dokumenIdsParam}`}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-brand-50 hover:text-brand-600 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="text-sm font-semibold">
                                                {category.name}
                                            </span>
                                            {/* <span className="text-xs text-brand-400 flex-shrink-0">
                                                (Link)
                                            </span> */}
                                        </div>
                                        <MdChevronRight className="w-5 h-5 text-brand-400 flex-shrink-0" />
                                    </Link>
                                ) : hasChildrenWithLink ? (
                                    // Kategori tanpa id_link tapi ada children - render sebagai accordion
                                    <button
                                        onClick={() => toggleExpand(category.id)}
                                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="text-sm font-semibold text-gray-900">
                                                {category.name}
                                            </span>
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                ({childrenWithLink.length})
                                            </span>
                                        </div>
                                        {isExpanded ? (
                                            <MdExpandMore className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        ) : (
                                            <MdChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                        )}
                                    </button>
                                ) : (
                                    // Kategori tanpa id_link dan tanpa children - render sebagai disabled
                                    <div className="w-full flex items-center justify-between px-4 py-3 text-left opacity-50 cursor-not-allowed rounded-lg">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <span className="text-sm font-semibold text-gray-500">
                                                {category.name}
                                            </span>
                                            <span className="text-xs text-gray-400 flex-shrink-0">
                                                (No content)
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Children Items - hanya untuk kategori tanpa id_link */}
                                {!hasCategoryLink && isExpanded && hasChildrenWithLink && (
                                    <div className="ml-2 mb-2">
                                        {childrenWithLink.map((child) =>
                                            renderChildItem(child)
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default NavigationAccordion;

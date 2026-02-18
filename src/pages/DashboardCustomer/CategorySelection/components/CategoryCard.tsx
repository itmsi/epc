import { Link } from 'react-router-dom';
import { CategoryChildItem } from '../types/categorySelection';

interface CategoryCardProps {
    item: CategoryChildItem;
    parentName: string;
    linkTo: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ item, parentName, linkTo }) => {
    return (
        <Link
            to={linkTo}
            className="group bg-white rounded-md border border-gray-200 overflow-hiddentransition-transform duration-800"
        >
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                <img
                    src="/images/product/placeholder.png"
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/images/icons/part-placeholder.svg';
                        target.onerror = null;
                    }}
                />
                {parentName !== '' && (
                <div className="absolute top-3 left-3 right-3">
                    <span className="px-2 py-1 text-xs uppercase font-medium font-secondary tracking-[0.05em] bg-[#0253a5] text-white rounded-md inline-block leading-tight">
                        {parentName}
                    </span>
                </div>
                )}
            </div>

            <div className="p-4">
                <h3 className="text-base font-primary-bold mb-2 line-clamp-3 transition-colors">
                    {item.name}
                </h3>

                {item.name_cn && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2 transition-colors">
                        {item.name_cn}
                    </p>
                )}
            </div>
        </Link>
    );
};

export default CategoryCard;

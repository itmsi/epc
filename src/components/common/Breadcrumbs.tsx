import { Link } from 'react-router-dom';
import { MdHome, MdChevronRight } from 'react-icons/md';

export interface BreadcrumbItem {
    label: string;
    path?: string;
    icon?: React.ReactNode;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    showHomeIcon?: boolean;
    separator?: React.ReactNode;
    className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
    items,
    showHomeIcon = true,
    separator,
    className = '',
}) => {
    const defaultSeparator = <MdChevronRight className="w-4 h-4 text-gray-400" />;
    const separatorElement = separator || defaultSeparator;

    return (
        <nav aria-label="Breadcrumb" className={className}>
            <ol className="flex flex-wrap items-center gap-2 text-sm">
                {items.map((item, index) => {
                    const isFirst = index === 0;
                    const isLast = index === items.length - 1;
                    const hasPath = !!item.path;

                    return (
                        <li key={index} className="flex items-center gap-2">
                            {!isFirst && separatorElement}

                            {hasPath ? (
                                <Link
                                    to={item.path!}
                                    className="flex items-center gap-1.5 text-gray-500 hover:text-brand-500 transition-colors"
                                >
                                    {isFirst && showHomeIcon && !item.icon && (
                                        <MdHome className="w-4 h-4" />
                                    )}
                                    {item.icon && item.icon}
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={`flex items-center gap-1.5 ${
                                        isLast 
                                        ? 'text-brand-800 font-primary-bold' 
                                        : 'text-gray-600'
                                    }`}
                                >
                                    {item.icon && item.icon}
                                    {item.label}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;

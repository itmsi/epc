import { CatalogueHeader } from '../types';

interface DetailCatalogueHeaderProps {
    header: CatalogueHeader | null;
}

/**
 * Komponen header untuk halaman detail catalogue
 */
export const DetailCatalogueHeader = ({ header }: DetailCatalogueHeaderProps) => {
    if (!header) return null;

    return (
        <div className="px-6 py-4 border-b border-gray-200 my-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg leading-6 font-primary-bold text-gray-900">
                        {header.category_name_en} {header.category_name_cn}
                    </h3>
                    {header.type_category_name_en && (
                        <p className="mt-1 text-sm text-gray-500">
                            {header.type_category_name_en} {header.type_category_name_cn}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

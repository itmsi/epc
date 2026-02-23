import { useState, useRef, useEffect } from 'react';
import { MdShoppingCart, MdClose } from 'react-icons/md';
import { useCartContext } from '@/context/CartContext';
import { CartItem } from '@/hooks/useCart';
import Button from '../ui/button/Button';

export default function CartDropdown() {
    const { cartItems, totalItems, removeFromCart, updateQty, saveCart, isSaving } = useCartContext();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Tutup saat klik di luar
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Group items by "vin_number|categorySlug|categoryName"
    const grouped = cartItems.reduce<Record<string, CartItem[]>>((acc, item) => {
        const key = `${item.vin_number}|${item.categorySlug}|${item.categoryName}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(item);
        return acc;
    }, {});

    return (
        <div ref={ref} className="relative">
            {/* Icon Button */}
            <button
                onClick={() => setOpen(prev => !prev)}
                className="relative flex items-center justify-center w-10 h-10 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Cart"
            >
                <MdShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-red-500 rounded-full">
                        {totalItems > 99 ? '99+' : totalItems}
                    </span>
                )}
            </button>

            {/* Dropdown Panel - Fullscreen on mobile, Dropdown on desktop */}
            {open && (
                <div className="fixed inset-0 z-[999] w-full h-full bg-white flex flex-col sm:absolute sm:inset-auto sm:right-0 sm:mt-2 sm:w-[580px] sm:h-auto sm:rounded-xl sm:shadow-xl sm:border sm:border-gray-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                        <h3 className="font-primary-bold text-gray-800 flex items-center gap-2">
                            <MdShoppingCart className="w-5 h-5 text-primary" />
                            Cart
                            <span className="text-xs font-normal font-primary text-gray-400">({totalItems} items)</span>
                        </h3>
                        <button
                            onClick={() => setOpen(false)}
                            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <MdClose className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Items grouped by VIN + Category */}
                    <div className={`flex-1 overflow-y-auto sm:max-h-[420px] p-3 ${cartItems.length === 0 ? 'bg-white' : 'bg-[#dfe8f2]'} space-y-3`}>
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-400 h-full">
                                <MdShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-base font-medium">Cart is empty</p>
                                <p className="text-sm mt-1">Start adding items from parts catalogue</p>
                            </div>
                        ) : (
                            Object.entries(grouped).map(([key, items]) => {
                                const [vinNumber, categorySlug, categoryName] = key.split('|');
                                return (
                                    <div key={key} className="border-b border-gray-100 last:border-b-0 bg-white rounded-lg">
                                        {/* Group header */}
                                        <div className="px-4 py-2 bg-gray-50 flex items-center gap-2 sticky top-0 z-10 rounded-lg">
                                            <span className="text-[10px] font-primary-bold tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                VIN: {vinNumber}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {categorySlug.replace(/-/g, ' ')} › {categoryName}
                                            </span>
                                            <span className="ml-auto text-[10px] text-gray-400">{items.length} part(s)</span>
                                        </div>

                                        {/* Items in group */}
                                        <div className="divide-y divide-gray-50">
                                            {items.map(item => (
                                                <div key={item.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-mono font-semibold">{item.name_en || item.name_cn || '-'}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            Qty Needs: <span className="font-medium text-gray-600">{item.quantity_needs}</span>
                                                            &nbsp;|&nbsp;
                                                            Stock: <span className="font-medium text-gray-600">{item.quantity_stock}</span>
                                                        </p>
                                                    </div>

                                                    {/* Qty control */}
                                                    <div className="flex items-center gap-1 flex-shrink-0">
                                                        <button
                                                            onClick={() => updateQty(item.id, item.qty - 1)}
                                                            disabled={item.qty <= 1}
                                                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold transition-colors"
                                                        >
                                                            −
                                                        </button>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={item.quantity_stock}
                                                            value={item.qty}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value, 10);
                                                                if (!isNaN(val)) updateQty(item.id, val);
                                                            }}
                                                            className="w-12 h-6 text-center text-sm border border-gray-200 rounded focus:outline-none focus:border-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                        />
                                                        <button
                                                            onClick={() => updateQty(item.id, item.qty + 1)}
                                                            disabled={item.qty >= item.quantity_stock}
                                                            className="w-6 h-6 flex items-center justify-center rounded border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-sm font-bold transition-colors"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {/* Remove */}
                                                    <button
                                                        onClick={() => removeFromCart(item.id)}
                                                        className="flex-shrink-0 text-red-500 transition-colors"
                                                        title="Remove"
                                                    >
                                                        <MdClose className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    {cartItems.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100 flex justify-end">
                            <Button
                                onClick={async () => {
                                    const success = await saveCart();
                                    if (success) setOpen(false);
                                }}
                                disabled={isSaving}
                                className='px-4 py-2'
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <MdShoppingCart className="w-4 h-4" />
                                        Save
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

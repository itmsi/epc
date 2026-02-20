import { useState, useEffect, useCallback } from 'react';
import { CartService } from '@/services/cartService';
import toast from 'react-hot-toast';

export interface CartItem {
    id: string;
    part_number: string;
    name_en: string;
    name_cn: string;
    quantity_needs: number;
    quantity_stock: number;
    qty: number;
    // Grouping context
    vin_number: string;
    categorySlug: string;
    categoryName: string;
}

const getCartKey = (): string => {
    try {
        const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
        return `cart_items_${authUser.id || 'guest'}`;
    } catch {
        return 'cart_items_guest';
    }
};

const loadCart = (): CartItem[] => {
    try {
        const raw = localStorage.getItem(getCartKey());
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const useCart = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>(loadCart);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        localStorage.setItem(getCartKey(), JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = useCallback((item: Omit<CartItem, 'qty'>) => {
        setCartItems(prev => {
            const exists = prev.find(p => p.id === item.id);
            if (exists) {
                return prev.map(p =>
                    p.id === item.id
                        ? { ...p, qty: Math.min(p.qty + 1, p.quantity_stock || 9999) }
                        : p
                );
            }
            return [...prev, { ...item, qty: 1 }];
        });
    }, []);

    const updateQty = useCallback((id: string, qty: number) => {
        setCartItems(prev =>
            prev.map(p =>
                p.id === id
                    ? { ...p, qty: Math.max(1, Math.min(qty, p.quantity_stock || 9999)) }
                    : p
            )
        );
    }, []);

    const removeFromCart = useCallback((id: string) => {
        setCartItems(prev => prev.filter(p => p.id !== id));
    }, []);

    const clearCart = useCallback(() => {
        setCartItems([]);
    }, []);

    const saveCart = useCallback(async () => {
        try {
            setIsSaving(true);
            const authUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
            if (!authUser.id) {
                toast.error('User not authenticated');
                return false;
            }

            // Group items by VIN
            const groupedItems = cartItems.reduce((acc, item) => {
                if (!acc[item.vin_number]) {
                    acc[item.vin_number] = [];
                }
                const group = acc[item.vin_number];
                // Check if item already exists in this group to prevent duplicates in payload,
                // although CartItem ID should be unique.
                group.push({
                    master_item_id: item.id,
                    part_number: item.part_number,
                    master_item_name_en: item.name_en,
                    master_item_name_ch: item.name_cn,
                    quantity_needs: item.quantity_needs, // as number/string per interface
                    quantity_order: item.qty
                });
                return acc;
            }, {} as Record<string, any[]>);

            const payloadData = Object.entries(groupedItems).map(([vinNumber, items]) => ({
                vin_number: vinNumber,
                item: items
            }));

            const payload = {
                customer_id: authUser.id,
                transaction_order_date: new Date().toISOString().split('T')[0],
                transaction_order_status: "submission",
                transaction_order_items: {
                    data: payloadData
                },
                transaction_order_items_total: cartItems.reduce((sum, item) => sum + item.qty, 0)
            };

            await CartService.createTransactionOrder(payload);
            toast.success('Order created successfully!');
            clearCart(); 
            return true;
        } catch (error: any) {
            console.error('Failed to create order:', error);
            const msg = error?.response?.data?.message || 'Failed to create order. Please try again.';
            toast.error(msg);
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [cartItems, clearCart]);

    return { 
        cartItems, 
        totalItems: cartItems.length, 
        addToCart, 
        updateQty, 
        removeFromCart, 
        clearCart,
        saveCart,
        isSaving 
    };
};

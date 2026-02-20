import { useState, useEffect, useCallback, useMemo } from 'react';
import { CartService } from '@/services/cartService';
import { useAuth } from '@/context/AuthContext';
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

const getCartKey = (userId: string | undefined): string | null => {
    if (!userId) return null;
    return `cart_items_${userId}`;
};

const loadCart = (userId: string | undefined): CartItem[] => {
    try {
        const key = getCartKey(userId);
        if (!key) return [];
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

export const useCart = () => {
    const { user, isAuthenticated } = useAuth();
    
    const currentUserId = useMemo(() => {
        if (isAuthenticated && user) {
            return user.user_id || (user as any).id;
        }
        
        try {
            const stored = localStorage.getItem('auth_user');
            if (stored) {
                const parsed = JSON.parse(stored);
                return parsed.user_id || parsed.id;
            }
        } catch (e) {
            // ignore
        }
    }, [user, isAuthenticated]);
    
    const [cartItems, setCartItems] = useState<CartItem[]>(() => loadCart(currentUserId));
    const [loadedUserId, setLoadedUserId] = useState<string | null>(currentUserId);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const items = loadCart(currentUserId);
        setCartItems(items);
        setLoadedUserId(currentUserId);
    }, [currentUserId]);

    useEffect(() => {
        const key = getCartKey(currentUserId);
        if (key && currentUserId && loadedUserId === currentUserId) {
            localStorage.setItem(key, JSON.stringify(cartItems));
        }
    }, [cartItems, currentUserId, loadedUserId]);

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
            const userId = currentUserId;
            
            if (!userId) {
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
                customer_id: userId,
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

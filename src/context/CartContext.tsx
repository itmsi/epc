import { createContext, useContext, ReactNode } from 'react';
import { useCart, CartItem } from '@/hooks/useCart';

interface CartContextType {
    cartItems: CartItem[];
    totalItems: number;
    addToCart: (item: Omit<CartItem, 'qty'>) => void;
    updateQty: (id: string, qty: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    saveCart: () => Promise<boolean>;
    isSaving: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const cart = useCart();
    return (
        <CartContext.Provider value={cart}>
            {children}
        </CartContext.Provider>
    );
}

export const useCartContext = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCartContext must be used within CartProvider');
    return ctx;
};

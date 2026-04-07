import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IceCream } from '../types';
import { appInsights } from '../services/appInsights';

interface CartContextType {
    cart: IceCream[];
    cartItems: IceCream[];
    addToCart: (iceCream: IceCream) => void;
    removeFromCart: (index: number) => void;
    removeItem: (index: number) => void;
    clearCart: () => void;
    getTotalItems: () => number;
    getCartTotal: () => number;
    totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
    children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
    const [cart, setCart] = useState<IceCream[]>([]);

    const addToCart = (iceCream: IceCream) => {
        const iceCreamWithId = {
            ...iceCream,
            id: Date.now() + Math.random(), // Simple ID generation
        };
        setCart((prevCart) => [...prevCart, iceCreamWithId]);
        console.log('Added to cart:', iceCreamWithId); // Debug log
        console.log('Cart now contains:', cart.length + 1, 'items'); // Debug log
        
        // Track add to cart event in Application Insights
        appInsights.trackEvent(
            { name: 'AddToCart' },
            {
                container: iceCream.container,
                flavorCount: iceCream.flavors.length,
                flavors: iceCream.flavors.map(f => f.name).join(', '),
                toppingCount: iceCream.toppings.length,
                toppings: iceCream.toppings.map(t => t.name).join(', '),
                cartItemCount: cart.length + 1
            }
        );
    };

    const removeFromCart = (index: number) => {
        const removedItem = cart[index];
        setCart((prevCart) => prevCart.filter((_, i) => i !== index));
        
        // Track remove from cart event
        if (removedItem) {
            appInsights.trackEvent(
                { name: 'RemoveFromCart' },
                {
                    container: removedItem.container,
                    flavorCount: removedItem.flavors.length,
                    cartItemCount: cart.length - 1
                }
            );
        }
    };

    const clearCart = () => {
        const itemCount = cart.length;
        setCart([]);
        
        // Track cart cleared event
        if (itemCount > 0) {
            appInsights.trackEvent(
                { name: 'ClearCart' },
                { itemsRemoved: itemCount }
            );
        }
    };

    const getTotalItems = () => {
        return cart.length;
    };

    // Calculate total amount with proper pricing
    const getTotalAmount = () => {
        return cart.reduce((total, iceCream) => {
            const containerPrice = iceCream.container === 'cone' ? 2.50 : 3.00;
            const flavorsPrice = iceCream.flavors.length * 2.00;
            const toppingsPrice = iceCream.toppings.reduce((toppingsTotal, topping) => {
                return toppingsTotal + (topping.price || 0.50);
            }, 0);
            
            return total + containerPrice + flavorsPrice + toppingsPrice;
        }, 0);
    };

    const value: CartContextType = {
        cart,
        cartItems: cart,
        addToCart,
        removeFromCart,
        removeItem: removeFromCart,
        clearCart,
        getTotalItems,
        getCartTotal: getTotalAmount,
        totalAmount: getTotalAmount(),
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = (): CartContextType => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export default CartContext;
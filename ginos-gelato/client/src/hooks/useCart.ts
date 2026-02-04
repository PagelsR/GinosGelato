import { useState } from 'react';
import { IceCream } from '../types';

export const useCart = () => {
    const [cart, setCart] = useState<IceCream[]>([]);

    const addToCart = (iceCream: IceCream) => {
        const iceCreamWithId = {
            ...iceCream,
            id: Date.now() + Math.random(), // Simple ID generation
        };
        setCart((prevCart) => [...prevCart, iceCreamWithId]);
    };

    const removeFromCart = (index: number) => {
        setCart((prevCart) => prevCart.filter((_, i) => i !== index));
    };

    const clearCart = () => {
        setCart([]);
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

    return {
        cart,
        cartItems: cart, // Alias for backward compatibility
        addToCart,
        removeFromCart,
        removeItem: removeFromCart, // Alias for backward compatibility
        clearCart,
        getTotalItems,
        getCartTotal: getTotalAmount, // Add this method
        totalAmount: getTotalAmount(),
    };
};

export default useCart;
import React from 'react';
import { useCart } from '../../hooks/useCart';
import CartItem from './CartItem';
import { Link } from 'react-router-dom';

const Cart: React.FC = () => {
    const { cartItems, removeFromCart, clearCart } = useCart();

    const handleRemove = (index: number) => {
        removeFromCart(index);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
            {cartItems.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div>
                    {cartItems.map((item, index) => (
                        <CartItem key={item.id || index} item={item} onRemove={() => handleRemove(index)} />
                    ))}
                    <div className="mt-4">
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                            onClick={clearCart}
                        >
                            Clear Cart
                        </button>
                        <Link to="/checkout">
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded"
                            >
                                Proceed to Checkout
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cart;
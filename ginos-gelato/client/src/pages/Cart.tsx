import React from 'react';
import { useCart } from '../contexts/CartContext';
import CartItem from '../components/Cart/CartItem';
import { Link } from 'react-router-dom';
import Button from '../components/UI/Button';

const Cart: React.FC = () => {
    const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart();

    const handleRemove = (index: number) => {
        removeFromCart(index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-20 right-20 text-pink-200 text-6xl animate-float opacity-20">🛒</div>
            <div className="absolute bottom-32 left-20 text-blue-200 text-5xl animate-bounce-slow opacity-20">🍦</div>
            
            <div className="gelato-container relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
                        🛒 Your Ice Cream Cart
                    </h1>
                    <p className="text-xl text-gray-600">
                        Review your delicious selections before checkout
                    </p>
                </div>

                {cartItems.length === 0 ? (
                    <div className="gelato-card text-center bg-gradient-to-br from-white to-blue-50 max-w-md mx-auto">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty!</h2>
                        <p className="text-gray-600 mb-6">Ready to create some delicious ice cream?</p>
                        <Link to="/builder">
                            <Button variant="primary" size="lg" onClick={() => {}}>
                                🎨 Start Building Ice Cream
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item, index) => (
                                <CartItem key={item.id || index} item={item} onRemove={() => handleRemove(index)} />
                            ))}
                        </div>

                        {/* Cart Summary */}
                        <div className="space-y-6">
                            <div className="gelato-card bg-gradient-to-br from-white to-green-50 sticky top-6">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                                    📋 Order Summary
                                </h3>
                                
                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Items ({cartItems.length})</span>
                                        <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tax (8.5%)</span>
                                        <span className="font-medium">${(getCartTotal() * 0.085).toFixed(2)}</span>
                                    </div>
                                    <hr className="border-gray-200" />
                                    <div className="flex justify-between text-lg font-bold">
                                        <span>Total</span>
                                        <span className="text-green-600">${(getCartTotal() * 1.085).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <Link to="/checkout" className="block">
                                        <Button variant="primary" size="lg" className="w-full" onClick={() => {}}>
                                            💳 Proceed to Checkout
                                        </Button>
                                    </Link>
                                    
                                    <Button 
                                        variant="secondary"
                                        size="md"
                                        onClick={clearCart}
                                        className="w-full"
                                    >
                                        🗑️ Clear Cart
                                    </Button>
                                    
                                    <Link to="/builder" className="block">
                                        <Button 
                                            variant="accent"
                                            size="md"
                                            className="w-full"
                                            onClick={() => {}}
                                        >
                                            ➕ Add More Ice Cream
                                        </Button>
                                    </Link>
                                </div>
                            </div>

                            {/* Special Offers */}
                            <div className="gelato-card bg-gradient-to-r from-yellow-100 to-orange-100">
                                <h4 className="font-semibold text-gray-800 mb-2">🎁 Special Offers</h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Free topping with 3+ items</li>
                                    <li>• 10% off orders over $25</li>
                                    <li>• Free delivery on $30+ orders</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;
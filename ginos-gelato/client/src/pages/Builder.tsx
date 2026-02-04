import React, { useState } from 'react';
import ContainerSelector from '../components/IceCreamBuilder/ContainerSelector';
import FlavorSelector from '../components/IceCreamBuilder/FlavorSelector';
import ToppingsSelector from '../components/IceCreamBuilder/ToppingsSelector';
import { useCart } from '../contexts/CartContext';
import { IceCream, Flavor, Topping } from '../types';
import Button from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';

const Builder: React.FC = () => {
    const { addToCart, cartItems } = useCart();
    const navigate = useNavigate();
    const [selectedContainer, setSelectedContainer] = useState<'cone' | 'cup'>('cone');
    const [selectedFlavors, setSelectedFlavors] = useState<Flavor[]>([]);
    const [selectedToppings, setSelectedToppings] = useState<Topping[]>([]);
    const [showSuccess, setShowSuccess] = useState(false);

    const calculatePrice = () => {
        const containerPrice = selectedContainer === 'cone' ? 2.50 : 3.00;
        const flavorsPrice = selectedFlavors.length * 2.00;
        const toppingsPrice = selectedToppings.reduce((total, topping) => total + topping.price, 0);
        return containerPrice + flavorsPrice + toppingsPrice;
    };

    const handleAddToCart = () => {
        if (selectedFlavors.length === 0) {
            alert('Please select at least one flavor!');
            return;
        }

        const iceCream: IceCream = {
            container: selectedContainer,
            flavors: selectedFlavors,
            toppings: selectedToppings,
        };
        
        console.log('Adding ice cream to cart:', iceCream); // Debug log
        addToCart(iceCream);
        console.log('Cart items after adding:', cartItems.length); // Debug log
        
        // Show success animation
        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            // Reset selections after adding to cart
            setSelectedContainer('cone');
            setSelectedFlavors([]);
            setSelectedToppings([]);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-10 left-20 text-pink-200 text-6xl animate-float opacity-20">🍦</div>
            <div className="absolute bottom-20 right-20 text-blue-200 text-5xl animate-bounce-slow opacity-20">🍨</div>
            <div className="absolute top-1/2 left-10 text-yellow-200 text-4xl animate-float opacity-20">🧁</div>

            {/* Success Message */}
            {showSuccess && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="gelato-card text-center animate-bounce">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-green-600 mb-2">Added to Cart!</h2>
                        <p className="text-gray-600">Your delicious creation is ready!</p>
                    </div>
                </div>
            )}

            <div className="gelato-container relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
                        🎨 Build Your Perfect Ice Cream
                    </h1>
                    <p className="text-xl text-gray-600">
                        Choose your container, pick up to 3 flavors, and add your favorite toppings!
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Selections */}
                    <div className="lg:col-span-2 space-y-8">
                        <ContainerSelector selectedContainer={selectedContainer} setSelectedContainer={setSelectedContainer} />
                        <FlavorSelector selectedFlavors={selectedFlavors} setSelectedFlavors={setSelectedFlavors} />
                        <ToppingsSelector selectedToppings={selectedToppings} setSelectedToppings={setSelectedToppings} />
                    </div>

                    {/* Right Column - Preview & Summary */}
                    <div className="space-y-6">
                        {/* Ice Cream Preview */}
                        <div className="gelato-card bg-gradient-to-br from-white to-pink-50 sticky top-6">
                            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">🍦 Your Creation</h3>
                            
                            {/* Visual Preview */}
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-2">
                                    {selectedContainer === 'cone' ? '🍦' : '🍨'}
                                </div>
                                <p className="font-medium text-gray-700 capitalize">
                                    {selectedContainer === 'cone' ? 'Waffle Cone' : 'Cup'}
                                </p>
                            </div>

                            {/* Flavors Summary */}
                            <div className="mb-4">
                                <h4 className="font-medium text-gray-700 mb-2">Flavors ({selectedFlavors.length}/3):</h4>
                                {selectedFlavors.length > 0 ? (
                                    <div className="space-y-1">
                                        {selectedFlavors.map(flavor => (
                                            <div key={flavor.id} className="text-sm bg-gradient-to-r from-pink-100 to-orange-100 px-3 py-1 rounded-full">
                                                {flavor.name}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No flavors selected</p>
                                )}
                            </div>

                            {/* Toppings Summary */}
                            <div className="mb-6">
                                <h4 className="font-medium text-gray-700 mb-2">Toppings ({selectedToppings.length}):</h4>
                                {selectedToppings.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                        {selectedToppings.map(topping => (
                                            <span key={topping.id} className="text-xs bg-gradient-to-r from-yellow-200 to-orange-200 px-2 py-1 rounded-full">
                                                {topping.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No toppings selected</p>
                                )}
                            </div>

                            {/* Price */}
                            <div className="border-t border-gray-200 pt-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-gray-800">Total Price:</span>
                                    <span className="text-xl font-bold text-green-600">${calculatePrice().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <Button 
                                onClick={handleAddToCart}
                                variant="primary"
                                size="lg"
                                className="w-full mb-3"
                                disabled={selectedFlavors.length === 0}
                            >
                                🛒 Add to Cart
                            </Button>

                            <Button 
                                onClick={() => navigate('/cart')}
                                variant="secondary"
                                size="md"
                                className="w-full"
                            >
                                View Cart
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Builder;
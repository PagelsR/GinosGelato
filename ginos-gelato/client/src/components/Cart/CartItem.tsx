import React from 'react';
import { IceCream } from '../../types';
import Button from '../UI/Button';

interface CartItemProps {
    item: IceCream;
    onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = ({ item, onRemove }) => {
    const { container, flavors, toppings } = item;

    const calculateItemPrice = () => {
        const containerPrice = container === 'cone' ? 2.50 : 3.00;
        const flavorsPrice = flavors.length * 2.00;
        const toppingsPrice = toppings.reduce((total, topping) => total + (topping.price || 0.50), 0);
        return containerPrice + flavorsPrice + toppingsPrice;
    };

    return (
        <div className="gelato-card bg-gradient-to-br from-white to-pink-50 hover:shadow-xl transition-all duration-300">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {/* Ice Cream Visual & Info */}
                <div className="flex gap-4 flex-1">
                    <div className="text-4xl">
                        {container === 'cone' ? '🍦' : '🍨'}
                    </div>
                    
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Custom {container === 'cone' ? 'Cone' : 'Cup'} Creation
                        </h3>
                        
                        {/* Flavors */}
                        <div className="mb-2">
                            <span className="text-sm font-medium text-gray-600">Flavors: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {flavors.map((flavor) => (
                                    <span 
                                        key={flavor.id}
                                        className="bg-gradient-to-r from-pink-200 to-orange-200 text-gray-800 text-xs px-2 py-1 rounded-full"
                                    >
                                        {flavor.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                        
                        {/* Toppings */}
                        <div className="mb-2">
                            <span className="text-sm font-medium text-gray-600">Toppings: </span>
                            {toppings.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {toppings.map((topping) => (
                                        <span 
                                            key={topping.id}
                                            className="bg-gradient-to-r from-yellow-200 to-orange-200 text-gray-800 text-xs px-2 py-1 rounded-full"
                                        >
                                            {topping.name}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <span className="text-gray-500 text-sm">None</span>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Price & Remove */}
                <div className="flex flex-row md:flex-col items-center gap-3">
                    <div className="text-right">
                        <div className="text-xl font-bold text-green-600">
                            ${calculateItemPrice().toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                            per item
                        </div>
                    </div>
                    
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onRemove}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        🗑️ Remove
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CartItem;
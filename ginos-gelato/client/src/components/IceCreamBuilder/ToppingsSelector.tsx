import React from 'react';
import { Topping } from '../../types';

interface ToppingsSelectorProps {
  selectedToppings: Topping[];
  setSelectedToppings: (toppings: Topping[]) => void;
}

// Enhanced toppings with emojis and prices
const availableToppings: Topping[] = [
  { id: 1, name: 'Rainbow Sprinkles', price: 0.50 },
  { id: 2, name: 'Chocolate Chips', price: 0.75 },
  { id: 3, name: 'Crushed Oreos', price: 1.00 },
  { id: 4, name: 'Caramel Sauce', price: 0.75 },
  { id: 5, name: 'Hot Fudge', price: 0.75 },
  { id: 6, name: 'Whipped Cream', price: 0.50 },
  { id: 7, name: 'Cherry', price: 0.25 },
  { id: 8, name: 'Crushed Nuts', price: 1.00 },
  { id: 9, name: 'Fresh Strawberries', price: 1.25 },
  { id: 10, name: 'Gummy Bears', price: 0.75 },
  { id: 11, name: 'Coconut Flakes', price: 0.50 },
  { id: 12, name: 'Graham Cracker', price: 0.75 },
];

const toppingEmojis: { [key: string]: string } = {
  'Rainbow Sprinkles': '🌈',
  'Chocolate Chips': '🍫',
  'Crushed Oreos': '🍪',
  'Caramel Sauce': '🧈',
  'Hot Fudge': '☕',
  'Whipped Cream': '🥛',
  'Cherry': '🍒',
  'Crushed Nuts': '🥜',
  'Fresh Strawberries': '🍓',
  'Gummy Bears': '🐻',
  'Coconut Flakes': '🥥',
  'Graham Cracker': '🍪',
};

const ToppingsSelector: React.FC<ToppingsSelectorProps> = ({ selectedToppings, setSelectedToppings }) => {
    const handleToppingChange = (topping: Topping) => {
        const isSelected = selectedToppings.some(t => t.id === topping.id);
        
        if (isSelected) {
            // Remove topping if already selected
            setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id));
        } else {
            // Add topping
            setSelectedToppings([...selectedToppings, topping]);
        }
    };

    const getTotalToppingsPrice = () => {
        return selectedToppings.reduce((total, topping) => total + topping.price, 0);
    };

    return (
        <div className="gelato-card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                    🧁 Add Your Toppings
                </h2>
                {selectedToppings.length > 0 && (
                    <div className="text-sm text-gray-600 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full">
                        {selectedToppings.length} toppings • +${getTotalToppingsPrice().toFixed(2)}
                    </div>
                )}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {availableToppings.map((topping) => {
                    const isSelected = selectedToppings.some(t => t.id === topping.id);
                    
                    return (
                        <div
                            key={topping.id}
                            className={`topping-pill ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleToppingChange(topping)}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{toppingEmojis[topping.name] || '🍯'}</span>
                                    <span className="text-sm font-medium">{topping.name}</span>
                                </div>
                                <div className="text-xs font-bold">
                                    +${topping.price.toFixed(2)}
                                </div>
                            </div>
                            {isSelected && (
                                <div className="mt-1 text-xs text-center">
                                    ✓ Added
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            
            {selectedToppings.length === 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg text-center">
                    <p className="text-gray-600">
                        🎯 Click on toppings to add them to your ice cream!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ToppingsSelector;
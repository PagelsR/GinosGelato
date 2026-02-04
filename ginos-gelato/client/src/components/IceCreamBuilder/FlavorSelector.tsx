import React from 'react';
import { Flavor } from '../../types';

interface FlavorSelectorProps {
  selectedFlavors: Flavor[];
  setSelectedFlavors: (flavors: Flavor[]) => void;
}

// Enhanced flavors with emojis and colors
const availableFlavors = [
  { id: 1, name: 'Vanilla Dream', emoji: '🤍', color: 'from-yellow-100 to-cream-100', description: 'Classic vanilla with Madagascar beans' },
  { id: 2, name: 'Chocolate Fudge', emoji: '🤎', color: 'from-amber-800 to-yellow-700', description: 'Rich dark chocolate delight' },
  { id: 3, name: 'Strawberry Bliss', emoji: '🍓', color: 'from-pink-300 to-red-300', description: 'Fresh strawberries and cream' },
  { id: 4, name: 'Mint Chocolate Chip', emoji: '🌿', color: 'from-green-200 to-emerald-300', description: 'Cool mint with chocolate chips' },
  { id: 5, name: 'Cookies & Cream', emoji: '🍪', color: 'from-gray-100 to-gray-300', description: 'Crushed Oreo cookies in vanilla' },
  { id: 6, name: 'Rocky Road', emoji: '🏔️', color: 'from-brown-300 to-amber-400', description: 'Chocolate with marshmallows & nuts' },
  { id: 7, name: 'Berry Burst', emoji: '🫐', color: 'from-purple-300 to-blue-400', description: 'Mixed berry explosion' },
  { id: 8, name: 'Pistachio', emoji: '🥜', color: 'from-green-300 to-lime-300', description: 'Authentic Italian pistachio' },
  { id: 9, name: 'Lemon Sorbet', emoji: '🍋', color: 'from-yellow-200 to-yellow-400', description: 'Refreshing lemon zest' },
  { id: 10, name: 'Salted Caramel', emoji: '🧈', color: 'from-amber-200 to-orange-300', description: 'Sweet caramel with sea salt' },
  { id: 11, name: 'Coffee Crunch', emoji: '☕', color: 'from-yellow-800 to-amber-700', description: 'Espresso with coffee bean crunch' },
  { id: 12, name: 'Rainbow Sherbet', emoji: '🌈', color: 'from-pink-200 via-yellow-200 to-blue-200', description: 'Colorful fruit sherbet mix' }
];

const FlavorSelector: React.FC<FlavorSelectorProps> = ({ selectedFlavors, setSelectedFlavors }) => {
  const handleFlavorClick = (flavor: Flavor) => {
    const isSelected = selectedFlavors.some(f => f.id === flavor.id);
    
    if (isSelected) {
      // Remove flavor if already selected
      setSelectedFlavors(selectedFlavors.filter(f => f.id !== flavor.id));
    } else if (selectedFlavors.length < 3) {
      // Add flavor if under the limit
      setSelectedFlavors([...selectedFlavors, flavor]);
    }
  };

  return (
    <div className="gelato-card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">
          🍦 Choose Your Flavors
        </h2>
        <div className="text-sm text-gray-600 bg-gradient-to-r from-pink-100 to-orange-100 px-4 py-2 rounded-full">
          {selectedFlavors.length}/3 Selected
        </div>
      </div>
      
      <div className="flavor-grid">
        {availableFlavors.map((flavor) => {
          const isSelected = selectedFlavors.some(f => f.id === flavor.id);
          const isDisabled = selectedFlavors.length >= 3 && !isSelected;
          
          return (
            <div
              key={flavor.id}
              className={`flavor-card p-4 ${isSelected ? 'selected' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onClick={() => !isDisabled && handleFlavorClick(flavor)}
            >
              <div className={`bg-gradient-to-br ${flavor.color} rounded-lg p-4 mb-3 text-center`}>
                <div className="text-3xl mb-2">{flavor.emoji}</div>
                <div className="text-lg font-semibold text-gray-800">{flavor.name}</div>
              </div>
              <p className="text-xs text-gray-600 text-center leading-tight">{flavor.description}</p>
              {isSelected && (
                <div className="text-center mt-2">
                  <span className="inline-block bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                    ✓ Selected
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {selectedFlavors.length >= 3 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg text-center">
          <p className="text-orange-700 font-medium">🎯 Perfect! You've selected the maximum 3 flavors.</p>
        </div>
      )}
    </div>
  );
};

export default FlavorSelector;
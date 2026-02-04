import React from 'react';

interface ContainerSelectorProps {
  selectedContainer: 'cone' | 'cup';
  setSelectedContainer: (container: 'cone' | 'cup') => void;
}

const ContainerSelector: React.FC<ContainerSelectorProps> = ({ selectedContainer, setSelectedContainer }) => {
    const containers = [
        { type: 'cone' as const, name: 'Waffle Cone', emoji: '🍦', price: 2.50, description: 'Crispy waffle cone, perfect for on-the-go' },
        { type: 'cup' as const, name: 'Bowl Cup', emoji: '🍨', price: 3.00, description: 'Classic bowl, great for extra toppings' }
    ];

    return (
        <div className="gelato-card">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                🏺 Choose Your Container
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {containers.map((container) => (
                    <div
                        key={container.type}
                        className={`selection-card p-6 text-center cursor-pointer ${
                            selectedContainer === container.type ? 'selected' : ''
                        }`}
                        onClick={() => setSelectedContainer(container.type)}
                    >
                        <div className="text-6xl mb-4">{container.emoji}</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{container.name}</h3>
                        <p className="text-gray-600 text-sm mb-3">{container.description}</p>
                        <div className="text-lg font-bold text-green-600">${container.price.toFixed(2)}</div>
                        {selectedContainer === container.type && (
                            <div className="mt-3 text-pink-500 font-medium">✓ Selected</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ContainerSelector;
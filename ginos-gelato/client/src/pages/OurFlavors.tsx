import React from 'react';

const flavorFamilies = [
    {
        title: 'Classics',
        items: ['Vanilla Bean', 'Chocolate Fondente', 'Stracciatella', 'Pistachio'],
        color: 'from-yellow-100 to-yellow-50',
    },
    {
        title: 'Fruit Sorbetto',
        items: ['Strawberry Bliss', 'Lemon Zest', 'Mango Tango', 'Raspberry Rose'],
        color: 'from-pink-100 to-pink-50',
    },
    {
        title: 'Chef Specials',
        items: ['Salted Caramel Crunch', 'Tiramisu Swirl', 'Hazelnut Praline', 'Espresso Chip'],
        color: 'from-purple-100 to-purple-50',
    },
];

const OurFlavors: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-yellow-50 px-6 py-12">
            <div className="container mx-auto max-w-5xl">
                <div className="gelato-card bg-white/90 mb-8">
                    <h1 className="text-4xl md:text-5xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-pink-400 to-yellow-400 mb-4">
                        Our Flavors
                    </h1>
                    <p className="text-gray-700 text-lg">
                        Explore our rotating selection of gelato and sorbetto. Fresh batches are crafted daily, so
                        availability may vary by location.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {flavorFamilies.map((family) => (
                        <div key={family.title} className={`gelato-card bg-gradient-to-br ${family.color}`}>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">{family.title}</h2>
                            <ul className="space-y-2 text-gray-700">
                                {family.items.map((item) => (
                                    <li key={item} className="flex items-center gap-2">
                                        <span>🍨</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="gelato-card mt-8 bg-gradient-to-r from-green-50 to-teal-50">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">Seasonal Drops</h3>
                    <p className="text-gray-700">
                        Look for limited-time flavors like Blood Orange, Honey Lavender, and Spiced Fig each season.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OurFlavors;

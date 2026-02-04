import React from 'react';

const locations = [
    {
        name: 'Downtown Gelato Bar',
        address: '123 Gelato Street, Sweet City, SC 12345',
        hours: 'Daily: 10AM - 10PM',
    },
    {
        name: 'Riverside Scoop Shop',
        address: '88 Riverwalk Ave, Sweet City, SC 12345',
        hours: 'Mon-Sat: 11AM - 9PM',
    },
    {
        name: 'Uptown Market Stand',
        address: '400 Market Plaza, Sweet City, SC 12345',
        hours: 'Fri-Sun: 12PM - 8PM',
    },
];

const Locations: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-blue-50 px-6 py-12">
            <div className="container mx-auto max-w-4xl">
                <div className="gelato-card bg-white/90 mb-8">
                    <h1 className="text-4xl md:text-5xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400 mb-4">
                        Locations
                    </h1>
                    <p className="text-gray-700 text-lg">
                        Find a scoop near you. Each shop offers rotating flavors, seasonal specials, and cozy seating.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {locations.map((location) => (
                        <div key={location.name} className="gelato-card bg-gradient-to-br from-white to-pink-50">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">{location.name}</h2>
                            <p className="text-gray-600">📍 {location.address}</p>
                            <p className="text-gray-600">🕒 {location.hours}</p>
                        </div>
                    ))}
                </div>

                <div className="gelato-card mt-8 bg-gradient-to-r from-orange-50 to-yellow-50">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-3">Planning a Visit?</h3>
                    <p className="text-gray-700">
                        Call ahead for flavor availability or to reserve seating for groups.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Locations;

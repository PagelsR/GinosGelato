import React from 'react';

const packages = [
    {
        title: 'Gelato Social',
        description: 'Perfect for small gatherings (10-20 guests). Includes 3 flavors and toppings bar.',
        icon: '🎉',
    },
    {
        title: 'Office Celebration',
        description: 'Ideal for teams (25-50 guests). Includes 5 flavors, cones, cups, and toppings.',
        icon: '🏢',
    },
    {
        title: 'Wedding & Events',
        description: 'Custom flavors, curated menu, and on-site scoop service for up to 150 guests.',
        icon: '💍',
    },
];

const Catering: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6 py-12 transition-colors duration-300">
            <div className="container mx-auto max-w-5xl">
                <div className="gelato-card bg-white/90 dark:bg-gray-800/90 mb-8">
                    <h1 className="text-4xl md:text-5xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-400 mb-4">
                        Catering
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                        Bring the gelato bar to your next event. Our catering team makes every celebration sweeter.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {packages.map((pkg) => (
                        <div key={pkg.title} className="gelato-card bg-gradient-to-br from-white to-purple-50 dark:from-gray-700 dark:to-gray-800 text-center">
                            <div className="text-4xl mb-3">{pkg.icon}</div>
                            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{pkg.title}</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">{pkg.description}</p>
                        </div>
                    ))}
                </div>

                <div className="gelato-card mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-gray-800">
                    <h3 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-3">Request a Quote</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                        Email us with your date, guest count, and flavor ideas. We&apos;ll craft a custom proposal.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Catering;

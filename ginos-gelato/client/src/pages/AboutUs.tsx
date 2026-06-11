import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-6 py-12">
            <div className="container mx-auto max-w-4xl">
                <div className="gelato-card bg-white/90 dark:bg-gray-800/90">
                    <h1 className="text-4xl md:text-5xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 mb-6">
                        About Gino&apos;s Gelato
                    </h1>
                    <p className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed mb-6">
                        Founded in 1952, Gino&apos;s Gelato began as a tiny family kitchen in Naples. Our mission has always
                        been simple: craft joyful, authentic gelato using traditional Italian techniques and the finest
                        ingredients we can find.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="gelato-card bg-gradient-to-br from-pink-100 to-pink-50 dark:from-pink-900/40 dark:to-pink-800/20 text-center">
                            <div className="text-4xl mb-3">🍓</div>
                            <h3 className="font-semibold text-pink-700 dark:text-pink-300 mb-2">Fresh Ingredients</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">Seasonal fruits, local dairy, and small-batch care.</p>
                        </div>
                        <div className="gelato-card bg-gradient-to-br from-yellow-100 to-yellow-50 dark:from-yellow-900/40 dark:to-yellow-800/20 text-center">
                            <div className="text-4xl mb-3">🏺</div>
                            <h3 className="font-semibold text-yellow-700 dark:text-yellow-300 mb-2">Italian Tradition</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">Slow-churned gelato for a silky, dense texture.</p>
                        </div>
                        <div className="gelato-card bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-800/20 text-center">
                            <div className="text-4xl mb-3">💛</div>
                            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Community First</h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">Serving smiles at every scoop, every day.</p>
                        </div>
                    </div>
                </div>

                <div className="gelato-card mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-4">Our Promise</h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        Whether you&apos;re celebrating a milestone or simply treating yourself, we promise to deliver a
                        memorable experience with every flavor and every visit.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;

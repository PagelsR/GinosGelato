import React from 'react';

const AboutUs: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-orange-50 to-yellow-50 px-6 py-12">
            <div className="container mx-auto max-w-4xl">
                <div className="gelato-card bg-white/90">
                    <h1 className="text-4xl md:text-5xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 mb-6">
                        About Gino&apos;s Gelato
                    </h1>
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">
                        Founded in 1952, Gino&apos;s Gelato began as a tiny family kitchen in Naples. Our mission has always
                        been simple: craft joyful, authentic gelato using traditional Italian techniques and the finest
                        ingredients we can find.
                    </p>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="gelato-card bg-gradient-to-br from-pink-100 to-pink-50 text-center">
                            <div className="text-4xl mb-3">🍓</div>
                            <h3 className="font-semibold text-pink-700 mb-2">Fresh Ingredients</h3>
                            <p className="text-gray-600 text-sm">Seasonal fruits, local dairy, and small-batch care.</p>
                        </div>
                        <div className="gelato-card bg-gradient-to-br from-yellow-100 to-yellow-50 text-center">
                            <div className="text-4xl mb-3">🏺</div>
                            <h3 className="font-semibold text-yellow-700 mb-2">Italian Tradition</h3>
                            <p className="text-gray-600 text-sm">Slow-churned gelato for a silky, dense texture.</p>
                        </div>
                        <div className="gelato-card bg-gradient-to-br from-blue-100 to-blue-50 text-center">
                            <div className="text-4xl mb-3">💛</div>
                            <h3 className="font-semibold text-blue-700 mb-2">Community First</h3>
                            <p className="text-gray-600 text-sm">Serving smiles at every scoop, every day.</p>
                        </div>
                    </div>
                </div>

                <div className="gelato-card mt-8 bg-gradient-to-r from-purple-50 to-pink-50">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Our Promise</h2>
                    <p className="text-gray-700 leading-relaxed">
                        Whether you&apos;re celebrating a milestone or simply treating yourself, we promise to deliver a
                        memorable experience with every flavor and every visit.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;

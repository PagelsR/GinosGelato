import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';

const Home: React.FC = () => {
    const navigate = useNavigate();

    const handleStartBuilding = () => {
        navigate('/builder');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50 relative overflow-hidden">
            {/* Floating Background Elements */}
            <div className="absolute top-20 left-10 text-pink-200 text-8xl animate-float opacity-30">🍦</div>
            <div className="absolute top-40 right-16 text-blue-200 text-6xl animate-bounce-slow opacity-30">🍨</div>
            <div className="absolute bottom-32 left-20 text-yellow-200 text-7xl animate-float opacity-30">🧁</div>
            <div className="absolute bottom-20 right-10 text-orange-200 text-5xl animate-bounce opacity-30">🍓</div>
            <div className="absolute top-60 left-1/3 text-purple-200 text-4xl animate-float opacity-30">🫐</div>
            
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Main Hero Section */}
                    <div className="gelato-card mb-8 bg-gradient-to-br from-white via-pink-50 to-orange-50">
                        <h1 className="text-4xl md:text-7xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 mb-6 animate-pulse">
                            🍦 Gino's Gelato! 🍨
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                            Create your perfect ice cream masterpiece with our premium flavors, 
                            delicious toppings, and artisanal containers. Every scoop is a celebration!
                        </p>
                        <Button 
                            onClick={handleStartBuilding}
                            className="gelato-button-primary text-xl px-12 py-4 mb-6"
                        >
                            🎨 Start Creating Your Ice Cream
                        </Button>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="gelato-card text-center bg-gradient-to-br from-pink-100 to-pink-50">
                            <div className="text-4xl mb-4">🏆</div>
                            <h3 className="text-xl font-semibold text-pink-700 mb-2">Premium Quality</h3>
                            <p className="text-gray-600">Made with the finest ingredients and traditional Italian recipes</p>
                        </div>
                        <div className="gelato-card text-center bg-gradient-to-br from-blue-100 to-blue-50">
                            <div className="text-4xl mb-4">🎨</div>
                            <h3 className="text-xl font-semibold text-blue-700 mb-2">Custom Creations</h3>
                            <p className="text-gray-600">Mix and match flavors, toppings, and containers to create your perfect treat</p>
                        </div>
                        <div className="gelato-card text-center bg-gradient-to-br from-yellow-100 to-yellow-50">
                            <div className="text-4xl mb-4">🚀</div>
                            <h3 className="text-xl font-semibold text-yellow-700 mb-2">Fresh Daily</h3>
                            <p className="text-gray-600">Made fresh every day with love and passion for authentic gelato</p>
                        </div>
                    </div>

                    {/* Popular Flavors Preview */}
                    <div className="gelato-card bg-gradient-to-r from-purple-50 to-pink-50">
                        <h2 className="text-3xl font-semibold text-gray-800 mb-6">🌟 Today's Featured Flavors</h2>
                        <div className="flex justify-center gap-4 flex-wrap">
                            <span className="bg-gradient-to-r from-pink-400 to-red-400 text-white px-4 py-2 rounded-full font-medium shadow-lg">🍓 Strawberry Bliss</span>
                            <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-medium shadow-lg">🍋 Lemon Zest</span>
                            <span className="bg-gradient-to-r from-purple-400 to-blue-400 text-white px-4 py-2 rounded-full font-medium shadow-lg">🫐 Berry Burst</span>
                            <span className="bg-gradient-to-r from-green-400 to-teal-400 text-white px-4 py-2 rounded-full font-medium shadow-lg">🥝 Mint Chocolate</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useTheme } from '../../contexts/ThemeContext';

const Header: React.FC = () => {
    const { getTotalItems } = useCart();
    const { isDarkMode, toggleDarkMode } = useTheme();
    return (
        <header className="bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-xl relative overflow-hidden transition-colors duration-300">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="absolute top-2 left-10 text-white/20 text-4xl animate-bounce-slow">🍦</div>
            <div className="absolute top-4 right-20 text-white/20 text-3xl animate-float">🍨</div>
            <div className="absolute bottom-2 right-40 text-white/20 text-2xl animate-bounce">🧁</div>
            
            <div className="relative z-10 container mx-auto px-6 py-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-fredoka text-white drop-shadow-lg">
                        <Link to="/" className="hover:text-yellow-100 transition-colors duration-300 flex items-center gap-2">
                            🍦 Gino's Gelato
                        </Link>
                    </h1>
                    <nav>
                        <ul className="flex items-center space-x-8">
                            <li>
                                <Link 
                                    to="/" 
                                    className="text-white font-medium hover:text-yellow-100 transition-all duration-300 hover:scale-110 relative group"
                                >
                                    Home
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-200 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/builder" 
                                    className="text-white font-medium hover:text-yellow-100 transition-all duration-300 hover:scale-110 relative group"
                                >
                                    🎨 Build Ice Cream
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-200 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    to="/cart" 
                                    className="text-white font-medium hover:text-yellow-100 transition-all duration-300 hover:scale-110 relative group flex items-center gap-1"
                                >
                                    🛒 Cart
                                    {getTotalItems() > 0 && (
                                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 ml-1 animate-pulse">
                                            {getTotalItems()}
                                        </span>
                                    )}
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-200 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={toggleDarkMode}
                                    aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                                    title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                                    className="relative flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white rounded-full px-3 py-1.5 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50"
                                >
                                    <span className="text-base leading-none" aria-hidden="true">
                                        {isDarkMode ? '☀️' : '🌙'}
                                    </span>
                                    <span className="text-sm font-medium hidden sm:inline">
                                        {isDarkMode ? 'Light' : 'Dark'}
                                    </span>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
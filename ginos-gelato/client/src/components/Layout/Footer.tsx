import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white py-8 mt-12">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <h3 className="text-2xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400 mb-3">
                            🍦 Gino's Gelato
                        </h3>
                        <p className="text-gray-300 leading-relaxed">
                            Crafting authentic Italian gelato with the finest ingredients since 1952. 
                            Every scoop is a journey to Italy!
                        </p>
                        <div className="flex gap-4 mt-4">
                            <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📧</span>
                            <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">📞</span>
                            <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">🌍</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-lg mb-3 text-yellow-300">Quick Links</h4>
                        <ul className="space-y-2 text-gray-300">
                            <li><a href="/about" className="hover:text-pink-300 transition-colors">About Us</a></li>
                            <li><a href="/menu" className="hover:text-pink-300 transition-colors">Our Flavors</a></li>
                            <li><a href="/locations" className="hover:text-pink-300 transition-colors">Locations</a></li>
                            <li><a href="/catering" className="hover:text-pink-300 transition-colors">Catering</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold text-lg mb-3 text-yellow-300">Contact</h4>
                        <div className="space-y-2 text-gray-300 text-sm">
                            <p>📍 123 Gelato Street</p>
                            <p>🌟 Sweet City, SC 12345</p>
                            <p>📞 (555) 123-GELATO</p>
                            <p>🕒 Daily: 10AM - 10PM</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-400 text-sm">
                        &copy; {new Date().getFullYear()} Gino's Gelato. All rights reserved. Made with ❤️ and lots of ice cream!
                    </p>
                    <div className="flex gap-6 mt-4 md:mt-0 text-sm">
                        <a href="/privacy" className="text-gray-400 hover:text-pink-300 transition-colors">Privacy Policy</a>
                        <a href="/terms" className="text-gray-400 hover:text-pink-300 transition-colors">Terms of Service</a>
                        <a href="/nutrition" className="text-gray-400 hover:text-pink-300 transition-colors">Nutrition Info</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
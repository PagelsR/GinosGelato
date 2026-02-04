import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/UI/Button';

interface CustomerInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
}

interface DeliveryInfo {
    type: 'pickup' | 'delivery';
    address: string;
    city: string;
    zipCode: string;
    specialInstructions: string;
}

interface PaymentInfo {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    nameOnCard: string;
}

const Checkout: React.FC = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    
    const [currentStep, setCurrentStep] = useState(1);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState('');
    
    const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    });
    
    const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
        type: 'pickup',
        address: '',
        city: '',
        zipCode: '',
        specialInstructions: ''
    });
    
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        nameOnCard: ''
    });

    const subtotal = getCartTotal();
    const tax = subtotal * 0.085;
    const deliveryFee = deliveryInfo.type === 'delivery' ? 4.99 : 0;
    const total = subtotal + tax + deliveryFee;

    const handleProcessOrder = async () => {
        setIsProcessing(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Generate fake order number
        const orderNum = 'GG' + Date.now().toString().slice(-6);
        setOrderNumber(orderNum);
        setOrderComplete(true);
        clearCart();
        setIsProcessing(false);
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full text-white font-semibold ${
                        currentStep >= step ? 'bg-gradient-to-r from-pink-500 to-orange-400' : 'bg-gray-300'
                    }`}>
                        {step}
                    </div>
                    {step < 3 && (
                        <div className={`w-16 h-1 mx-2 ${
                            currentStep > step ? 'bg-gradient-to-r from-pink-500 to-orange-400' : 'bg-gray-300'
                        }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );

    const renderCustomerInfoStep = () => (
        <div className="gelato-card">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">👤 Customer Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                        type="text"
                        value={customerInfo.firstName}
                        onChange={(e) => setCustomerInfo({...customerInfo, firstName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Enter your first name"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                        type="text"
                        value={customerInfo.lastName}
                        onChange={(e) => setCustomerInfo({...customerInfo, lastName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="Enter your last name"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="your@email.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                        type="tel"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                        placeholder="(555) 123-4567"
                        required
                    />
                </div>
            </div>
            <div className="flex justify-end mt-6">
                <Button 
                    onClick={() => setCurrentStep(2)}
                    disabled={!customerInfo.firstName || !customerInfo.lastName || !customerInfo.email || !customerInfo.phone}
                >
                    Continue to Delivery →
                </Button>
            </div>
        </div>
    );

    const renderDeliveryStep = () => (
        <div className="gelato-card">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">🚚 Delivery Information</h2>
            
            {/* Delivery Type Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Delivery Method</label>
                <div className="grid grid-cols-2 gap-4">
                    <div 
                        className={`selection-card p-4 text-center cursor-pointer ${deliveryInfo.type === 'pickup' ? 'selected' : ''}`}
                        onClick={() => setDeliveryInfo({...deliveryInfo, type: 'pickup'})}
                    >
                        <div className="text-3xl mb-2">🏪</div>
                        <h3 className="font-semibold">Store Pickup</h3>
                        <p className="text-sm text-gray-600">Ready in 15 minutes</p>
                        <p className="text-green-600 font-medium">FREE</p>
                    </div>
                    <div 
                        className={`selection-card p-4 text-center cursor-pointer ${deliveryInfo.type === 'delivery' ? 'selected' : ''}`}
                        onClick={() => setDeliveryInfo({...deliveryInfo, type: 'delivery'})}
                    >
                        <div className="text-3xl mb-2">🚚</div>
                        <h3 className="font-semibold">Home Delivery</h3>
                        <p className="text-sm text-gray-600">30-45 minutes</p>
                        <p className="text-orange-600 font-medium">$4.99</p>
                    </div>
                </div>
            </div>

            {/* Address Fields (only show for delivery) */}
            {deliveryInfo.type === 'delivery' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                        <input
                            type="text"
                            value={deliveryInfo.address}
                            onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="123 Main Street"
                            required
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                            <input
                                type="text"
                                value={deliveryInfo.city}
                                onChange={(e) => setDeliveryInfo({...deliveryInfo, city: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="Your city"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                            <input
                                type="text"
                                value={deliveryInfo.zipCode}
                                onChange={(e) => setDeliveryInfo({...deliveryInfo, zipCode: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="12345"
                                required
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Special Instructions */}
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Special Instructions</label>
                <textarea
                    value={deliveryInfo.specialInstructions}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, specialInstructions: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows={3}
                    placeholder="Any special requests or delivery instructions..."
                />
            </div>

            <div className="flex justify-between mt-6">
                <Button variant="secondary" onClick={() => setCurrentStep(1)}>
                    ← Back
                </Button>
                <Button 
                    onClick={() => setCurrentStep(3)}
                    disabled={deliveryInfo.type === 'delivery' && (!deliveryInfo.address || !deliveryInfo.city || !deliveryInfo.zipCode)}
                >
                    Continue to Payment →
                </Button>
            </div>
        </div>
    );

    const renderPaymentStep = () => (
        <div className="grid lg:grid-cols-3 gap-8">
            {/* Payment Form */}
            <div className="lg:col-span-2">
                <div className="gelato-card">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">💳 Payment Information</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name on Card *</label>
                            <input
                                type="text"
                                value={paymentInfo.nameOnCard}
                                onChange={(e) => setPaymentInfo({...paymentInfo, nameOnCard: e.target.value})}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="John Doe"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Card Number *</label>
                            <input
                                type="text"
                                value={paymentInfo.cardNumber}
                                onChange={(e) => {
                                    // Format card number with spaces
                                    const formatted = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                                    if (formatted.length <= 19) {
                                        setPaymentInfo({...paymentInfo, cardNumber: formatted});
                                    }
                                }}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                placeholder="1234 5678 9012 3456"
                                maxLength={19}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date *</label>
                                <input
                                    type="text"
                                    value={paymentInfo.expiryDate}
                                    onChange={(e) => {
                                        // Format MM/YY
                                        const formatted = e.target.value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
                                        if (formatted.length <= 5) {
                                            setPaymentInfo({...paymentInfo, expiryDate: formatted});
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="MM/YY"
                                    maxLength={5}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                                <input
                                    type="text"
                                    value={paymentInfo.cvv}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 3) {
                                            setPaymentInfo({...paymentInfo, cvv: value});
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="123"
                                    maxLength={3}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between mt-8">
                        <Button variant="secondary" onClick={() => setCurrentStep(2)}>
                            ← Back
                        </Button>
                        <Button 
                            onClick={handleProcessOrder}
                            disabled={!paymentInfo.nameOnCard || !paymentInfo.cardNumber || !paymentInfo.expiryDate || !paymentInfo.cvv || isProcessing}
                            className={isProcessing ? 'animate-pulse' : ''}
                        >
                            {isProcessing ? '🍦 Processing Order...' : `💳 Complete Order ($${total.toFixed(2)})`}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Order Summary */}
            <div>
                <div className="gelato-card bg-gradient-to-br from-white to-green-50 sticky top-6">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">📋 Order Summary</h3>
                    
                    {/* Items */}
                    <div className="space-y-3 mb-4">
                        {cartItems.map((item, index) => (
                            <div key={index} className="text-sm border-b border-gray-200 pb-2">
                                <div className="flex justify-between font-medium">
                                    <span>{item.container === 'cone' ? '🍦' : '🍨'} {item.container === 'cone' ? 'Cone' : 'Cup'}</span>
                                    <span>${((item.container === 'cone' ? 2.50 : 3.00) + item.flavors.length * 2.00 + item.toppings.reduce((sum, t) => sum + (t.price || 0.50), 0)).toFixed(2)}</span>
                                </div>
                                <div className="text-gray-600 text-xs">
                                    {item.flavors.map(f => f.name).join(', ')}
                                    {item.toppings.length > 0 && ` + ${item.toppings.map(t => t.name).join(', ')}`}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Totals */}
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax (8.5%):</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        {deliveryFee > 0 && (
                            <div className="flex justify-between">
                                <span>Delivery:</span>
                                <span>${deliveryFee.toFixed(2)}</span>
                            </div>
                        )}
                        <hr className="border-gray-300" />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span className="text-green-600">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderOrderComplete = () => (
        <div className="text-center">
            <div className="gelato-card max-w-md mx-auto bg-gradient-to-br from-green-50 to-blue-50">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-3xl font-bold text-green-600 mb-4">Order Confirmed!</h2>
                <div className="bg-white rounded-lg p-4 mb-6">
                    <p className="text-lg font-semibold text-gray-800">Order #{orderNumber}</p>
                    <p className="text-gray-600">Total: ${total.toFixed(2)}</p>
                </div>
                <p className="text-gray-700 mb-6">
                    Thank you for your order! We're preparing your delicious ice cream now. 
                    {deliveryInfo.type === 'pickup' ? 
                        ' Your order will be ready for pickup in 15 minutes.' : 
                        ' Your order will be delivered in 30-45 minutes.'
                    }
                </p>
                <div className="space-y-3">
                    <Button variant="primary" onClick={() => navigate('/')}>
                        🍦 Order More Ice Cream
                    </Button>
                    <Button variant="secondary" onClick={() => navigate('/')} className="w-full">
                        🏠 Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );

    if (cartItems.length === 0 && !orderComplete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50 relative overflow-hidden">
                <div className="gelato-container relative z-10">
                    <div className="gelato-card text-center bg-gradient-to-br from-white to-blue-50 max-w-md mx-auto mt-20">
                        <div className="text-6xl mb-4">🛒</div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your cart is empty!</h2>
                        <p className="text-gray-600 mb-6">Add some delicious ice cream to your cart before checking out.</p>
                        <Button variant="primary" onClick={() => navigate('/builder')}>
                            🎨 Build Your Ice Cream
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-yellow-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-20 right-20 text-pink-200 text-6xl animate-float opacity-20">💳</div>
            <div className="absolute bottom-32 left-20 text-blue-200 text-5xl animate-bounce-slow opacity-20">🍦</div>

            <div className="gelato-container relative z-10">
                {!orderComplete ? (
                    <>
                        <div className="text-center mb-8">
                            <h1 className="text-5xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-400 mb-4">
                                💳 Secure Checkout
                            </h1>
                            <p className="text-xl text-gray-600">
                                Complete your ice cream order safely and securely
                            </p>
                        </div>

                        {renderStepIndicator()}

                        {currentStep === 1 && renderCustomerInfoStep()}
                        {currentStep === 2 && renderDeliveryStep()}
                        {currentStep === 3 && renderPaymentStep()}
                    </>
                ) : (
                    renderOrderComplete()
                )}
            </div>
        </div>
    );
};

export default Checkout;
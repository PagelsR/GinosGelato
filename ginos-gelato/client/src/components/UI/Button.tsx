import React from 'react';

interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    className?: string;
    variant?: 'primary' | 'secondary' | 'accent';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
    onClick, 
    children, 
    className = '', 
    variant = 'primary',
    size = 'md',
    disabled = false
}) => {
    const baseStyles = "font-semibold rounded-full transition-all duration-300 transform border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
    
    const variants = {
        primary: "gelato-button-primary shadow-lg hover:shadow-xl hover:scale-105",
        secondary: "gelato-button-secondary shadow-md hover:shadow-lg hover:scale-105", 
        accent: "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:scale-105"
    };
    
    const sizes = {
        sm: "py-2 px-4 text-sm",
        md: "py-3 px-6 text-base",
        lg: "py-4 px-8 text-lg"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
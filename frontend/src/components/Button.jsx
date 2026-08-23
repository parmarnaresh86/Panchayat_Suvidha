
import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '', disabled = false }) => {
    return (
        <button
            className={`bg-primary-500 hover:bg-primary-600 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
            type={type}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default Button;

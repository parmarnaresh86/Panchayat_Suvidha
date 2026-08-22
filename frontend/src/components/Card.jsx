
import React from 'react';

const Card = ({ children, className }) => {
    return (
        <div className={`bg-white shadow-lg rounded-2xl p-6 ${className}`}>
            {children}
        </div>
    );
};

export default Card;

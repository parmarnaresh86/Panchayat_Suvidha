
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// eslint-disable-next-line no-unused-vars
const ServiceCard = ({ id, icon: IconComponent, title, items, guTitle, cardTo }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        if (cardTo) navigate(cardTo);
    };

    return (
        <div
            id={id}
            className={`bg-white rounded-2xl shadow-sm p-5 hover:shadow-2xl hover:ring-2 hover:ring-blue-300 hover:-translate-y-1 transition-all duration-500 ease-out border border-slate-200 flex flex-col h-full min-h-72 group ${cardTo ? 'cursor-pointer' : ''}`}
            onClick={handleCardClick}
            role={cardTo ? 'button' : undefined}
            tabIndex={cardTo ? 0 : -1}
            onKeyDown={(e) => {
                if (!cardTo) return;
                if (e.target !== e.currentTarget) return; // avoid triggering when pressing keys inside links
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                }
            }}
        >
            <div className="flex items-center mb-4">
                <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-700 transition-colors duration-300">
                    <IconComponent className="text-2xl text-blue-700 group-hover:text-white transition-colors duration-300" size={24} />
                </div>
            </div>
            <h3 className="text-lg md:text-xl font-extrabold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-3 w-fit">
                {guTitle}
            </p>
            <ul className="space-y-1.5 mt-auto">
                {items.map((item) => (
                    <li key={item.id} className="text-slate-600 text-sm flex items-center">
                        {item.to ? (
                            <Link
                                to={item.to}
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center w-full text-slate-700 hover:text-blue-700 font-medium"
                            >
                                <span className="w-1.5 h-1.5 bg-blue-200 rounded-full mr-2"></span>
                                {item.label}
                            </Link>
                        ) : (
                            <>
                                <span className="w-1.5 h-1.5 bg-blue-200 rounded-full mr-2"></span>
                                {item.label}
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ServiceCard;

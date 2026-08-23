import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneCall, Layers } from 'lucide-react';

const FloatingActionButton = () => {
    const navigate = useNavigate();

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
            <button
                onClick={() => navigate('/contact')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 hover:scale-105 transition-transform duration-300"
                aria-label="Contact Panchayat"
            >
                <PhoneCall className="w-4 h-4" />
                <span className="text-sm font-semibold">Contact</span>
            </button>
            <button
                onClick={() => navigate('/services')}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 hover:scale-105 transition-transform duration-300"
                aria-label="View Services"
            >
                <Layers className="w-4 h-4" />
                <span className="text-sm font-semibold">Services</span>
            </button>
        </div>
    );
};

export default FloatingActionButton;

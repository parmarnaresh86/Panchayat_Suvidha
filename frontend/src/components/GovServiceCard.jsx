import React from 'react';

const GovServiceCard = ({ icon: Icon, title, description, actionText, url, isDownload, children }) => {
    const handleClick = () => {
        if (!url) return;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div
            onClick={handleClick}
            className="bg-white rounded-2xl shadow-md p-5 hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer h-full flex flex-col"
            role={url ? 'button' : 'presentation'}
            aria-label={title}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            <div className="flex items-center gap-3 mb-4">
                {Icon && <Icon className="text-3xl text-primary-500" />}
                <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4 flex-1">{description}</p>
            {children}
            {url && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleClick();
                    }}
                    className="mt-4 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition duration-300"
                >
                    {actionText || (isDownload ? 'Download' : 'Visit')}
                </button>
            )}
        </div>
    );
};

export default GovServiceCard;

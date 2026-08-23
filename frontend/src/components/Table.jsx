
import React from 'react';

const Table = ({ headers, data, renderRow }) => {
    return (
        <div className="overflow-x-auto rounded-lg shadow-md">
            <table className="min-w-full bg-white">
                <thead className="bg-primary-600 text-white">
                    <tr>
                        {headers.map((header, index) => (
                            <th key={index} className="text-left py-3 px-4 uppercase font-semibold text-sm">{header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="text-gray-700">
                    {data.map((item, index) => renderRow(item, index))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;

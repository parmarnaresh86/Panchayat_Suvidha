
import React from 'react';

const Input = React.forwardRef(({ id, name, type, placeholder, defaultValue, onChange, autoComplete }, ref) => {
    return (
        <input
            ref={ref}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500"
            id={id}
            name={name}
            type={type}
            placeholder={placeholder}
            defaultValue={defaultValue}
            onChange={onChange}
            autoComplete={autoComplete}
        />
    );
});

export default Input;

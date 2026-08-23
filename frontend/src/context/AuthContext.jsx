
/* eslint react-refresh/only-export-components: off */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem('role') === 'admin');
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));

    useEffect(() => {
        const sync = () => {
            setIsAdmin(localStorage.getItem('role') === 'admin');
            setIsLoggedIn(!!localStorage.getItem('token'));
        };
        window.addEventListener('storage', sync);
        window.addEventListener('auth-change', sync);
        return () => {
            window.removeEventListener('storage', sync);
            window.removeEventListener('auth-change', sync);
        };
    }, []);

    const refreshAuth = useCallback(() => {
        setIsAdmin(localStorage.getItem('role') === 'admin');
        setIsLoggedIn(!!localStorage.getItem('token'));
    }, []);

    return (
        <AuthContext.Provider value={{ isAdmin, isLoggedIn, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

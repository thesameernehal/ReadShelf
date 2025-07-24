import { Children, createContext, useEffect, useState } from 'react';


// creating the context
export const AuthContext = createContext();

// creating the provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(
        JSON.parse(localStorage.getItem('user')) || null
    );

    // initial load , checking whether user exists in localstorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    // function to log in user and update context + localStorage
    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        setUser(userData);
    };

    // function to log out user and clear context + local storage

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, setUser , login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext

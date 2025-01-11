// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const BASE_API = import.meta.env.VITE_API_URL;

    const [auth, setAuth] = useState({
        isAuthenticated: false,
        user: null,
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            axios.defaults.headers.common['Authorization'] = token;

            const fetchProfile = async () => {
                try {
                    const response = await axios.get(`${BASE_API}/users/profile`);
                    setAuth({
                        isAuthenticated: true,
                        user: response.data,
                    });
                } catch (err) {
                    console.log('Пользователь не аутентифицирован или токен истёк');
                    localStorage.removeItem('authToken');
                    delete axios.defaults.headers.common['Authorization'];
                }
            };

            fetchProfile();
        }
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post(`${BASE_API}/auth/logout`);
            setAuth({
                isAuthenticated: false,
                user: null,
            });
            localStorage.removeItem('authToken');
            delete axios.defaults.headers.common['Authorization'];
        } catch (err) {
            console.error('Ошибка при выходе из системы:', err);
        }
    };

    return (
        <AuthContext.Provider value={{ auth, setAuth, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};

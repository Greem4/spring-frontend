// components/OAuth2RedirectHandler.jsx
import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../AuthContext';

const OAuth2RedirectHandler = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { setAuth } = useContext(AuthContext);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (token) {
            const authToken = `Bearer ${token}`;
            localStorage.setItem('authToken', authToken);
            axios.defaults.headers.common['Authorization'] = authToken;

            let userData = {};
            try {
                const decoded = jwtDecode(token);
                // Распознаём роли ADMIN, HH и USER
                let role = 'USER';
                if (decoded.role) {
                    if (decoded.role.includes('ROLE_ADMIN')) {
                        role = 'ADMIN';
                    } else if (decoded.role.includes('ROLE_HH')) {
                        role = 'HH';
                    }
                }
                userData = {
                    username: decoded.sub,
                    role: role,
                };
            } catch (e) {
                console.error('Ошибка декодирования JWT:', e);
            }

            setAuth({ isAuthenticated: true, user: userData });
            navigate('/medicines');
        } else {
            console.error('Токен не найден в URL.');
        }
    }, [location, navigate, setAuth]);

    return <div>Авторизация...</div>;
};

export default OAuth2RedirectHandler;

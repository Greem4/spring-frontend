import React, { useEffect, useContext } from 'react';
import axios from 'axios';
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

            // Здесь можно декодировать token, получить пользователя и установить состояние
            // Для примера установим фиктивные данные
            const userData = { role: 'USER', username: 'YandexUser' };

            setAuth({ isAuthenticated: true, user: userData });

            // Перенаправление на нужную страницу после авторизации
            navigate('/medicines');
        } else {
            console.error('Token not found in URL.');
        }
    }, [location, navigate, setAuth]);

    return <div>Авторизация...</div>;
};

export default OAuth2RedirectHandler;

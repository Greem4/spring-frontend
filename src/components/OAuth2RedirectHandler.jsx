import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import * as jwtDecode from 'jwt-decode';
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
            // Сохраняем токен и устанавливаем заголовок для axios
            localStorage.setItem('authToken', authToken);
            axios.defaults.headers.common['Authorization'] = authToken;

            // Декодируем JWT для извлечения информации о пользователе и ролях
            let userData = {};
            try {
                const decoded = jwtDecode(token);
                // Предполагается, что в JWT есть поля sub и role
                userData = {
                    username: decoded.sub,
                    // Пример определения роли: если в массиве ролей есть ROLE_ADMIN — считаем пользователя администратором
                    role: decoded.role && decoded.role.includes('ROLE_ADMIN') ? 'ADMIN' : 'USER'
                };
            } catch (e) {
                console.error('Ошибка декодирования JWT:', e);
            }

            // Обновляем контекст аутентификации
            setAuth({ isAuthenticated: true, user: userData });

            // Перенаправляем пользователя на страницу со списком лекарств
            navigate('/medicines');
        } else {
            console.error('Токен не найден в URL.');
        }
    }, [location, navigate, setAuth]);

    return <div>Авторизация...</div>;
};

export default OAuth2RedirectHandler;

// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import MedicinesTable from './components/MedicinesTable';
import axios from 'axios';

function App() {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        user: null,
    });

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            // Установка заголовка Authorization для всех запросов axios
            axios.defaults.headers.common['Authorization'] = token;

            // Запрос профиля пользователя
            const fetchProfile = async () => {
                try {
                    const response = await axios.get('http://localhost:8080/api/users/profile');
                    setAuth({
                        isAuthenticated: true,
                        user: response.data,
                    });
                } catch (err) {
                    console.log('Пользователь не аутентифицирован или токен истёк');
                    // Очистка невалидного токена
                    localStorage.removeItem('authToken');
                    delete axios.defaults.headers.common['Authorization'];
                }
            };

            fetchProfile();
        }
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8080/api/auth/logout');
            // Очистка состояния аутентификации и заголовка
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
        <div>
            <Navbar
                isAuthenticated={auth.isAuthenticated}
                user={auth.user}
                handleLogout={handleLogout}
                setAuth={setAuth}
            />
            <Container maxWidth="lg" sx={{ marginTop: 4 }}>
                <MedicinesTable isAdmin={auth.user?.role === 'ADMIN'} />
            </Container>
        </div>
    );
}

export default App;

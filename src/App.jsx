import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'; // Добавлен React Router
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import MedicinesTable from './components/MedicinesTable';
import AdminMenu from './components/AdminMenu'; // Импорт компонента AdminMenu
import axios from 'axios';

function App() {
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
                    const response = await axios.get('http://localhost:8080/api/users/profile');
                    setAuth({
                        isAuthenticated: true,
                        user: response.data,
                    });
                } catch (err) {
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
        <Router>
            <Navbar
                isAuthenticated={auth.isAuthenticated}
                user={auth.user}
                handleLogout={handleLogout}
                setAuth={setAuth}
            />
            <Container maxWidth="lg" sx={{ marginTop: 4 }}>
                <Routes>
                    {/* Таблица лекарств */}
                    <Route
                        path="/medicines"
                        element={<MedicinesTable isAdmin={auth.user?.role === 'ADMIN'} />}
                    />
                    {/* Страница администратора */}
                    <Route
                        path="/admin"
                        element={
                            auth.user?.role === 'ADMIN' ? (
                                <AdminMenu />
                            ) : (
                                <Navigate to="/medicines" />
                            )
                        }
                    />
                    {/* Редирект на Таблицу лекарств по умолчанию */}
                    <Route path="*" element={<Navigate to="/medicines" />} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;

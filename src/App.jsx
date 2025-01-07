import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import MedicinesTable from './components/MedicinesTable';
import AdminMenu from './components/AdminMenu';
import axios from 'axios';
import { AuthContext } from './AuthContext';

function App() {
    const { auth, setAuth } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await axios.post('http://localhost:8080/api/v1/auth/logout');
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
                    {/* Маршрут доступен для всех, авторизация не требуется */}
                    <Route
                        path="/medicines"
                        element={<MedicinesTable isAdmin={auth.user?.role === 'ADMIN'} />}
                    />
                    {/* Маршрут администратора доступен только для админов */}
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
                    {/* Редирект всех неизвестных маршрутов на страницу лекарств */}
                    <Route path="*" element={<Navigate to="/medicines" />} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;

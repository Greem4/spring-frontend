import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from '@mui/material';
import Navbar from './components/Navbar';
import MedicinesTable from './components/MedicinesTable';
import AdminMenu from './components/AdminMenu';
import UserProfile from './components/UserProfile';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import OAuth2RedirectHandler from "./components/OAuth2RedirectHandler";
import { API_URL } from './config';

function App() {

    const { auth, setAuth } = useContext(AuthContext);

    const handleLogout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`);
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
                    <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
                    <Route
                        path="/medicines"
                        element={<MedicinesTable isAdmin={auth.user?.role === 'ADMIN'} />}
                    />
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
                    <Route
                        path="/profile"
                        element={
                            auth.isAuthenticated ? (
                                <UserProfile />
                            ) : (
                                <Navigate to="/medicines" />
                            )
                        }
                    />
                    <Route path="*" element={<Navigate to="/medicines" />} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;

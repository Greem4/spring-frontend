import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    IconButton,
    Avatar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    InputAdornment,
    FormControl,
    InputLabel,
    OutlinedInput,
    Tooltip
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MedicinesTable from './components/MedicinesTable';
import axios from 'axios';

function App() {
    const [open, setOpen] = useState(false); // Состояние для открытия диалога
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    // Проверка наличия токена в localStorage при загрузке приложения
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            setIsAuthenticated(true);
            setUser(JSON.parse(storedUser));
            // Настройка axios для включения токена в заголовки
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    }, []);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setAuthError(null);
        setUsername('');
        setPassword('');
        setShowPassword(false);
    };

    const handleLogin = async () => {
        if (username.trim() === '' || password.trim() === '') {
            setAuthError('Пожалуйста, заполните все поля');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/auth/login', {
                username,
                password
            });

            console.log('Ответ от бэкенда:', response.data);

            // Предполагается, что ответ содержит user и token
            const { user: userData, token } = response.data;

            setIsAuthenticated(true);
            setUser(userData);

            // Сохранение данных в localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', token);

            // Настройка axios для включения токена в заголовки
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            handleClose();
        } catch (err) {
            console.error('Ошибка при авторизации:', err);
            if (err.response && err.response.status === 401) {
                setAuthError('Неверный логин или пароль');
            } else {
                setAuthError('Произошла ошибка. Пожалуйста, попробуйте позже.');
            }
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <Container maxWidth="lg" sx={{ marginTop: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
                <Typography variant="h4" component="h1">
                    Список Лекарств
                </Typography>
                {isAuthenticated ? (
                    <Box display="flex" alignItems="center">
                        <Typography variant="body1" sx={{ marginRight: 1 }}>
                            Добро пожаловать, {user.username}!
                        </Typography>
                        {user.role === 'ADMIN' && (
                            <Tooltip title="Администратор">
                                <Avatar sx={{ bgcolor: '#d32f2f' }}>A</Avatar>
                            </Tooltip>
                        )}
                        <IconButton onClick={handleLogout} color="inherit" sx={{ ml: 2 }}>
                            <Avatar sx={{ bgcolor: '#1976d2' }}>
                                {user.username.charAt(0).toUpperCase()}
                            </Avatar>
                        </IconButton>
                    </Box>
                ) : (
                    <IconButton onClick={handleClickOpen} color="inherit">
                        <AccountCircleIcon fontSize="large" />
                    </IconButton>
                )}
            </Box>
            <MedicinesTable isAdmin={user?.role === 'ADMIN'} />

            {/* Диалоговое окно для авторизации */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Вход в систему</DialogTitle>
                <DialogContent>
                    {authError && <Alert severity="error" sx={{ mb: 2 }}>{authError}</Alert>}
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Логин"
                        type="text"
                        fullWidth
                        variant="outlined"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <FormControl variant="outlined" fullWidth sx={{ mt: 2 }}>
                        <InputLabel htmlFor="password">Пароль</InputLabel>
                        <OutlinedInput
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            label="Пароль"
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleTogglePasswordVisibility}
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            }
                        />
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Отмена</Button>
                    <Button onClick={handleLogin} variant="contained">Войти</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );

}

export default App;

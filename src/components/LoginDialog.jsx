import React, { useState, useContext } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Alert,
    InputAdornment,
    IconButton,
    FormControl,
    InputLabel,
    OutlinedInput,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import { AuthContext } from '../AuthContext';

const LoginDialog = ({ open, handleClose }) => {
    const { setAuth } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    const handleLogin = async () => {
        if (username.trim() === '' || password.trim() === '') {
            setAuthError('Пожалуйста, заполните все поля');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/login', {
                username,
                password,
            });

            console.log('Ответ от бэкенда:', response.data);

            const { token, type, ...userData } = response.data;
            if (token && type) {
                const authToken = `${type} ${token}`;
                localStorage.setItem('authToken', authToken);
                axios.defaults.headers.common['Authorization'] = authToken;

                setAuth({
                    isAuthenticated: true,
                    user: { ...userData },
                });

                handleClose();
            } else {
                setAuthError('Некорректный ответ от сервера');
            }
        } catch (err) {
            console.error('Ошибка при авторизации:', err);
            if (err.response && err.response.status === 401) {
                setAuthError('Неверный логин или пароль');
            } else {
                setAuthError('Произошла ошибка. Пожалуйста, попробуйте позже.');
            }
        }
    };

    const handleYandexLogin = () => {
        window.location.href = 'http://localhost:8080/oauth2/authorization/yandex';
    };

    return (
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
                    <InputLabel htmlFor="login-password">Пароль</InputLabel>
                    <OutlinedInput
                        id="login-password"
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
            <DialogActions sx={{ justifyContent: 'space-between' }}>
                <Button onClick={handleClose}>Отмена</Button>
                <div>
                    <Button onClick={handleYandexLogin} sx={{ mr: 1 }}>
                        Войти через Яндекс
                    </Button>
                    <Button onClick={handleLogin} variant="contained">
                        Войти
                    </Button>
                </div>
            </DialogActions>
        </Dialog>
    );
};

export default LoginDialog;

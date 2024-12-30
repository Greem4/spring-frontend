// src/components/LoginDialog.jsx
import React, { useState } from 'react';
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

const LoginDialog = ({ open, handleClose, setAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
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
            }, { withCredentials: true });

            console.log('Ответ от бэкенда:', response.data);

            // После успешного логина, получаем профиль пользователя
            const profileResponse = await axios.get('http://localhost:8080/api/users/profile', { withCredentials: true });
            setAuth({
                isAuthenticated: true,
                user: profileResponse.data,
            });

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
            <DialogActions>
                <Button onClick={handleClose}>Отмена</Button>
                <Button onClick={handleLogin} variant="contained">Войти</Button>
            </DialogActions>
        </Dialog>
    );
};

export default LoginDialog;

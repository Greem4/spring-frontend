// src/components/RegisterDialog.jsx
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

const RegisterDialog = ({ open, handleClose, setAuth }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [registerError, setRegisterError] = useState(null);
    const [registerSuccess, setRegisterSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleRegister = async () => {
        if (username.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
            setRegisterError('Пожалуйста, заполните все поля');
            return;
        }

        if (password !== confirmPassword) {
            setRegisterError('Пароли не совпадают');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8080/api/v1/auth/register', {
                username,
                password
            }, { withCredentials: true });

            console.log('Ответ от бэкенда:', response.data);

            setRegisterSuccess('Регистрация прошла успешно! Вы можете войти в систему.');
            setRegisterError(null);
            setUsername('');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('Ошибка при регистрации:', err);
            if (err.response && err.response.status === 400) {
                setRegisterError(err.response.data.message || 'Пользователь уже существует');
            } else {
                setRegisterError('Произошла ошибка. Пожалуйста, попробуйте позже.');
            }
            setRegisterSuccess(null);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Регистрация</DialogTitle>
            <DialogContent>
                {registerError && <Alert severity="error" sx={{ mb: 2 }}>{registerError}</Alert>}
                {registerSuccess && <Alert severity="success" sx={{ mb: 2 }}>{registerSuccess}</Alert>}
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
                    <InputLabel htmlFor="register-password">Пароль</InputLabel>
                    <OutlinedInput
                        id="register-password"
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
                <FormControl variant="outlined" fullWidth sx={{ mt: 2 }}>
                    <InputLabel htmlFor="confirm-password">Подтверждение Пароля</InputLabel>
                    <OutlinedInput
                        id="confirm-password"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        label="Подтверждение Пароля"
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
                <Button onClick={handleRegister} variant="contained">Зарегистрироваться</Button>
            </DialogActions>
        </Dialog>
    );
};

export default RegisterDialog;

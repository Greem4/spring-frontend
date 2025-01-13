// LoginForm.jsx
import React, {useState, useContext} from 'react';
import {
    Box,
    Alert,
    TextField,
    InputAdornment,
    IconButton,
    Button,
    FormControl,
    InputLabel,
    OutlinedInput
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';
import {AuthContext} from '../AuthContext';
import YandexIcon from '../assets/yandex-icon.svg';
import {API_URL} from '../config';
import {YANDEX_AUTH_URL} from '../config';

const LoginForm = ({setAuth, onSuccess}) => {
    const {setAuth: setContextAuth} = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState(null);

    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    const handleLogin = async () => {
        if (username.trim() === '' || password.trim() === '') {
            setAuthError('Пожалуйста, заполните все поля');
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                username,
                password,
            });

            const {token, type} = response.data;
            if (token && type) {
                const authToken = `${type} ${token}`;
                localStorage.setItem('authToken', authToken);
                axios.defaults.headers.common['Authorization'] = authToken;
            } else {
                throw new Error('Токен не получен');
            }

            const profileResponse = await axios.get(`${API_URL}/users/profile`, {
                withCredentials: true,
            });

            setContextAuth({ isAuthenticated: true, user: profileResponse.data });
            setAuth({ isAuthenticated: true, user: profileResponse.data });

            setAuthError(null);
            setUsername('');
            setPassword('');
            onSuccess();
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
        window.location.href = `${YANDEX_AUTH_URL}`;
    };

    return (
        <>
            {authError &&
                <Alert severity="error" sx={{mb: 2}}>{authError}</Alert>}
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
            <FormControl variant="outlined" fullWidth sx={{mt: 2}}>
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
                                {showPassword ? <VisibilityOff/> :
                                    <Visibility/>}
                            </IconButton>
                        </InputAdornment>
                    }
                />
            </FormControl>
            <Box sx={{display: 'flex', justifyContent: 'space-between', mt: 2}}>
                <Button
                    onClick={handleYandexLogin}
                    sx={{
                        backgroundColor: '#0a0a0a',
                        color: '#ebeaea',
                        mr: 1,
                        '&:hover': {
                            backgroundColor: '#080808',
                        },
                    }}
                    startIcon={
                        <img src={YandexIcon} alt="Yandex"
                             style={{width: 35, height: 24}}/>
                    }
                >
                    Войти с Яндекс ID
                </Button>
                <Button onClick={handleLogin} variant="contained">
                    Войти
                </Button>
            </Box>
        </>
    );
};

export default LoginForm;

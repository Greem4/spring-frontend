// LoginForm.jsx
import React, { useState, useContext, useEffect } from 'react';
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
import { AuthContext } from '../AuthContext';
import { API_URL } from '../config';

// Настройка OAuth-параметров
const YA_CLIENT_ID = '0ef7c6fc73b64a7eb51a0b046ebc82fe';
const YA_REDIRECT_URI = 'http://localhost:8080/login/oauth2/code/yandex';
const YA_TOKEN_PAGE_ORIGIN = 'http://localhost:5173';

const loadYandexSDK = () => {
    return new Promise((resolve, reject) => {
        if (window.YaAuthSuggest) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://yastatic.net/s3/passport-sdk/autofill/v1/sdk-suggest-with-polyfills-latest.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Не удалось загрузить Яндекс SDK'));
        document.body.appendChild(script);
    });
};

const LoginForm = ({ setAuth, onSuccess }) => {
    const { setAuth: setContextAuth } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        loadYandexSDK()
            .then(() => {
                window.YaAuthSuggest.init(
                    {
                        client_id: YA_CLIENT_ID,
                        response_type: 'token',
                        redirect_uri: YA_REDIRECT_URI
                    },
                    YA_TOKEN_PAGE_ORIGIN,
                    {
                        view: 'button',
                        parentId: 'yandex-button-container',
                        buttonView: 'main',
                        buttonTheme: 'light',
                        buttonSize: 's',
                        buttonBorderRadius: 20
                    }
                )
                    .then(({ handler }) => handler())
                    .then(data => {
                        console.log('Сообщение с токеном: ', data);
                        const { access_token } = data;

                        if (!access_token) {
                            throw new Error('OAuth-токен от Яндекса не получен');
                        }

                        return axios.post(`${API_URL}/auth/yandex`, { token: access_token });
                    })
                    .then(response => {
                        const data = response.data;

                        // Проверяем, вернул ли сервер код 'in_progress'
                        if (data.code === 'in_progress') {
                            setAuthError('Авторизация в процессе. Пожалуйста, повторите попытку позже.');
                            throw new Error('in_progress');
                        }

                        const { token, type } = data;
                        if (token && type) {
                            const authToken = `${type} ${token}`;
                            localStorage.setItem('authToken', authToken);
                            axios.defaults.headers.common['Authorization'] = authToken;
                        } else {
                            throw new Error('Токен не получен от сервера');
                        }
                        return axios.get(`${API_URL}/users/profile`, { withCredentials: true });
                    })
                    .then(profileResponse => {
                        setContextAuth({ isAuthenticated: true, user: profileResponse.data });
                        setAuth({ isAuthenticated: true, user: profileResponse.data });
                        setAuthError(null);
                        onSuccess();
                    })
                    .catch(error => {
                        // Подавляем логирование ошибки 'in_progress', чтобы не мешала логированию других ошибок
                        if (error.message !== 'in_progress') {
                            console.error('Ошибка при Яндекс авторизации или обмене токена: ', error);
                        }
                    });
            })
            .catch(error => console.error(error));
    }, []);

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

            const { token, type } = response.data;
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

    return (
        <>
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                {/* Контейнер для кнопки Яндекса */}
                <div id="yandex-button-container"></div>
                <Button onClick={handleLogin} variant="contained">
                    Войти
                </Button>
            </Box>
        </>
    );
};

export default LoginForm;

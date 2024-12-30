import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Avatar,
    Box,
    Button,
    Tooltip,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginDialog from './LoginDialog';
import RegisterDialog from './RegisterDialog';
import { Link } from 'react-router-dom'; // Добавлено для маршрутизации

const Navbar = ({ isAuthenticated, user, handleLogout, setAuth }) => {
    const [openLogin, setOpenLogin] = useState(false);
    const [openRegister, setOpenRegister] = useState(false);

    const handleLoginOpen = () => {
        setOpenLogin(true);
    };

    const handleLoginClose = () => {
        setOpenLogin(false);
    };

    const handleRegisterOpen = () => {
        setOpenRegister(true);
    };

    const handleRegisterClose = () => {
        setOpenRegister(false);
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    {/* Название приложения */}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Medicine Manager
                    </Typography>

                    {/* Если пользователь не аутентифицирован, показываем кнопки Вход и Регистрация */}
                    {!isAuthenticated ? (
                        <>
                            <Button color="inherit" onClick={handleLoginOpen}>
                                Вход
                            </Button>
                            <Button color="inherit" onClick={handleRegisterOpen}>
                                Регистрация
                            </Button>
                        </>
                    ) : (
                        /* Если аутентифицирован, показываем информацию о пользователе и кнопку Выход */
                        <Box display="flex" alignItems="center">
                            <Typography variant="body1" sx={{ marginRight: 2 }}>
                                {user.username}
                            </Typography>
                            {/* Показывать вкладку "Администратор", если роль ADMIN */}
                            {user.role === 'ADMIN' && (
                                <Button color="inherit" component={Link} to="/admin">
                                    Администратор
                                </Button>
                            )}
                            <Button color="inherit" onClick={handleLogout}>
                                Выход
                            </Button>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>

            {/* Диалоговое окно для входа */}
            <LoginDialog open={openLogin} handleClose={handleLoginClose} setAuth={setAuth} />

            {/* Диалоговое окно для регистрации */}
            <RegisterDialog open={openRegister} handleClose={handleRegisterClose} setAuth={setAuth} />
        </>
    );
};

export default Navbar;

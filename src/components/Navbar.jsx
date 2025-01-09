import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Box,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LoginDialog from './LoginDialog';
import RegisterDialog from './RegisterDialog';
import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated, user, handleLogout, setAuth }) => {
    const [openLogin, setOpenLogin] = useState(false);
    const [openRegister, setOpenRegister] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);

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

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const onLogout = () => {
        handleLogout();
        handleCloseUserMenu();
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    {/* Название приложения */}
                    <Typography variant="h6" component="div" sx={{ mr: 2 }}>
                        Medicine Manager
                    </Typography>

                    {/* Навигационные ссылки */}
                    <Box sx={{ flexGrow: 1 }}>
                        <Button color="inherit" component={Link} to="/medicines">
                            Лекарства
                        </Button>
                        {/* Добавьте другие ссылки по мере необходимости */}
                    </Box>

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
                        /* Если аутентифицирован, показываем всплывающее меню пользователя */
                        <>
                            <IconButton
                                size="large"
                                edge="end"
                                color="inherit"
                                onClick={handleOpenUserMenu}
                            >
                                <AccountCircleIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorElUser}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem disabled>
                                    <Typography textAlign="center">
                                        {user.username}
                                    </Typography>
                                </MenuItem>
                                {user.role === 'ADMIN' && (
                                    <MenuItem
                                        component={Link}
                                        to="/admin"
                                        onClick={handleCloseUserMenu}
                                    >
                                        Администратор
                                    </MenuItem>
                                )}
                                <MenuItem onClick={onLogout}>
                                    <Typography textAlign="center">Выход</Typography>
                                </MenuItem>
                            </Menu>
                        </>
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

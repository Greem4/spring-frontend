// Navbar.jsx
import React, { useState } from 'react';
import axios from 'axios';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
    Tooltip
} from '@mui/material';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import AuthDialog from './AuthDialog';

const Navbar = ({ isAuthenticated, user, handleLogout, setAuth }) => {
    const [openAuth, setOpenAuth] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleAuthOpen = () => setOpenAuth(true);
    const handleAuthClose = () => setOpenAuth(false);

    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);

    const handleSendEmail = async () => {
        try {
            await axios.post('http://localhost:8080/api/v1/admin/users/notification');
            alert('Письмо успешно отправлено!');
        } catch (err) {
            console.error('Ошибка при отправке письма:', err);
            alert('Ошибка при отправке письма');
        }
    };

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Medicine Manager
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {isAuthenticated && user.role === 'ADMIN' && (
                            <Tooltip title="Отправить email-уведомление">
                                <Button
                                    color="inherit"
                                    startIcon={<MailOutlineIcon />}
                                    onClick={handleSendEmail}
                                    sx={{ textTransform: 'none' }}
                                >
                                    Уведомить
                                </Button>
                            </Tooltip>
                        )}
                        <Button color="inherit" component={Link} to="/medicines">
                            Лекарства
                        </Button>
                    </Box>

                    {!isAuthenticated ? (
                        <Button color="inherit" onClick={handleAuthOpen}>
                            Вход
                        </Button>
                    ) : (
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
                                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem disabled>{user.username}</MenuItem>
                                <MenuItem
                                    component={Link}
                                    to="/profile"
                                    onClick={handleCloseUserMenu}
                                >
                                    Мой профиль
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
                                <MenuItem
                                    onClick={() => {
                                        handleLogout();
                                        handleCloseUserMenu();
                                    }}
                                >
                                    Выход
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Toolbar>
            </AppBar>

            <AuthDialog open={openAuth} handleClose={handleAuthClose} setAuth={setAuth} />
        </>
    );
};

export default Navbar;

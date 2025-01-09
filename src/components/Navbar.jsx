import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
    Menu,
    MenuItem,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Link } from 'react-router-dom';
import LoginDialog from './LoginDialog';
import RegisterDialog from './RegisterDialog';

const Navbar = ({ isAuthenticated, user, handleLogout, setAuth }) => {
    const [openLogin, setOpenLogin] = useState(false);
    const [openRegister, setOpenRegister] = useState(false);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleLoginOpen = () => setOpenLogin(true);
    const handleLoginClose = () => setOpenLogin(false);
    const handleRegisterOpen = () => setOpenRegister(true);
    const handleRegisterClose = () => setOpenRegister(false);

    const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
    const handleCloseUserMenu = () => setAnchorElUser(null);

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Medicine Manager
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button color="inherit" component={Link} to="/medicines">
                            Лекарства
                        </Button>
                    </Box>

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

            <LoginDialog open={openLogin} handleClose={handleLoginClose} setAuth={setAuth} />
            <RegisterDialog open={openRegister} handleClose={handleRegisterClose} setAuth={setAuth} />
        </>
    );
};

export default Navbar;

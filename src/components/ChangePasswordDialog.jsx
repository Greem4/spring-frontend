import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    OutlinedInput,
    InputAdornment,
    IconButton,
    Alert,
    Stack,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import axios from 'axios';

const ChangePasswordDialog = ({ open, handleClose, username }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            setError('Пожалуйста, заполните все поля');
            return;
        }
        if (newPassword !== confirmNewPassword) {
            setError('Новый пароль и подтверждение не совпадают');
            return;
        }
        try {
            await axios.put('http://localhost:8080/api/v1/users/changePassword', {
                username,
                oldPassword,
                newPassword,
                confirmNewPassword
            });
            setSuccess('Пароль успешно изменён');
            setError(null);
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (err) {
            console.error('Ошибка при смене пароля:', err);
            console.error('Ответ сервера:', err.response?.data);
            setError('Не удалось изменить пароль');
            setSuccess(null);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Сменить пароль</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    {success && <Alert severity="success">{success}</Alert>}
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel htmlFor="old-password">Старый пароль</InputLabel>
                        <OutlinedInput
                            id="old-password"
                            type={showPassword ? 'text' : 'password'}
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            label="Старый пароль"
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
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel htmlFor="new-password">Новый пароль</InputLabel>
                        <OutlinedInput
                            id="new-password"
                            type={showPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            label="Новый пароль"
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
                    <FormControl variant="outlined" fullWidth>
                        <InputLabel htmlFor="confirm-new-password">
                            Подтвердите новый пароль
                        </InputLabel>
                        <OutlinedInput
                            id="confirm-new-password"
                            type={showPassword ? 'text' : 'password'}
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            label="Подтвердите новый пароль"
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
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Отмена</Button>
                <Button onClick={handleChangePassword} variant="contained">
                    Сменить пароль
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ChangePasswordDialog;

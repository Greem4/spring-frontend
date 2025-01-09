import React, { useContext, useState } from 'react';
import { Typography, Paper, Box, Chip, Button } from '@mui/material';
import { AuthContext } from '../AuthContext';
import ChangePasswordDialog from './ChangePasswordDialog';

const UserProfile = () => {
    const { auth } = useContext(AuthContext);
    const [openChangePassword, setOpenChangePassword] = useState(false);

    if (!auth.isAuthenticated) {
        return <Typography variant="h6">Пользователь не авторизован</Typography>;
    }

    const { username, role, enabled } = auth.user;

    return (
        <Box sx={{ maxWidth: 600, margin: '0 auto', p: 2 }}>
            <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Мой профиль
                </Typography>
                <Typography variant="body1">
                    <strong>Имя пользователя:</strong> {username}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Роль:</strong>{' '}
                    <Chip label={role} color={role === 'ADMIN' ? 'primary' : 'default'} />
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                    <strong>Статус:</strong>{' '}
                    <Chip
                        label={enabled ? 'Активный' : 'Неактивный'}
                        color={enabled ? 'success' : 'default'}
                    />
                </Typography>
                <Button
                    variant="outlined"
                    sx={{ mt: 3 }}
                    onClick={() => setOpenChangePassword(true)}
                >
                    Сменить пароль
                </Button>
            </Paper>
            <ChangePasswordDialog
                open={openChangePassword}
                handleClose={() => setOpenChangePassword(false)}
                username={username}
            />
        </Box>
    );
};

export default UserProfile;

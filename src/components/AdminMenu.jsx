import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../AuthContext';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Paper,
    CircularProgress,
    Alert,
    Chip,
    Divider,
} from '@mui/material';
import axios from 'axios';
import UserInfoDialog from './UserInfoDialog';

const BASE_API = import.meta.env.VITE_API_URL;

const AdminMenu = () => {
    const { auth } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    if (!auth.isAuthenticated || auth.user.role !== 'ADMIN') {
        return <Alert severity="warning">Доступ запрещён</Alert>;
    }

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${BASE_API}/admin/users`);
                const usersData = response.data._embedded?.userResponseList || [];
                setUsers(usersData);
            } catch (err) {
                console.error('Ошибка при загрузке пользователей:', err);
                setError('Не удалось загрузить пользователей.');
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleOpenUserDialog = (user) => {
        setSelectedUser(user);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setSelectedUser(null);
        setOpenDialog(false);
    };

    const handleDeleteUser = async (id) => {
        try {
            await axios.delete(`${BASE_API}/admin/users/${id}`);
            setUsers((prev) => prev.filter((user) => user.id !== id));
            handleCloseDialog();
        } catch (err) {
            console.error('Ошибка при удалении пользователя:', err);
            setError('Не удалось удалить пользователя.');
        }
    };

    const handleToggleEnabled = async (id) => {
        const user = users.find(u => u.id === id);
        if (!user) return;
        try {
            const action = user.enabled ? 'DISABLE' : 'ENABLE';
            const response = await axios.put(`${BASE_API}/admin/users/${user.username}/${action}`);
            const updatedUser = response.data;
            setUsers(prev => prev.map(u => u.id === id ? updatedUser : u));
            if (selectedUser && selectedUser.id === id) {
                setSelectedUser(updatedUser);
            }
        } catch (err) {
            console.error('Ошибка при изменении статуса пользователя:', err);
            setError('Не удалось изменить статус пользователя.');
        }
    };

    const handleRoleChange = async (id, newRole) => {
        const user = users.find(u => u.id === id);
        if (!user) return;
        try {
            const payload = { username: user.username, role: newRole };
            await axios.put(`${BASE_API}/admin/users/role`, payload);
            setUsers(prev => {
                const updated = prev.map(u => u.id === id ? { ...u, role: newRole } : u);
                if (selectedUser && selectedUser.id === id) {
                    setSelectedUser({ ...selectedUser, role: newRole });
                }
                return updated;
            });
        } catch (err) {
            console.error('Ошибка при изменении роли пользователя:', err);
            setError('Не удалось изменить роль пользователя.');
        }
    };

    if (loading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2, textAlign: 'center' }}>
                Список пользователей
            </Typography>
            <Paper elevation={3} sx={{ maxWidth: 600, margin: '0 auto' }}>
                <List>
                    {users.map((user, index) => (
                        <React.Fragment key={user.id}>
                            <ListItem button onClick={() => handleOpenUserDialog(user)}>
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        {user.username.charAt(0).toUpperCase()}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={user.username}
                                    secondary={
                                        <>
                                            <Chip
                                                label={`Роль: ${user.role}`}
                                                size="small"
                                                sx={{ mr: 1 }}
                                            />
                                            <Chip
                                                label={user.enabled ? 'Включён' : 'Отключён'}
                                                size="small"
                                                color={user.enabled ? 'success' : 'default'}
                                            />
                                        </>
                                    }
                                />
                            </ListItem>
                            {index < users.length - 1 && <Divider variant="inset" component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            </Paper>

            {selectedUser && (
                <UserInfoDialog
                    open={openDialog}
                    user={selectedUser}
                    onClose={handleCloseDialog}
                    onDelete={handleDeleteUser}
                    onToggleEnabled={handleToggleEnabled}
                    onRoleChange={handleRoleChange}
                />
            )}
        </Box>
    );
};

export default AdminMenu;

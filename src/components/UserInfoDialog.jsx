import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    Stack,
    Typography,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
} from '@mui/material';

const UserInfoDialog = ({ open, user, onClose, onDelete, onToggleEnabled, onRoleChange }) => {
    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Информация о пользователе</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Stack spacing={2}>
                        <Typography>
                            <strong>Имя пользователя:</strong> {user.username}
                        </Typography>
                        <Typography>
                            <strong>Роль:</strong>{' '}
                            <Select
                                value={user.role}
                                onChange={(e) => onRoleChange(user.id, e.target.value)}
                                size="small"
                            >
                                <MenuItem value="USER">USER</MenuItem>
                                <MenuItem value="ADMIN">ADMIN</MenuItem>
                            </Select>
                        </Typography>
                        <Typography>
                            <strong>Статус:</strong>{' '}
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={user.enabled}
                                        onChange={() => onToggleEnabled(user.id)}
                                        color="primary"
                                    />
                                }
                                label={user.enabled ? 'Включён' : 'Отключён'}
                            />
                        </Typography>
                    </Stack>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onDelete(user.id)} color="error">
                    Удалить
                </Button>
                <Button onClick={onClose} color="primary">
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserInfoDialog;

// components/UserInfoDialog.jsx
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
                                onChange={onRoleChange ? (e) => onRoleChange(user.id, e.target.value) : undefined}
                                size="small"
                                disabled={!onRoleChange}
                            >
                                <MenuItem value="USER">USER</MenuItem>
                                <MenuItem value="ADMIN">ADMIN</MenuItem>
                                <MenuItem value="HH">HH</MenuItem>
                            </Select>
                        </Typography>
                        <Typography>
                            <strong>Статус:</strong>{' '}
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={user.enabled}
                                        onChange={onToggleEnabled ? () => onToggleEnabled(user.id) : undefined}
                                        color="primary"
                                        disabled={!onToggleEnabled}
                                    />
                                }
                                label={user.enabled ? 'Включён' : 'Отключён'}
                            />
                        </Typography>
                    </Stack>
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                {onDelete && (
                    <Button onClick={() => onDelete(user.id)} color="error">
                        Удалить
                    </Button>
                )}
                <Button onClick={onClose} color="primary">
                    Закрыть
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UserInfoDialog;

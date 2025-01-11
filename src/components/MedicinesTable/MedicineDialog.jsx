// components/MedicinesTable/MedicineDialog.jsx
import React, { memo, useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';

function MedicineDialog({
                            open,
                            onClose,
                            dialogMode,      // "add" или "edit"
                            initialData,     // начальные данные при "редактировании"
                            onSave,          // колбэк для сохранения (create/update)
                            onDelete,        // колбэк для удаления (в режиме edit)
                        }) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        serialNumber: '',
        expirationDate: '',
    });

    // При открытии диалога в режиме "edit" заполняем поля
    useEffect(() => {
        if (open && initialData) {
            setFormData(initialData);
        } else if (open && dialogMode === 'add') {
            // Сбрасываем в пустые поля
            setFormData({
                id: '',
                name: '',
                serialNumber: '',
                expirationDate: '',
            });
        }
    }, [open, dialogMode, initialData]);

    // Обработчик изменения полей
    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    // Нажатие "Сохранить"
    const handleSubmit = useCallback(() => {
        onSave(formData);
    }, [onSave, formData]);

    // Нажатие "Удалить" (только в режиме edit)
    const handleDelete = useCallback(() => {
        if (onDelete) {
            onDelete(formData.id);
        }
    }, [onDelete, formData.id]);

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {dialogMode === 'add' ? 'Добавить лекарство' : 'Редактировать лекарство'}
            </DialogTitle>
            <DialogContent dividers>
                <TextField
                    label="Название"
                    name="name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={formData.name}
                    onChange={handleFormChange}
                />
                <TextField
                    label="Серийный номер"
                    name="serialNumber"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={formData.serialNumber}
                    onChange={handleFormChange}
                />
                <TextField
                    label="Срок годности (дд-ММ-гггг)"
                    name="expirationDate"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={formData.expirationDate}
                    onChange={handleFormChange}
                    placeholder="например: 25-12-2025"
                />
            </DialogContent>
            <DialogActions>
                {dialogMode === 'edit' && (
                    <Button color="error" onClick={handleDelete}>
                        Удалить
                    </Button>
                )}
                <Button onClick={onClose}>Отмена</Button>
                <Button variant="contained" onClick={handleSubmit}>
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default memo(MedicineDialog);

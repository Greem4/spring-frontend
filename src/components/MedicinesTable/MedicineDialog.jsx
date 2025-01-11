import React, { memo, useCallback, useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parse } from 'date-fns';
import { ru } from 'date-fns/locale';

function MedicineDialog({
                            open,
                            onClose,
                            dialogMode,
                            initialData,
                            onSave,
                            onDelete,
                        }) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        serialNumber: '',
        expirationDate: null,
    });

    useEffect(() => {
        if (open && initialData) {
            let dateValue = null;
            if (initialData.expirationDate) {
                // Сервер может вернуть дату в виде "DD-MM-YYYY" или "DD/MM/YYYY".
                // Проверяем, есть ли дефис: парсим как "dd-MM-yyyy", иначе — "dd/MM/yyyy".
                if (initialData.expirationDate.includes('-')) {
                    dateValue = parse(initialData.expirationDate, 'dd-MM-yyyy', new Date());
                } else {
                    dateValue = parse(initialData.expirationDate, 'dd/MM/yyyy', new Date());
                }
            }

            setFormData({
                ...initialData,
                expirationDate: dateValue,
            });
        } else if (open && dialogMode === 'add') {
            setFormData({
                id: '',
                name: '',
                serialNumber: '',
                expirationDate: null,
            });
        }
    }, [open, dialogMode, initialData]);

    const handleFormChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }, []);

    const handleSubmit = useCallback(
        (e) => {
            if (e?.preventDefault) {
                e.preventDefault();
            }
            const dataToSave = { ...formData };

            // Сохраняем дату всегда в виде "DD/MM/YYYY"
            if (dataToSave.expirationDate) {
                dataToSave.expirationDate = format(dataToSave.expirationDate, 'dd/MM/yyyy');
            }
            onSave(dataToSave);
        },
        [onSave, formData]
    );

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

            <form onSubmit={handleSubmit}>
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

                    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                        <DatePicker
                            label="Срок годности"
                            value={formData.expirationDate}
                            onChange={(newValue) =>
                                setFormData((prev) => ({ ...prev, expirationDate: newValue }))
                            }
                            // Отображаем и вводим дату через "DD/MM/YYYY"
                            inputFormat="dd/MM/yyyy"
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    fullWidth
                                    margin="normal"
                                    helperText={null}
                                />
                            )}
                        />
                    </LocalizationProvider>
                </DialogContent>

                <DialogActions>
                    {dialogMode === 'edit' && (
                        <Button color="error" onClick={handleDelete}>
                            Удалить
                        </Button>
                    )}
                    <Button onClick={onClose}>Отмена</Button>
                    <Button type="submit" variant="contained">
                        Сохранить
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

export default memo(MedicineDialog);

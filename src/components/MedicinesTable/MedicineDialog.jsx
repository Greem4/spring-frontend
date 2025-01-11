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
import { format } from 'date-fns';
// Опционально, если хотите локаль (русские названия месяцев, дней)
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
            setFormData({
                ...initialData,
                expirationDate: initialData.expirationDate
                    ? new Date(initialData.expirationDate)
                    : null,
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
            // Предотвращаем перезагрузку при отправке формы
            if (e?.preventDefault) {
                e.preventDefault();
            }

            const dataToSave = { ...formData };
            if (dataToSave.expirationDate) {
                // Сохраняем строку в формате "DD/MM/YYYY"
                dataToSave.expirationDate = format(
                    dataToSave.expirationDate,
                    'dd/MM/yyyy'
                );
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

                    <LocalizationProvider
                        dateAdapter={AdapterDateFns}
                        // Если хотите русскую локализацию, раскомментируйте строку ниже + импорт { ru } из 'date-fns/locale'
                        adapterLocale={ru}
                    >
                        <DatePicker
                            label="Срок годности"
                            value={formData.expirationDate}
                            onChange={(newValue) =>
                                setFormData((prev) => ({ ...prev, expirationDate: newValue }))
                            }
                            // Формат отображения и ввода: "DD/MM/YYYY"
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

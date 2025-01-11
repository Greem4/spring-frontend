// src/components/MedicinesTable.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TableSortLabel,
    Pagination,
    Stack,
    CircularProgress,
    Alert,
    Tooltip,
    IconButton,
    Box,
    Checkbox,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import { format, parse, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { styled } from '@mui/material/styles';

// ---------- Кастомные стили ----------
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    border: '1px solid #ddd',
    padding: '12px 16px',
    boxSizing: 'border-box',
    [theme.breakpoints.down('sm')]: {
        padding: '8px 12px',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
}));

// ---------- Основной компонент ----------
const MedicinesTable = ({ isAdmin }) => {
    const [medicines, setMedicines] = useState([]);

    // Параметры сортировки
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20; // Кол-во записей на страницу
    const [totalPages, setTotalPages] = useState(1);

    // Состояния загрузки, ошибок
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Для выбора нескольких записей через чекбоксы ---
    const [selectedIds, setSelectedIds] = useState([]);

    // --- Управление диалогом "Добавление/Редактирование" ---
    const [openDialog, setOpenDialog] = useState(false);
    // Режим диалога: либо "add" (добавить), либо "edit" (редактировать)
    const [dialogMode, setDialogMode] = useState('add');
    // Поля формы в диалоге
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        serialNumber: '',
        expirationDate: '',
    });

    // Добавляем токен аутентификации из localStorage (если нужно)
    const authHeader = {
        headers: {
            Authorization: localStorage.getItem('authToken'),
        },
    };

    // ---------- Функция для определения оставшихся дней до истечения срока ----------
    const getDaysRemaining = (dateStr) => {
        const today = new Date();
        const expirationDate = parse(dateStr, 'dd-MM-yyyy', new Date());
        return differenceInDays(expirationDate, today);
    };

    // ---------- Загрузка данных с бэкенда ----------
    const fetchMedicines = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get('http://localhost:8080/api/v1/medicines', {
                params: {
                    page: currentPage - 1, // Бэкенд использует нумерацию страниц с 0
                    size: rowsPerPage,
                    sort: `${orderBy},${order}`,
                },
                ...authHeader,
            });

            // Логирование ответа для отладки
            console.log('Ответ от бэкенда:', response.data);

            // Извлечение данных из ответа
            const medicinesData = response.data._embedded?.medicineViewList || [];
            const totalPagesFromBackend = response.data.page?.totalPages || 1;

            setMedicines(medicinesData);
            setTotalPages(totalPagesFromBackend);
        } catch (err) {
            console.error('Ошибка при загрузке данных:', err);
            setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    };

    // ---------- Хук для загрузки данных при изменении сортировки/страницы ----------
    useEffect(() => {
        fetchMedicines();
    }, [order, orderBy, currentPage, rowsPerPage]);

    // ---------- Обработчик сортировки ----------
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // ---------- Обработчик смены страницы ----------
    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    // ---------- Обработчик выбора чекбокса (одна строка) ----------
    const handleCheckboxChange = (id) => {
        setSelectedIds((prevSelected) => {
            if (prevSelected.includes(id)) {
                // Удаляем из массива
                return prevSelected.filter((item) => item !== id);
            } else {
                // Добавляем
                return [...prevSelected, id];
            }
        });
    };

    // ---------- Обработчик выбора всех чекбоксов (шапка таблицы) ----------
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            // Выделить все
            const allIds = medicines.map((med) => med.id);
            setSelectedIds(allIds);
        } else {
            // Снять выделение со всех
            setSelectedIds([]);
        }
    };

    // ---------- Удаление нескольких лекарств ----------
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        try {
            // Выполняем несколько запросов DELETE (или один общий, если бэкенд поддерживает)
            await Promise.all(
                selectedIds.map((id) =>
                    axios.delete(`http://localhost:8080/api/v1/medicines/${id}`, { ...authHeader })
                )
            );
            // После удаления обновляем таблицу
            fetchMedicines();
            // Сбрасываем выбранные ID
            setSelectedIds([]);
        } catch (err) {
            console.error('Ошибка при удалении лекарств:', err);
            setError('Не удалось удалить некоторые или все выбранные препараты.');
        }
    };

    // ---------- Открыть диалог для "добавления" ----------
    const handleOpenAddDialog = () => {
        setDialogMode('add');
        setFormData({
            id: '',
            name: '',
            serialNumber: '',
            expirationDate: '',
        });
        setOpenDialog(true);
    };

    // ---------- Открыть диалог для "редактирования" ----------
    const handleOpenEditDialog = (medicine) => {
        setDialogMode('edit');
        setFormData({
            id: medicine.id,
            name: medicine.name,
            serialNumber: medicine.serialNumber,
            expirationDate: medicine.expirationDate, // формат "dd-MM-yyyy"
        });
        setOpenDialog(true);
    };

    // ---------- Закрыть диалог ----------
    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    // ---------- Обработчик изменения полей формы в диалоге ----------
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ---------- Отправка формы (добавление или обновление) ----------
    const handleSubmit = async () => {
        try {
            // Принимаем, что наш сервер ожидает данные именно в формате "dd-MM-yyyy"
            if (dialogMode === 'add') {
                // Запрос на создание
                await axios.post(
                    'http://localhost:8080/api/v1/medicines',
                    {
                        name: formData.name,
                        serialNumber: formData.serialNumber,
                        expirationDate: formData.expirationDate,
                    },
                    authHeader
                );
            } else {
                // Запрос на обновление
                await axios.put(
                    `http://localhost:8080/api/v1/medicines/${formData.id}`,
                    {
                        name: formData.name,
                        serialNumber: formData.serialNumber,
                        expirationDate: formData.expirationDate,
                    },
                    authHeader
                );
            }

            // После успешной операции обновим таблицу
            fetchMedicines();
            // Закроем диалог
            setOpenDialog(false);
        } catch (err) {
            console.error('Ошибка при сохранении лекарства:', err);
            setError('Не удалось сохранить изменения. Попробуйте ещё раз позже.');
        }
    };

    // ---------- Удаление лекарства из диалога (режим edit) ----------
    const handleDeleteFromDialog = async () => {
        try {
            await axios.delete(`http://localhost:8080/api/v1/medicines/${formData.id}`, {
                ...authHeader,
            });
            fetchMedicines();
            setOpenDialog(false);
        } catch (err) {
            console.error('Ошибка при удалении лекарства:', err);
            setError('Не удалось удалить препарат. Попробуйте ещё раз позже.');
        }
    };

    // ---------- JSX разметка ----------
    return (
        <Box sx={{ position: 'relative' }}>
            {/* Кнопка "Добавить" (справа вверху) + Кнопка "Удалить выбранные" */}
            {isAdmin && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        marginBottom: 2,
                    }}
                >
                    <Button variant="contained" color="primary" onClick={handleOpenAddDialog}>
                        Добавить
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDeleteSelected}
                        disabled={selectedIds.length === 0}
                    >
                        Удалить выбранные
                    </Button>
                </Box>
            )}

            <TableContainer
                component={Paper}
                sx={{
                    overflowX: 'auto',
                    position: 'relative',
                    tableLayout: 'fixed', // Фиксированный макет таблицы
                    border: '1px solid #ddd', // Внешняя граница таблицы
                }}
            >
                {loading && (
                    <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 1,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
                {error ? (
                    <Alert severity="error" sx={{ m: 2 }}>
                        {error}
                    </Alert>
                ) : (
                    <>
                        <Table>
                            <TableHead sx={{ backgroundColor: '#1976d2' }}>
                                <TableRow>
                                    {isAdmin && (
                                        <StyledTableCell
                                            sx={{
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                width: '50px',
                                                textAlign: 'center',
                                            }}
                                        >
                                            <Checkbox
                                                size="small"
                                                sx={{ color: 'white' }}
                                                checked={selectedIds.length === medicines.length && medicines.length > 0}
                                                onChange={handleSelectAll}
                                            />
                                        </StyledTableCell>
                                    )}
                                    {/* Название препарата */}
                                    <StyledTableCell
                                        sx={{
                                            color: '#ffffff',
                                            fontWeight: 'bold',
                                            width: '250px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        <Tooltip title="Название препарата">
                      <span>
                        <TableSortLabel
                            active={orderBy === 'name'}
                            direction={orderBy === 'name' ? order : 'asc'}
                            onClick={() => handleSort('name')}
                            sx={{ color: '#ffffff' }}
                            hideSortIcon={false}
                        >
                          Название
                        </TableSortLabel>
                      </span>
                                        </Tooltip>
                                    </StyledTableCell>

                                    {/* Серийный номер */}
                                    <StyledTableCell
                                        sx={{
                                            color: '#ffffff',
                                            fontWeight: 'bold',
                                            width: '90px',
                                            whiteSpace: 'nowrap',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Tooltip title="Уникальный серийный номер препарата">
                      <span>
                        <TableSortLabel
                            active={orderBy === 'serialNumber'}
                            direction={orderBy === 'serialNumber' ? order : 'asc'}
                            onClick={() => handleSort('serialNumber')}
                            sx={{ color: '#ffffff', justifyContent: 'center' }}
                            hideSortIcon={false}
                        >
                          Серийный Номер
                        </TableSortLabel>
                      </span>
                                        </Tooltip>
                                    </StyledTableCell>

                                    {/* Срок годности (с отображением цвета) */}
                                    <StyledTableCell
                                        sx={{
                                            color: '#ffffff',
                                            fontWeight: 'bold',
                                            width: '150px',
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            textAlign: 'center',
                                        }}
                                    >
                                        <Tooltip title="Дата истечения срока годности препарата">
                      <span>
                        <TableSortLabel
                            active={orderBy === 'expirationDate'}
                            direction={orderBy === 'expirationDate' ? order : 'asc'}
                            onClick={() => handleSort('expirationDate')}
                            sx={{ color: '#ffffff' }}
                            hideSortIcon={false}
                        >
                          Срок Годности
                        </TableSortLabel>
                      </span>
                                        </Tooltip>
                                    </StyledTableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {medicines.length > 0 ? (
                                    medicines.map((medicine) => {
                                        const isSelected = selectedIds.includes(medicine.id);
                                        return (
                                            <StyledTableRow key={medicine.id}>
                                                {isAdmin && (
                                                    <StyledTableCell
                                                        sx={{
                                                            width: '50px',
                                                            textAlign: 'center',
                                                        }}
                                                    >
                                                        <Checkbox
                                                            size="small"
                                                            checked={isSelected}
                                                            onChange={() => handleCheckboxChange(medicine.id)}
                                                        />
                                                    </StyledTableCell>
                                                )}
                                                {/* Название (кликаем для редактирования, если admin) */}
                                                <StyledTableCell
                                                    sx={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        cursor: isAdmin ? 'pointer' : 'default',
                                                    }}
                                                    onClick={() => isAdmin && handleOpenEditDialog(medicine)}
                                                    title={
                                                        isAdmin
                                                            ? 'Нажмите, чтобы редактировать'
                                                            : medicine.name
                                                    }
                                                >
                                                    <Tooltip title={medicine.name} arrow>
                                                        <span>{medicine.name}</span>
                                                    </Tooltip>
                                                </StyledTableCell>

                                                {/* Серийный номер */}
                                                <StyledTableCell
                                                    sx={{
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        textAlign: 'center',
                                                    }}
                                                >
                                                    <Tooltip title={medicine.serialNumber} arrow>
                                                        <span>{medicine.serialNumber}</span>
                                                    </Tooltip>
                                                </StyledTableCell>

                                                {/* Срок годности (с использованием цвета) */}
                                                <StyledTableCell
                                                    sx={{
                                                        backgroundColor: medicine.color || 'transparent',
                                                        color: medicine.color ? '#ffffff' : 'inherit',
                                                        textAlign: 'center',
                                                        borderRadius: medicine.color ? '4px' : 0,
                                                        fontWeight: 'bold',
                                                        cursor: 'default',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                >
                                                    <Tooltip
                                                        title={`Срок истекает через ${getDaysRemaining(
                                                            medicine.expirationDate
                                                        )} дней`}
                                                        arrow
                                                    >
                            <span>
                              {format(
                                  parse(
                                      medicine.expirationDate,
                                      'dd-MM-yyyy',
                                      new Date()
                                  ),
                                  'dd MMM yyyy',
                                  { locale: ru }
                              )}
                            </span>
                                                    </Tooltip>
                                                </StyledTableCell>
                                            </StyledTableRow>
                                        );
                                    })
                                ) : (
                                    <StyledTableRow>
                                        <StyledTableCell
                                            colSpan={isAdmin ? 4 : 3}
                                            align="center"
                                            sx={{ padding: '12px 16px' }}
                                        >
                                            Нет данных
                                        </StyledTableCell>
                                    </StyledTableRow>
                                )}
                            </TableBody>
                        </Table>

                        {/* Пагинация */}
                        <Stack spacing={2} alignItems="center" padding={2}>
                            <Pagination
                                count={totalPages}
                                page={currentPage}
                                onChange={handleChangePage}
                                color="primary"
                                variant="outlined"
                                shape="rounded"
                            />
                        </Stack>
                    </>
                )}
            </TableContainer>

            {/* Диалог: Добавление / Редактирование */}
            <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
                <DialogTitle>
                    {dialogMode === 'add' ? 'Добавить лекарство' : 'Редактировать лекарство'}
                </DialogTitle>
                <DialogContent dividers>
                    {/* Поле Name */}
                    <TextField
                        label="Название"
                        name="name"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={formData.name}
                        onChange={handleFormChange}
                    />
                    {/* Поле SerialNumber */}
                    <TextField
                        label="Серийный номер"
                        name="serialNumber"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={formData.serialNumber}
                        onChange={handleFormChange}
                    />
                    {/* Поле ExpirationDate (формат 'dd-MM-yyyy') */}
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
                    {/* Если режим edit, показываем кнопку удаления */}
                    {dialogMode === 'edit' && (
                        <Button color="error" onClick={handleDeleteFromDialog}>
                            Удалить
                        </Button>
                    )}
                    <Button onClick={handleCloseDialog}>Отмена</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        Сохранить
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MedicinesTable;

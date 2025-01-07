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
} from '@mui/material';
import { format, parse, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import DeleteIcon from '@mui/icons-material/Delete'; // Иконка для удаления
import { styled } from '@mui/material/styles';

// Кастомные стили для TableCell и TableRow
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

const MedicinesTable = ({ isAdmin }) => {
    const [medicines, setMedicines] = useState([]);
    const [order, setOrder] = useState('asc'); // 'asc' или 'desc'
    const [orderBy, setOrderBy] = useState('name'); // Поле для сортировки
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20; // Соответствует вашему бэкенду
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Добавляем токен аутентификации из localStorage
    const authHeader = {
        headers: {
            Authorization: localStorage.getItem('authToken'), // Токен уже содержит Bearer
        },
    };

    // Функция для определения оставшихся дней до истечения срока годности
    const getDaysRemaining = (dateStr) => {
        const today = new Date();
        const expirationDate = parse(dateStr, 'dd-MM-yyyy', new Date());
        return differenceInDays(expirationDate, today);
    };

    // Загрузка данных с бэкенда
    useEffect(() => {
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
                    ...authHeader, // Передаём заголовки аутентификации
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

        fetchMedicines();
    }, [order, orderBy, currentPage, rowsPerPage]);

    // Обработчик сортировки
    const handleSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Обработчик смены страницы
    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    // Функция удаления лекарства (доступна только администраторам)
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/v1/medicines/${id}`, {
                headers: {
                    Authorization: `${localStorage.getItem('authToken')}`, // Токен для аутентификации
                },
            });

            setMedicines((prev) => prev.filter((med) => med.id !== id)); // Обновление списка после удаления
        } catch (err) {
            console.error('Ошибка при удалении лекарства:', err);
            setError('Не удалось удалить лекарство. Проверьте права доступа.');
        }
    };

    return (
        <TableContainer
            component={Paper}
            sx={{
                marginTop: 4,
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
                <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
            ) : (
                <>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#1976d2' }}>
                            <TableRow>
                                {/* Название препарата */}
                                <StyledTableCell
                                    sx={{
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        width: '250px', // Фиксированная ширина
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
                                                hideSortIcon={false} // Всегда показывать иконку сортировки
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
                                        width: '90px', // Уменьшенная фиксированная ширина
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        textAlign: 'center', // Центрирование содержимого
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

                                {/* Срок годности */}
                                <StyledTableCell
                                    sx={{
                                        color: '#ffffff',
                                        fontWeight: 'bold',
                                        width: '150px', // Уменьшенная фиксированная ширина
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
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

                                {/* Дополнительный столбец для администраторов */}
                                {isAdmin && (
                                    <StyledTableCell
                                        sx={{
                                            color: '#ffffff',
                                            fontWeight: 'bold',
                                            width: '100px', // Фиксированная ширина
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                        }}
                                    >
                                        <Tooltip title="Действия">
                                            <span>Действия</span>
                                        </Tooltip>
                                    </StyledTableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {medicines.length > 0 ? (
                                medicines.map((medicine) => (
                                    <StyledTableRow key={medicine.id}>
                                        <StyledTableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                            }}
                                        >
                                            <Tooltip title={medicine.name} arrow>
                                                <span>{medicine.name}</span>
                                            </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell
                                            sx={{
                                                whiteSpace: 'nowrap',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                textAlign: 'center', // Центрирование содержимого
                                            }}
                                        >
                                            <Tooltip title={medicine.serialNumber} arrow>
                                                <span>{medicine.serialNumber}</span>
                                            </Tooltip>
                                        </StyledTableCell>
                                        <StyledTableCell
                                            sx={{
                                                backgroundColor: medicine.color, // Используем цвет из JSON
                                                color: '#ffffff',
                                                textAlign: 'center',
                                                borderRadius: '4px',
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
                                                        parse(medicine.expirationDate, 'dd-MM-yyyy', new Date()),
                                                        'dd MMM yyyy',
                                                        { locale: ru }
                                                    )}
                                                </span>
                                            </Tooltip>
                                        </StyledTableCell>
                                        {isAdmin && (
                                            <StyledTableCell
                                                sx={{
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <Tooltip title="Удалить" arrow>
                                                    <IconButton
                                                        aria-label="delete"
                                                        color="error"
                                                        onClick={() => handleDelete(medicine.id)}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </StyledTableCell>
                                        )}
                                    </StyledTableRow>
                                ))
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
    );
};

export default MedicinesTable;

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
    IconButton
} from '@mui/material';
import { format, parse, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import DeleteIcon from '@mui/icons-material/Delete'; // Иконка для удаления

const MedicinesTable = ({ isAdmin }) => {
    const [medicines, setMedicines] = useState([]);
    const [order, setOrder] = useState('asc'); // 'asc' или 'desc'
    const [orderBy, setOrderBy] = useState('name'); // Поле для сортировки
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20; // Соответствует вашему бэкенду
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
                const response = await axios.get('http://localhost:8080/api/medicines', {
                    params: {
                        page: currentPage - 1, // Бэкенд использует нумерацию страниц с 0
                        size: rowsPerPage,
                        sort: `${orderBy},${order}`,
                    }
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

    // Функция для сортировки данных
    const sortData = (data, order, orderBy) => {
        return data.sort((a, b) => {
            let aValue = a[orderBy];
            let bValue = b[orderBy];

            if (orderBy === 'expirationDate') {
                aValue = parse(aValue, 'dd-MM-yyyy', new Date());
                bValue = parse(bValue, 'dd-MM-yyyy', new Date());
            }

            if (aValue < bValue) {
                return order === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return order === 'asc' ? 1 : -1;
            }
            return 0;
        });
    };

    const sortedMedicines = sortData([...medicines], order, orderBy);

    // Функция удаления лекарства (доступна только администраторам)
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:8080/api/medicines/${id}`);
            // Обновление списка после удаления
            setMedicines(prev => prev.filter(med => med.id !== id));
        } catch (err) {
            console.error('Ошибка при удалении лекарства:', err);
            setError('Не удалось удалить лекарство. Пожалуйста, попробуйте позже.');
        }
    };

    return (
        <TableContainer component={Paper} sx={{ marginTop: 4, overflowX: 'auto', position: 'relative' }}>
            {loading && (
                <Stack
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
                </Stack>
            )}
            {error ? (
                <Alert severity="error">{error}</Alert>
            ) : (
                <>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#1976d2' }}>
                            <TableRow>
                                {/* Название препарата */}
                                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', minWidth: isAdmin ? 150 : 100 }}>
                                    <TableSortLabel
                                        active={orderBy === 'name'}
                                        direction={orderBy === 'name' ? order : 'asc'}
                                        onClick={() => handleSort('name')}
                                        sx={{ color: '#ffffff' }}
                                    >
                                        Название
                                    </TableSortLabel>
                                </TableCell>

                                {/* Серийный номер */}
                                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', minWidth: isAdmin ? 150 : 100 }}>
                                    <TableSortLabel
                                        active={orderBy === 'serialNumber'}
                                        direction={orderBy === 'serialNumber' ? order : 'asc'}
                                        onClick={() => handleSort('serialNumber')}
                                        sx={{ color: '#ffffff' }}
                                    >
                                        Серийный Номер
                                    </TableSortLabel>
                                </TableCell>

                                {/* Срок годности */}
                                <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', minWidth: isAdmin ? 180 : 120 }}>
                                    <TableSortLabel
                                        active={orderBy === 'expirationDate'}
                                        direction={orderBy === 'expirationDate' ? order : 'asc'}
                                        onClick={() => handleSort('expirationDate')}
                                        sx={{ color: '#ffffff' }}
                                    >
                                        Срок Годности
                                    </TableSortLabel>
                                </TableCell>

                                {/* Дополнительный столбец для администраторов */}
                                {isAdmin && (
                                    <TableCell sx={{ color: '#ffffff', fontWeight: 'bold', minWidth: 50 }}>
                                        Действия
                                    </TableCell>
                                )}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedMedicines.length > 0 ? (
                                sortedMedicines.map((medicine) => (
                                    <TableRow
                                        key={medicine.id}
                                        hover
                                        sx={{
                                            '&:nth-of-type(odd)': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                            },
                                        }}
                                    >
                                        <TableCell sx={{ minWidth: isAdmin ? 150 : 100 }}>
                                            {medicine.name}
                                        </TableCell>
                                        <TableCell sx={{ minWidth: isAdmin ? 150 : 100 }}>
                                            {medicine.serialNumber}
                                        </TableCell>
                                        <TableCell
                                            sx={{
                                                backgroundColor: medicine.color, // Используем цвет из JSON
                                                color: '#ffffff',
                                                textAlign: 'center',
                                                borderRadius: '4px',
                                                fontWeight: 'bold',
                                                cursor: 'default',
                                                minWidth: isAdmin ? 180 : 120,
                                            }}
                                        >
                                            <Tooltip title={`Срок истекает через ${getDaysRemaining(medicine.expirationDate)} дней`}>
                                                <span>
                                                    {format(
                                                        parse(medicine.expirationDate, 'dd-MM-yyyy', new Date()),
                                                        'dd MMM yyyy',
                                                        { locale: ru }
                                                    )}
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                        {isAdmin && (
                                            <TableCell sx={{ minWidth: 50 }}>
                                                <IconButton
                                                    aria-label="delete"
                                                    color="error"
                                                    onClick={() => handleDelete(medicine.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 4 : 3} align="center">
                                        Нет данных
                                    </TableCell>
                                </TableRow>
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
        </TableContainer>)
};

export default MedicinesTable;

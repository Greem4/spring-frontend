// components/MedicinesTable/index.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableHead,
    Paper,
    TableContainer,
    TableRow,
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
} from '@mui/material';

import { StyledTableCell, StyledTableRow } from './styles';
import MedicineRow from './MedicineRow';
import MedicineDialog from './MedicineDialog';

import {
    getMedicines,
    createMedicine,
    updateMedicine,
    deleteMedicine,
    deleteMultipleMedicines,
} from '/services/api';

/**
 * Основной компонент, который отображает таблицу лекарств,
 * а также диалог добавления/редактирования.
 */
function MedicinesTable({ isAdmin }) {
    // Состояние со списком
    const [medicines, setMedicines] = useState([]);

    // Параметры сортировки
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');

    // Пагинация
    const [currentPage, setCurrentPage] = useState(1);   // пользовательская нумерация (1-based)
    const rowsPerPage = 20;
    const [totalPages, setTotalPages] = useState(1);

    // Состояния загрузки, ошибок
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Выбранные через чекбокс
    const [selectedIds, setSelectedIds] = useState([]);

    // Состояние диалога
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add'); // "add" или "edit"
    const [dialogData, setDialogData] = useState(null);  // данные для редактирования

    // --- Загрузка списка с бэкенда ---
    const fetchMedicinesData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const pageIndex = currentPage - 1; // Бэкенд использует 0-based
            const sortParam = `${orderBy},${order}`;
            const responseData = await getMedicines(pageIndex, rowsPerPage, sortParam);

            console.log('Ответ от бэкенда:', responseData);

            const medicinesData = responseData._embedded?.medicineViewList || [];
            const totalPagesFromBackend = responseData.page?.totalPages || 1;

            setMedicines(medicinesData);
            setTotalPages(totalPagesFromBackend);
        } catch (err) {
            console.error('Ошибка при загрузке данных:', err);
            setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
        } finally {
            setLoading(false);
        }
    }, [currentPage, order, orderBy]);

    // Загружаем данные при изменении сортировки/страницы
    useEffect(() => {
        fetchMedicinesData();
    }, [fetchMedicinesData]);

    // --- Обработчик сортировки ---
    const handleSort = useCallback((property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    }, [order, orderBy]);

    // --- Обработчик смены страницы ---
    const handleChangePage = useCallback((event, newPage) => {
        setCurrentPage(newPage);
    }, []);

    // --- Обработчик чекбоксов ---
    const handleCheckboxChange = useCallback((id) => {
        setSelectedIds((prevSelected) => {
            if (prevSelected.includes(id)) {
                // Удаляем
                return prevSelected.filter((item) => item !== id);
            } else {
                // Добавляем
                return [...prevSelected, id];
            }
        });
    }, []);

    const handleSelectAll = useCallback((event) => {
        if (event.target.checked) {
            // Выделить все
            const allIds = medicines.map((med) => med.id);
            setSelectedIds(allIds);
        } else {
            // Снять всё
            setSelectedIds([]);
        }
    }, [medicines]);

    // --- Удаление нескольких лекарств ---
    const handleDeleteSelected = useCallback(async () => {
        if (selectedIds.length === 0) return;
        try {
            await deleteMultipleMedicines(selectedIds);
            fetchMedicinesData();
            setSelectedIds([]);
        } catch (err) {
            console.error('Ошибка при удалении:', err);
            setError('Не удалось удалить некоторые или все выбранные препараты.');
        }
    }, [selectedIds, fetchMedicinesData]);

    // --- Открыть диалог на "добавление" ---
    const handleOpenAddDialog = useCallback(() => {
        setDialogMode('add');
        setDialogData(null); // пустые поля заполнит useEffect диалога
        setOpenDialog(true);
    }, []);

    // --- Открыть диалог на "редактирование" (при клике по названию) ---
    const handleOpenEditDialog = useCallback((medicine) => {
        setDialogMode('edit');
        setDialogData({
            id: medicine.id,
            name: medicine.name,
            serialNumber: medicine.serialNumber,
            expirationDate: medicine.expirationDate,
        });
        setOpenDialog(true);
    }, []);

    const handleCloseDialog = useCallback(() => {
        setOpenDialog(false);
    }, []);

    // --- Обработчик сохранения (create/update) из диалога ---
    const handleSaveMedicine = useCallback(
        async (formData) => {
            try {
                if (dialogMode === 'add') {
                    // Создаём новое
                    await createMedicine({
                        name: formData.name,
                        serialNumber: formData.serialNumber,
                        expirationDate: formData.expirationDate,
                    });
                } else {
                    // Обновляем
                    await updateMedicine(formData.id, {
                        name: formData.name,
                        serialNumber: formData.serialNumber,
                        expirationDate: formData.expirationDate,
                    });
                }
                fetchMedicinesData();
                setOpenDialog(false);
            } catch (err) {
                console.error('Ошибка при сохранении:', err);
                setError('Не удалось сохранить изменения. Попробуйте ещё раз позже.');
            }
        },
        [dialogMode, fetchMedicinesData]
    );

    // --- Удаление лекарства (в диалоге при "edit") ---
    const handleDeleteFromDialog = useCallback(
        async (id) => {
            try {
                await deleteMedicine(id);
                fetchMedicinesData();
                setOpenDialog(false);
            } catch (err) {
                console.error('Ошибка при удалении:', err);
                setError('Не удалось удалить препарат. Попробуйте ещё раз позже.');
            }
        },
        [fetchMedicinesData]
    );

    // --- JSX ---
    return (
        <Box sx={{ position: 'relative' }}>
            {/* Кнопки "Добавить" и "Удалить выбранные" */}
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
                    tableLayout: 'fixed',
                    border: '1px solid #ddd',
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
                                                checked={
                                                    selectedIds.length === medicines.length && medicines.length > 0
                                                }
                                                onChange={handleSelectAll}
                                            />
                                        </StyledTableCell>
                                    )}

                                    {/* Название */}
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

                                    {/* Срок годности */}
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
                                    medicines.map((medicine) => (
                                        <MedicineRow
                                            key={medicine.id}
                                            medicine={medicine}
                                            isAdmin={isAdmin}
                                            isSelected={selectedIds.includes(medicine.id)}
                                            onCheckboxChange={() => handleCheckboxChange(medicine.id)}
                                            onRowClick={handleOpenEditDialog}
                                        />
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

            {/* Диалог (добавление/редактирование) */}
            <MedicineDialog
                open={openDialog}
                onClose={handleCloseDialog}
                dialogMode={dialogMode}
                initialData={dialogData}
                onSave={handleSaveMedicine}
                onDelete={handleDeleteFromDialog}
            />
        </Box>
    );
}

export default MedicinesTable;

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
    Checkbox,
    Button,
    Box,
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

function MedicinesTable({ showAdminUI, canEdit }) {
    const [medicines, setMedicines] = useState([]);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 20;
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogMode, setDialogMode] = useState('add');
    const [dialogData, setDialogData] = useState(null);

    const fetchMedicinesData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const pageIndex = currentPage - 1;
            const sortParam = `${orderBy},${order}`;
            const responseData = await getMedicines(pageIndex, rowsPerPage, sortParam);

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

    useEffect(() => {
        fetchMedicinesData();
    }, [fetchMedicinesData]);

    const handleSort = useCallback(
        (property) => {
            const isAsc = orderBy === property && order === 'asc';
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(property);
        },
        [order, orderBy]
    );

    const handleChangePage = useCallback((event, newPage) => {
        setCurrentPage(newPage);
    }, []);

    const handleCheckboxChange = useCallback((id) => {
        setSelectedIds((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((item) => item !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    }, []);

    const handleSelectAll = useCallback(
        (event) => {
            if (event.target.checked) {
                const allIds = medicines.map((med) => med.id);
                setSelectedIds(allIds);
            } else {
                setSelectedIds([]);
            }
        },
        [medicines]
    );

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

    const handleOpenAddDialog = useCallback(() => {
        setDialogMode('add');
        setDialogData(null);
        setOpenDialog(true);
    }, []);

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

    const handleSaveMedicine = useCallback(
        async (formData) => {
            try {
                if (dialogMode === 'add') {
                    await createMedicine({
                        name: formData.name,
                        serialNumber: formData.serialNumber,
                        expirationDate: formData.expirationDate,
                    });
                } else {
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

    return (
        <Box sx={{ position: 'relative' }}>
            {showAdminUI && (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 2,
                        marginBottom: 2,
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={canEdit ? handleOpenAddDialog : () => alert('Недостаточно прав')}
                    >
                        Добавить
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={canEdit ? handleDeleteSelected : () => alert('Недостаточно прав')}
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
                                    {showAdminUI && (
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
                                                    selectedIds.length === medicines.length &&
                                                    medicines.length > 0
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
                                            isAdmin={showAdminUI}
                                            isSelected={selectedIds.includes(medicine.id)}
                                            onCheckboxChange={() => handleCheckboxChange(medicine.id)}
                                            onRowClick={handleOpenEditDialog}
                                        />
                                    ))
                                ) : (
                                    <StyledTableRow>
                                        <StyledTableCell
                                            colSpan={showAdminUI ? 4 : 3}
                                            align="center"
                                            sx={{ padding: '12px 16px' }}
                                        >
                                            Нет данных
                                        </StyledTableCell>
                                    </StyledTableRow>
                                )}
                            </TableBody>
                        </Table>
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

            <MedicineDialog
                open={openDialog}
                onClose={handleCloseDialog}
                dialogMode={dialogMode}
                initialData={dialogData}
                onSave={canEdit ? handleSaveMedicine : undefined}
                onDelete={canEdit ? handleDeleteFromDialog : undefined}
            />
        </Box>
    );
}

export default MedicinesTable;

// components/MedicinesTable/styles.js
import { styled } from '@mui/material/styles';
import { TableCell, TableRow } from '@mui/material';

// Кастомная ячейка таблицы
export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    border: '1px solid #ddd',
    padding: '12px 16px',
    boxSizing: 'border-box',
    [theme.breakpoints.down('sm')]: {
        padding: '8px 12px',
    },
}));

// Кастомная строка таблицы
export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
    },
}));

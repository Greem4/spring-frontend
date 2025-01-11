// components/MedicinesTable/MedicineRow.jsx
import React, { memo, useMemo } from 'react';
import { StyledTableRow, StyledTableCell } from './styles';
import { Checkbox, Tooltip } from '@mui/material';
import { parse, differenceInDays, format } from 'date-fns';
import { ru } from 'date-fns/locale';

function MedicineRow({
                         medicine,
                         isAdmin,
                         isSelected,         // выбран ли в чекбоксе
                         onCheckboxChange,   // колбэк для изменения чекбокса
                         onRowClick          // колбэк, вызываемый при клике по названию (редактирование)
                     }) {
    // Функция для определения оставшихся дней до истечения срока
    const daysRemaining = useMemo(() => {
        const today = new Date();
        const expirationDate = parse(medicine.expirationDate, 'dd-MM-yyyy', new Date());
        return differenceInDays(expirationDate, today);
        // Зависит только от medicine.expirationDate
    }, [medicine.expirationDate]);

    // Форматированная дата: "dd MMM yyyy"
    const formattedExpiration = useMemo(() => {
        const parsed = parse(medicine.expirationDate, 'dd-MM-yyyy', new Date());
        return format(parsed, 'dd MMM yyyy', { locale: ru });
    }, [medicine.expirationDate]);

    return (
        <StyledTableRow>
            {isAdmin && (
                <StyledTableCell sx={{ width: '50px', textAlign: 'center' }}>
                    <Checkbox
                        size="small"
                        checked={isSelected}
                        onChange={onCheckboxChange}
                    />
                </StyledTableCell>
            )}

            {/* Название (при клике - редактирование, если isAdmin) */}
            <StyledTableCell
                sx={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    cursor: isAdmin ? 'pointer' : 'default',
                }}
                onClick={() => isAdmin && onRowClick(medicine)}
                title={isAdmin ? 'Нажмите, чтобы редактировать' : medicine.name}
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

            {/* Срок годности */}
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
                <Tooltip title={`Срок истекает через ${daysRemaining} дней`} arrow>
                    <span>{formattedExpiration}</span>
                </Tooltip>
            </StyledTableCell>
        </StyledTableRow>
    );
}

export default memo(MedicineRow);

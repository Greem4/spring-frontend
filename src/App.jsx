// src/App.jsx
import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import MedicinesTable from './components/MedicinesTable';

function App() {
    return (
        <Container maxWidth="lg" sx={{ marginTop: 4 }}>
            <Box marginBottom={2}>
                <Typography variant="h4" component="h1">
                    Список Лекарств
                </Typography>
            </Box>
            <MedicinesTable />
        </Container>
    );
}

export default App;

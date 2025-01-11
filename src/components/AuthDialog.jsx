// AuthDialog.jsx
import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Tabs,
    Tab,
    Box,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`auth-tabpanel-${index}`}
            aria-labelledby={`auth-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
}

const AuthDialog = ({ open, handleClose, setAuth }) => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ m: 0, p: 2 }}>
                {tabIndex === 0 ? 'Вход' : 'Регистрация'}
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Tabs
                    value={tabIndex}
                    onChange={handleChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab label="Вход" id="auth-tab-0" aria-controls="auth-tabpanel-0" />
                    <Tab label="Регистрация" id="auth-tab-1" aria-controls="auth-tabpanel-1" />
                </Tabs>
                <TabPanel value={tabIndex} index={0}>
                    <LoginForm setAuth={setAuth} onSuccess={handleClose} />
                </TabPanel>
                <TabPanel value={tabIndex} index={1}>
                    <RegisterForm setAuth={setAuth} onSuccess={handleClose} />
                </TabPanel>
            </DialogContent>
        </Dialog>
    );
};

export default AuthDialog;

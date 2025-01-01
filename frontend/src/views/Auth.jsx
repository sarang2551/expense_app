import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box, Alert, Tabs, Tab } from '@mui/material';
import axiosClient from '../util/setupAxios';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true); // Toggle between login/register
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);   
    const api = axiosClient();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.username || !formData.password) {
            setError('Please enter username and password.');
            return;
        }

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const endpoint = isLogin ? 'user/login' : 'user/register';
            const response = await api.post(endpoint, {
                username: formData.username,
                password: formData.password,
            });

            if(response.status === 200 && isLogin){
                const {jwt_token} = response.data
                if(!jwt_token){ 
                    setError("JWT_Token is invalid")
                    return;
                }
                localStorage.setItem("jwt_token",jwt_token);
                navigate('/home');
            }
            else if(response.status === 201 && !isLogin){
                setIsLogin(true);
                setSuccess("Registration successful. Please login.")
            } else {
                setError("Invalid Credentials")
            }
            
        } catch (err) {
            if (err.response) {
                setError(err.response.data.message || 'Authentication failed.'); // Backend error message
            } else {
                setError('A network error occurred. Please try again.');
            }
            console.error(err)
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    {isLogin ? 'Login' : 'Register'}
                </Typography>
                <Tabs value={isLogin ? 0 : 1} onChange={(event, newValue) => setIsLogin(newValue === 0)} sx={{ mb: 3 }}>
                    <Tab label="Login" />
                    <Tab label="Register" />
                </Tabs>
                {error && <Alert onClose={()=>{setError(null)}} severity="error">{error}</Alert>}
                {success && <Alert onClose={()=>{setSuccess(null)}} severity="success">{success}</Alert>}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={formData.username}
                        onChange={handleChange}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {!isLogin && ( // Conditionally render confirm password field
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                        />
                    )}
                    <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }}>
                        {isLogin ? 'Sign In' : 'Sign Up'}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Auth;
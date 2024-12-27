import React, { useState } from 'react';
import { Modal, Container, Stack, Divider, FormControl, InputLabel, Select, MenuItem, Button, TextField, Alert, Typography } from '@mui/material';
import axiosClient from '../util/setupAxios';

const Home = () => {
    const axios = axiosClient();
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        itemName: '',
        amount: '',
        category: 'Category',
    });
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const modalToggle = () => {
        setModalOpen(!modalOpen);
        setError(null);
        setSuccessMessage(null);
        setFormData({ itemName: '', amount: '', category: 'Category' }); // Reset form
    };

    const handleChange = (event) => {
        setFormData({ ...formData, [event.target.name]: event.target.value });
    };

    const addExpense = async () => {
        setError(null);
        setSuccessMessage(null);

        if (!formData.itemName) {
            setError('Item Name is required.');
            return;
        }

        if (!formData.amount || isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
            setError('Amount must be a valid positive number.');
            return;
        }

        if (formData.category === 'Category') {
            setError('Please select a category.');
            return;
        }

        try {
            const response = await axios.post('expense/add', {
                ...formData,
                amount: parseFloat(formData.amount), // Parse amount before sending
            });
            if(response.status !== 200) {
                setError('Failed to add expense. Please try again.');
                return;
            }
            setSuccessMessage("Expense added successfully")
            modalToggle();
        } catch (err) {
            console.error('Error adding expense:', err);
            setError('Failed to add expense. Please try again.');
        }
    };

    return (
        <>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stack direction={'column'} spacing={2}>
            <Typography variant='h3'>Add Expense</Typography>
            <Button  onClick={modalToggle}>Add +</Button>
            </Stack>
        
        </div>
        
        {modalOpen && (
            <Modal
                open={modalOpen}
                onClose={modalToggle}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <Container style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px' }}>
                    <Stack
                        direction="column"
                        divider={<Divider orientation="horizontal" flexItem />}
                        spacing={2}
                        alignItems="stretch"
                    >
                        {error && <Alert onClose={()=>{setError(null)}} severity="error">{error}</Alert>}
                        {successMessage && <Alert onClose={()=>{setSuccessMessage(null)}} severity="success">{successMessage}</Alert>}
                        <FormControl style={{gap: '20px'}}>
                            <TextField
                                label="Item Name"
                                name="itemName"
                                value={formData.itemName}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                            <TextField
                                label="Amount"
                                name="amount"
                                type="number"
                                value={formData.amount}
                                onChange={handleChange}
                                fullWidth
                                required
                            />
                            <FormControl fullWidth required> {/* Added FormControl for Select */}
                                <InputLabel id="category-label">Category</InputLabel>
                                <Select
                                    labelId="category-label"
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    label="Category"
                                    onChange={handleChange}
                                    fullWidth
                                >
                                    <MenuItem value="Category">Category</MenuItem>
                                    <MenuItem value="Food">Food</MenuItem>
                                    <MenuItem value="Transport">Transport</MenuItem>
                                    <MenuItem value="Entertainment">Entertainment</MenuItem>
                                    <MenuItem value="Health">Health</MenuItem>
                                    <MenuItem value="Education">Education</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" color="success" onClick={addExpense}>
                                Add
                            </Button>
                        </FormControl>
                    </Stack>
                </Container>
            </Modal>
        )}
        </>
    );
};

export default Home;
import React, { useState, useEffect } from 'react';
import { Modal, Container, Stack, Divider, FormControl, InputLabel, Select, MenuItem, Button, TextField, Alert, Typography, IconButton } from '@mui/material';
import axiosClient from '../util/setupAxios';
import ItemsGrid from '../components/ItemsGrid';
import HomeIcon from '@mui/icons-material/Home';
import {useNavigate} from 'react-router-dom';

const Home = () => {
    const axios = axiosClient();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
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

    const getItems = async () => {  
        try {
            const response = await axios.get('/user/expenses');
            if(response.status !== 200) {
                setError('Failed to get items:', response.data.message);
                return;
            }
            setItems(response.data.expenses??[]);
        } catch (err) {
            console.error('Error getting items:', err);
        }
    }

    const add_expense = async () => {
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
            const response = await axios.post('/expense/add', {
                ...formData,
                amount: parseFloat(formData.amount), // Parse amount before sending
            });
            if(response.status !== 201) {
                setError('Failed to add expense. Please try again.');
                return;
            }
            setSuccessMessage("Expense added successfully")
            modalToggle();
            await getItems();
        } catch (err) {
            console.error('Error adding expense:', err);
            setError('Failed to add expense. Please try again.');
        }
    };

        const delete_expense = async (expense_id) => {
        if (window.confirm("Are you sure you want to delete this expense?")) {
          try {
            const response = await axios.delete(`/expense/delete/${expense_id}`);
      
            if (response.status !== 200) {
              alert(`Failed to delete expense: ${response.data.message}`);
            }

            await getItems(); // Refresh or update the expense list
          } catch (error) {
            setError(error.message); // Set a user-friendly error message using the error object
          }
        }
      };

    const edit_expense = async (expense_obj) => {
        if(!expense_obj){
            console.log("Expense object is missing for the edit function")
            return;
        }
        const {id} = expense_obj
        try {
            const response = await axios.put(`expense/update/${id}`, expense_obj);
            if(response.status !== 200) {
                setError('Failed to edit item:', response.data.message);
                return;
            }
            await getItems();
        }catch(err) {
            setError(err)
        }
    }

    const logOut = async() => {
        try{
            localStorage.clear() // clear everything
            navigate('/')
        }catch(err){
            console.log(err)
        }
    }

    useEffect(() => {
        getItems();
    }, []);

    return (
        <> 
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Stack direction={'column'} spacing={2} marginTop={5}>
            <IconButton variant='outlined' onClick={logOut}>
            <HomeIcon style={{height:40,width:40}}/>
            </IconButton>
            <Typography variant='h3'>Add Expense</Typography>
            <Button variant='outlined'  onClick={modalToggle}>Add +</Button>
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
                            <FormControl fullWidth required> 
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
                            <Button variant="contained" color="success" onClick={add_expense}>
                                Add
                            </Button>
                        </FormControl>
                    </Stack>
                </Container>
            </Modal>
        )}
        <ItemsGrid items={items} handleDelete={delete_expense} handleEdit={edit_expense}/>
        </>
    );
};

export default Home;
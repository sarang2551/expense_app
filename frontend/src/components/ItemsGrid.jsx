import React, { useState } from 'react';
import { Card, CardContent, IconButton, Stack,  Modal, Container, Divider, FormControl, InputLabel, Select, MenuItem, Button, TextField, Alert, Typography  } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const ItemsGrid = ({ items, handleDelete, handleEdit }) => {
    const [modalOpen,setModalOpen] = useState(false);
    const [error,setError] = useState(null);
    const [selectedItem,setSelectedItem] = useState({itemName:"",amount:0,category:"category"});

    const modalToggle = () => setModalOpen(!modalOpen);
    if (!items || items.length === 0) {
        return <Typography variant="body1">No expenses recorded yet.</Typography>;
    }
    const handleChange = (event) => {
        setSelectedItem({ ...selectedItem, [event.target.name]: event.target.value });
    };

    return (
        <>
        <Stack spacing={2} sx={{ width: '65%', margin: '20px auto' }}> {/* Centered stack */}
            {items.map((item) => (
                <Card key={item.id} elevation={3}>
                    <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <Typography variant="h6">{item.itemName}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Category: {item.category}
                            </Typography>
                            <Typography variant="body1">Amount: ${item.amount}</Typography>
                        </div>
                        <div>
                            <IconButton aria-label="edit" onClick={() => {
                                setSelectedItem(item)
                                setModalOpen(true)}}>
                                <EditIcon />
                            </IconButton>
                            <IconButton aria-label="delete" onClick={() => handleDelete(item.id)}>
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </Stack>
                {modalOpen && (
                    <Modal
                        open={modalOpen}
                        onClose={()=> {modalToggle(); setSelectedItem(null);}}
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
                                <FormControl style={{gap: '20px'}}>
                                    <TextField
                                        label="Item Name"
                                        name="itemName"
                                        value={selectedItem.itemName}
                                        onChange={handleChange}
                                        fullWidth
                                        required
                                    />
                                    <TextField
                                        label="Amount"
                                        name="amount"
                                        type="number"
                                        value={selectedItem.amount}
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
                                            value={selectedItem.category}
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
                                    <Button variant="contained" color="success" onClick={async()=>{
                                        await handleEdit(selectedItem);
                                        setModalOpen(false);
                                        }}>
                                        Edit
                                    </Button>
                                </FormControl>
                            </Stack>
                        </Container>
                    </Modal>
                )}
                </>
    );
};

export default ItemsGrid;
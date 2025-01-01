const express = require('express');
const router = express.Router();
const Expense = require('../models/expense');
const User = require("../models/user")
const jwt = require("jsonwebtoken")

router.post('/add', async (req, res) => {
  try {
    const { itemName, amount, category } = req.body;

    // Validate request body
    if (!itemName || !amount || !category) {
      return res.status(400).json({ message: 'Invalid expense data' });
    }
    if(!req.headers.authorization){
      return res.status(401).json({ message: 'Authorization header is missing' });
    }
    const token = req.headers.authorization.split(" ")[1]
    const identity = jwt.verify(token,process.env.JWT_SECRET).userId
    console.log(`Adding expense for user ${identity}`)
    
    const userObj = await User.findById(identity); // Use req.userId from JWT verification

    // Check if user exists
    if (!userObj) {
      return res.status(400).json({ message: 'User not found' });
    }

    const newExpense = new Expense({ item_name:itemName, amount, category, user_id: userObj._id });
    await newExpense.save();

    return res.status(201).json({ message: 'Expense added successfully!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to add expense' });
  }
});

router.delete('/delete/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;

    const expense = await Expense.findByIdAndDelete(expenseId);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to delete expense' });
  }
});

router.put('/update/:expenseId', async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { itemName, amount, category } = req.body;

    // Validate request body
    if (!itemName || !amount || !category) {
      return res.status(400).json({ message: 'Invalid expense data' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { itemName, amount, category },
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.status(200).json({ message: 'Expense updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update expense' });
  }
});

module.exports = router;
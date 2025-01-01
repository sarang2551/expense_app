const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken'); // For generating access tokens
const Expense = require('../models/expense');
const jwtSecret = process.env.JWT_SECRET;

// Function to generate a JWT access token
function generateAccessToken(userId) {
  return jwt.sign({ userId }, jwtSecret, { expiresIn: '1h' }); // Set expiration time appropriately
}

// Route for user login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate request body
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing username or password' });
    }

    // Find user by username
    const user = await User.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const accessToken = generateAccessToken(user._id); // using user id as the identity

    return res.status(200).json({ message: 'Login successful', jwt_token: accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate request body
    if (!username || !password) {
      return res.status(400).json({ message: 'Missing username or password' });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create new user and save it to database
    const newUser = new User({ username, password});
    await newUser.save();

    return res.status(201).json({ message: 'User registration successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/expenses',async(req,res)=>{
  try{
    if(!req.headers.authorization){
      return res.send(401).json({message:"Missing Authorization header"})
    }
    const token = req.headers.authorization.split(" ")[1]
    const user_id = jwt.verify(token,process.env.JWT_SECRET).userId
    const expensesList = await Expense.find({user_id}) // find all documents with the token verified user_id
    if(!expensesList){
      return res.status(500).json({expenses:[]})
    }

    const expenses = expensesList.map((exp)=> {
      return {
      id:exp._id,
      itemName:exp.item_name,
      amount:exp.amount,
      category:exp.category}
    })
    return res.status(200).json({expenses})

  }catch(err){
    console.log(err)
    return res.status(500).json({message:"Internal server error"})
  }
})

module.exports = router;

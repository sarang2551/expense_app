const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const expenseSchema = new Schema({
  item_name: {
    type: String,
    maxlength: 128, // Enforce maximum length
    required:true
  },
  amount: {
    type: Number, // Use Number for numeric values
    required: true, // Enforce that amount is provided
  },
  category: {
    type: String,
    maxlength: 128,
    default: "Other", // Set default value
    required:true
  },
  user_id: {
    type: Schema.Types.ObjectId, // Reference to User model
    required: true, // Enforce that user_id is provided
    ref: 'User', // Specify the model it references
  },
},{timestamps:true});

expenseSchema.methods.toString = function() {
  return `<Expense ${this.item_name} - ${this.amount}>`;
};

// Create the model
const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;
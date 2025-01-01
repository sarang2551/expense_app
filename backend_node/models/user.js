const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// passed object defines the properties of the database model
const userSchema = new Schema({
    username: {
        type: String, 
        required: true,
        unique: true, 
        index: true,  
        maxlength: 64 // Enforces a maximum length of 64 characters
    },
    password: {
        type: String, 
        maxlength: 128 // Enforces a maximum length of 128 characters
    }
},{timestamps:true});

userSchema.methods.toString = function() {
    return `<User ${this.username}>`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
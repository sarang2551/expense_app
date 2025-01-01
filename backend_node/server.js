require('dotenv').config();
const express = require('express')
const userRouter = require('./routes/users')
const expenseRouter = require('./routes/expenses')
const mongoose = require('mongoose')
var { expressjwt: jwt } = require("express-jwt");
const bodyParser = require('body-parser');
const cors = require('cors')

const DATABASE_URI = process.env.DB_CONNECTION_STRING || ""
mongoose.connect(DATABASE_URI).then((result)=>{
    console.log('Db connection successful')
}).catch((err)=>{
    console.log(err)
})

const allowedOrigins = ['http://localhost:3000']

const corsOptions = {
    origin: function (origin, callback) {
        //Check if the origin is in the allowed origins array or if the origin is undefined (for requests like curl or mobile apps).
        if (!origin || allowedOrigins.includes(origin)){
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true, // Important for cookies, authorization headers withCredentials must be set to true on the client side as well.
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
    allowedHeaders: "Content-Type, Authorization", // Allowed headers
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(jwt({secret:process.env.JWT_SECRET,algorithms:["HS256"],getToken:(req)=>{
    if (
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer"
      ) {
        return req.headers.authorization.split(" ")[1];
      } else if (req.query && req.query.token) {
        return req.query.token;
      }
      return null;
}}).unless({path:["/user/login","/user/register"]}))
app.use(bodyParser.json()) // VERY IMPORTANT, express doesn't parse requests to JSON by default
app.use(cors(corsOptions))
app.use('/expense',expenseRouter)
app.use('/user',userRouter)

const port = process.env.PORT || 5000
app.listen(port,()=>{console.log(`Server is listening on port ${port}`)});
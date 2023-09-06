require("dotenv").config()
const express = require('express');
const bodyParser = require('body-parser');
const route = require('./route/routes.js');
const AWS = require('aws-sdk')
const  mongoose = require('mongoose');
const app = express();
const multer= require("multer");
const cors = require("cors");
const path = require("path");

app.use(bodyParser.json());
app.use(cors())

const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "public")));

app.use(bodyParser.urlencoded({ extended: true }));
// app.use( multer().any())

app.get('/', (req,res)=>{
    res.send("hello world")
})


mongoose.connect("mongodb+srv://dumpingdata:DumpingData98@cluster0.1lj4fxy.mongodb.net/dumpingdata", {
    useNewUrlParser: true
}) 
.then( () => console.log("MongoDb is connected"))
.catch ( err => console.log(err) )


app.use('/api', route);

app.listen(process.env.PORT || 9000, function () {
    console.log('Express app running on port ' + (process.env.PORT || 9000))
});
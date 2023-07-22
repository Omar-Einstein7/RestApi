const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");

const productroutes  = require("./api/routes/products");
const productroutes2  = require("./api/routes/products2");
const productroutes3  = require("./api/routes/products3");
const productroutes4  = require("./api/routes/products4");
const productroutes5  = require("./api/routes/products5");
const Orederroutes  = require("./api/routes/orders");
const Userroutes  = require("./api/routes/user");


mongoose.connect(
    "mongodb+srv://omarahmed:xfW6ZmdvgbHZORo4@codemapdb.hwbdf6r.mongodb.net/?retryWrites=true&w=majority")  ;



mongoose.Promise = global.Promise

app.use(morgan("dev"));
app.use("/uploads",express.static("uploads"))
app.use(bodyparser.urlencoded({extended: false}))
app.use(bodyparser.json());

app.use((req , res , next)=>{
    res.header("Access-Control-Allow-Origin" , "*");
    res.header("Access-Control-Allow-Headers" , "Origin , X-Requested-With , Content-Type , Accept , Authorization");
    if(req.method === "OPTIONS"){
        res.header("Access-Control-Allow-Methods" , "PUT, PATCH, nPOST, DELETE, GET");
        return res.status(200).json({});
    }
    next();
})

app.use("/product" , productroutes);
app.use("/product2" , productroutes2);
app.use("/product3" , productroutes3);
app.use("/product4" , productroutes4);
app.use("/product5" , productroutes5);
app.use("/order" , Orederroutes);
app.use("/user" , Userroutes);

app.use((req ,res , next)=>{
    const error = new Error("not found");
    error.status = 404;
    next(error);

})

app.use((error,req ,res , next)=>{
    res.status(error.status || 500);
    res.json({
        error:{
            message: error.message
        }
    })

})

module.exports = app ;
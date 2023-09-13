const mongoose = require("mongoose");
mongoose.connect("mongodb+srv://neslanes0524:floris00@floris.x5duodb.mongodb.net/floris?retryWrites=true&w=majority", {
  
}).then(() => {
  console.log("db connected");
});

const express = require("express");
const app = express();
const dotenv = require("dotenv");
app.set("view engine", "ejs");
//environment variables
dotenv.config({ path: "./.env" });

app.use(express.static(__dirname + "/public/floris"));
// app.use(express.static(__dirname+'/public/style'))
// app.use(express.static(__dirname+'/public/admin'))
app.use(express.static(__dirname + "/public/images"));
app.use(express.static("public"));

//for user route
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

//for Admin route
const adminRoute = require("./routes/adminRoute");
app.use("/", adminRoute);

app.listen(process.env.PORT, () => {
  console.log(
    `server starterd working on the port http://localhost:${process.env.PORT}`,
  );
});

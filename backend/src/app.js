const express = require("express");

const authRoutes = require('./routes/authRoutes');

const cookieParser = require("cookie-parser");

const globalErrorHandler = require("./middlewares/globalErrorHandler");

const app = express();

app.use(cookieParser());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);


module.exports = app;
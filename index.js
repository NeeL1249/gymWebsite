const express = require('express')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const defaultRoutes = require('./routes/default.routes')
const adminRoutes = require('./routes/admin.routes')
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api", defaultRoutes)
app.use("/api/admin", adminRoutes)

app.listen(3000, () => {
  console.log("Server is Running");
});

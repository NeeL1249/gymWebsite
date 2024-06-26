const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const defaultRoutes = require('./routes/default.routes')
const adminRoutes = require('./routes/admin.routes')
const authRoutes = require('./routes/auth.routes')
const { authLimiter } = require('./middlewares/auth.middleware')
const path = require('path')
require('dotenv').config();

const _dirname = path.resolve();
const buildpath = path.resolve(_dirname, '../Frontend', 'dist')

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.log('MongoDB connection error:', err));

const app = express();

app.use(express.static(buildpath))
app.use(cors({"origin": "*"}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(authLimiter)
app.use("/api/auth", authRoutes)
app.use("/api", defaultRoutes)
app.use("/api/admin", adminRoutes)


app.listen(3000, () => {
  console.log("Server is Running");
});

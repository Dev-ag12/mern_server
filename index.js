const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

const corsOptions = {
    origin: 'https://mern-client-6fcb.vercel.app', // Frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  };
  
  // Middleware
  app.use(express.json());
  app.use(cors(corsOptions));

app.use('/api/companies', require('./routes/UserRoute'));
app.use('/api/jobs', require('./routes/JobRoutes'));

// Define Routes
// app.use('/api/users', require('./routes/users'));
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/applications', require('./routes/applications'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
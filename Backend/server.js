const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. IMPORT THE AUTH ROUTES FILE
const authRoutes = require('./routes/auth'); 

const documentRoutes = require('./routes/documents');

const app = express();
const port = 3001;


app.use(cors());
app.use(express.json()); // Essential for parsing login/register data
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/documents', documentRoutes);

// 2. MOUNT THE AUTH ROUTES TO THE /api/auth PATH
app.use('/api/auth', authRoutes); 


app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
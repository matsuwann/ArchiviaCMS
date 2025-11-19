const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth'); 
const documentRoutes = require('./routes/documents');
const adminRoutes = require('./routes/admin'); 
const settingsRoutes = require('./routes/settings'); 
const app = express();
const port = process.env.PORT || 3001; // Render uses a dynamic port

// Allow requests from your Frontend Render URL and Localhost
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://archivia-frontend.onrender.com' // REPLACE THIS with your actual Render Frontend URL after deploying
  ]
}));

app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/settings', settingsRoutes); 

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
if (!process.env.JWT_SECRET || !process.env.DATABASE_URL) {
  console.error("FATAL ERROR: Missing required environment variables.");
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth'); 
const documentRoutes = require('./routes/documents');
const adminRoutes = require('./routes/admin'); 
const settingsRoutes = require('./routes/settings'); 
// IMPORT MODEL
const documentModel = require('./models/documentModel'); 

const app = express();
const port = process.env.PORT || 3001; 

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://archivia-frontend.vercel.app' 
    // Make sure this matches your Vercel URL exactly (no trailing slash)
  ],
  credentials: true // <--- ADD THIS LINE
}));

app.use(express.json()); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/documents', documentRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/admin', adminRoutes); 
app.use('/api/settings', settingsRoutes); 
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

app.listen(port, async () => {
  console.log(`Backend server running on port ${port}`);
  
  // === RUN AUTO-ARCHIVE CHECK ON STARTUP ===
  await documentModel.autoArchiveOldDocuments();
});
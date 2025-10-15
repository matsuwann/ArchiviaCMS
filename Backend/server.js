
const express = require('express');
const cors = require('cors');
const path = require('path');


const documentRoutes = require('./routes/documents');

const app = express();
const port = 3001;


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/documents', documentRoutes);


app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
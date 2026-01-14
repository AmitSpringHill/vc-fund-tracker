const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const fundRoutes = require('./routes/fundRoutes');
const quarterRoutes = require('./routes/quarterRoutes');
const investmentRoutes = require('./routes/investmentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'VC Fund Tracker API is running' });
});

app.use('/api/funds', fundRoutes);
app.use('/api/quarters', quarterRoutes);
app.use('/api/investments', investmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/upload', uploadRoutes);

app.use(errorHandler);

module.exports = app;

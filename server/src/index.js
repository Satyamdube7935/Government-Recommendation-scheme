require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const schemeRoutes = require('./routes/schemeRoutes');
const recommendRoutes = require('./routes/recommendRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Scheme Recommender API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/recommend', recommendRoutes);

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

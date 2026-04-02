const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// 1. Middleware
// Restricting CORS to your local dev environment and your future Vercel URL
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://food-delivery-app-smoky-sigma.vercel.app" 
    ],
    credentials: true
}));
app.use(express.json());

// 2. Import Routes
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

// 3. Define API Routes
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// 4. MongoDB Connection
// Ensuring we don't even try to connect if the URI is missing
if (!process.env.MONGODB_URI) {
    console.error("❌ ERROR: MONGODB_URI is not defined in .env file");
    process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// 5. Default & Health Check Route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Food Ordering Server is Running', status: 'Healthy' });
});

// 6. Global Error Handling Middleware
// This keeps your server from crashing and sends clean JSON back to the frontend
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: "Something went wrong on the server!",
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 7. Start Server
app.listen(port, () => {
    console.log(`🚀 Server is flying on port: ${port}`);
});
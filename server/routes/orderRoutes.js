const express = require('express');
const router = express.Router();
const Order = require('../models/Order');


// This matches POST http://localhost:5000/api/orders/create-order
router.post('/create-order', async (req, res) => {
    try {
        const { email, items, totalAmount } = req.body;
        const newOrder = new Order({ email, items, totalAmount });
        await newOrder.save();
        res.status(201).json({ message: "Order placed successfully!", orderId: newOrder._id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// server/routes/orderRoutes.js

// Fetch all orders for the Admin Dashboard
router.get('/all-orders', async (req, res) => {
    try {
        // Fetch orders and sort by newest first
        const orders = await Order.find().sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Optional: Route to update order status (Pending -> Delivered)
router.patch('/update-status/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// a backend route to fetch orders by email.
router.get('/my-orders', async (req, res) => {
    try {
        const { email } = req.query;
        const orders = await Order.find({ email }).sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
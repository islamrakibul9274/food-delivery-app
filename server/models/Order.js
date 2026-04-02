const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    email: { type: String, required: true },
    items: [
        {
            name: String,
            quantity: Number,
            price: Number,
            image: String
        }
    ],
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'pending' }, // pending, confirmed, delivered
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
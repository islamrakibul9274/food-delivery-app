const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    category: { 
        type: String, 
        required: true, 
        enum: ['Burger', 'Pizza', 'Pasta', 'Dessert', 'Drink'] 
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
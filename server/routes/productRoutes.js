const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// POST: Add a new product (Admin Function)
router.post('/add-product', async (req, res) => {
    try {
        const { name, weight, price, image, category } = req.body;
        
        const newProduct = new Product({
            name,
            weight,
            price,
            image,
            category
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (error) {
        res.status(400).json({ message: "Error adding product", error: error.message });
    }
});

// GET: Fetch all products (For your MenuGrid)
router.get('/', async (req, res) => {
    try {
        const products = await Product.find(); // Fetches everything from MongoDB
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// server/routes/productRoutes.js

// 1. Delete a product by ID
router.delete('/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Update product details (Price, Name, etc.)
router.put('/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true }
        );
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
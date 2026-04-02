import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Initialize state from localStorage if it exists
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('food-cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });
    
    // Save to localStorage every time the cart changes
    useEffect(() => {
        localStorage.setItem('food-cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity) => {
        setCart((prevCart) => {
            const existingItem = prevCart.find(item => item._id === product._id);
            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                // If quantity becomes 0, remove the item
                if (newQuantity <= 0) {
                    return prevCart.filter(item => item._id !== product._id);
                }
                return prevCart.map(item =>
                    item._id === product._id ? { ...item, quantity: newQuantity } : item
                );
            }
            return [...prevCart, { ...product, quantity }];
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    // Calculate total items for the Navbar icon
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, totalItems, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
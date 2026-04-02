import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import axiosPublic from '../api/axiosPublic';
import { FaTrash, FaShoppingCart, FaArrowRight } from 'react-icons/fa'; // Added extra icons for polish

const CartPage = () => {
    const { cart, addToCart, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isOrdering, setIsOrdering] = useState(false); // New state to show loading during checkout

    // 1. Fetch user info on mount to know who is ordering
    useEffect(() => {
        const savedUser = localStorage.getItem('user-info');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = cart.length > 0 ? 2.00 : 0;
    const total = subtotal + deliveryFee;

    // Polished Empty State
    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
                <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <FaShoppingCart className="text-red-500 text-6xl opacity-50" />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Your cart is hungry!</h2>
                <p className="text-gray-500 mb-8 max-w-md">Looks like you haven't added anything to your cart yet. Browse our menu to find your next favorite meal.</p>
                <Link to="/" className="btn flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-none rounded-full px-8 py-3 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                    Explore Menu <FaArrowRight size={14} />
                </Link>
            </div>
        );
    }

    const handleOrder = async () => {
        if (!user) {
            alert("Please login to place an order!");
            return navigate('/login');
        }

        setIsOrdering(true); // Disable button to prevent double-clicks

        const orderData = {
            email: user.email,
            items: cart,
            totalAmount: total 
        };

        try {
            const response = await axiosPublic.post('/orders/create-order', orderData);
            if (response.status === 201) {
                alert("Order Placed! Check your MongoDB.");
                clearCart(); 
                navigate('/my-orders'); // Redirect to their orders instead of just the homepage
            }
        } catch (error) {
            console.error("Order failed:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsOrdering(false);
        }
    };

    return (
        <div className="max-w-[1140px] mx-auto my-12 px-4 sm:px-6 flex flex-col lg:flex-row gap-8 lg:gap-12 relative">
            
            {/* Left: Item List */}
            <div className="flex-1">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
                    <h2 className="text-3xl font-extrabold text-gray-900">Shopping Cart</h2>
                    <span className="bg-red-100 text-red-600 font-bold px-3 py-1 rounded-full text-sm">
                        {cart.length} {cart.length === 1 ? 'Item' : 'Items'}
                    </span>
                </div>

                <div className="space-y-6">
                    {cart.map((item) => (
                        <div key={item._id} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 bg-white p-5 rounded-[2rem] shadow-sm hover:shadow-md border border-gray-50 transition-shadow group">
                            
                            {/* Image & Basic Info */}
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-2xl flex items-center justify-center shrink-0 p-2">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-lg text-gray-900 line-clamp-1">{item.name}</h3>
                                    <p className="text-gray-400 text-sm font-medium mt-1">${item.price.toFixed(2)} / each</p>
                                </div>
                            </div>

                            {/* Mobile Divider */}
                            <hr className="sm:hidden border-gray-100 my-2" />

                            {/* Controls & Price Row */}
                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto">
                                
                                {/* Plus/Minus Counter */}
                                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-full px-4 py-1.5">
                                    <button onClick={() => addToCart(item, -1)} className="font-black text-gray-400 hover:text-red-600 p-1 transition-colors">-</button>
                                    <span className="text-sm font-bold w-6 text-center text-gray-800">{item.quantity}</span>
                                    <button onClick={() => addToCart(item, 1)} className="font-black text-gray-400 hover:text-red-600 p-1 transition-colors">+</button>
                                </div>

                                {/* Total Price */}
                                <p className="font-black text-xl text-gray-900 w-20 text-right">
                                    ${(item.price * item.quantity).toFixed(2)}
                                </p>

                                {/* The Missing Trash Can! */}
                                <button 
                                    onClick={() => removeFromCart(item._id)} 
                                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 p-2.5 rounded-full transition-all"
                                    title="Remove item"
                                >
                                    <FaTrash size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Summary Card (Sticky) */}
            <div className="w-full lg:w-[380px] shrink-0">
                {/* sticky top-32 makes the summary box follow you down the page if you have a lot of items */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/40 border border-gray-100 sticky top-32">
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-6">Order Summary</h3>
                    
                    <div className="space-y-4 border-b border-dashed border-gray-200 pb-6 text-sm font-medium text-gray-600">
                        <div className="flex justify-between items-center">
                            <span>Subtotal</span>
                            <span className="text-gray-900 text-base font-bold">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span>Delivery Fee</span>
                            <span className="text-gray-900 text-base font-bold">${deliveryFee.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-end pt-6 mb-8">
                        <span className="font-bold text-gray-600">Total</span>
                        <div className="text-right">
                            <p className="text-xs text-gray-400 font-medium mb-1">Including VAT</p>
                            <span className="text-3xl font-black text-red-600">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleOrder} 
                        disabled={isOrdering}
                        className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-bold rounded-full py-4 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                    >
                        {isOrdering ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                            <>Proceed to Checkout <FaArrowRight size={14}/></>
                        )}
                    </button>
                    
                    {/* Trust Badges */}
                    <p className="text-center text-xs text-gray-400 mt-6 font-medium flex items-center justify-center gap-1">
                        🔒 Secure checkout process
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
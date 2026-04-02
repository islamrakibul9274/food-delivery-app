import React, { useEffect, useState } from 'react';
import axiosPublic from '../api/axiosPublic';
import { FaBoxOpen, FaChevronDown, FaClock, FaCheckCircle, FaReceipt } from 'react-icons/fa';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState(null); // Track which order is clicked

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user-info'));
        if (savedUser?.email) {
            const fetchMyOrders = async () => {
                try {
                    const res = await axiosPublic.get(`/orders/my-orders?email=${savedUser.email}`);
                    // Sort orders by newest first
                    const sortedOrders = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    setOrders(sortedOrders);
                    setLoading(false);
                } catch (err) {
                    console.error("Error fetching your orders:", err);
                    setLoading(false);
                }
            };
            fetchMyOrders();
        } else {
            setLoading(false); // Stop loading if no user
        }
    }, []);

    const toggleOrder = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null); // Close if already open
        } else {
            setExpandedOrder(orderId); // Open new one
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <span className="loading loading-spinner loading-lg text-red-600"></span>
        </div>
    );

    return (
        <div className="max-w-[1140px] mx-auto my-12 px-4 sm:px-6 min-h-[60vh]">
            
            <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                    <FaReceipt size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900">My Order History</h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">Track and review your past purchases</p>
                </div>
            </div>
            
            {orders.length === 0 ? (
                <div className="bg-gray-50 rounded-[2.5rem] flex flex-col items-center justify-center py-20 text-center border border-gray-100">
                    <FaBoxOpen className="text-6xl text-gray-300 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h3>
                    <p className="text-gray-500 max-w-sm mb-6">Looks like you haven't placed any orders. Head over to the menu to satisfy your cravings!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => {
                        const isExpanded = expandedOrder === order._id;
                        
                        return (
                            <div key={order._id} className="bg-white rounded-[2rem] shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300 overflow-hidden group">
                                
                                {/* Order Header (Always Visible) */}
                                <div 
                                    onClick={() => toggleOrder(order._id)}
                                    className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 cursor-pointer"
                                >
                                    <div className="flex-1 w-full">
                                        <div className="flex items-center justify-between sm:justify-start gap-4 mb-2">
                                            <p className="text-xs text-gray-400 font-mono bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                                                ID: {order._id.substring(0, 8).toUpperCase()}
                                            </p>
                                            <span className={`sm:hidden px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        
                                        <h4 className="font-extrabold text-lg text-gray-900">
                                            {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'} Ordered
                                        </h4>
                                        <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-1">
                                            <FaClock className="text-gray-400" />
                                            {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 border-t border-gray-50 sm:border-0 pt-4 sm:pt-0">
                                        <div className="text-left sm:text-right">
                                            <p className="text-xs text-gray-400 font-medium mb-1">Total Amount</p>
                                            <span className="font-black text-red-600 text-2xl">
                                                ${order.totalAmount.toFixed(2)}
                                            </span>
                                        </div>

                                        <div className="hidden sm:flex flex-col items-end">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {order.status === 'delivered' ? <span className="flex items-center gap-1.5"><FaCheckCircle/> Delivered</span> : 'Processing'}
                                            </span>
                                        </div>

                                        <button className={`p-3 rounded-full bg-gray-50 text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180 bg-red-50 text-red-500' : 'group-hover:bg-red-50 group-hover:text-red-500'}`}>
                                            <FaChevronDown />
                                        </button>
                                    </div>
                                </div>

                                {/* Order Details Dropdown (Accordion) */}
                                <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                    <div className="p-6 sm:p-8 bg-gray-50 border-t border-gray-100">
                                        <h5 className="font-bold text-sm text-gray-900 uppercase tracking-widest mb-4">Order Items</h5>
                                        
                                        <div className="space-y-4">
                                            {order.items.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center p-1">
                                                            <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm sm:text-base">{item.name}</p>
                                                            <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                                                        </div>
                                                    </div>
                                                    <p className="font-bold text-gray-900">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default MyOrders;
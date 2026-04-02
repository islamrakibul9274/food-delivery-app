import React, { useEffect, useState } from 'react';
import axiosPublic from '../../api/axiosPublic';
import { FaSearch, FaFilter, FaUser, FaShoppingBag, FaCheck, FaTruck } from 'react-icons/fa';

const ManageOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await axiosPublic.get('/orders/all-orders');
                // Sort by newest first so the admin sees the latest work
                const sortedData = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setOrders(sortedData);
                setFilteredOrders(sortedData);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching orders:", err);
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    // Enhancement: Search logic
    useEffect(() => {
        const results = orders.filter(order =>
            order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order._id.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredOrders(results);
    }, [searchTerm, orders]);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axiosPublic.patch(`/orders/update-status/${id}`, { status: newStatus });
            setOrders(orders.map(order => 
                order._id === id ? { ...order, status: newStatus } : order
            ));
        } catch (err) {
            console.error("Failed to update status");
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <span className="loading loading-spinner loading-lg text-red-600"></span>
        </div>
    );

    return (
        <div className="max-w-[1140px] mx-auto my-8 px-4 sm:px-6">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                
                {/* Header & Search Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Customer Orders</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Manage and track all incoming requests</p>
                    </div>

                    <div className="relative w-full md:w-72">
                        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search by email or ID..." 
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* 1. Desktop Table View (Hidden on mobile) */}
                <div className="hidden md:block overflow-hidden">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <th className="pb-4 px-6">Order</th>
                                <th className="pb-4 px-6">Customer</th>
                                <th className="pb-4 px-6">Total</th>
                                <th className="pb-4 px-6">Status</th>
                                <th className="pb-4 px-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="group bg-white hover:bg-gray-50 transition-all">
                                    <td className="py-5 px-6 rounded-l-2xl border-y border-l border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2.5 bg-red-50 text-red-500 rounded-xl">
                                                <FaShoppingBag size={14} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 text-sm">#{order._id.substring(0, 8).toUpperCase()}</p>
                                                <p className="text-[10px] text-gray-400 font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 border-y border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <FaUser className="text-gray-300 text-xs" />
                                            <span className="font-medium text-gray-700 text-sm">{order.email}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6 border-y border-gray-50">
                                        <span className="font-black text-gray-900">${order.totalAmount.toFixed(2)}</span>
                                    </td>
                                    <td className="py-5 px-6 border-y border-gray-50">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                                            order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6 rounded-r-2xl border-y border-r border-gray-50 text-right">
                                        {order.status !== 'delivered' ? (
                                            <button 
                                                onClick={() => handleStatusChange(order._id, 'delivered')}
                                                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-all shadow-md shadow-red-200 active:scale-95"
                                            >
                                                Mark Delivered
                                            </button>
                                        ) : (
                                            <span className="text-green-500 flex items-center justify-end gap-1 text-xs font-bold">
                                                <FaCheck /> Done
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* 2. Mobile Card View (Hidden on desktop) */}
                <div className="md:hidden space-y-4">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                                        <FaShoppingBag size={12} />
                                    </div>
                                    <div>
                                        <p className="font-black text-gray-900 text-sm">#{order._id.substring(0, 8).toUpperCase()}</p>
                                        <p className="text-[10px] text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                                    order.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                }`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600">
                                <FaUser size={12} className="text-gray-400" />
                                <span className="text-xs font-medium truncate">{order.email}</span>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                                <p className="font-black text-gray-900 text-lg">${order.totalAmount.toFixed(2)}</p>
                                {order.status !== 'delivered' && (
                                    <button 
                                        onClick={() => handleStatusChange(order._id, 'delivered')}
                                        className="bg-red-600 text-white text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg"
                                    >
                                        <FaTruck /> MARK DELIVERED
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredOrders.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 font-medium">No orders found for your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageOrders;
import React, { useEffect, useState } from 'react';
import axiosPublic from '../../api/axiosPublic';
import { FaDollarSign, FaUtensils, FaShoppingBag, FaChartLine, FaPlus, FaEye } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const AdminHome = () => {
    const [stats, setStats] = useState({
        revenue: 0,
        orders: 0,
        products: 0,
        avgOrder: 0
    });
    const [loading, setLoading] = useState(true);
    const [adminName, setAdminName] = useState("Admin");

    useEffect(() => {
        const savedUser = JSON.parse(localStorage.getItem('user-info'));
        if (savedUser?.name) setAdminName(savedUser.name.split(' ')[0]);

        const fetchStats = async () => {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    axiosPublic.get('/orders/all-orders'),
                    axiosPublic.get('/products')
                ]);

                const orders = ordersRes.data;
                const products = productsRes.data;
                const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);

                setStats({
                    revenue: totalRevenue,
                    orders: orders.length,
                    products: products.length,
                    avgOrder: orders.length > 0 ? (totalRevenue / orders.length) : 0
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching dashboard stats:", err);
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-[400px]">
            <span className="loading loading-spinner loading-lg text-red-600"></span>
        </div>
    );

    return (
        <div className="max-w-[1140px] mx-auto my-8 px-4 sm:px-6">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                <div>
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                        Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 capitalize">{adminName}!</span>
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1 italic">Here's what's happening with your restaurant today.</p>
                </div>
                <div className="text-xs font-bold bg-gray-100 px-4 py-2 rounded-full text-gray-500 uppercase tracking-widest">
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                
                {/* Revenue Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                        <h3 className="text-3xl font-black text-gray-900">${stats.revenue.toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
                        <p className="text-green-500 text-[10px] font-bold mt-2 flex items-center gap-1">
                            <FaChartLine /> +12.5% from last month
                        </p>
                    </div>
                    <div className="bg-red-50 text-red-500 p-4 rounded-3xl group-hover:bg-red-600 group-hover:text-white transition-colors duration-500">
                        <FaDollarSign size={28} />
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 flex items-center justify-between group hover:-translate-y-1 transition-all duration-300">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Orders</p>
                        <h3 className="text-3xl font-black text-gray-900">{stats.orders}</h3>
                        <p className="text-gray-400 text-[10px] font-medium mt-2">Active customer requests</p>
                    </div>
                    <div className="bg-orange-50 text-orange-500 p-4 rounded-3xl group-hover:bg-orange-500 group-hover:text-white transition-colors duration-500">
                        <FaShoppingBag size={28} />
                    </div>
                </div>

                {/* Products Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-50 flex items-center justify-between group hover:-translate-y-1 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                    <div>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Menu Items</p>
                        <h3 className="text-3xl font-black text-gray-900">{stats.products}</h3>
                        <p className="text-gray-400 text-[10px] font-medium mt-2">Live in your inventory</p>
                    </div>
                    <div className="bg-gray-50 text-gray-500 p-4 rounded-3xl group-hover:bg-gray-900 group-hover:text-white transition-colors duration-500">
                        <FaUtensils size={28} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Insights Card */}
                <div className="p-8 md:p-10 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-[3rem] shadow-2xl relative overflow-hidden">
                    {/* Decorative Background Icon */}
                    <FaChartLine className="absolute -bottom-10 -right-10 text-[200px] text-white/5 rotate-12" />
                    
                    <h4 className="text-2xl font-extrabold mb-4 relative z-10">Business Insights 📈</h4>
                    <p className="text-slate-400 text-base leading-relaxed mb-8 relative z-10">
                        Your current average order value is <span className="text-white font-bold underline decoration-red-500 underline-offset-4">${stats.avgOrder.toFixed(2)}</span>. 
                        Users are engaging well with the menu! To boost this, consider adding more "Dessert" bundles.
                    </p>
                    
                    <div className="flex flex-wrap gap-4 relative z-10">
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Target</p>
                            <p className="text-lg font-bold">84%</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Order Growth</p>
                            <p className="text-lg font-bold">+5.2%</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Section */}
                <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 border border-gray-100">
                    <h4 className="text-xl font-extrabold text-gray-900 mb-6">Quick Actions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link to="/admin/add-item" className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-all group">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-red-600 group-hover:text-white transition-colors">
                                <FaPlus />
                            </div>
                            <span className="font-bold text-sm">Add New Food</span>
                        </Link>
                        <Link to="/admin/orders" className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl hover:bg-orange-50 hover:text-orange-600 transition-all group">
                            <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-orange-500 group-hover:text-white transition-colors">
                                <FaEye />
                            </div>
                            <span className="font-bold text-sm">Review Orders</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHome;
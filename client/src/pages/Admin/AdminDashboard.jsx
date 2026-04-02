import React, { useState } from 'react';
import { Link, Outlet, useLocation } from "react-router-dom";
import { FaPlusCircle, FaListUl, FaShoppingBasket, FaArrowLeft, FaBars, FaTimes, FaChartPie } from "react-icons/fa";

const AdminDashboard = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation(); // To highlight the active link

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    // Helper to see if a link is active
    const isActive = (path) => location.pathname === path;

    const navItems = [
        { name: 'Dashboard', path: '/admin', icon: <FaChartPie /> },
        { name: 'Add New Item', path: '/admin/add-item', icon: <FaPlusCircle /> },
        { name: 'Manage Menu', path: '/admin/manage-items', icon: <FaListUl /> },
        { name: 'View Orders', path: '/admin/orders', icon: <FaShoppingBasket /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            
            {/* Mobile Hamburger Button */}
            <button 
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-[100] p-3 bg-red-600 text-white rounded-2xl shadow-lg shadow-red-200 active:scale-95 transition-all"
            >
                {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            {/* Sidebar Overlay (Mobile only) */}
            {isSidebarOpen && (
                <div 
                    onClick={toggleSidebar}
                    className="lg:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[80] transition-opacity"
                ></div>
            )}

            {/* Sidebar Wrapper */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-[90]
                w-72 bg-white border-r border-gray-100 shadow-2xl lg:shadow-none
                transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
                transition-transform duration-300 ease-in-out
                flex flex-col
            `}>
                
                {/* Sidebar Header */}
                <div className="p-8">
                    <Link to="/admin" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-red-200 group-hover:rotate-12 transition-transform">
                            <span className="font-black text-xl italic">F</span>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tighter italic">
                            ADMIN<span className="text-red-600">CORE</span>
                        </h2>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                    <p className="px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Main Menu</p>
                    
                    {navItems.map((item) => (
                        <Link 
                            key={item.path}
                            to={item.path} 
                            onClick={() => setIsSidebarOpen(false)}
                            className={`
                                flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all group
                                ${isActive(item.path) 
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-200' 
                                    : 'text-gray-500 hover:bg-red-50 hover:text-red-600'}
                            `}
                        >
                            <span className={`text-lg ${isActive(item.path) ? 'text-white' : 'text-gray-400 group-hover:text-red-500'}`}>
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-6 border-t border-gray-50">
                    <Link 
                        to="/" 
                        className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-400 hover:text-red-600 transition-colors"
                    >
                        <FaArrowLeft size={14} />
                        Back to Shop
                    </Link>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                
                {/* Top Header Bar (Desktop Only) */}
                <header className="hidden lg:flex h-20 bg-white border-b border-gray-100 items-center justify-between px-10 shrink-0">
                    <div className="text-sm font-medium text-gray-400">
                        Pages / <span className="text-gray-900 font-bold capitalize">
                            {location.pathname.split('/').pop() || 'Dashboard'}
                        </span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">
                             <FaChartPie />
                        </div>
                    </div>
                </header>

                {/* Content Outlet */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
                    <div className="max-w-6xl mx-auto">
                        <Outlet /> 
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
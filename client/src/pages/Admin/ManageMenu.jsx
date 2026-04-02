import React, { useEffect, useState } from 'react';
import axiosPublic from '../../api/axiosPublic';
import { FaTrash, FaEdit, FaSearch, FaPlus, FaBox, FaTimes } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ManageMenu = () => {
    const [isEditing, setIsEditing] = useState(null);
    const [editData, setEditData] = useState({});
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await axiosPublic.get('/products');
                setProducts(res.data);
                setFilteredProducts(res.data);
            } catch (err) {
                console.error("Failed to fetch products", err);
            }
        };
        fetchProducts();
    }, []);

    // Filter logic for the search bar
    useEffect(() => {
        const results = products.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchTerm, products]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this delicious item?")) {
            try {
                await axiosPublic.delete(`/products/${id}`);
                setProducts(products.filter(p => p._id !== id));
            } catch (err) {
                console.error("Delete failed");
            }
        }
    };

    const openEditModal = (item) => {
        setIsEditing(item._id);
        setEditData(item);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosPublic.put(`/products/${isEditing}`, editData);
            if (res.status === 200) {
                setProducts(products.map(p => p._id === isEditing ? res.data : p));
                setIsEditing(null);
                alert("Product updated successfully!");
            }
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    return (
        <div className="max-w-[1140px] mx-auto my-8 px-4 sm:px-6">
            <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Menu Inventory</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Add, update, or remove items from your store</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                        <div className="relative w-full sm:w-64">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search food..."
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Link to="/admin/add-item">

                            {/* Add Product Button (UI Placeholder) */}
                            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 text-sm">
                                <FaPlus /> Add New
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Desktop View: Table (Hidden on Mobile) */}
                <div className="hidden md:block overflow-hidden">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                            <tr className="text-gray-400 text-xs font-bold uppercase tracking-widest">
                                <th className="pb-2 px-6">Food Item</th>
                                <th className="pb-2 px-6">Category</th>
                                <th className="pb-2 px-6">Price</th>
                                <th className="pb-2 px-6 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map((item) => (
                                <tr key={item._id} className="bg-white hover:bg-gray-50 transition-all border border-gray-100 rounded-2xl">
                                    <td className="py-4 px-6 rounded-l-2xl border-y border-l border-gray-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center p-2 border border-gray-100">
                                                <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                                            </div>
                                            <span className="font-bold text-gray-900">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 border-y border-gray-100 text-sm font-medium text-gray-500">
                                        <span className="bg-gray-100 px-3 py-1 rounded-full">{item.category}</span>
                                    </td>
                                    <td className="py-4 px-6 border-y border-gray-100 font-black text-gray-900">
                                        ${item.price.toFixed(2)}
                                    </td>
                                    <td className="py-4 px-6 rounded-r-2xl border-y border-r border-gray-100">
                                        <div className="flex justify-center gap-3">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item._id)}
                                                className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View: Cards (Hidden on Desktop) */}
                <div className="md:hidden grid grid-cols-1 gap-4">
                    {filteredProducts.map((item) => (
                        <div key={item._id} className="p-5 bg-gray-50 rounded-3xl border border-gray-100 flex items-center gap-4 group">
                            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center p-2 border border-gray-200 shrink-0">
                                <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                                <p className="text-xs text-gray-500 font-medium mb-2">{item.category} • {item.weight || 'Standard'}</p>
                                <p className="font-black text-red-600">${item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => openEditModal(item)} className="p-3 bg-white text-blue-500 rounded-xl shadow-sm"><FaEdit /></button>
                                <button onClick={() => handleDelete(item._id)} className="p-3 bg-white text-red-500 rounded-xl shadow-sm"><FaTrash /></button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 text-gray-400 font-medium">
                        <FaBox className="mx-auto text-4xl mb-4 opacity-20" />
                        No items found.
                    </div>
                )}
            </div>

            {/* Edit Modal: Now with Glassmorphism and better inputs */}
            {isEditing && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-fadeIn">
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl relative">
                        <button
                            onClick={() => setIsEditing(null)}
                            className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 transition-colors"
                        >
                            <FaTimes size={20} />
                        </button>

                        <div className="mb-8">
                            <h3 className="text-2xl font-extrabold text-gray-900">Edit Product</h3>
                            <p className="text-gray-500 text-sm font-medium">Update pricing and specifications</p>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Item Name</label>
                                <input
                                    disabled
                                    className="w-full bg-gray-100 border-none rounded-xl p-3.5 text-gray-500 font-medium cursor-not-allowed"
                                    value={editData.name}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Price ($)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all font-bold"
                                        value={editData.price}
                                        onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Weight/Size</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 250g"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3.5 focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all"
                                        value={editData.weight}
                                        onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95">
                                    Save Changes
                                </button>
                                <button type="button" onClick={() => setIsEditing(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-all">
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageMenu;
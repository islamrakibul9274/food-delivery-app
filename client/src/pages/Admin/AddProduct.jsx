import React, { useState } from 'react';
import axiosPublic from '../../api/axiosPublic';
import { FaCloudUploadAlt, FaUtensils, FaWeightHanging, FaTag, FaDollarSign, FaPlusCircle, FaCheckCircle } from 'react-icons/fa';

const AddProduct = () => {
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState(""); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const url = `https://api.imgbb.com/1/upload?key=beb67fd8b573fc739cbc277a903dc4cc`;
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                setImageUrl(result.data.url);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            alert("Image upload failed. Check your connection.");
        } finally {
            setUploading(false);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!imageUrl) return alert("Please upload an image first!");

        setIsSubmitting(true);
        const form = e.target;

        const newItem = {
            name: form.name.value,
            weight: form.weight.value,
            price: parseFloat(form.price.value),
            image: imageUrl,
            category: form.category.value
        };

        try {
            const res = await axiosPublic.post('/products/add-product', newItem);
            if (res.status === 201) {
                alert(`${newItem.name} added to the menu!`);
                form.reset();
                setImageUrl(""); 
            }
        } catch (err) {
            console.error(err);
            alert("Failed to add item. Check if your server is running.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto my-8 px-4">
            {/* Main Card */}
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 animate-fadeIn">
                
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-sm">
                        <FaPlusCircle size={24} />
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Add New Item</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Populate your menu with delicious new entries</p>
                    </div>
                </div>

                <form onSubmit={handleAddItem} className="space-y-8">
                    
                    {/* Top Row: Name & Category */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-1">
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <FaUtensils className="text-gray-400" /> Product Name
                            </label>
                            <input 
                                name="name" 
                                type="text" 
                                placeholder="e.g. Royale De Luxe" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <FaTag className="text-gray-400" /> Category
                            </label>
                            <select 
                                name="category" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="Burger">Burger</option>
                                <option value="Pizza">Pizza</option>
                                <option value="Pasta">Pasta</option>
                                <option value="Dessert">Dessert</option>
                                <option value="Drink">Drink</option>
                            </select>
                        </div>
                    </div>

                    {/* Middle Row: Weight & Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <FaWeightHanging className="text-gray-400" /> Weight/Size
                            </label>
                            <input 
                                name="weight" 
                                type="text" 
                                placeholder="e.g. 140 g" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all" 
                                required 
                            />
                        </div>

                        <div>
                            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <FaDollarSign className="text-gray-400" /> Price ($)
                            </label>
                            <input 
                                name="price" 
                                type="number" 
                                step="0.01" 
                                placeholder="2.50" 
                                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-bold focus:ring-4 focus:ring-red-500/5 focus:border-red-500 outline-none transition-all" 
                                required 
                            />
                        </div>
                    </div>

                    {/* Image Upload Section: The "Cool" Part */}
                    <div className="space-y-4">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                            <FaCloudUploadAlt className="text-gray-400" /> Food Photo
                        </label>
                        
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            {/* Custom Styled Upload Box */}
                            <label className="flex-1 w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-red-300 rounded-[2rem] p-8 transition-all cursor-pointer bg-gray-50/50 hover:bg-red-50/20">
                                <div className="p-4 bg-white rounded-full shadow-sm mb-4">
                                    <FaCloudUploadAlt className="text-red-500 text-3xl" />
                                </div>
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">Click to upload photo</p>
                                <p className="text-[10px] text-gray-400 mt-2 italic">Supports: JPG, PNG, GIF</p>
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </label>

                            {/* Image Preview Window */}
                            <div className="w-full md:w-48 h-48 bg-gray-100 rounded-[2rem] flex items-center justify-center border border-gray-200 overflow-hidden relative group">
                                {uploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <span className="loading loading-spinner loading-md text-red-500"></span>
                                        <p className="text-[10px] font-bold text-gray-500">UPLOADING...</p>
                                    </div>
                                ) : imageUrl ? (
                                    <>
                                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <div className="absolute top-2 right-2">
                                            <FaCheckCircle className="text-green-500 text-lg bg-white rounded-full shadow-sm" />
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <FaUtensils className="text-gray-300 text-3xl mx-auto mb-2 opacity-30" />
                                        <p className="text-[10px] font-bold text-gray-300 uppercase">No Preview</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={uploading || isSubmitting}
                            className={`w-full py-4 rounded-2xl font-bold text-sm shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${
                                uploading || isSubmitting 
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                : 'bg-red-600 text-white hover:bg-red-700 hover:shadow-red-200 hover:-translate-y-0.5'
                            }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="loading loading-spinner loading-sm"></span>
                                    SAVING TO DATABASE...
                                </>
                            ) : (
                                <>
                                    <FaPlusCircle /> ADD TO MENU
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProduct;
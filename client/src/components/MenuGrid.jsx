import React, { useEffect, useState } from 'react';
import axiosPublic from '../api/axiosPublic';
import { useCart } from '../context/CartContext';
import { FaShoppingCart, FaPlus, FaMinus } from "react-icons/fa"; // Importing better icons

const MenuGrid = () => {
  const [allProducts, setAllProducts] = useState([]); 
  const [filteredMenu, setFilteredMenu] = useState([]); 
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const categories = ['All', 'Burger', 'Pizza', 'Pasta', 'Dessert', 'Drink'];

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axiosPublic.get('/products');
        setAllProducts(response.data);
        setFilteredMenu(response.data); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching menu:", error);
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleFilter = (category) => {
    setActiveCategory(category);
    if (category === 'All') {
      setFilteredMenu(allProducts);
    } else {
      const filtered = allProducts.filter(item => item.category === category);
      setFilteredMenu(filtered);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
        {/* Cool animated loader matching the red theme */}
        <span className="loading loading-spinner loading-lg text-red-600"></span>
    </div>
  );

  return (
    <div className='max-w-[1140px] mx-auto my-16 md:my-24 px-4 sm:px-6'>
      
      {/* Section Header */}
      <div className="text-center mb-10 md:mb-16">
          <p className="text-red-500 font-medium text-sm tracking-widest uppercase mb-2">Our Menu</p>
          <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900">Choose Your Favorite</h2>
      </div>

      {/* 1. Category Filter Buttons: Scrollable on mobile, wrapped on desktop */}
      <div className="flex overflow-x-auto sm:flex-wrap justify-start sm:justify-center gap-3 md:gap-4 mb-12 pb-4 sm:pb-0 hide-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => handleFilter(cat)}
            className={`whitespace-nowrap px-6 py-2.5 rounded-full font-medium transition-all duration-300 shadow-sm ${activeCategory === cat
              ? 'bg-red-600 text-white shadow-red-500/30 shadow-lg scale-105'
              : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600 border border-gray-100'
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 2. The Menu Grid: Smooth grid system */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {filteredMenu.map((item) => (
          <FoodCard key={item._id} item={item} />
        ))}
      </div>

      {/* Empty State Fallback if a category has no items */}
      {filteredMenu.length === 0 && (
         <div className="text-center py-20 text-gray-500">
            No items found in this category yet.
         </div>
      )}
    </div>
  );
};

// 3. Separate FoodCard Component 
const FoodCard = ({ item }) => {
  const [count, setCount] = useState(1);
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart(); 

  const handleAddToCart = () => {
    addToCart(item, count);
    // Optional: Reset count back to 1 after adding to cart
    setCount(1);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative p-6 rounded-[2rem] transition-all duration-500 shadow-md border border-gray-100 group ${
          isHovered ? 'bg-red-600 text-white shadow-2xl shadow-red-500/20 md:-translate-y-2' : 'bg-white text-gray-800 hover:shadow-xl'
        }`}
    >
      {/* Image container with bounce effect on hover */}
      <div className="w-full h-32 md:h-40 flex justify-center items-center mb-6">
          <img 
            src={item.image} 
            alt={item.name} 
            className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-110" 
          />
      </div>
      
      <h3 className="font-extrabold text-xl text-center mb-1 line-clamp-1">{item.name}</h3>
      
      <p className={`text-center text-xs font-medium mb-4 transition-colors duration-300 ${isHovered ? 'text-red-200' : 'text-gray-400'}`}>
        {item.weight || 'Standard Size'}g
      </p>
      
      <p className="text-center font-black text-2xl mb-4 tracking-tight">
        <span className={`text-sm align-top mr-1 ${isHovered ? 'text-red-200' : 'text-red-500'}`}>$</span>
        {item.price.toFixed(2)}
      </p>

      {/* The Counter & Basket UI */}
      {/* Removed 'isHovered' conditional so mobile users can always see and tap the buttons */}
      <div className={`flex flex-col gap-3 transition-all duration-300 ${isHovered ? 'opacity-100 mt-2' : 'opacity-100 md:opacity-0 md:-mt-10'}`}>
          <div className={`flex items-center justify-between rounded-full px-4 py-2 border transition-colors ${isHovered ? 'bg-white/20 border-white/30 text-white' : 'bg-gray-50 border-gray-200 text-gray-800'}`}>
            <button onClick={() => setCount(Math.max(1, count - 1))} className="p-1 hover:scale-110 transition-transform">
                <FaMinus size={12} />
            </button>
            <span className="font-bold w-6 text-center">{count}</span>
            <button onClick={() => setCount(count + 1)} className="p-1 hover:scale-110 transition-transform">
                <FaPlus size={12} />
            </button>
          </div>
          
          <button
            onClick={handleAddToCart}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-bold shadow-md transition-all duration-300 hover:scale-105 ${isHovered ? 'bg-white text-red-600 hover:bg-gray-50' : 'bg-red-600 text-white hover:bg-red-700'}`}
          >
            <FaShoppingCart /> Add to Cart
          </button>
      </div>
    </div>
  );
};

export default MenuGrid;
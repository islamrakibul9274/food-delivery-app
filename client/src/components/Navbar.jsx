import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosSearch, IoMdMenu, IoMdClose } from "react-icons/io"; // Added Menu & Close icons
import { BsMinecartLoaded } from "react-icons/bs";
import { FaArrowRight } from "react-icons/fa";
import { useCart } from '../context/CartContext';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false); // New state for scroll effect
    const navigate = useNavigate();
    const { totalItems } = useCart();

    // 1. Check for user data and add scroll listener when component mounts
    useEffect(() => {
        const savedUser = localStorage.getItem('user-info');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }

        // Enhancement: Listen for scroll to trigger the glassmorphism effect
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 2. Handle Logout
    const handleLogout = () => {
        localStorage.removeItem('access-token');
        localStorage.removeItem('user-info');
        setUser(null);
        setIsMobileMenuOpen(false); // Close mobile menu on logout
        navigate('/login');
    };

    // Helper to close menu when clicking a link on mobile
    const closeMenu = () => setIsMobileMenuOpen(false);

    // Array of links to keep code DRY
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Menu', path: '/menu' },
        { name: 'Service', path: '/service' },
        { name: 'Contact', path: '/contact' },
    ];

    return (
        <nav className={`fixed w-full top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-3' : 'bg-white py-5'}`}>
            <div className='max-w-[1140px] mx-auto px-4 md:px-6 flex justify-between items-center'>

                {/* Logo */}
                <div className="z-50">
                    <Link to="/" onClick={closeMenu}>
                        <h3 className='text-3xl font-extrabold tracking-tight'>F<span className='text-red-600'>OO</span>D</h3>
                    </Link>
                </div>

                {/* Desktop Navigation Links */}
                <div className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
                    {navLinks.map((link) => (
                        <Link key={link.name} to={link.path} className="hover:text-red-600 transition-colors duration-200">
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Desktop Right Side Actions */}
                <div className="hidden md:flex items-center space-x-6">
                    <IoIosSearch className="cursor-pointer text-xl text-gray-600 hover:text-red-600 transition-colors" />

                    <Link to="/cart" className="relative cursor-pointer group">
                        <BsMinecartLoaded size={22} className="text-gray-600 group-hover:text-red-600 transition-colors" />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm animate-pulse">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    {/* Conditional Rendering based on 'user' state */}
                    {user ? (
                        <div className="flex items-center gap-4">
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-sm font-bold text-red-600 hover:text-red-700 transition-colors">
                                    Dashboard
                                </Link>
                            )}
                            <Link to="/my-orders" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                                My Orders
                            </Link>
                            <Link to="/profile" className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors">
                                Hi, <span className="capitalize">{user.name}</span>
                            </Link>
                            <button onClick={handleLogout} className="text-sm text-white bg-red-600 hover:bg-red-700 transition-colors rounded-full px-5 py-2 shadow-md hover:shadow-lg">
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login">
                            <button className="flex items-center gap-2 text-white bg-red-600 hover:bg-red-700 transition-colors text-sm font-medium rounded-full px-5 py-2 shadow-md hover:shadow-lg">
                                Sign In <FaArrowRight size={12} />
                            </button>
                        </Link>
                    )}
                </div>

                {/* Mobile Controls (Cart & Hamburger) */}
                <div className="flex md:hidden items-center gap-5 z-50">
                    <Link to="/cart" className="relative cursor-pointer" onClick={closeMenu}>
                        <BsMinecartLoaded size={24} className="text-gray-800" />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-800 focus:outline-none">
                        {isMobileMenuOpen ? <IoMdClose size={28} /> : <IoMdMenu size={28} />}
                    </button>
                </div>
            </div>

            {/* Mobile Dropdown Menu */}
            <div className={`md:hidden absolute top-full left-0 w-full bg-white shadow-xl flex flex-col items-center py-6 gap-6 transition-all duration-300 ease-in-out origin-top ${isMobileMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}`}>
                {navLinks.map((link) => (
                    <Link key={link.name} to={link.path} onClick={closeMenu} className="text-lg font-medium text-gray-700 hover:text-red-600">
                        {link.name}
                    </Link>
                ))}

                <div className="w-3/4 h-[1px] bg-gray-100 my-2"></div>

                {user ? (
                    <div className="flex flex-col items-center gap-4">
                        {user.role === 'admin' && (
                            <Link to="/admin" onClick={closeMenu} className="text-md font-bold text-red-600">
                                Admin Dashboard
                            </Link>
                        )}
                        <Link to="/my-orders" onClick={closeMenu} className="text-md font-medium text-gray-700">
                            My Orders
                        </Link>
                        <Link to="/profile" onClick={closeMenu} className="text-md font-medium text-gray-700">
                            Profile ({user.name})
                        </Link>
                        <button onClick={handleLogout} className="mt-2 text-md text-white bg-red-600 rounded-full px-8 py-2 shadow-md">
                            Logout
                        </button>
                    </div>
                ) : (
                    <Link to="/login" onClick={closeMenu}>
                        <button className="flex items-center gap-2 text-md text-white bg-red-600 font-medium rounded-full px-8 py-3 shadow-md">
                            Sign In <FaArrowRight size={14} />
                        </button>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
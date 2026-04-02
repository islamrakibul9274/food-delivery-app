import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosPublic from '../api/axiosPublic';
import { FaGoogle, FaFacebookF, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading state
        
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const response = await axiosPublic.post('/users/login', { email, password });
            
            if (response.data.token) {
                // 1. Save the token and user info to the browser
                localStorage.setItem('access-token', response.data.token);
                localStorage.setItem('user-info', JSON.stringify(response.data.user));
                
                navigate("/"); // Redirect to Home page
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Invalid Email or Password");
        } finally {
            setIsLoading(false); // Stop loading state whether success or fail
        }
    };

    return (
        // Wrapper with pt-24 to clear your global sticky Navbar
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-24 md:pt-32">
            
            {/* Main Card Container */}
            <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-red-500/10 overflow-hidden flex flex-col lg:flex-row">
                
                {/* Left Side: Image (Hidden on mobile, visible on lg screens) */}
                <div className="hidden lg:block lg:w-1/2 relative bg-red-50">
                    {/* Optional: A gradient overlay to make the image look premium */}
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent mix-blend-multiply z-10"></div>
                    <img src="/sign.png" className="absolute inset-0 w-full h-full object-cover" alt="Login Illustration" />
                </div>

                {/* Right Side: Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
                    
                    <div className="text-center lg:text-left mb-8">
                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Welcome Back!</h3>
                        <p className="text-gray-500 font-medium text-sm">Please enter your details to sign in.</p>
                    </div>
                    
                    {/* Social Login Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-8">
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700 shadow-sm active:scale-95">
                            <FaGoogle className="text-red-500" /> Google
                        </button>
                        <button type="button" className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl transition-colors font-medium text-sm shadow-sm active:scale-95">
                            <FaFacebookF /> Facebook
                        </button>
                    </div>

                    <div className="flex items-center justify-between mb-8">
                        <hr className="w-full border-gray-200" />
                        <span className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">Or email</span>
                        <hr className="w-full border-gray-200" />
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email Input */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaEnvelope className="text-gray-400" />
                                </div>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    required 
                                    placeholder="Enter your email" 
                                    className="block w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all" 
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FaLock className="text-gray-400" />
                                </div>
                                <input 
                                    type={showPassword ? "text" : "password"} 
                                    name="password" 
                                    id="password" 
                                    required 
                                    placeholder="••••••••" 
                                    className="block w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all" 
                                />
                                {/* Toggle Password Visibility */}
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
                                <span className="text-gray-600 group-hover:text-gray-900 font-medium transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-red-600 font-bold hover:text-red-700 transition-colors">Forgot Password?</a>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold rounded-xl py-3.5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center h-12"
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                "Log In"
                            )}
                        </button>

                        <p className="text-center text-sm font-medium">
                            <span className="text-gray-500">Don't have an account?</span>
                            <Link to="/signup" className="text-red-600 font-bold ml-1.5 hover:underline">Sign up</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
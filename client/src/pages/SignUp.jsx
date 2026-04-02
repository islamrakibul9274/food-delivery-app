import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosPublic from '../api/axiosPublic';
import { FaGoogle, FaFacebookF, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUp = () => {
    const [accepted, setAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Trigger loading spinner
        
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;

        try {
            const response = await axiosPublic.post('/users/signup', { email, password });

            if (response.status === 201) {
                alert("Signup Successful! Redirecting to Login...");
                navigate("/login");
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Signup failed. Please try again.");
        } finally {
            setIsLoading(false); // Turn off loading spinner
        }
    }

    return (
        // Wrapper with pt-24 to clear your global sticky Navbar
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-24 md:pt-32">
            
            {/* Main Card Container */}
            <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-red-500/10 overflow-hidden flex flex-col lg:flex-row-reverse">
                
                {/* Right Side: Image (Hidden on mobile, reversed layout for visual variety) */}
                <div className="hidden lg:block lg:w-1/2 relative bg-red-50">
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent mix-blend-multiply z-10"></div>
                    {/* Using the specific signup.png from your public folder */}
                    <img src="/sign.png" className="absolute inset-0 w-full h-full object-cover" alt="Signup Illustration" />
                </div>

                {/* Left Side: Form */}
                <div className="w-full lg:w-1/2 p-8 sm:p-12 md:p-16 flex flex-col justify-center">
                    
                    <div className="text-center lg:text-left mb-8">
                        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">Create Account</h3>
                        <p className="text-gray-500 font-medium text-sm">Join us today to get your favorite food delivered.</p>
                    </div>
                    
                    {/* Social Signup Buttons */}
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
                        <span className="px-4 text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">Or use email</span>
                        <hr className="w-full border-gray-200" />
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-6">
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
                                    placeholder="Create a strong password" 
                                    className="block w-full pl-11 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-red-500/10 focus:border-red-500 focus:bg-white outline-none transition-all" 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        {/* Terms and Conditions Checkbox */}
                        <div className="flex items-start gap-3 text-sm mt-2">
                            <input 
                                type="checkbox" 
                                id="terms"
                                onChange={(e) => setAccepted(e.target.checked)} 
                                className="mt-1 w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" 
                            />
                            <label htmlFor="terms" className="text-gray-600 leading-relaxed cursor-pointer">
                                I agree to the <span className="font-bold text-gray-800 hover:text-red-600 transition-colors underline underline-offset-2">Terms of Service</span> and <span className="font-bold text-gray-800 hover:text-red-600 transition-colors underline underline-offset-2">Privacy Policy</span>.
                            </label>
                        </div>

                        <button 
                            type="submit" 
                            disabled={!accepted || isLoading}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex justify-center items-center h-12"
                        >
                            {isLoading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                "Sign Up"
                            )}
                        </button>

                        <p className="text-center text-sm font-medium">
                            <span className="text-gray-500">Already have an account?</span>
                            <Link to="/login" className="text-red-600 font-bold ml-1.5 hover:underline">Log In</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SignUp;
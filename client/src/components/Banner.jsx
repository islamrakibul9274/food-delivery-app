import React, { useState } from 'react';
import { GiStrawberry } from "react-icons/gi";
import { FaPlay, FaStar, FaCartPlus } from "react-icons/fa";

const Banner = ({ onOrderClick }) => {
    const [showProcess, setShowProcess] = useState(false); 
    
    return (
        <div className='max-w-[1140px] w-full px-4 md:px-6 my-10 md:my-20 mx-auto flex flex-col md:flex-row items-center relative gap-12 md:gap-6'>

            {/* Responsive wrapper: flex-col on mobile, flex-row on desktop */}
            {/* Left Side: Centered on mobile, Left-aligned on desktop */}
            <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-10">

                <p className="text-red-500 font-medium flex items-center text-sm py-2 px-5 bg-red-100 rounded-full shadow-sm">
                    More than Faster
                    <GiStrawberry className="ml-2 text-red-600 text-lg animate-bounce" />
                </p>

                <h3 className="my-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
                    Be The Fastest <br className="hidden sm:block" /> In Delivering <br className="hidden sm:block" /> Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">
                        Food
                    </span>
                </h3>
                
                <p className="text-gray-600 mb-8 max-w-md text-sm sm:text-base leading-relaxed">
                    Lorem ipsum dolor sit amet consectetur adipisicing elit. Neque quod laudantium illum deserunt corrupti nesciunt, maiores aut exercitationem blanditiis.
                </p>

                {/* Buttons: Stacked on mobile, row on desktop */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto relative">
                    <button onClick={onOrderClick} className="w-full sm:w-auto bg-red-600 hover:bg-red-700 transition-colors text-white font-medium rounded-full px-8 py-3 shadow-lg hover:shadow-xl hover:-translate-y-1 transform duration-200">
                        Order Now
                    </button>
                    
                    <div className="relative w-full sm:w-auto">
                        <button
                            onClick={() => setShowProcess(!showProcess)}
                            className="w-full sm:w-auto flex justify-center items-center bg-white border-2 border-red-100 hover:border-red-300 text-gray-700 font-medium rounded-full px-8 py-3 shadow-sm hover:shadow-md transition-all">
                            <div className="bg-red-100 p-1.5 rounded-full mr-3">
                                <FaPlay className="text-red-500 text-xs" />
                            </div>
                            Order Process
                        </button>

                        {/* Floating Summary - Adjusted positioning for mobile screens */}
                        {showProcess && (
                            <div className="absolute top-full mt-4 left-1/2 sm:left-0 -translate-x-1/2 sm:translate-x-0 w-64 p-4 bg-white shadow-2xl border-l-4 border-red-500 rounded-lg z-50 transition-all">
                                <h4 className="font-bold text-red-600">How it works:</h4>
                                <p className="text-sm text-gray-600 mt-2">
                                    1. Pick your favorite burger. <br />
                                    2. Add to cart and checkout. <br />
                                    3. We cook and deliver in 30 mins!
                                </p>
                                <div className="absolute -top-2 left-1/2 sm:left-6 -translate-x-1/2 sm:translate-x-0 w-4 h-4 bg-white rotate-45 border-t border-l border-gray-100"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Side: Images */}
            <div className="w-full md:w-1/2 relative mt-8 md:mt-0 flex justify-center">
                {/* Main Image Container */}
                <div className="relative w-full max-w-[400px] md:max-w-none aspect-square md:aspect-auto group">
                    <img className="w-full h-full object-cover rounded-[2rem] md:rounded-[3rem] shadow-2xl" src="/banner.png" alt="Delicious Food Banner" />

                    {/* Floating Card 1: Burger (Bottom Right) */}
                    <div className="absolute -bottom-4 -right-2 sm:-right-6 md:-right-8 z-10 flex w-[200px] sm:w-[240px] md:w-[260px] p-3 sm:p-4 bg-white/70 backdrop-blur-md border border-white/40 shadow-2xl rounded-2xl items-center justify-between transition-transform duration-500 hover:-translate-y-2 hover:shadow-red-500/20">
                        <div className="card-left">
                            <p className="font-bold text-slate-800 text-xs sm:text-sm">American Burger</p>
                            <div className="text-yellow-400 flex text-[10px] sm:text-xs my-1">
                                <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                            </div>
                            <p className="font-extrabold text-sm sm:text-base text-gray-900">$8.75</p>
                        </div>
                        <div className="w-14 sm:w-16 md:w-20">
                            <img src="/burger.png" className="w-full rounded-xl h-auto drop-shadow-md" alt="Burger" />
                        </div>
                    </div>

                    {/* Floating Card 2: Orange (Top Left) */}
                    <div className="absolute -top-4 sm:top-4 -left-2 sm:-left-4 md:-left-8 z-10 transition-transform duration-500 hover:-translate-y-2 hover:rotate-3">
                        <div className="relative bg-white/70 backdrop-blur-md border border-white/40 shadow-xl w-[120px] sm:w-[140px] flex flex-col items-center space-y-1 py-6 rounded-2xl hover:shadow-red-500/20">
                            <div className="w-full flex items-center justify-center">
                                <img className="w-12 sm:w-16 drop-shadow-md" src="/orange.png" alt="Orange juice" />
                            </div>
                            <p className="text-xs sm:text-sm font-medium text-gray-800 mt-2">Fresh Orange</p>
                            <hr className="w-6 border-red-400 my-1" />
                            <h3 className="font-extrabold text-sm sm:text-base text-gray-900">$4.60</h3> 
                            <p className="text-gray-500 text-[10px] sm:text-xs">Free Shipping</p>
                            
                            {/* Add to Cart Button floating at the bottom */}
                            <button className="bg-red-500 hover:bg-red-600 transition-colors text-white rounded-full absolute -bottom-5 sm:-bottom-6 p-2 sm:p-3 shadow-lg hover:scale-110 transform duration-200">
                                <FaCartPlus className="text-sm sm:text-base" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Banner;
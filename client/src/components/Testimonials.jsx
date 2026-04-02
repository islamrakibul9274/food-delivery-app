import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FaStar, FaQuoteLeft } from "react-icons/fa"; // Added icons for flair
import { reviews } from '../data/testimonialsReview';

const Testimonials = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === reviews.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
    };

    const { name, location, image, text } = reviews[currentIndex];

    return (
        <section className="max-w-[1140px] mx-auto py-20 md:py-32 px-4 sm:px-6 text-center font-sans relative overflow-hidden">
            
            {/* Header - Typography matched to Services & Menu */}
            <div className="mb-12 md:mb-20 text-center">
                <p className="text-red-500 font-medium tracking-widest uppercase text-sm mb-2">
                    What they say
                </p>
                <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6">
                    Testimonials About Us
                </h2>
                <div className="w-16 h-1.5 bg-red-500 mx-auto rounded-full mb-6 opacity-80"></div>
            </div>

            {/* Slider Container - Max width controls how wide the card gets */}
            <div className="relative max-w-5xl mx-auto px-0 sm:px-16 lg:px-20">

                {/* Desktop Left Arrow - Hidden on mobile, absolute positioned on sides */}
                <button
                    onClick={prevSlide}
                    className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full items-center justify-center shadow-md hover:shadow-xl text-gray-400 hover:text-red-600 transition-all duration-300 z-10 hover:-translate-x-1"
                >
                    <ChevronLeft size={32} strokeWidth={2} />
                </button>

                {/* Testimonial Card */}
                {/* The 'key' prop forces React to re-mount the div when index changes, making transitions snap cleanly */}
                <div 
                    key={currentIndex} 
                    className="w-full bg-white border border-gray-100 rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-14 shadow-xl shadow-red-500/5 flex flex-col md:flex-row items-center gap-8 md:gap-12 relative overflow-hidden group"
                >
                    {/* Decorative Background Quote */}
                    <FaQuoteLeft className="absolute top-8 right-10 text-9xl text-gray-50 opacity-50 z-0 rotate-12 transition-transform duration-700 group-hover:scale-110" />

                    {/* User Image Area */}
                    <div className="relative z-10 shrink-0">
                        <div className="w-28 h-28 md:w-40 md:h-40 rounded-full overflow-hidden p-1.5 border-2 border-dashed border-red-200">
                            <img src={image} alt={name} className="w-full h-full object-cover rounded-full shadow-inner" />
                        </div>
                        {/* Little floating badge */}
                        <div className="absolute -bottom-3 right-2 md:right-4 bg-white p-2 rounded-full shadow-lg">
                            <span className="text-xl">🌟</span>
                        </div>
                    </div>

                    {/* User Review Text */}
                    <div className="text-center md:text-left flex-1 z-10">
                        {/* Star Rating */}
                        <div className="flex justify-center md:justify-start text-yellow-400 text-sm md:text-base gap-1 mb-4">
                            <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                        </div>
                        
                        <p className="text-gray-600 text-base md:text-xl italic leading-relaxed md:leading-loose mb-6 md:mb-8 font-medium">
                            "{text}"
                        </p>
                        
                        <div>
                            <h4 className="text-xl md:text-2xl font-black text-gray-900">{name}</h4>
                            <p className="text-red-500 text-xs md:text-sm font-bold uppercase tracking-wider mt-1">{location}</p>
                        </div>
                    </div>
                </div>

                {/* Desktop Right Arrow */}
                <button
                    onClick={nextSlide}
                    className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full items-center justify-center shadow-md hover:shadow-xl text-gray-400 hover:text-red-600 transition-all duration-300 z-10 hover:translate-x-1"
                >
                    <ChevronRight size={32} strokeWidth={2} />
                </button>

                {/* Mobile Arrows - Only visible on small screens, placed BELOW the card */}
                <div className="flex sm:hidden items-center justify-center gap-6 mt-8">
                    <button
                        onClick={prevSlide}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-gray-500 hover:text-red-600 active:scale-95 transition-all"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    
                    {/* Visual indicator of slides (Optional dot) */}
                    <div className="w-2 h-2 rounded-full bg-red-200"></div>

                    <button
                        onClick={nextSlide}
                        className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-gray-500 hover:text-red-600 active:scale-95 transition-all"
                    >
                        <ChevronRight size={28} />
                    </button>
                </div>

            </div>
        </section>
    );
};

export default Testimonials;
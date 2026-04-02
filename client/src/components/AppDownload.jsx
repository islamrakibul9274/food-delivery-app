import React from 'react';

const AppDownload = () => {
    return (
        <div className="bg-gradient-to-br from-red-50 via-white to-red-50/50 relative overflow-hidden">
            {/* Soft, modern background gradient to replace the flat color */}
            
            {/* Decorative background blobs to add depth */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>

            <section className="max-w-[1140px] mx-auto px-4 sm:px-6 py-20 md:py-32 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20 relative z-10">

                {/* Left Side: Phone Mockup */}
                {/* Changed to center on mobile, left-align on desktop for better visual balance */}
                <div className="w-full lg:w-1/2 flex justify-center lg:justify-start group">
                    <div className="relative w-full max-w-[350px] md:max-w-[400px]">
                        {/* A glowing backdrop for the phone */}
                        <div className="absolute inset-0 bg-red-500 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity duration-500"></div>
                        
                        <img
                            src="/mobile-app.png"
                            alt="App Mockup"
                            // Replaced custom animation with standard Tailwind transform classes for a floating effect
                            className="w-full h-auto drop-shadow-2xl rounded-[3rem] relative z-10 transition-transform duration-700 ease-in-out hover:-translate-y-4"
                        />
                    </div>
                </div>

                {/* Right Side: Content */}
                {/* Ensured perfect centering on mobile, left alignment on large screens */}
                <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
                    <p className="text-red-500 font-medium uppercase text-sm tracking-widest mb-4">
                        Download our app
                    </p>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6 tracking-tight">
                        Get The Groceries App <br className="hidden sm:block lg:hidden" /> Order More Easily.
                    </h2>
                    <p className="text-gray-600 text-base md:text-lg mb-10 max-w-md leading-relaxed font-medium">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut.
                    </p>

                    {/* Store Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start w-full sm:w-auto">
                        <a href="#" className="rounded-xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl rounded-xl">
                            <img src="/google-play.png" alt="Get it on Google Play" className="rounded-xl h-12 sm:h-14 w-auto drop-shadow-sm" />
                        </a>
                        <a href="#" className="rounded-xl transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl rounded-xl">
                            <img src="/app-store.png" alt="Download on the App Store" className="rounded-xl h-12 sm:h-14 w-auto drop-shadow-sm" />
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AppDownload;
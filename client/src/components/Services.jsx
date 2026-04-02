import React from 'react';

const Services = () => {
    const services = [
        {
            id: 1,
            title: "Easy To Order",
            description: "You only need a few steps in ordering food. Pick, checkout, and wait.",
            image: "/easy-order.png", 
        },
        {
            id: 2,
            title: "Fastest Delivery",
            description: "Delivery that is always on time even faster. Fresh and hot to your door.",
            image: "/fastest-delivery.png",
            elevated: true, 
        },
        {
            id: 3,
            title: "Best Quality",
            description: "Not only fast for us quality is also number one. Premium ingredients.",
            image: "/best-quality.png",
        },
    ];

    return (
        <section className="py-20 md:py-32 px-4 sm:px-6 bg-gradient-to-b from-white via-red-50/30 to-white relative overflow-hidden">
            {/* Added a very subtle gradient background to separate it from pure white sections */}
            <div className="max-w-[1140px] mx-auto text-center relative z-10">
                
                {/* Header Text - Matched to MenuGrid typography */}
                <p className="text-red-500 font-medium tracking-widest uppercase text-sm mb-2">
                    What we Serve
                </p>
                <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-16 md:mb-24 leading-tight">
                    Your Favorite Food <br className="hidden sm:block" /> Delivery Partner
                </h2>

                {/* Cards Grid */}
                {/* Changed items-center to md:items-stretch so all cards match height on desktop */}
                <div className="flex flex-col md:flex-row justify-center items-center md:items-stretch gap-8 md:gap-6 lg:gap-10">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className={`group w-full max-w-[340px] bg-white transition-all duration-500 rounded-[2.5rem] flex flex-col items-center px-8 text-center border border-gray-100 cursor-default
                                ${service.elevated
                                    // md:scale-110 fixes the mobile bulging issue. It only scales up on medium screens and larger.
                                    ? "shadow-2xl shadow-red-500/10 md:scale-110 z-10 py-12 md:py-14 ring-1 ring-red-100"
                                    : "shadow-md hover:shadow-xl py-10 md:py-12 md:mt-4 hover:-translate-y-2"
                                }`}
                        >
                            {/* Image Container with Bounce Animation on Hover */}
                            <div className="w-28 h-28 md:w-32 md:h-32 mb-8 flex items-center justify-center relative">
                                {/* Subtle background glow behind the image */}
                                <div className={`absolute inset-0 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 ${service.elevated ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                                
                                <img
                                    src={service.image}
                                    alt={service.title}
                                    className="w-full h-auto object-contain relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2 drop-shadow-md"
                                />
                            </div>

                            {/* Text Content */}
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 transition-colors duration-300 group-hover:text-red-600">
                                {service.title}
                            </h3>
                            <p className="text-gray-500 leading-relaxed text-sm font-medium">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
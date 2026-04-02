
import React, { useRef } from 'react';
import Banner from '../components/Banner';
import Services from '../components/Services';
import MenuGrid from '../components/MenuGrid';
import Testimonials from '../components/Testimonials';
import AppDownload from '../components/AppDownload';

const LandingPage = () => {
    const menuRef = useRef(null); // 1. Create the reference

    const scrollToMenu = () => {
        // 2. Logic to jump to the menu section
        menuRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div className=" min-h-screen flex flex-col">
            {/* Added pt-24 (96px top padding) to account for the fixed Navbar */}

            {/* Pass the function to the Banner */}
            <Banner onOrderClick={scrollToMenu} />
            <Services />

            {/* Pass the ref to the MenuGrid container */}
            <div ref={menuRef}>
                <MenuGrid />
            </div>

            <Testimonials />
            <AppDownload />
        </div>
    );
};

export default LandingPage;
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Main = () => {
    return (
        // 1. Made the outermost div a flex column taking up at least the full screen height
        <div className="flex flex-col min-h-screen">
            <Navbar />
            
            {/* 2. Changed to a <main> tag for better HTML semantics */}
            {/* 3. Added pt-24 globally. flex-grow pushes the Footer to the bottom of the screen */}
            <main className="flex-grow pt-24">
                <Outlet /> 
            </main>
            
            <Footer />
        </div>
    );
};

export default Main;
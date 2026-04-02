import React from 'react';
import { Send } from 'lucide-react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  // Automatically updates the copyright year so it never looks outdated
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white pt-16 md:pt-24 pb-8 px-4 sm:px-6 font-sans border-t border-gray-100">
      <div className="max-w-[1140px] mx-auto">
        
        {/* Adjusted grid gap for better mobile spacing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12 mb-16">
          
          {/* Column 1: Brand & Desc */}
          <div className="flex flex-col gap-6">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-gray-900">
              F<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">OO</span>D
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm font-medium">
              Your favorite food delivery partner. Fresh, fast, and reliable service right to your doorstep.
            </p>
            
            {/* Developer/Portfolio Links */}
            <div className="flex items-center gap-4 mt-2">
                <a href="https://github.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                    <FaGithub size={20} />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                    <FaLinkedin size={20} />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
                    <FaTwitter size={20} />
                </a>
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="flex flex-col gap-5">
            {/* Added decorative underlines to headers */}
            <h4 className="text-lg font-bold text-gray-900 relative inline-block w-fit">
                Company
                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-red-500 rounded-full"></span>
            </h4>
            <nav className="flex flex-col gap-3 text-sm text-gray-600 font-medium">
              <a href="#" className="hover:text-red-600 hover:translate-x-1 transition-transform w-fit">About Us</a>
              <a href="#" className="hover:text-red-600 hover:translate-x-1 transition-transform w-fit">Blog</a>
              <a href="#" className="hover:text-red-600 hover:translate-x-1 transition-transform w-fit">All Products</a>
              <a href="#" className="hover:text-red-600 hover:translate-x-1 transition-transform w-fit">Locations Map</a>
            </nav>
          </div>

          {/* Column 3: Services */}
          <div className="flex flex-col gap-5">
            <h4 className="text-lg font-bold text-gray-900 relative inline-block w-fit">
                Services
                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-red-500 rounded-full"></span>
            </h4>
            <nav className="flex flex-col gap-3 text-sm text-gray-600 font-medium">
              <a href="#" className="hover:text-red-600 hover:translate-x-1 transition-transform w-fit">Order tracking</a>
              <a href="#" className="hover:text-red-600 hover:translate-x-1 transition-transform w-fit">Wish List</a>
              <a href="#" className="hover:text-red-600 hover:translate-x-1 transition-transform w-fit">My account</a>
              <a href="#" className="hover:text-red-600 hover:translate-x-1 transition-transform w-fit">Terms & Conditions</a>
            </nav>
          </div>

          {/* Column 4: Newsletter */}
          <div className="flex flex-col gap-5">
            <h4 className="text-lg font-bold text-gray-900 relative inline-block w-fit">
                Get in Touch
                <span className="absolute -bottom-1 left-0 w-1/2 h-0.5 bg-red-500 rounded-full"></span>
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed font-medium">
              Subscribe to our weekly Newsletter and receive updates via email.
            </p>
            
            {/* Upgraded Input Field */}
            <div className="relative mt-1 group">
              <input 
                type="email" 
                placeholder="Enter Your Email Address" 
                className="w-full bg-gray-50 text-sm text-gray-800 rounded-full py-3.5 pl-5 pr-14 outline-none border border-gray-200 focus:border-red-300 focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-red-600 hover:bg-red-700 flex items-center justify-center rounded-full text-white shadow-md hover:shadow-lg transition-all active:scale-95">
                <Send size={16} className="-ml-0.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <hr className="border-gray-100 mb-6" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-gray-500 text-xs sm:text-sm font-medium">
          <p>
            © {currentYear} FOOD. All Rights Reserved. Built with ❤️ by Rumel.
          </p>
          <div className="flex gap-6 sm:gap-8">
            <a href="#" className="hover:text-red-600 transition-colors">Terms & Conditions</a>
            <a href="#" className="hover:text-red-600 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
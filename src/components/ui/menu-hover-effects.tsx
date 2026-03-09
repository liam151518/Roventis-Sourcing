"use client";

import React, { useState } from 'react';

const menuItems = [
  { label: 'Home', href: '#' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Earnings', href: '#calculator' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#' },
];

interface NavMenuProps {
  onLoginClick?: () => void;
  onApplyClick?: () => void;
}

export default function NavMenu({ onLoginClick, onApplyClick }: NavMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="absolute bg-black/95 backdrop-blur-xl inset-0 w-full z-50">
      {/* Mobile menu toggle button - only visible on small screens */}
      <button 
        onClick={toggleMenu}
        className="md:hidden absolute top-6 right-6 z-20 p-2"
        aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      >
        <div className={`w-6 h-0.5 bg-white mb-1.5 transition-transform duration-300 ${isMenuOpen ? 'transform rotate-45 translate-y-2' : ''}`}></div>
        <div className={`w-6 h-0.5 bg-white mb-1.5 transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></div>
        <div className={`w-6 h-0.5 bg-white transition-transform duration-300 ${isMenuOpen ? 'transform -rotate-45 -translate-y-2' : ''}`}></div>
      </button>
      
      {/* Menu container - adapts to screen size */}
      <div className={`
        flex flex-col items-center justify-center w-full h-full
        md:block md:h-auto md:pt-8
        ${isMenuOpen ? 'block' : 'hidden md:block'}
      `}>
        <ul className={`
          flex flex-col items-center space-y-8
          md:flex-row md:space-y-0 md:space-x-2 lg:space-x-4
          md:justify-center
        `}>
          {menuItems.map((item) => (
            <li key={item.label} className="list-none">
              <a 
                href={item.href}
                onClick={handleLinkClick}
                className="relative inline-block group cursor-pointer"
              >
                {/* Link text */}
                <span className="
                  relative z-10 block uppercase text-white
                  font-sans font-medium transition-colors duration-300 
                  group-hover:text-black
                  text-2xl py-3 px-5
                  md:text-sm md:py-2 md:px-4
                  lg:text-base lg:py-2 lg:px-5
                ">
                  {item.label}
                </span>
                {/* Top & bottom border animation */}
                <span className="
                  absolute inset-0 border-t-2 border-b-2 border-white
                  transform scale-y-[2] opacity-0 
                  transition-all duration-300 origin-center
                  group-hover:scale-y-100 group-hover:opacity-100
                " />
                {/* Background fill animation */}
                <span className="
                  absolute top-[2px] left-0 w-full h-full bg-white
                  transform scale-0 opacity-0
                  transition-all duration-300 origin-top
                  group-hover:scale-100 group-hover:opacity-100
                " />
              </a>
            </li>
          ))}
        </ul>
        
        {/* Mobile CTA Buttons */}
        <div className={`flex flex-col gap-4 mt-12 md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
          <button 
            onClick={() => { handleLinkClick(); onLoginClick?.(); }}
            className="px-8 py-3 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-colors"
          >
            Sign In
          </button>
          <button 
            onClick={() => { handleLinkClick(); onApplyClick?.(); }}
            className="px-8 py-3 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors"
          >
            Apply Now
          </button>
        </div>
      </div>
    </nav>
  );
}

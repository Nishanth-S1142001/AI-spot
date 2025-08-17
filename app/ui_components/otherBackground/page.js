"use client";
import React, { useEffect, useRef } from 'react';
export default function NeonBackground() 
{ 
   
        
    

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Static geometric background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800">
        {/* CSS geometric shapes for base layer */}
        <div className="absolute top-0 left-0 w-full h-full">
          {/* Top angular shapes */}
          <div className="absolute top-0 left-0 w-96 h-32 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-12 -translate-x-20 -translate-y-10 shadow-lg"></div>
          <div className="absolute top-10 left-20 w-80 h-28 bg-gradient-to-br from-gray-700 to-gray-800 transform rotate-6 shadow-md"></div>
          <div className="absolute top-5 left-40 w-72 h-24 bg-gradient-to-br from-gray-800 to-gray-900 transform rotate-8 shadow-lg"></div>
          
          {/* Bottom angular shapes */}
          <div className="absolute bottom-0 right-0 w-96 h-40 bg-gradient-to-tl from-gray-800 to-gray-900 transform -rotate-12 translate-x-20 translate-y-10 shadow-lg"></div>
          <div className="absolute bottom-10 right-20 w-80 h-36 bg-gradient-to-tl from-gray-700 to-gray-800 transform -rotate-8 shadow-md"></div>
          <div className="absolute bottom-5 right-40 w-72 h-32 bg-gradient-to-tl from-gray-800 to-gray-900 transform -rotate-6 shadow-lg"></div>
          
          {/* Side accent shapes */}
          <div className="absolute top-1/4 right-0 w-64 h-48 bg-gradient-to-l from-gray-800 to-transparent transform rotate-45 translate-x-32"></div>
          <div className="absolute bottom-1/4 left-0 w-64 h-48 bg-gradient-to-r from-gray-800 to-transparent transform -rotate-45 -translate-x-32"></div>
        </div>
      </div>
      
      {/* Animated canvas overlay */}
       
      
      {/* Additional glow effects */}
      <div className="absolute inset-0 bg-gradient-radial from-secondary via-transparent to-transparent"></div>
    </div>
  );
}
"use client";
import React, { useEffect, useRef } from 'react';
export default function NeonBackground() 
{
  const canvasRef = useRef(null);
  const animationRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation parameters
    const particles = [];
    const lines = [
      // Top angular lines
       
      // Bottom angular lines
      //{ x1: 250, y1: window.innerHeight, x2: 250, y2: window.innerHeight - 300, angle: Math.atan2(-200, 400) },
      //{ x1: 300, y1: 0, x2: 300, y2: window.innerHeight, angle: Math.atan2(-250, 400) },
      //top left
     { x1:200, y1: 0, x2: 200, y2: window.innerHeight-300, angle: Math.atan2(-250, 400) },
       //{ x1:window.innerWidth-100, y1: 0, x2: window.innerWidth-100, y2: window.innerHeight-200, angle: Math.atan2(-250, 400) },
      
      // Right side lines
      //{ x1: window.innerWidth, y1: 100, x2: window.innerWidth - 300, y2: 400, angle: Math.atan2(300, -300) },
      //{ x1: window.innerWidth, y1: 200, x2: window.innerWidth - 250, y2: 450, angle: Math.atan2(250, -250) },
      
      // Left side lines
      { x1: 0, y1: 100, x2: 400, y2: 100, angle: Math.atan2(300, 350) },
      { x1: 0, y1: 150, x2: 350, y2: 150, angle: Math.atan2(250, 300) },
    ];

    // Create particles for each line
    lines.forEach((line, lineIndex) => {
      const lineLength = Math.sqrt(Math.pow(line.x2 - line.x1, 2) + Math.pow(line.y2 - line.y1, 2));
      const particleCount = Math.floor(lineLength / 50);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          lineIndex,
          progress: Math.random(),
          speed: 0.002 + Math.random() * 0.008,
          size: 2 + Math.random() * 3,
          opacity: 0.5 + Math.random() * 0.5,
          trail: []
        });
      }
    });

    const drawLine = (line, opacity = 0.3) => {
      ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#041c90';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      ctx.moveTo(line.x1, line.y1);
      ctx.lineTo(line.x2, line.y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawParticle = (particle, line) => {
      const x = line.x1 + (line.x2 - line.x1) * particle.progress;
      const y = line.y1 + (line.y2 - line.y1) * particle.progress;
      
      // Add current position to trail
      particle.trail.push({ x, y, opacity: particle.opacity });
      
      // Limit trail length
      if (particle.trail.length > 20) {
        particle.trail.shift();
      }
      
      // Draw trail
      particle.trail.forEach((point, index) => {
        const trailOpacity = (point.opacity * index) / particle.trail.length;
        const trailSize = (particle.size * index) / particle.trail.length;
        
        ctx.shadowColor = '#041c90';
        ctx.shadowBlur = 15;
        ctx.fillStyle = `rgba(59, 130, 246, ${trailOpacity})`;
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, trailSize, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw main particle with intense glow
      ctx.shadowColor = '#3b82f6';
      ctx.shadowBlur = 20;
      ctx.fillStyle = `rgba(147, 197, 253, ${particle.opacity})`;
      
      ctx.beginPath();
      ctx.arc(x, y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add extra bright center
      ctx.shadowBlur = 5;
      ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity * 0.8})`;
      
      ctx.beginPath();
      ctx.arc(x, y, particle.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.shadowBlur = 0;
    };

    const animate = () => {
      // Clear canvas with dark background
      ctx.fillStyle = 'rgba(15, 15, 15, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update canvas size for lines
      lines.forEach(line => {
        if (line.x2 > canvas.width || line.y2 > canvas.height || line.y1 > canvas.height) {
          // Adjust line positions based on current canvas size
          line.x2 = Math.min(line.x2, canvas.width);
          line.y2 = Math.min(line.y2, canvas.height);
          line.y1 = Math.min(line.y1, canvas.height);
        }
      });
      
      // Draw static lines
      lines.forEach(line => drawLine(line, 0.2));
      
      // Update and draw particles
      particles.forEach(particle => {
        const line = lines[particle.lineIndex];
        if (!line) return;
        
        // Update particle position
        particle.progress += particle.speed;
        
        // Reset particle when it reaches the end
        if (particle.progress > 1) {
          particle.progress = 0;
          particle.trail = [];
          particle.speed = 0.002 + Math.random() * 0.008;
          particle.opacity = 0.5 + Math.random() * 0.5;
        }
        
        drawParticle(particle, line);
      });
      
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);

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
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Additional glow effects */}
      <div className="absolute inset-0 bg-gradient-radial from-secondary via-transparent to-transparent"></div>
    </div>
  );
}
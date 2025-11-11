'use client'

import { useEffect, useRef } from 'react'
import Button from '../components/ui/button'
import { ChevronRight } from 'lucide-react'

export default function HeroSection({ onGetStarted }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const particles = []
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Define detailed humanoid robot shape with more particles
    const createRobotShape = () => {
      const scale = 1.2 // Scale factor for the robot
      
      // HEAD - More detailed spherical head
      addDetailedSphere(0, -220, 35, 150, scale)
      
      // Face details - Eyes with glow
      addDetailedSphere(-12, -225, 4, 15, scale) // Left eye
      addDetailedSphere(12, -225, 4, 15, scale) // Right eye
      
      // Face contours
      addEllipse(0, -215, 20, 25, 30, scale) // Face oval
      
      // NECK - Segmented mechanical neck
      addCylinder(0, -175, 12, 25, 25, scale)
      addRing(0, -165, 14, 15, scale) // Neck joint
      
      // SHOULDERS - Mechanical shoulder joints
      addDetailedSphere(-50, -145, 18, 40, scale) // Left shoulder
      addDetailedSphere(50, -145, 18, 40, scale) // Right shoulder
      
      // CHEST/TORSO - Detailed armored chest
      addDetailedBox(0, -120, 70, 60, 35, 200, scale) // Upper chest
      addDetailedBox(0, -65, 60, 40, 30, 100, scale) // Lower chest
      
      // Arc reactor / Chest core with glow
      addRing(0, -110, 12, 30, scale)
      addDetailedSphere(0, -110, 8, 25, scale)
      
      // Chest plating details
      addLine(-25, -145, -25, -85, 15, scale) // Left chest line
      addLine(25, -145, 25, -85, 15, scale) // Right chest line
      
      // ARMS - Segmented mechanical arms
      // Left upper arm
      addCylinder(-50, -120, 11, 45, 35, scale)
      addRing(-50, -95, 12, 15, scale) // Elbow joint
      
      // Left forearm
      addCylinder(-50, -65, 10, 40, 35, scale)
      addDetailedSphere(-50, -40, 12, 30, scale) // Left hand/fist
      
      // Right upper arm
      addCylinder(50, -120, 11, 45, 35, scale)
      addRing(50, -95, 12, 15, scale) // Elbow joint
      
      // Right forearm
      addCylinder(50, -65, 10, 40, 35, scale)
      addDetailedSphere(50, -40, 12, 30, scale) // Right hand/fist
      
      // WAIST/PELVIS - Mechanical hip assembly
      addDetailedBox(0, -30, 65, 35, 35, 80, scale)
      addRing(0, -15, 30, 20, scale) // Waist ring
      
      // HIP JOINTS
      addDetailedSphere(-22, 5, 15, 30, scale) // Left hip
      addDetailedSphere(22, 5, 15, 30, scale) // Right hip
      
      // LEGS - Mechanical legs
      // Left thigh
      addCylinder(-22, 50, 13, 70, 50, scale)
      addRing(-22, 90, 14, 20, scale) // Knee joint
      
      // Left shin
      addCylinder(-22, 135, 11, 70, 50, scale)
      
      // Left foot
      addDetailedBox(-22, 180, 18, 20, 28, 40, scale)
      
      // Right thigh
      addCylinder(22, 50, 13, 70, 50, scale)
      addRing(22, 90, 14, 20, scale) // Knee joint
      
      // Right shin
      addCylinder(22, 135, 11, 70, 50, scale)
      
      // Right foot
      addDetailedBox(22, 180, 18, 20, 28, 40, scale)
      
      // Additional mechanical details
      addLine(-35, -120, -35, -65, 10, scale) // Left arm panel line
      addLine(35, -120, 35, -65, 10, scale) // Right arm panel line
      
      // Back power pack indicators
      addSmallSphere(-15, -100, 3, 8, scale)
      addSmallSphere(15, -100, 3, 8, scale)
    }

    // Enhanced helper functions for more detailed shapes
    const addDetailedSphere = (cx, cy, radius, particleCount, scale) => {
      const goldenRatio = (1 + Math.sqrt(5)) / 2
      const angleIncrement = Math.PI * 2 * goldenRatio

      for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount
        const inclination = Math.acos(1 - 2 * t)
        const azimuth = angleIncrement * i

        const x = cx + radius * Math.sin(inclination) * Math.cos(azimuth)
        const y = cy + radius * Math.sin(inclination) * Math.sin(azimuth)
        const z = radius * Math.cos(inclination)

        particles.push({
          x: x / scale,
          y: y / scale,
          z: z / scale,
          size: 1.5 + Math.random() * 1.0,
          baseSize: 1.5 + Math.random() * 1.0,
          brightness: 0.6 + Math.random() * 0.4
        })
      }
    }

    const addSmallSphere = (cx, cy, radius, particleCount, scale) => {
      for (let i = 0; i < particleCount; i++) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI
        
        const x = cx + radius * Math.sin(phi) * Math.cos(theta)
        const y = cy + radius * Math.sin(phi) * Math.sin(theta)
        const z = radius * Math.cos(phi)

        particles.push({
          x: x / scale,
          y: y / scale,
          z: z / scale,
          size: 1.5 + Math.random() * 0.8,
          baseSize: 1.5 + Math.random() * 0.8,
          brightness: 0.7 + Math.random() * 0.3
        })
      }
    }

    const addCylinder = (cx, cy, radius, height, particleCount, scale) => {
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.random()) * Math.PI * 2
        const h = (Math.random() - 0.5) * height
        
        const x = cx + radius * Math.cos(angle)
        const y = cy + h
        const z = radius * Math.sin(angle)

        particles.push({
          x: x / scale,
          y: y / scale,
          z: z / scale,
          size: 1.2 + Math.random() * 0.8,
          baseSize: 1.2 + Math.random() * 0.8,
          brightness: 0.5 + Math.random() * 0.3
        })
      }
    }

    const addRing = (cx, cy, radius, particleCount, scale) => {
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2
        const r = radius + (Math.random() - 0.5) * 3
        
        const x = cx + r * Math.cos(angle)
        const y = cy
        const z = r * Math.sin(angle)

        particles.push({
          x: x / scale,
          y: y / scale,
          z: z / scale,
          size: 1.5 + Math.random() * 0.8,
          baseSize: 1.5 + Math.random() * 0.8,
          brightness: 0.7 + Math.random() * 0.3
        })
      }
    }

    const addDetailedBox = (cx, cy, width, height, depth, particleCount, scale) => {
      for (let i = 0; i < particleCount; i++) {
        const side = Math.floor(Math.random() * 6)
        let x, y, z

        switch (side) {
          case 0: // Front face
            x = cx + (Math.random() - 0.5) * width
            y = cy + (Math.random() - 0.5) * height
            z = depth / 2
            break
          case 1: // Back face
            x = cx + (Math.random() - 0.5) * width
            y = cy + (Math.random() - 0.5) * height
            z = -depth / 2
            break
          case 2: // Top face
            x = cx + (Math.random() - 0.5) * width
            y = cy - height / 2
            z = (Math.random() - 0.5) * depth
            break
          case 3: // Bottom face
            x = cx + (Math.random() - 0.5) * width
            y = cy + height / 2
            z = (Math.random() - 0.5) * depth
            break
          case 4: // Left face
            x = cx - width / 2
            y = cy + (Math.random() - 0.5) * height
            z = (Math.random() - 0.5) * depth
            break
          case 5: // Right face
            x = cx + width / 2
            y = cy + (Math.random() - 0.5) * height
            z = (Math.random() - 0.5) * depth
            break
        }

        particles.push({
          x: x / scale,
          y: y / scale,
          z: z / scale,
          size: 1.2 + Math.random() * 0.8,
          baseSize: 1.2 + Math.random() * 0.8,
          brightness: 0.5 + Math.random() * 0.3
        })
      }
    }

    const addLine = (x1, y1, x2, y2, particleCount, scale) => {
      for (let i = 0; i < particleCount; i++) {
        const t = i / particleCount
        const x = x1 + (x2 - x1) * t
        const y = y1 + (y2 - y1) * t

        particles.push({
          x: x / scale,
          y: y / scale,
          z: 0,
          size: 1.3 + Math.random() * 0.7,
          baseSize: 1.3 + Math.random() * 0.7,
          brightness: 0.6 + Math.random() * 0.3
        })
      }
    }

    const addEllipse = (cx, cy, radiusX, radiusY, particleCount, scale) => {
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2
        const x = cx + radiusX * Math.cos(angle)
        const y = cy + radiusY * Math.sin(angle)

        particles.push({
          x: x / scale,
          y: y / scale,
          z: 0,
          size: 1.3 + Math.random() * 0.7,
          baseSize: 1.3 + Math.random() * 0.7,
          brightness: 0.6 + Math.random() * 0.3
        })
      }
    }

    createRobotShape()

    let rotationX = 0.15 // Start with slight angle
    let rotationY = 0
    let animationId

    const rotate3D = (x, y, z, angleX, angleY) => {
      // Rotate around X axis
      let newY = y * Math.cos(angleX) - z * Math.sin(angleX)
      let newZ = y * Math.sin(angleX) + z * Math.cos(angleX)

      // Rotate around Y axis
      let newX = x * Math.cos(angleY) - newZ * Math.sin(angleY)
      newZ = x * Math.sin(angleY) + newZ * Math.cos(angleY)

      return { x: newX, y: newY, z: newZ }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Gentle continuous rotation
      rotationY += 0.003

      // Calculate rotated positions and sort by depth
      const rotatedParticles = particles.map((particle) => {
        const rotated = rotate3D(
          particle.x,
          particle.y,
          particle.z,
          rotationX,
          rotationY
        )

        // Perspective projection
        const perspective = 500
        const scale = perspective / (perspective + rotated.z * 100)
        const x2d = centerX + rotated.x * 100 * scale
        const y2d = centerY + rotated.y * 100 * scale

        return {
          x: x2d,
          y: y2d,
          z: rotated.z,
          size: Math.max(0.5, particle.baseSize * scale), // Ensure minimum size
          depth: rotated.z,
          brightness: particle.brightness
        }
      })

      // Sort by depth (draw far particles first)
      rotatedParticles.sort((a, b) => a.depth - b.depth)

      // Draw subtle connections for mechanical appearance
      ctx.strokeStyle = 'rgba(251, 146, 60, 0.08)'
      ctx.lineWidth = 0.3
      
      for (let i = 0; i < rotatedParticles.length; i += 3) {
        for (let j = i + 1; j < Math.min(i + 5, rotatedParticles.length); j++) {
          const dx = rotatedParticles[i].x - rotatedParticles[j].x
          const dy = rotatedParticles[i].y - rotatedParticles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < 25 && Math.abs(rotatedParticles[i].depth - rotatedParticles[j].depth) < 0.3) {
            const alpha = (1 - distance / 25) * 0.15
            ctx.strokeStyle = `rgba(251, 146, 60, ${alpha})`
            ctx.beginPath()
            ctx.moveTo(rotatedParticles[i].x, rotatedParticles[i].y)
            ctx.lineTo(rotatedParticles[j].x, rotatedParticles[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw particles with enhanced effects
      rotatedParticles.forEach((particle) => {
        // Ensure particle size is always positive
        const particleSize = Math.max(0.5, particle.size)
        
        // Calculate opacity based on depth (front particles brighter)
        const depthOpacity = 0.3 + ((particle.depth + 1) / 2) * 0.5
        const finalOpacity = Math.max(0.1, Math.min(1, depthOpacity * particle.brightness))

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particleSize, 0, Math.PI * 2)

        // Core particle
        ctx.fillStyle = `rgba(251, 146, 60, ${finalOpacity})`
        ctx.fill()

        // Enhanced glow for front particles
        if (particle.depth > 0.3) {
          const glowIntensity = (particle.depth - 0.3) / 0.7
          ctx.shadowBlur = 8 + glowIntensity * 8
          ctx.shadowColor = `rgba(251, 146, 60, ${glowIntensity * 0.8})`
          ctx.fill()
          ctx.shadowBlur = 0
        }

        // Highlight bright core for prominent particles
        if (particle.depth > 0.6 && particleSize > 1) {
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, particleSize * 0.4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255, 200, 100, ${(particle.depth - 0.6) * 0.6})`
          ctx.fill()
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [])

  return (
    <section className='relative flex min-h-screen flex-col overflow-hidden'>
      {/* Enhanced Background Effects */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='h-[900px] w-[900px] rounded-full bg-orange-500/10 blur-[150px]' />
        <div className='absolute h-[700px] w-[700px] rounded-full bg-orange-400/5 blur-[120px] animate-pulse' />
      </div>

      {/* Subtle grid overlay */}
      <div className='absolute inset-0 opacity-[0.02]' style={{
        backgroundImage: 'linear-gradient(rgba(251, 146, 60, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(251, 146, 60, 0.3) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      {/* Main Hero Content */}
      <div className='flex flex-1 items-center justify-center px-4 py-20 sm:px-6 lg:px-8'>
        <div className='relative z-10 mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2'>
          {/* Left: Text Content */}
          <div className='text-center lg:text-left order-2 lg:order-1'>
            {/* Ready Badge */}
            <div className='mb-8 inline-flex items-center justify-center lg:justify-start'>
              <span className='rounded-full border border-orange-600/30 bg-neutral-900/50 px-6 py-2 text-sm text-neutral-300 backdrop-blur-sm'>
                Ready?
              </span>
            </div>

            {/* Main Heading */}
            <h1 className='mb-8 text-5xl leading-tight font-bold sm:text-6xl lg:text-7xl'>
              <span className='text-neutral-300'>Build and Launch</span>
              <br />
              <span className='text-neutral-400'>AI Agents Today</span>
              
            </h1>
  
            {/* Subtitle */}
            <p className='mb-8 text-lg text-neutral-500 max-w-xl mx-auto lg:mx-0'>
              Create powerful AI automation with no code required. Deploy intelligent agents in minutes.
            </p>

            {/* CTA Button */}
            <div className='flex justify-center lg:justify-start'>
              <Button
                onClick={onGetStarted}
                className='group flex flex-row items-center justify-between gap-6 rounded-full border border-neutral-700 bg-neutral-900/50 px-8 py-4 whitespace-nowrap backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-orange-600/50 hover:bg-neutral-800/50'
              >
                <div className='flex items-center gap-3'>
                  <svg
                    className='h-5 w-5 text-orange-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                  <span className='font-medium text-neutral-200'>Get Started</span>
                </div>
                <ChevronRight className='h-5 w-5 text-neutral-500 transition-transform group-hover:translate-x-1' />
              </Button>
            </div>
          </div>

          {/* Right: Enhanced Robot Particle Animation */}
          <div className='flex items-center justify-center order-1 lg:order-2'>
            <div className='relative'>
              <canvas
                ref={canvasRef}
                width={600}
                height={700}
                className='h-auto max-w-full'
              />
              
              {/* Enhanced floating decorative elements */}
              <div className='absolute -top-10 -right-10 hidden lg:block animate-float'>
                <div className='flex h-20 w-20 rotate-12 transform items-center justify-center rounded-xl border border-orange-600/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-sm shadow-lg shadow-orange-500/10'>
                  <svg
                    className='h-10 w-10 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
                    />
                  </svg>
                </div>
              </div>

              <div className='absolute -bottom-10 -left-10 hidden lg:block animate-float-delayed'>
                <div className='flex h-16 w-16 -rotate-12 transform items-center justify-center rounded-lg border border-orange-600/30 bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-sm shadow-lg shadow-orange-500/10'>
                  <svg
                    className='h-8 w-8 text-orange-400 drop-shadow-[0_0_6px_rgba(251,146,60,0.5)]'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M13 10V3L4 14h7v7l9-11h-7z'
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(12deg);
          }
          50% {
            transform: translateY(-20px) rotate(18deg);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0) rotate(-12deg);
          }
          50% {
            transform: translateY(-15px) rotate(-18deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </section>
  )
}
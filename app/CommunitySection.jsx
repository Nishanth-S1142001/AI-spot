'use client'

import { useEffect, useRef } from 'react'
import Button from '../components/ui/button'

export default function CommunitySection() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const particles = []
    const particleCount = 200
    const globeRadius = 120
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Create particles on sphere surface using Fibonacci sphere algorithm
    const goldenRatio = (1 + Math.sqrt(5)) / 2
    const angleIncrement = Math.PI * 2 * goldenRatio

    for (let i = 0; i < particleCount; i++) {
      const t = i / particleCount
      const inclination = Math.acos(1 - 2 * t)
      const azimuth = angleIncrement * i

      const x = Math.sin(inclination) * Math.cos(azimuth)
      const y = Math.sin(inclination) * Math.sin(azimuth)
      const z = Math.cos(inclination)

      particles.push({
        x: x,
        y: y,
        z: z,
        size: 1.5 + Math.random() * 1.5,
        baseSize: 1.5 + Math.random() * 1.5,
        inclination: inclination, // Store for vertical grouping
        azimuth: azimuth
      })
    }

    let rotationX = 0
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

      // Update rotation
      rotationX += 0.003
      rotationY += 0.005

      // Calculate rotated positions
      const rotatedParticles = particles.map((particle) => {
        const rotated = rotate3D(
          particle.x,
          particle.y,
          particle.z,
          rotationX,
          rotationY
        )

        // Perspective projection
        const scale = 300 / (300 + rotated.z * globeRadius)
        const x2d = centerX + rotated.x * globeRadius * scale
        const y2d = centerY + rotated.y * globeRadius * scale

        return {
          x: x2d,
          y: y2d,
          z: rotated.z,
          size: particle.baseSize * scale,
          depth: rotated.z,
          inclination: particle.inclination,
          azimuth: particle.azimuth,
          originalX: particle.x,
          originalY: particle.y,
          originalZ: particle.z
        }
      })

      // Sort by depth for drawing order
      const sortedParticles = [...rotatedParticles].sort(
        (a, b) => a.depth - b.depth
      )

      // Group particles by latitude (similar Y coordinate on sphere)
      // Create latitude bands
      // const latitudeBands = []
      // const bandCount = 12 // Number of horizontal bands around globe

      // for (let i = 0; i < bandCount; i++) {
      //   latitudeBands[i] = []
      // }

      // rotatedParticles.forEach((particle) => {
      //   // Group by original Y position (latitude on sphere)
      //   const normalizedY = (particle.originalY + 1) / 2 // Map from [-1, 1] to [0, 1]
      //   const bandIndex = Math.floor(normalizedY * (bandCount - 1))
      //   latitudeBands[bandIndex].push(particle)
      // })

      // // Draw horizontal connections (latitude lines)
      // ctx.lineWidth = 0.8

      // latitudeBands.forEach((band) => {
      //   if (band.length < 2) return

      //   // Sort particles in band by azimuth angle for proper connection order
      //   band.sort((a, b) => a.azimuth - b.azimuth)

      //   for (let i = 0; i < band.length; i++) {
      //     const particleA = band[i]
      //     const particleB = band[(i + 1) % band.length] // Connect to next, wrapping around

      //     // Only draw if both particles are somewhat visible
      //     if (particleA.depth > -0.5 && particleB.depth > -0.5) {
      //       // Calculate distance to avoid connecting particles that are too far apart
      //       const dx = particleA.x - particleB.x
      //       const dy = particleA.y - particleB.y
      //       const distance = Math.sqrt(dx * dx + dy * dy)

      //       // Only connect if reasonably close (avoid connecting across globe)
      //       if (distance < 80) {
      //         const avgDepth = (particleA.depth + particleB.depth) / 2
      //         const depthOpacity = (avgDepth + 1) / 2
      //         const lineOpacity = depthOpacity * 0.3

      //         ctx.beginPath()
      //         ctx.strokeStyle = `rgba(251, 146, 60, ${lineOpacity})`
      //         ctx.moveTo(particleA.x, particleA.y)
      //         ctx.lineTo(particleB.x, particleB.y)
      //         ctx.stroke()
      //       }
      //     }
      //   }
      // })

      // Draw particles on top of lines
      sortedParticles.forEach((particle) => {
        // Calculate opacity based on depth
        const opacity = (particle.depth + 1) / 2 // Map from [-1, 1] to [0, 1]

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)

        // Orange particles with depth-based opacity
        const brightness = 0.4 + opacity * 0.4
        ctx.fillStyle = `rgba(251, 146, 60, ${brightness})`
        ctx.fill()

        // Add glow effect for particles in front
        if (particle.depth > 0.3) {
          ctx.shadowBlur = 8
          ctx.shadowColor = 'rgba(251, 146, 60, 0.6)'
          ctx.fill()
          ctx.shadowBlur = 0
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
    <section className='relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8'>
      {/* Background Glow */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[120px]' />
      </div>

      <div className='relative mx-auto max-w-7xl'>
        <div className='grid items-center gap-12 lg:grid-cols-2'>
          {/* Left Content */}
          <div className='text-center lg:text-left'>
            {/* Badge */}
            <div className='mb-8 inline-flex items-center justify-center'>
              <span className='rounded-full border border-neutral-700 bg-neutral-900/50 px-6 py-2 text-sm text-neutral-300 backdrop-blur-sm'>
                Community
              </span>
            </div>

            {/* Heading */}
            <h2 className='mb-6 text-4xl leading-tight font-bold sm:text-5xl lg:text-5xl'>
              <span className='text-neutral-400'>Join our community of</span>
              <br />
              <span className='text-neutral-300'>100K+ AI builders</span>
            </h2>

            {/* Subtitle */}
            <p className='mb-8 text-lg text-neutral-500'>
              Learn, share, and grow with automation experts from around the
              world
            </p>

            {/* CTA Button */}
            <Button
              disabled={true}
              className='inline-flex items-center gap-3 rounded-full border border-neutral-700 bg-neutral-900/50 px-8 py-4 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-orange-600/50 hover:bg-neutral-800/50'
            >
              <span className='font-medium text-neutral-200'>Comming Soon</span>
            </Button>
          </div>

          {/* Right Content - 3D Rotating Globe with Latitude Lines */}
          <div className='flex items-center justify-center'>
            <div className='relative'>
              <canvas
                ref={canvasRef}
                width={400}
                height={400}
                className='h-auto max-w-full'
              />
              {/* Center Icon */}
              {/* <div className='absolute inset-0 flex items-center justify-center'>
                <div className='flex h-24 w-24 rotate-12 transform items-center justify-center rounded-2xl border border-orange-600/30 bg-orange-500/20 backdrop-blur-sm transition-transform duration-500 hover:rotate-0'>
                  <svg
                    className='h-12 w-12 text-orange-400'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

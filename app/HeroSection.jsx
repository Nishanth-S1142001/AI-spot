'use client'

import { memo } from 'react'
import { ArrowRight, Zap, Shield, TrendingUp } from 'lucide-react'
import Button from '../components/ui/button'
import Card from '../components/ui/card'

const HeroSection = memo(({ onGetStarted }) => {
  return (
    <section className='relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto w-full'>
        <div className='text-center space-y-8'>
          {/* Badge */}
          <div className='inline-flex items-center gap-2 rounded-full bg-orange-900/20 border border-orange-600/30 px-4 py-2 text-sm text-orange-400'>
            <Zap className='h-4 w-4' />
            <span>Powered by AI Technology</span>
          </div>

          {/* Heading */}
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-100 leading-tight'>
            Build The Future With{' '}
            <span className='bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 bg-clip-text text-transparent'>
              AI-Powered
            </span>{' '}
            Solutions
          </h1>

          {/* Subheading */}
          <p className='max-w-2xl mx-auto text-lg sm:text-xl text-neutral-300 leading-relaxed'>
            Transform your business with cutting-edge artificial intelligence. 
            Automate workflows, gain insights, and scale faster than ever before.
          </p>

          {/* CTA Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
            <Button
              onClick={onGetStarted}
              text='Get Started Free'
              className='group inline-flex items-center gap-2'
            >
              <span>Get Started Free</span>
              <ArrowRight className='h-5 w-5 transition-transform group-hover:translate-x-1' />
            </Button>
            
            <button className='inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-6 py-3 text-neutral-100 transition-all hover:border-orange-600/50 hover:bg-neutral-800'>
              <span>Watch Demo</span>
            </button>
          </div>

          {/* Feature Cards */}
          <div className='grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto mt-16'>
            <Card className='group p-6 bg-gradient-to-br from-orange-900/40 to-orange-950/20 border-orange-600/30 hover:border-orange-600/50 transition-all hover:scale-105'>
              <Zap className='h-8 w-8 text-orange-400 mb-4' />
              <h3 className='text-lg font-semibold text-neutral-100 mb-2'>Lightning Fast</h3>
              <p className='text-sm text-neutral-400'>Process data at unprecedented speeds</p>
            </Card>

            <Card className='group p-6 bg-gradient-to-br from-blue-900/40 to-blue-950/20 border-blue-600/30 hover:border-blue-600/50 transition-all hover:scale-105'>
              <Shield className='h-8 w-8 text-blue-400 mb-4' />
              <h3 className='text-lg font-semibold text-neutral-100 mb-2'>Secure by Default</h3>
              <p className='text-sm text-neutral-400'>Enterprise-grade security built-in</p>
            </Card>

            <Card className='group p-6 bg-gradient-to-br from-green-900/40 to-green-950/20 border-green-600/30 hover:border-green-600/50 transition-all hover:scale-105'>
              <TrendingUp className='h-8 w-8 text-green-400 mb-4' />
              <h3 className='text-lg font-semibold text-neutral-100 mb-2'>Scale Infinitely</h3>
              <p className='text-sm text-neutral-400'>Grow without infrastructure limits</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
})

HeroSection.displayName = 'HeroSection'

export default HeroSection

'use client'

import styles from './page.module.css'
import { useRouter } from 'next/navigation'
import NeonBackground from './ui_components/primaryBackground/page'
import myVideo2 from '../public/robot2.mp4'
import { useEffect, useRef } from 'react'

// Importing icons for the new sections
import {
  Bot,
  Code,
  Cloud,
  Quote,
  Twitter,
  Linkedin,
  Github
} from 'lucide-react'


export default function Home() {
  const router = useRouter()
  const handClick = () => {
    router.push('/register')
  }
  const videoRef = useRef(null)

  const handleBuildnow = () => {
    router.push('/login') // Redirect to login page
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.5 // Set speed to 0.5x
    }
  }, [])

  return (
    <div>
      <NeonBackground />
      {/* 1. Header / Menu */}

      {/* Hero Section (Your original content) */}
      <div
        id='home'
        className='relative flex h-screen flex-col items-center justify-center  p-6'
      >
        {/* Background video */}
        <video
          ref={videoRef}
          src={myVideo2}
          autoPlay
          muted
          loop
          className='absolute top-18 left-0 h-full w-full mask-b-from-[55%] object-cover opacity-40'
        />
        <div className='z-10 flex flex-col items-center justify-center py-8 text-center font-medium tracking-[1rem] text-white uppercase'>
          <h1 className='m-2 text-[130px]'>
            {'build'}{' '}
            <span className='bg-black text-[115px] text-white shadow-xl shadow-white'>
              your
            </span>
          </h1>
          <h1 className='m-2 text-[100px]'>
            <span className='shadow-[#024a70] bg-black text-blue-400 shadow-lg'>
              no code
            </span>
            {' AI agents'}
          </h1>
          <h1 className='mt-2 mb-5 text-[50px]'>now</h1>
          <div className={styles.buttons}>
            <button onClick={handleBuildnow}>build now</button>
            <button onClick={handClick}>sign up</button>
          </div>
        </div>
      </div>
      {/* Main content container for all sections */}
      <main className='bg-opacity-80 relative z-10 text-white'>
        {/* 2. About Us Section */}
        <section id='about' className='px-4 py-20 shadow-2xl shadow-black'>
          <div className='container mx-auto max-w-4xl bg-black text-center'>
            <h2 className='mb-6 text-4xl font-bold tracking-wider uppercase'>
              About Us
            </h2>
            <p className='text-lg leading-relaxed text-gray-300'>
              We are pioneers in the no-code AI revolution. Our mission is to
              empower creators, entrepreneurs, and businesses of all sizes to
              build powerful, autonomous AI agents without writing a single line
              of code. We believe the future of automation is accessible to
              everyone.
            </p>
          </div>
        </section>
        <div className='flex justify-center'></div>

        {/* 3. Services Provided Section */}
        <section
          id='services'
          className='bg-opacity-20 bg-tranparent px-4 py-20 shadow-xl shadow-black'
        >
          <div className='container mx-auto max-w-6xl text-center'>
            <h2 className='mb-12 text-4xl font-bold tracking-wider uppercase'>
              Our Services
            </h2>
            <div className='grid gap-8 md:grid-cols-3'>
              {/* Service Card 1 */}
              <div className='transform rounded-lg border border-cyan-500/20 bg-gray-800 p-8 transition-all hover:-translate-y-2 hover:border-cyan-500'>
                <Bot size={48} className='mx-auto mb-4 text-cyan-400' />
                <h3 className='mb-2 text-2xl font-semibold'>
                  Custom AI Agent Builder
                </h3>
                <p className='text-gray-400'>
                  An intuitive drag-and-drop interface to design, train, and
                  deploy AI agents for any task.
                </p>
              </div>
              {/* Service Card 2 */}
              <div className='transform rounded-lg border border-cyan-500/20 bg-gray-800 p-8 transition-all hover:-translate-y-2 hover:border-cyan-500'>
                <Code size={48} className='mx-auto mb-4 text-cyan-400' />
                <h3 className='mb-2 text-2xl font-semibold'>API Integration</h3>
                <p className='text-gray-400'>
                  Seamlessly connect your AI agents to thousands of third-party
                  apps and services.
                </p>
              </div>
              {/* Service Card 3 */}
              <div className='transform rounded-lg border border-cyan-500/20 bg-gray-800 p-8 transition-all hover:-translate-y-2 hover:border-cyan-500'>
                <Cloud size={48} className='mx-auto mb-4 text-cyan-400' />
                <h3 className='mb-2 text-2xl font-semibold'>
                  Cloud Deployment
                </h3>
                <p className='text-gray-400'>
                  One-click deployment to our secure and scalable cloud
                  infrastructure.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Testimonials Section */}
        <section
          id='testimonials'
          className='px-4 py-20 shadow-2xl shadow-black'
        >
          <div className='container mx-auto max-w-4xl text-center'>
            <h2 className='mb-12 text-4xl font-bold tracking-wider uppercase'>
              What Our Clients Say
            </h2>
            <div className='space-y-8'>
              {/* Testimonial 1 */}
              <div className='relative rounded-lg bg-gray-800 p-6 text-left'>
                <Quote
                  size={40}
                  className='absolute top-4 left-4 text-cyan-600 opacity-20'
                />
                <blockquote className='text-lg text-gray-300 italic'>
                  "This platform changed the game for our startup. We automated
                  80% of our customer support in a week without hiring a
                  developer. Incredible!"
                </blockquote>
                <cite className='mt-4 block text-right font-semibold text-cyan-400 not-italic'>
                  - Jane Doe, CEO of Tech Innovators
                </cite>
              </div>
              {/* Testimonial 2 */}
              <div className='relative rounded-lg bg-gray-800 p-6 text-left'>
                <Quote
                  size={40}
                  className='absolute top-4 left-4 text-cyan-600 opacity-20'
                />
                <blockquote className='text-lg text-gray-300 italic'>
                  "The flexibility of the agent builder is unmatched. I was able
                  to create a complex marketing automation agent that now saves
                  me 10 hours a week."
                </blockquote>
                <cite className='mt-4 block text-right font-semibold text-cyan-400 not-italic'>
                  - John Smith, Marketing Freelancer
                </cite>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Pricing Section */}
        <section
          id='pricing'
          className='bg-opacity-20 bg-tranparent shadow-[#024a70] px-4 py-20 shadow-xl'
        >
          <div className='container mx-auto max-w-6xl text-center'>
            <h2 className='mb-12 text-4xl font-bold tracking-wider uppercase'>
              Pricing Plans
            </h2>
            <div className='grid gap-8 md:grid-cols-3'>
              {/* Plan 1: Starter */}
              <div className='flex flex-col rounded-lg border border-gray-700 bg-gray-800 p-8'>
                <h3 className='mb-2 text-2xl font-semibold'>Starter</h3>
                <p className='mb-4 text-5xl font-bold'>
                  $49
                  <span className='text-lg font-normal text-gray-400'>/mo</span>
                </p>
                <ul className='mb-8 flex-grow space-y-2 text-left text-gray-300'>
                  <li>✔ 1 AI Agent</li>
                  <li>✔ 10,000 Operations/mo</li>
                  <li>✔ Basic API Integrations</li>
                  <li>✔ Email Support</li>
                </ul>
                <button className='mt-auto w-full rounded bg-gray-600 px-4 py-2 font-bold text-white transition-colors hover:bg-gray-500'>
                  Choose Plan
                </button>
              </div>
              {/* Plan 2: Pro (Highlighted) */}
              <div className='relative flex flex-col rounded-lg border-2 border-cyan-500 bg-gray-800 p-8'>
                <span className='absolute top-0 -translate-y-1/2 rounded-full bg-cyan-500 px-3 py-1 text-sm font-bold text-black'>
                  MOST POPULAR
                </span>
                <h3 className='mb-2 text-2xl font-semibold'>Pro</h3>
                <p className='mb-4 text-5xl font-bold text-cyan-400'>
                  $99
                  <span className='text-lg font-normal text-gray-400'>/mo</span>
                </p>
                <ul className='mb-8 flex-grow space-y-2 text-left text-gray-300'>
                  <li>✔ 10 AI Agents</li>
                  <li>✔ 100,000 Operations/mo</li>
                  <li>✔ Advanced API Integrations</li>
                  <li>✔ Priority Email Support</li>
                </ul>
                <button className='mt-auto w-full rounded bg-cyan-500 px-4 py-2 font-bold text-black transition-colors hover:bg-cyan-400'>
                  Choose Plan
                </button>
              </div>
              {/* Plan 3: Enterprise */}
              <div className='flex flex-col rounded-lg border border-gray-700 bg-gray-800 p-8'>
                <h3 className='mb-2 text-2xl font-semibold'>Enterprise</h3>
                <p className='mb-4 text-4xl font-bold'>Custom</p>
                <ul className='mb-8 flex-grow space-y-2 text-left text-gray-300'>
                  <li>✔ Unlimited Agents</li>
                  <li>✔ Unlimited Operations</li>
                  <li>✔ Custom Integrations</li>
                  <li>✔ 24/7 Dedicated Support</li>
                </ul>
                <button className='mt-auto w-full rounded bg-gray-600 px-4 py-2 font-bold text-white transition-colors hover:bg-gray-500'>
                  Contact Us
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* 6. Contact Us / Footer Section */}
      <footer
        id='contact'
        className='bg-tranparent relative z-10 px-4 py-10 text-center text-gray-400'
      >
        <div className='container mx-auto'>
          <h2 className='mb-4 text-3xl font-bold text-white'>Get In Touch</h2>
          <p className='mb-6'>Have questions? We'd love to hear from you.</p>
          <p className='mb-8 text-lg text-cyan-400'>contact@aiagentsinc.com</p>
          <div className='mb-8 flex justify-center space-x-6'>
            <a href='#' className='transition-colors hover:text-white'>
              <Twitter size={28} />
            </a>
            <a href='#' className='transition-colors hover:text-white'>
              <Linkedin size={28} />
            </a>
            <a href='#' className='transition-colors hover:text-white'>
              <Github size={28} />
            </a>
          </div>
          <p className='text-sm'>
            &copy; {new Date().getFullYear()} AI Agents Inc. All Rights
            Reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

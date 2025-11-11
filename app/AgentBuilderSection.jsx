'use client'

import { useState, useEffect } from 'react'
import Button from '../components/ui/button'
export default function AgentBuilderSection({ onLoginClick }) {
  const [prompt, setPrompt] = useState('')
  const [currentPlaceholder, setCurrentPlaceholder] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isWaiting, setIsWaiting] = useState(false)

  const placeholders = [
    'Create an agent that can research my competitors...',
    'Build an AI that automates customer support..',
    'Design an agent to analyze market trends...',
    'Make a bot that schedules meetings automatically...',
    'Create an assistant that writes blog posts..',
    'Build an agent that monitors social media...',
    'Design a system that generates sales reports..',
    'Make an AI that manages email responses...'
  ]

  useEffect(() => {
    if (prompt) return // Don't animate if user is typing

    const currentText = placeholders[placeholderIndex]

    if (isWaiting) {
      const waitTimeout = setTimeout(() => {
        setIsWaiting(false)
        setIsDeleting(true)
      }, 2000) // Wait 2 seconds before deleting
      return () => clearTimeout(waitTimeout)
    }

    if (!isDeleting && charIndex < currentText.length) {
      // Typing
      const typingTimeout = setTimeout(() => {
        setCurrentPlaceholder(currentText.substring(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      }, 50) // Typing speed
      return () => clearTimeout(typingTimeout)
    } else if (!isDeleting && charIndex === currentText.length) {
      // Finished typing, wait before deleting
      setIsWaiting(true)
    } else if (isDeleting && charIndex > 0) {
      // Deleting
      const deletingTimeout = setTimeout(() => {
        setCurrentPlaceholder(currentText.substring(0, charIndex - 1))
        setCharIndex(charIndex - 1)
      }, 30) // Deleting speed (faster)
      return () => clearTimeout(deletingTimeout)
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting, move to next placeholder
      setIsDeleting(false)
      setPlaceholderIndex((placeholderIndex + 1) % placeholders.length)
    }
  }, [charIndex, isDeleting, placeholderIndex, prompt, isWaiting])

  const handleSubmit = () => {
    if (prompt.trim()) {
      // Handle agent creation
      console.log('Creating agent:', prompt)
    }
  }

  return (
    <section className='relative px-4 py-32 sm:px-6 lg:px-8'>
      {/* Background Glow */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <div className='h-[600px] w-[600px] rounded-full bg-orange-500/10 blur-[120px]' />
        <div className='absolute h-[400px] w-[400px] animate-pulse rounded-full bg-orange-400/5 blur-[100px]' />
      </div>

      <div className='relative mx-auto max-w-4xl text-center'>
        {/* Title */}
        <h2 className='mb-12 text-4xl leading-tight font-bold text-neutral-400 sm:text-5xl lg:text-6xl'>
          What agent do you want to build?
        </h2>

        {/* Input Container */}
        <div className='relative'>
          <div className='group relative rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 backdrop-blur-sm transition-all duration-300 no-outline'>
            {/* Animated border glow on focus */}
            <div className='pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500/0 via-orange-500/20 to-orange-500/0 opacity-0 blur-xl transition-opacity duration-500 group-focus-within:opacity-100' />

            <div className='relative'>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={currentPlaceholder}
                className='min-h-[120px] w-full resize-none bg-transparent text-lg text-neutral-300 placeholder-neutral-600 focus:outline-none'
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />

              {/* Typing cursor effect when empty */}
              {!prompt && (
                <span className='pointer-events-none absolute top-0 left-0 text-lg text-neutral-600'>
                  {currentPlaceholder}
                  <span className='animate-blink ml-0.5 inline-block h-5 w-0.5 bg-orange-500' />
                </span>
              )}
            </div>

            {/* Bottom Bar */}
            <div className='mt-4 flex items-center justify-between border-t border-neutral-800 pt-4'>
              {/* Templates Button */}
              <Button
                onClick={onLoginClick}
                className='group/btn inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800/50 px-4 py-2 text-sm text-neutral-300 transition-all duration-300 hover:border-orange-600/50 hover:bg-neutral-700/50 hover:text-orange-400'
              >
                <svg
                  className='h-4 w-4 transition-transform group-hover/btn:scale-110'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                Templates
              </Button>

              {/* Submit Button */}
              <button
                onClick={onLoginClick}
                disabled={!prompt.trim()}
                className='group/submit relative inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-orange-500/20 text-orange-400 transition-all duration-300 hover:scale-110 hover:bg-orange-500/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100'
              >
                {/* Ripple effect on hover */}
                <span className='absolute inset-0 scale-0 rounded-full bg-orange-500/0 transition-all duration-500 group-hover/submit:scale-150 group-hover/submit:bg-orange-500/10' />

                <svg
                  className='relative z-10 h-6 w-6 transition-transform group-hover/submit:translate-x-0.5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Floating particles effect */}
          <div className='pointer-events-none absolute -inset-4'>
            <div className='animate-float-particle-1 absolute top-0 left-1/4 h-2 w-2 rounded-full bg-orange-500/30' />
            <div className='animate-float-particle-2 absolute top-1/3 right-1/4 h-1.5 w-1.5 rounded-full bg-orange-400/20' />
            <div className='animate-float-particle-3 absolute bottom-1/4 left-1/3 h-2.5 w-2.5 rounded-full bg-orange-500/20' />
          </div>
        </div>

        {/* Helper Text with subtle animation */}
        <div className='mt-6 space-y-2 text-sm text-neutral-500'>
          <p className='animate-fade-in'>
            Press{' '}
            <kbd className='rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-mono text-xs text-neutral-400'>
              Enter
            </kbd>{' '}
            to create •{' '}
            <kbd className='rounded border border-neutral-700 bg-neutral-800 px-2 py-0.5 font-mono text-xs text-neutral-400'>
              Shift + Enter
            </kbd>{' '}
            for new line
          </p>

          {/* Suggestion pills */}
          <div className='animate-fade-in-delayed mt-4 flex flex-wrap items-center justify-center gap-2'>
            <span className='text-xs text-neutral-600'>Try:</span>
            {[
              'Customer Support',
              'Sales Agent',
              'Data Analyst',
              'Content Writer'
            ].map((suggestion, idx) => (
              <Button
                key={idx}
                onClick={() =>
                  setPrompt(
                    `Create an agent that can ${suggestion.toLowerCase()}`
                  )
                }
                className='rounded-full border border-neutral-700 bg-neutral-800/50 px-3 py-1 text-xs text-neutral-400 transition-all duration-300 hover:scale-105 hover:border-orange-600/50 hover:bg-neutral-800 hover:text-orange-400'
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blink {
          0%,
          49% {
            opacity: 1;
          }
          50%,
          100% {
            opacity: 0;
          }
        }

        @keyframes float-particle-1 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          50% {
            transform: translate(10px, -20px) scale(1.2);
            opacity: 0.6;
          }
        }

        @keyframes float-particle-2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.2;
          }
          50% {
            transform: translate(-15px, -15px) scale(1.3);
            opacity: 0.5;
          }
        }

        @keyframes float-particle-3 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.25;
          }
          50% {
            transform: translate(12px, 18px) scale(1.1);
            opacity: 0.55;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blink {
          animation: blink 1s step-end infinite;
        }

        .animate-float-particle-1 {
          animation: float-particle-1 8s ease-in-out infinite;
        }

        .animate-float-particle-2 {
          animation: float-particle-2 6s ease-in-out infinite;
          animation-delay: 1s;
        }

        .animate-float-particle-3 {
          animation: float-particle-3 7s ease-in-out infinite;
          animation-delay: 2s;
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-fade-in-delayed {
          opacity: 0;
          animation: fade-in 0.8s ease-out 0.3s forwards;
        }
      `}</style>
    </section>
  )
}

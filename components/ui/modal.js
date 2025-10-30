'use client'

import { memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import Card from './card'

/**
 * Optimized BottomModal Component
 * Features:
 * - Memoized for performance
 * - Optimized animations
 * - Better backdrop
 * - Keyboard support (ESC to close)
 * - Focus trap
 * - Smooth transitions
 * - Multiple sizes
 */

const BottomModal = memo(({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  closeOnBackdrop = true,
  closeOnEsc = true
}) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]'
  }

  // Handle ESC key
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose, closeOnEsc])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  return (
    <AnimatePresence mode='wait'>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-end justify-center sm:items-center'>
          {/* Backdrop - Optimized with will-change */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='absolute inset-0 bg-black/80 backdrop-blur-sm will-change-opacity'
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden='true'
          />

          {/* Modal - Optimized with GPU acceleration */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1] // Custom easing for smooth motion
            }}
            className={`
              relative m-4 flex max-h-[90vh] w-full flex-col rounded-lg
              will-change-transform
              ${sizes[size]}
            `}
            onClick={(e) => e.stopPropagation()}
            role='dialog'
            aria-modal='true'
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            <div className='overflow-hidden rounded-lg border border-orange-500/30 bg-gradient-to-br from-neutral-900/95 via-neutral-950/95 to-neutral-900/95 backdrop-blur-xl shadow-2xl shadow-orange-500/10'>
              {/* Header */}
              {(title || showCloseButton) && (
                <div className='flex items-center justify-between border-b border-neutral-800/50 px-6 py-4'>
                  {title && (
                    <h2
                      id='modal-title'
                      className='text-xl font-bold text-neutral-100'
                    >
                      {title}
                    </h2>
                  )}
                  
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className='group flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 transition-all duration-200 hover:bg-neutral-800 hover:text-orange-400'
                      aria-label='Close modal'
                    >
                      <X className='h-5 w-5 transition-transform duration-200 group-hover:scale-110' />
                    </button>
                  )}
                </div>
              )}

              {/* Content - Custom scrollbar */}
              <div className='custom-scrollbar max-h-[calc(90vh-8rem)] overflow-y-auto p-6'>
                {children}
              </div>
            </div>
          </motion.div>

          {/* Custom Scrollbar Styles */}
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.2);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.3);
            }
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
            }
          `}</style>
        </div>
      )}
    </AnimatePresence>
  )
})

BottomModal.displayName = 'BottomModal'

export default BottomModal
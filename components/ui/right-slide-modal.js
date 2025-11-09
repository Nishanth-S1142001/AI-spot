'use client'

import { memo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * Right Slide Modal Component
 * Slides in from right to left, occupies 50% of screen width
 */

const RightSlideModal = memo(({
  isOpen,
  onClose,
  title,
  children,
  closeOnBackdrop = true,
  closeOnEsc = true,
  color = 'orange' // orange, blue, green, purple, pink
}) => {
  const colorStyles = {
    orange: {
      border: 'border-orange-500/30',
      gradient: 'from-orange-900/20 via-neutral-950/95 to-neutral-900/95',
      shadow: 'shadow-orange-500/10',
      hover: 'hover:text-orange-400',
      title: 'text-orange-400'
    },
    blue: {
      border: 'border-blue-500/30',
      gradient: 'from-blue-900/20 via-neutral-950/95 to-neutral-900/95',
      shadow: 'shadow-blue-500/10',
      hover: 'hover:text-blue-400',
      title: 'text-blue-400'
    },
    green: {
      border: 'border-green-500/30',
      gradient: 'from-green-900/20 via-neutral-950/95 to-neutral-900/95',
      shadow: 'shadow-green-500/10',
      hover: 'hover:text-green-400',
      title: 'text-green-400'
    },
    purple: {
      border: 'border-purple-500/30',
      gradient: 'from-purple-900/20 via-neutral-950/95 to-neutral-900/95',
      shadow: 'shadow-purple-500/10',
      hover: 'hover:text-purple-400',
      title: 'text-purple-400'
    },
    pink: {
      border: 'border-pink-500/30',
      gradient: 'from-pink-900/20 via-neutral-950/95 to-neutral-900/95',
      shadow: 'shadow-pink-500/10',
      hover: 'hover:text-pink-400',
      title: 'text-pink-400'
    }
  }

  const styles = colorStyles[color] || colorStyles.orange

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
        <div className='fixed inset-0 z-50'>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className='absolute inset-0 bg-black/60 backdrop-blur-sm will-change-opacity'
            onClick={closeOnBackdrop ? onClose : undefined}
            aria-hidden='true'
          />

          {/* Modal - Slides from right */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1]
            }}
            className='absolute right-0 top-0 flex h-full w-full flex-col sm:w-1/2 will-change-transform'
            onClick={(e) => e.stopPropagation()}
            role='dialog'
            aria-modal='true'
            aria-labelledby={title ? 'modal-title' : undefined}
          >
            <div className={`flex h-full flex-col overflow-hidden border-l bg-gradient-to-br backdrop-blur-xl shadow-2xl ${styles.border} ${styles.gradient} ${styles.shadow}`}>
              {/* Header */}
              <div className='flex items-center justify-between border-b border-neutral-800/50 px-6 py-5'>
                {title && (
                  <h2
                    id='modal-title'
                    className={`text-2xl font-bold ${styles.title}`}
                  >
                    {title}
                  </h2>
                )}
                
                <button
                  onClick={onClose}
                  className={`group ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-neutral-400 transition-all duration-200 hover:bg-neutral-800 ${styles.hover}`}
                  aria-label='Close modal'
                >
                  <X className='h-6 w-6 transition-transform duration-200 group-hover:scale-110' />
                </button>
              </div>

              {/* Content */}
              <div className='custom-scrollbar flex-1 overflow-y-auto p-6'>
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
          `}</style>
        </div>
      )}
    </AnimatePresence>
  )
})

RightSlideModal.displayName = 'RightSlideModal'

export default RightSlideModal
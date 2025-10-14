'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
  hideOverlay = false
}) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center ${!hideOverlay ? 'backdrop-blur-sm' : ''}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`w-full rounded-lg border border-neutral-500 bg-gradient-to-br from-neutral-900 via-black to-neutral-800 bg-cover bg-center p-8 shadow-2xl ${sizeClasses[size]} mx-4`}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className='flex items-center justify-between border-b border-neutral-700 px-5 py-4'>
              {title && (
                <h2 className='text-lg font-semibold text-orange-500'>
                  {title}
                </h2>
              )}
              {showClose && (
                <button
                  onClick={onClose}
                  className='cursor-pointer p-1 text-gray-400 transition-colors hover:text-white'
                >
                  <X className='h-5 w-5' />
                </button>
              )}
            </div>

            <div
              className='custom-scrollbar overflow-y-auto p-5'
              style={{ maxHeight: 'calc(90vh - 80px)' }}
            >
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

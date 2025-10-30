'use client'

import { memo, forwardRef } from 'react'

/**
 * Optimized FormTextarea Component
 * Features:
 * - ForwardRef for react-hook-form
 * - Memoized for performance
 * - No inline styles (moved to global CSS)
 * - Error state
 * - Helper text
 * - Character count
 * - Auto-resize option
 * - Dark theme optimized
 */

const FormTextarea = memo(
  forwardRef(
    (
      {
        id,
        label,
        placeholder,
        name,
        value,
        className = '',
        onChange,
        disabled = false,
        required = false,
        error,
        helperText,
        rows = 5,
        maxLength,
        showCount = false,
        autoResize = false,
        ...props
      },
      ref
    ) => {
      const hasError = !!error
      const characterCount = value?.length || 0

      // Auto-resize handler
      const handleAutoResize = (e) => {
        if (autoResize) {
          e.target.style.height = 'auto'
          e.target.style.height = `${e.target.scrollHeight}px`
        }
        onChange?.(e)
      }

      return (
        <div className='w-full space-y-1'>
          {/* Label */}
          {label && (
            <div className='flex items-center justify-between'>
              <label
                htmlFor={id}
                className='block text-sm font-medium text-neutral-300'
              >
                {label}
                {required && <span className='ml-1 text-orange-400'>*</span>}
              </label>
              
              {showCount && maxLength && (
                <span
                  className={`text-xs ${
                    characterCount > maxLength
                      ? 'text-red-400'
                      : 'text-neutral-500'
                  }`}
                >
                  {characterCount}/{maxLength}
                </span>
              )}
            </div>
          )}

          {/* Textarea */}
          <textarea
            ref={ref}
            disabled={disabled}
            name={name}
            value={value}
            onChange={handleAutoResize}
            placeholder={placeholder}
            required={required}
            id={id}
            rows={rows}
            maxLength={maxLength}
            className={`
              custom-scrollbar w-full rounded-lg border bg-neutral-900/50 px-4 py-2.5 font-mono text-white
              placeholder-neutral-500 transition-all duration-200
              ${autoResize ? 'resize-none' : 'resize-y'}
              ${
                hasError
                  ? 'border-red-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                  : 'border-neutral-700/50 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
              }
              ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              focus:outline-none
              ${className}
            `}
            {...props}
          />

          {/* Helper Text / Error */}
          {(error || helperText) && (
            <p
              className={`text-xs ${
                hasError ? 'text-red-400' : 'text-neutral-500'
              }`}
            >
              {error || helperText}
            </p>
          )}
        </div>
      )
    }
  )
)

FormTextarea.displayName = 'FormTextarea'

export default FormTextarea
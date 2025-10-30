'use client'

import { memo, forwardRef } from 'react'

/**
 * Optimized FormInput Component
 * 
 * Features:
 * - ✅ Fixed icon overlap issue
 * - ✅ ForwardRef for react-hook-form compatibility
 * - ✅ Memoized for performance
 * - ✅ Icon support (left/right)
 * - ✅ Error states with validation
 * - ✅ Helper text support
 * - ✅ Loading state
 * - ✅ Character counter
 * - ✅ Better focus states
 * - ✅ Dark theme optimized
 * - ✅ Variant system (default, orange, blue)
 */

const FormInput = memo(
  forwardRef(
    (
      {
        type = 'text',
        id,
        label,
        placeholder,
        name,
        className = '',
        disabled = false,
        required = false,
        error,
        helperText,
        icon,
        iconPosition = 'left',
        variant = 'default', // 'default' | 'orange' | 'blue' | 'green'
        loading = false,
        maxLength,
        showCharCount = false,
        value = '',
        ...props
      },
      ref
    ) => {
      const hasError = !!error
      const charCount = value?.toString().length || 0

      // Variant styles
      const variantStyles = {
        default: {
          focus: 'focus:border-neutral-500 focus:ring-neutral-500/20',
          icon: 'text-neutral-400'
        },
        orange: {
          focus: 'focus:border-orange-500 focus:ring-orange-500/20',
          icon: 'text-orange-400'
        },
        blue: {
          focus: 'focus:border-blue-500 focus:ring-blue-500/20',
          icon: 'text-blue-400'
        },
        green: {
          focus: 'focus:border-green-500 focus:ring-green-500/20',
          icon: 'text-green-400'
        }
      }

      const styles = variantStyles[variant] || variantStyles.default

      // ✅ FIX: Proper padding to prevent icon overlap
      const inputPaddingClass = icon
        ? iconPosition === 'left'
          ? 'pl-11 pr-4' // Increased from pl-10
          : 'pl-4 pr-11' // Increased from pr-10
        : 'px-4'

      return (
        <div className="w-full space-y-1.5 font-mono">
          {/* Label */}
          {label && (
            <label
              htmlFor={id}
              className="block text-sm font-medium text-neutral-200"
            >
              {label}
              {required && <span className="ml-1 text-orange-400">*</span>}
            </label>
          )}

          {/* Input Container */}
          <div className="relative">
            {/* Left Icon */}
            {icon && iconPosition === 'left' && (
              <div
                className={`pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  hasError ? 'text-red-400' : loading ? 'text-neutral-600' : styles.icon
                }`}
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-600 border-t-orange-500" />
                ) : (
                  icon
                )}
              </div>
            )}

            {/* Input Field */}
            <input
              ref={ref}
              disabled={disabled || loading}
              type={type}
              name={name}
              id={id}
              placeholder={placeholder}
              required={required}
              maxLength={maxLength}
              value={value}
              className={`
                w-full rounded-lg border bg-neutral-900/50 font-mono text-neutral-100 
                placeholder-neutral-500 transition-all duration-200
                ${inputPaddingClass}
                py-2.5
                ${
                  hasError
                    ? 'border-red-600/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : `border-neutral-700/50 focus:ring-2 ${styles.focus}`
                }
                ${disabled || loading ? 'cursor-not-allowed opacity-50' : ''}
                focus:outline-none
                hover:border-neutral-600/50
                ${className}
              `}
              {...props}
            />

            {/* Right Icon */}
            {icon && iconPosition === 'right' && (
              <div
                className={`pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 ${
                  hasError ? 'text-red-400' : loading ? 'text-neutral-600' : styles.icon
                }`}
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-600 border-t-orange-500" />
                ) : (
                  icon
                )}
              </div>
            )}
          </div>

          {/* Helper Text / Error / Character Count */}
          <div className="flex items-center justify-between gap-2">
            {(error || helperText) && (
              <p
                className={`text-xs ${
                  hasError ? 'text-red-400' : 'text-neutral-500'
                }`}
              >
                {error || helperText}
              </p>
            )}

            {showCharCount && maxLength && (
              <p
                className={`ml-auto text-xs ${
                  charCount > maxLength * 0.9
                    ? 'text-orange-400'
                    : 'text-neutral-500'
                }`}
              >
                {charCount}/{maxLength}
              </p>
            )}
          </div>
        </div>
      )
    }
  )
)

FormInput.displayName = 'FormInput'

export default FormInput
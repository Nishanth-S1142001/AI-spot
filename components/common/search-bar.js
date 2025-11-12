'use client'

import { Search, X } from 'lucide-react'
import { memo, useCallback, useEffect, useRef, useState } from 'react'

function SearchBar({ 
  value = '',
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300, // ✅ OPTIMIZATION: Debounce for performance
  variant = 'default', // 'default' | 'orange' | 'blue'
  className = ''
}) {
  const [localValue, setLocalValue] = useState(value)
  const debounceTimerRef = useRef(null)

  // Sync with external value prop
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // ✅ OPTIMIZATION: Debounced search to reduce unnecessary re-renders and API calls
  const debouncedSearch = useCallback(
    (searchValue) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        onChange?.(searchValue)
        onSearch?.(searchValue)
      }, debounceMs)
    },
    [onChange, onSearch, debounceMs]
  )

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  // Handle input change
  const handleChange = useCallback(
    (e) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      debouncedSearch(newValue)
    },
    [debouncedSearch]
  )

  // Handle clear
  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange?.('')
    onSearch?.('')
    
    // Clear any pending debounced search
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
  }, [onChange, onSearch])

  // Handle form submit (immediate search)
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault()
      
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      
      // Immediate search
      onChange?.(localValue)
      onSearch?.(localValue)
    },
    [localValue, onChange, onSearch]
  )

  // Variant styles
  const variantStyles = {
    default: {
      border: 'border-neutral-700 focus-within:border-neutral-600',
      bg: 'bg-neutral-900',
      icon: 'text-neutral-400'
    },
    orange: {
      border: 'border-neutral-700 focus-within:border-orange-500',
      bg: 'bg-neutral-900',
      icon: 'text-orange-400'
    },
    blue: {
      border: 'border-neutral-700 focus-within:border-blue-500',
      bg: 'bg-neutral-900',
      icon: 'text-blue-400'
    }
  }

  const styles = variantStyles[variant] || variantStyles.default

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative w-full font-mono ${className}`}
    >
      {/* Search Icon */}
      <Search className={`absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 ${styles.icon}`} />
      
      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full rounded-lg border ${styles.border} ${styles.bg} py-2.5 pl-10 pr-10 text-sm text-neutral-200 placeholder-neutral-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0 ${
          variant === 'orange' ? 'focus:ring-orange-500/20' : 
          variant === 'blue' ? 'focus:ring-blue-500/20' : 
          'focus:ring-neutral-500/20'
        }`}
      />
      
      {/* Clear Button */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-neutral-200"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </form>
  )
}

// ✅ OPTIMIZATION: Memoize to prevent unnecessary re-renders
export default memo(SearchBar)
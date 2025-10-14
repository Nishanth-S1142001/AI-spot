'use client'

import React from 'react'

// Use forwardRef so react-hook-form can register the input
const FormInput = React.forwardRef(
  (
    {
      type = 'text',
      id,
      placeholder,
      name,
      className,
      disabled,
      required,
      ...props
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        disabled={disabled}
        type={type}
        name={name}
        placeholder={placeholder}
        required={required}
        id={id}
        className={`${className} border-2 border-transparent border-b-neutral-700 px-4 py-3 pl-10 font-mono text-white placeholder-neutral-400 transition-all duration-300 focus:border-b-white focus:ring-2 focus:ring-transparent focus:outline-none`}
        {...props} // spreads value, onChange, etc.
      />
    )
  }
)

FormInput.displayName = 'FormInput'

export default FormInput

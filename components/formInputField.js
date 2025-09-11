'use client'

export default function FormInput({
  type,
  id,
  placeholder,
  name,
  value,
  className,
  onChange,
  disabled,
  required,
  children
}) {
  return (
    <input
      disabled={disabled}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      id={id}
      className={`${className} font-mono  border-2 border-transparent border-b-neutral-700 px-4 py-3 pl-10 text-white placeholder-neutral-400 transition-all duration-300 focus:border-b-white focus:ring-2 focus:ring-transparent focus:outline-none`}
    >
      {children}
    </input>
  )
}

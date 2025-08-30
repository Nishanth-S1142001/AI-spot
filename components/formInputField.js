'use client'

export default function FormInput({
  label,
  type,
  id,
  placeholder,
  name,
  value,
  onChange,
  required
}) {
  return (
    <div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        id={id}
        className='w-full border-2 border-transparent border-b-[#024a70] px-4 py-3 pl-10 text-white placeholder-gray-400 transition-all duration-300 focus:border-b-blue-400 focus:ring-2 focus:ring-transparent focus:outline-none'
      />
    </div>
  )
}

'use client'

export default function Button({
  text,
  onClick,
  disabled,
  className,
  children
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={` ${className} font-mono m-2 rounded-full px-4 py-2 text-lg font-bold tracking-wide transition ${
        disabled
          ? 'cursor-not-allowed bg-neutral-200 text-black opacity-50'
          : 'hover: cursor-pointer bg-neutral-600 text-white hover:bg-neutral-800 hover:shadow-lg'
      } `}
    >
      {text}
      {children}
    </button>
  )
}

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
      className={` ${className} font-mono m-2 rounded-full px-4 py-2 text-lg border border-orange-600 font-bold tracking-wide transition text-white hover:text-orange-500 ${
        disabled
          ? 'cursor-not-allowed    '
          : ' cursor-pointer '
      } `}
    >
      {text}
      {children}
    </button>
  )
}

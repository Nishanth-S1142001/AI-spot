'use client'

export default function Card({ onClick, className, children }) {
  return (
    <div
      onClick={onClick}
      className={` ${className} inset-0 transform rounded-lg border border-orange-500 bg-gradient-to-br from-neutral-900 via-black to-neutral-800 bg-cover bg-center p-8 font-mono transition-all hover:-translate-y-2 hover:bg-neutral-800`}
    >
      {children}
    </div>
  )
}

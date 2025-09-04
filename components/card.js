'use client'

export default function Card({ onClick, className, children }) {
  return (
    <div
      onClick={onClick}
      className={` ${className} transform rounded-lg border  border-neutral-500     inset-0 bg-gradient-to-br from-neutral-900 via-black to-neutral-800 bg-cover bg-center p-8 transition-all hover:-translate-y-2 hover:bg-neutral-800`}
    >
        {children}
    </div>
  )
}

"use client"

export default function Badge({ children, variant = "default" }) {
  const variants = {
    default: "bg-blue-100 text-blue-700 border border-blue-200",
    success: "bg-green-100 text-green-700 border border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    danger: "bg-red-100 text-red-700 border border-red-200",
    inactive: "bg-red-200 text-red-700 border border-red-200",
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full ${variants[variant]}`}
    >
      {children}
    </span>
  )
}

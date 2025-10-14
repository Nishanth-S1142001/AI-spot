'use client'
import { Search } from 'lucide-react'
import { useState } from 'react'
import FormInput from '../ui/formInputField'

export default function SearchBar({ placeholder = 'Search...', onSearch }) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch?.(query)
  }

  return (
    <form onSubmit={handleSubmit} className='relative w-full max-w-md'>
      <Search className='absolute top-2.5 left-3 h-5 w-5 text-neutral-400' />
      <FormInput
        type='text'
        value={query}
        className="w-full"
        onChange={(e) => {
          setQuery(e.target.value)
          onSearch?.(e.target.value) // live update
        }}
        placeholder={placeholder}
      />
    </form>
  )
}

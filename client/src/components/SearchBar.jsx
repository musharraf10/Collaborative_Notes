import { useState, useEffect, useRef } from 'react'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'

function SearchBar({ onSearch, onClear, placeholder = "Search notes..." }) {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const prevQueryRef = useRef('')  // Keeps track of the last searched value

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const trimmedQuery = query.trim()

      // Only call search if new character(s) typed
      if (trimmedQuery && trimmedQuery !== prevQueryRef.current) {
        setIsSearching(true)
          ; (async () => {
            await onSearch(trimmedQuery)
            prevQueryRef.current = trimmedQuery
            setIsSearching(false)
          })()
      } else if (!trimmedQuery) {
        onClear()
        prevQueryRef.current = ''
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query, onSearch, onClear])

  const handleClear = () => {
    setQuery('')
    onClear()
    setIsSearching(false)
    prevQueryRef.current = ''
  }

  return (
    <div className="relative max-w-md w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        {isSearching ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
        ) : (
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        )}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl leading-5 bg-white/80 backdrop-blur-sm placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        placeholder={placeholder}
      />

      {query && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  )
}

export default SearchBar

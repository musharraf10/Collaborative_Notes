import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import UserNameModal from '../components/UserNameModal'
import SearchBar from '../components/SearchBar'
import NoteCard from '../components/NoteCard'
import { useUser } from '../context/UserContext'
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

function HomePage() {
  const { isNameSet } = useUser()
  const [notes, setNotes] = useState([])
  const [filteredNotes, setFilteredNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNameModal, setShowNameModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  useEffect(() => {
    if (!isNameSet) {
      setShowNameModal(true)
    }
  }, [isNameSet])

  const fetchNotes = async () => {
    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
      const response = await fetch(`${serverUrl}/api/notes`)

      if (!response.ok) {
        throw new Error('Failed to fetch notes')
      }

      const data = await response.json()
      setNotes(data)
      setFilteredNotes(data)
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query) => {
    setSearchQuery(query)
    setIsSearching(true)

    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
      const response = await fetch(`${serverUrl}/api/notes/search/${encodeURIComponent(query)}`)

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setFilteredNotes(data)
    } catch (error) {
      console.error('Error searching notes:', error)
      toast.error('Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setFilteredNotes(notes)
  }

  const handlePinToggle = async (noteId) => {
    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
      const response = await fetch(`${serverUrl}/api/notes/${noteId}/pin`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to toggle pin')
      }

      const updatedNote = await response.json()
      
      // Update both notes arrays
      const updateNotes = (notesList) =>
        notesList.map(note => 
          note._id === noteId ? updatedNote : note
        ).sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          return new Date(b.updatedAt) - new Date(a.updatedAt)
        })

      setNotes(updateNotes)
      setFilteredNotes(updateNotes)
    } catch (error) {
      throw error
    }
  }

  const pinnedNotes = filteredNotes.filter(note => note.isPinned)
  const regularNotes = filteredNotes.filter(note => !note.isPinned)

  return (
    <>
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Notes
            </h1>
            <p className="text-gray-600">
              Create and collaborate on notes in real-time with your team
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              placeholder="Search notes, content, or tags..."
            />
            
            <Link 
              to="/create" 
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Note
            </Link>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">
              {isSearching ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Searching...
                </span>
              ) : (
                <>
                  Found {filteredNotes.length} result{filteredNotes.length !== 1 ? 's' : ''} for "{searchQuery}"
                  <button
                    onClick={handleClearSearch}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear search
                  </button>
                </>
              )}
            </p>
          </div>
        )}

        {isLoading ? (
          <LoadingSpinner text="Loading notes..." />
        ) : filteredNotes.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <DocumentTextIcon className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {searchQuery ? 'No notes found' : 'No notes yet'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchQuery 
                ? `No notes match your search for "${searchQuery}". Try different keywords.`
                : 'Get started by creating your first collaborative note and invite others to edit together.'
              }
            </p>
            {!searchQuery && (
              <Link 
                to="/create" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Note
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">📌 Pinned Notes</h2>
                  <span className="ml-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                    {pinnedNotes.length}
                  </span>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onPinToggle={handlePinToggle}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Notes */}
            {regularNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <div className="flex items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">📝 All Notes</h2>
                    <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                      {regularNotes.length}
                    </span>
                  </div>
                )}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {regularNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onPinToggle={handlePinToggle}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <UserNameModal
        isOpen={showNameModal}
        onClose={() => setShowNameModal(false)}
      />
    </>
  )
}

export default HomePage
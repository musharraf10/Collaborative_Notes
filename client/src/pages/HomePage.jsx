import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import UserNameModal from '../components/UserNameModal'
import { useUser } from '../context/UserContext'
import toast from 'react-hot-toast'

function HomePage() {
  const { isNameSet } = useUser()
  const [notes, setNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showNameModal, setShowNameModal] = useState(false)

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
    } catch (error) {
      console.error('Error fetching notes:', error)
      toast.error('Failed to load notes')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Notes</h2>
            <p className="text-gray-600">Create and collaborate on notes in real-time</p>
          </div>

          <Link to="/create" className="btn btn-primary">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Note
          </Link>
        </div>

        {isLoading ? (
          <LoadingSpinner text="Loading notes..." />
        ) : notes.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notes yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first collaborative note</p>
            <Link to="/create" className="btn btn-primary">
              Create Your First Note
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {notes.map((note) => (
              <Link
                key={note._id}
                to={`/note/${note._id}`}
                className="card p-6 hover:shadow-lg transition-all duration-200"
              >
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {note.title}
                </h3>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>Last edited by {note.lastEditedBy}</p>
                  <p>{formatDate(note.updatedAt)}</p>
                </div>

                <div className="mt-4 flex items-center text-sm text-gray-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Click to edit
                </div>
              </Link>
            ))}
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
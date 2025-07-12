import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { useUser } from '../context/UserContext'
import toast from 'react-hot-toast'

function CreateNotePage() {
  const navigate = useNavigate()
  const { userName } = useUser()
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title for your note')
      return
    }

    setIsLoading(true)

    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
      const response = await fetch(`${serverUrl}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: '',
          lastEditedBy: userName
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create note')
      }

      const note = await response.json()
      toast.success('Note created successfully!')
      navigate(`/note/${note._id}`)
    } catch (error) {
      console.error('Error creating note:', error)
      toast.error('Failed to create note. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Header title="Create New Note" showBackButton />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="card p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Note</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Note Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input"
                placeholder="Enter a title for your note"
                maxLength={200}
                disabled={isLoading}
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-1">
                {title.length}/200 characters
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">✨ What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your note will be created and ready for editing</li>
                <li>• Share the URL with others to collaborate in real-time</li>
                <li>• All changes are automatically saved</li>
                <li>• See who's online and editing with you</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={!title.trim() || isLoading}
                className="btn btn-primary flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="spinner" />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Note
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  )
}

export default CreateNotePage
import { useState } from 'react'
import { useUser } from '../context/UserContext'

function UserNameModal({ isOpen, onClose }) {
  const { updateUserName } = useUser()
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsLoading(true)
    updateUserName(name.trim())
    setIsLoading(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome to Collaborative Notes!</h2>
        <p className="text-gray-600 mb-6">
          Please enter your name so others can see who's editing the notes.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="userName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="form-input"
              placeholder="Enter your name"
              maxLength={50}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={!name.trim() || isLoading}
              className="btn btn-primary flex-1"
            >
              {isLoading ? (
                <>
                  <div className="spinner" />
                  Setting up...
                </>
              ) : (
                'Continue'
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                updateUserName('Anonymous')
                onClose()
              }}
              className="btn btn-secondary"
              disabled={isLoading}
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserNameModal
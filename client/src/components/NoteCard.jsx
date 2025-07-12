import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPinIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { MapPinIcon as PinIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

function NoteCard({ note, onPinToggle }) {
  const [isToggling, setIsToggling] = useState(false)

  const handlePinToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (isToggling) return

    setIsToggling(true)
    try {
      await onPinToggle(note._id)
      toast.success(note.isPinned ? 'Note unpinned' : 'Note pinned')
    } catch (error) {
      toast.error('Failed to toggle pin')
    } finally {
      setIsToggling(false)
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

  const getPreview = (content) => {
    const div = document.createElement('div')
    div.innerHTML = content
    const text = div.textContent || div.innerText || ''
    return text.slice(0, 120) + (text.length > 120 ? '...' : '')
  }

  return (
    <div className={`group relative bg-white rounded-xl shadow-sm border transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${note.isPinned ? 'border-amber-200 bg-gradient-to-br from-amber-50 to-white' : 'border-gray-200'
      }`}>
      {/* Pin Button */}
      <button
        onClick={handlePinToggle}
        disabled={isToggling}
        className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${note.isPinned
          ? 'text-amber-600 bg-amber-100 hover:bg-amber-200'
          : 'text-gray-400 bg-gray-100 hover:bg-gray-200 opacity-0 group-hover:opacity-100'
          } ${isToggling ? 'animate-pulse' : ''}`}
      >
        {note.isPinned ? (
          <PinIconSolid className="h-4 w-4" />
        ) : (
          <MapPinIcon className="h-4 w-4" />
        )}
      </button>

      <Link to={`/note/${note._id}`} className="block p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 pr-8">
            {note.title}
          </h3>
        </div>

        {/* Content Preview */}
        {note.content && (
          <p className="text-gray-600 text-sm line-clamp-3 mb-4">
            {getPreview(note.content)}
          </p>
        )}

        {/* Tags */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              <span>{note.lastEditedBy}</span>
            </div>
            <div className="flex items-center">
              <ClockIcon className="h-4 w-4 mr-1" />
              <span>{formatDate(note.updatedAt)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <EyeIcon className="h-4 w-4" />
            <PencilIcon className="h-4 w-4" />
          </div>
        </div>
      </Link>
    </div>
  )
}

export default NoteCard
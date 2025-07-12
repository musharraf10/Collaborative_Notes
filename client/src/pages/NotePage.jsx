import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import WYSIWYGEditor from '../components/WYSIWYGEditor'
import { useSocket } from '../context/SocketContext'
import { useUser } from '../context/UserContext'
import {
  MapPinIcon,
  TagIcon,
  ClockIcon,
  UsersIcon,
  DocumentTextIcon,
  ShareIcon
} from '@heroicons/react/24/outline'
import { MapPinIcon as PinIconSolid } from '@heroicons/react/24/solid'
import toast from 'react-hot-toast'

function NotePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { socket, isConnected } = useSocket()
  const { userName } = useUser()

  const [note, setNote] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeUsers, setActiveUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [lastSaved, setLastSaved] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isPinning, setIsPinning] = useState(false)
  const [newTag, setNewTag] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)

  const saveTimeoutRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Load note data
  useEffect(() => {
    if (socket && isConnected) {
      loadNote()
    }
  }, [socket, isConnected, id])

  // Socket event listeners
  useEffect(() => {
    if (!socket) return

    socket.on('note_loaded', (noteData) => {
      setNote(noteData)
      setIsLoading(false)
    })

    socket.on('note_updated', (updateData) => {
      setNote(prev => ({
        ...prev,
        ...updateData
      }))
      setLastSaved(new Date())
      toast.success(`Updated by ${updateData.updatedBy}`, { duration: 2000 })
    })

    socket.on('active_users', (users) => {
      setActiveUsers(users.filter(user => user.userName !== userName))
    })

    socket.on('user_typing', ({ userName: typingUser, isTyping }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev)
        if (isTyping) {
          newSet.add(typingUser)
        } else {
          newSet.delete(typingUser)
        }
        return newSet
      })
    })

    return () => {
      socket.off('note_loaded')
      socket.off('note_updated')
      socket.off('active_users')
      socket.off('user_typing')
    }
  }, [socket, userName])

  const loadNote = useCallback(() => {
    if (socket) {
      socket.emit('join_note', { noteId: id, userName })
    }
  }, [socket, id, userName])

  const debouncedSave = useCallback((content, title, tags) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    saveTimeoutRef.current = setTimeout(() => {
      if (socket && isConnected) {
        setIsSaving(true)
        socket.emit('note_update', {
          noteId: id,
          content,
          title,
          tags,
          userName
        })

        setTimeout(() => {
          setIsSaving(false)
          setLastSaved(new Date())
        }, 500)
      }
    }, 1000)
  }, [socket, isConnected, id, userName])

  const handleContentChange = (value) => {
    setNote(prev => ({ ...prev, content: value }))
    debouncedSave(value, note?.title, note?.tags)

    // Typing indicator
    if (socket) {
      socket.emit('typing_start', { noteId: id, userName })

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { noteId: id, userName })
      }, 1000)
    }
  }

  const handleTitleChange = (value) => {
    setNote(prev => ({ ...prev, title: value }))
    debouncedSave(note?.content, value, note?.tags)
  }

  const handlePinToggle = async () => {
    if (isPinning) return

    setIsPinning(true)
    try {
      const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
      const response = await fetch(`${serverUrl}/api/notes/${id}/pin`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to toggle pin')
      }

      const updatedNote = await response.json()
      setNote(updatedNote)
      toast.success(updatedNote.isPinned ? 'Note pinned' : 'Note unpinned')
    } catch (error) {
      toast.error('Failed to toggle pin')
    } finally {
      setIsPinning(false)
    }
  }

  const handleAddTag = () => {
    if (!newTag.trim() || !note) return

    const trimmedTag = newTag.trim()
    if (note.tags?.includes(trimmedTag)) {
      toast.error('Tag already exists')
      return
    }

    const updatedTags = [...(note.tags || []), trimmedTag]
    setNote(prev => ({ ...prev, tags: updatedTags }))
    debouncedSave(note.content, note.title, updatedTags)
    setNewTag('')
    setShowTagInput(false)
    toast.success('Tag added')
  }

  const handleRemoveTag = (tagToRemove) => {
    if (!note) return

    const updatedTags = note.tags?.filter(tag => tag !== tagToRemove) || []
    setNote(prev => ({ ...prev, tags: updatedTags }))
    debouncedSave(note.content, note.title, updatedTags)
    toast.success('Tag removed')
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const getWordCount = (text) => {
    if (!text) return 0
    const div = document.createElement('div')
    div.innerHTML = text
    const plainText = div.textContent || div.innerText || ''
    return plainText.trim().split(/\s+/).filter(word => word.length > 0).length
  }

  const getCharCount = (text) => {
    if (!text) return 0
    const div = document.createElement('div')
    div.innerHTML = text
    return (div.textContent || div.innerText || '').length
  }

  const formatLastUpdated = (date) => {
    if (!date) return ''
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)

    if (diff < 60) return 'Just saved'
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`
    return `Saved at ${date.toLocaleTimeString()}`
  }

  if (isLoading) {
    return (
      <>
        <Header title="Loading Note..." showBackButton />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <LoadingSpinner text="Loading note..." />
        </main>
      </>
    )
  }

  if (!note) {
    return (
      <>
        <Header title="Note Not Found" showBackButton />
        <main className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <DocumentTextIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Note not found</h2>
            <p className="text-gray-600 mb-6">The note you're looking for doesn't exist or has been deleted.</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go back to notes
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header title={note.title} showBackButton />

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Collaboration Panel */}
        <div className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left side - Collaboration info */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <UsersIcon className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-gray-700">
                  {activeUsers.length} {activeUsers.length === 1 ? 'collaborator' : 'collaborators'} online
                </span>
              </div>

              {activeUsers.length > 0 && (
                <div className="flex -space-x-2">
                  {activeUsers.slice(0, 5).map((user, index) => (
                    <div
                      key={user.socketId}
                      className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center text-xs font-medium border-2 border-white shadow-sm"
                      title={user.userName}
                    >
                      {user.userName.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {activeUsers.length > 5 && (
                    <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs font-medium border-2 border-white shadow-sm">
                      +{activeUsers.length - 5}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right side - Actions and stats */}
            <div className="flex items-center gap-4">
              {/* Save status */}
              {isSaving ? (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  Saving...
                </div>
              ) : lastSaved ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ClockIcon className="h-4 w-4" />
                  {formatLastUpdated(lastSaved)}
                </div>
              ) : null}

              {/* Word count */}
              <div className="hidden sm:flex items-center gap-4 text-sm text-gray-600">
                <span>{getWordCount(note.content)} words</span>
                <span>{getCharCount(note.content)} characters</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleShare}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Share note"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>

                <button
                  onClick={handlePinToggle}
                  disabled={isPinning}
                  className={`p-2 rounded-lg transition-colors ${note.isPinned
                    ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                    : 'text-gray-600 hover:text-amber-600 hover:bg-amber-50'
                    } ${isPinning ? 'animate-pulse' : ''}`}
                  title={note.isPinned ? 'Unpin note' : 'Pin note'}
                >
                  {note.isPinned ? (
                    <PinIconSolid className="h-5 w-5" />
                  ) : (
                    <MapPinIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Typing indicator */}
          {typingUsers.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span>
                  {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Note Editor */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Title Section */}
          <div className="border-b border-gray-200 p-6">
            <input
              type="text"
              value={note.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-3xl font-bold border-none outline-none bg-transparent text-gray-900 placeholder-gray-400"
              placeholder="Note title..."
              maxLength={200}
            />

            {/* Tags Section */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <TagIcon className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Tags</span>
                <button
                  onClick={() => setShowTagInput(!showTagInput)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Add tag
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {note.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 group cursor-pointer"
                    onClick={() => handleRemoveTag(tag)}
                    title="Click to remove"
                  >
                    {tag}
                    <span className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity">×</span>
                  </span>
                ))}

                {showTagInput && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      onBlur={() => {
                        if (newTag.trim()) handleAddTag()
                        else setShowTagInput(false)
                      }}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tag name"
                      maxLength={50}
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Editor */}
          <div className="p-6">
            <WYSIWYGEditor
              content={note.content || ''}
              onChange={handleContentChange}
              placeholder="Start writing your note here... Others will see your changes in real-time!"
            />
          </div>
        </div>

        {/* Mobile stats */}
        <div className="sm:hidden mt-4 text-center text-sm text-gray-600 bg-white/80 backdrop-blur-sm rounded-lg p-3">
          {getWordCount(note.content)} words • {getCharCount(note.content)} characters
        </div>
      </main>
    </>
  )
}

export default NotePage
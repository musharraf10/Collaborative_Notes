import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import TextareaAutosize from 'react-textarea-autosize'
import Header from '../components/Header'
import LoadingSpinner from '../components/LoadingSpinner'
import { useSocket } from '../context/SocketContext'
import { useUser } from '../context/UserContext'
import toast from 'react-hot-toast'

function NotePage() {
  const { id } = useParams()
  const { socket, isConnected } = useSocket()
  const { userName } = useUser()

  const [note, setNote] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeUsers, setActiveUsers] = useState([])
  const [typingUsers, setTypingUsers] = useState(new Set())
  const [lastSaved, setLastSaved] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

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

  const debouncedSave = useCallback((content, title) => {
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
          userName
        })

        setTimeout(() => {
          setIsSaving(false)
          setLastSaved(new Date())
        }, 500)
      }
    }, 1000) // Auto-save after 1 second of inactivity
  }, [socket, isConnected, id, userName])

  const handleContentChange = (value) => {
    setNote(prev => ({ ...prev, content: value }))
    debouncedSave(value, note?.title)

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
    debouncedSave(note?.content, value)
  }

  const getWordCount = (text) => {
    return text ? text.trim().split(/\s+/).filter(word => word.length > 0).length : 0
  }

  const getCharCount = (text) => {
    return text ? text.length : 0
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
        <main className="max-w-4xl mx-auto px-4 py-8">
          <LoadingSpinner text="Loading note..." />
        </main>
      </>
    )
  }

  if (!note) {
    return (
      <>
        <Header title="Note Not Found" showBackButton />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Note not found</h2>
            <p className="text-gray-600">The note you're looking for doesn't exist.</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <Header title={note.title} showBackButton />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Collaboration info */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span className="text-sm font-medium">
                  {activeUsers.length} {activeUsers.length === 1 ? 'collaborator' : 'collaborators'} online
                </span>
              </div>

              {activeUsers.length > 0 && (
                <div className="flex -space-x-2">
                  {activeUsers.slice(0, 3).map((user, index) => (
                    <div
                      key={user.socketId}
                      className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-medium border-2 border-white"
                      title={user.userName}
                    >
                      {user.userName.charAt(0).toUpperCase()}
                    </div>
                  ))}
                  {activeUsers.length > 3 && (
                    <div className="w-8 h-8 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                      +{activeUsers.length - 3}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-600">
              {isSaving && (
                <div className="flex items-center gap-2">
                  <div className="spinner w-4 h-4" />
                  Saving...
                </div>
              )}

              {lastSaved && !isSaving && (
                <span>{formatLastUpdated(lastSaved)}</span>
              )}

              <div className="hidden sm:block">
                {getWordCount(note.content)} words • {getCharCount(note.content)} characters
              </div>
            </div>
          </div>

          {typingUsers.size > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="typing-indicator">
                <span>{Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing</span>
                <div className="typing-dots">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Note editor */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="border-b border-gray-200 p-4">
            <input
              type="text"
              value={note.title || ''}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-2xl font-bold border-none outline-none bg-transparent"
              placeholder="Note title..."
              maxLength={200}
            />
          </div>

          <div className="p-4">
            <TextareaAutosize
              value={note.content || ''}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Start writing your note here... Others will see your changes in real-time!"
              className="w-full border-none outline-none resize-none bg-transparent text-gray-900 leading-relaxed"
              minRows={10}
              maxRows={50}
            />
          </div>
        </div>

        {/* Mobile stats */}
        <div className="sm:hidden mt-4 text-center text-sm text-gray-600">
          {getWordCount(note.content)} words • {getCharCount(note.content)} characters
        </div>
      </main>
    </>
  )
}

export default NotePage
import { Link } from 'react-router-dom'
import { useSocket } from '../context/SocketContext'
import { useUser } from '../context/UserContext'

function Header({ title, showBackButton = false }) {
  const { isConnected } = useSocket()
  const { userName } = useUser()

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Link
                to="/"
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </Link>
            )}
            <h1 className="text-xl font-semibold text-gray-900">
              {title || 'Collaborative Notes'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center text-sm">
              <span
                className={`status-indicator ${isConnected ? 'status-online' : 'status-offline'
                  }`}
              />
              {isConnected ? 'Online' : 'Offline'}
            </div>

            <div className="hidden sm:flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {userName}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
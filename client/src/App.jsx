import { Routes, Route } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import { UserProvider } from './context/UserContext'
import HomePage from './pages/HomePage'
import NotePage from './pages/NotePage'
import CreateNotePage from './pages/CreateNotePage'

function App() {
  return (
    <UserProvider>
      <SocketProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreateNotePage />} />
            <Route path="/note/:id" element={<NotePage />} />
          </Routes>
        </div>
      </SocketProvider>
    </UserProvider>
  )
}

export default App
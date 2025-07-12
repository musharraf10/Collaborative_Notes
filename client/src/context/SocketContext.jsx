import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import toast from 'react-hot-toast'

const SocketContext = createContext()

export function useSocket() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000'
    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      toast.success('Connected to server')
      console.log('Connected to server')
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
      toast.error('Disconnected from server')
      console.log('Disconnected from server')
    })

    newSocket.on('connect_error', (error) => {
      setIsConnected(false)
      toast.error('Connection failed')
      console.error('Connection error:', error)
    })

    newSocket.on('error', (error) => {
      toast.error(error.message || 'An error occurred')
      console.error('Socket error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const value = {
    socket,
    isConnected
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}
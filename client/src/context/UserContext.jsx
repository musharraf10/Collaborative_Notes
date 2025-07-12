import { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export function UserProvider({ children }) {
  const [userName, setUserName] = useState('')
  const [isNameSet, setIsNameSet] = useState(false)

  useEffect(() => {
    const savedName = localStorage.getItem('collaborativeNotesUserName')
    if (savedName) {
      setUserName(savedName)
      setIsNameSet(true)
    }
  }, [])

  const updateUserName = (name) => {
    const trimmedName = name.trim()
    setUserName(trimmedName)
    setIsNameSet(!!trimmedName)
    
    if (trimmedName) {
      localStorage.setItem('collaborativeNotesUserName', trimmedName)
    } else {
      localStorage.removeItem('collaborativeNotesUserName')
    }
  }

  const value = {
    userName: userName || 'Anonymous',
    isNameSet,
    updateUserName
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
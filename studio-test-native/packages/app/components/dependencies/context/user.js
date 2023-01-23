import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
  } from 'react'
  import axios from 'axios'
import { API_ROOT } from '../utils/actions'
  
  export const UserContext = createContext()
  
  export function UserWrapper({ children }) {
    const [user, setUser] = useState(null)
  
    const getCurrentUser = useCallback(() => {
      axios
        .get(`${API_ROOT}/current-user`)
        .then(res => {
          setUser(res.data)
        })
        .catch(error => {
          setUser(false)
          console.error('Cant fetch current user', error)
        })
    }, [])
  
    useEffect(() => {
      getCurrentUser()
    }, [getCurrentUser])
  
    return (
      <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>
    )
  }
  
  export function useUserContext() {
    return useContext(UserContext)
  }
  
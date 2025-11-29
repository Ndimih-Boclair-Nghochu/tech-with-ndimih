import React, { createContext, useState, useEffect } from 'react'
import { setAuthToken, login as apiLogin } from '../lib/api'

export const AuthContext = createContext()

export function AuthProvider({ children }){
  const [token, setToken] = useState(()=> localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  useEffect(()=>{
    setAuthToken(token)
    if(token) localStorage.setItem('token', token)
    else localStorage.removeItem('token')
  }, [token])

  async function login(username, password){
    try {
      const data = await apiLogin(username, password)
      setToken(data.access)
      return data
    } catch (error) {
      // Re-throw with a more user-friendly message if needed
      if (error.response) {
        // Server responded with error status
        throw new Error(error.response.data?.detail || error.response.data?.non_field_errors?.[0] || 'Login failed')
      } else if (error.request) {
        // Request made but no response received
        throw new Error('Unable to connect to server. Please check your connection.')
      } else {
        // Something else happened
        throw new Error(error.message || 'Login failed')
      }
    }
  }

  function logout(){
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

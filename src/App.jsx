import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './supabase'
import SignupPage from './components/SignupPage/SignupPage'
import HomePage from './components/HomePage/HomePage'
import './App.css'

export default function App() {
  const [session, setSession] = useState(undefined)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (session === undefined) return null

  return (
    <Routes>
      <Route path="/login" element={!session ? <SignupPage /> : <Navigate to="/home" replace />} />
      <Route path="/home" element={session ? <HomePage user={session.user} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to={session ? "/home" : "/login"} replace />} />
    </Routes>
  )
}

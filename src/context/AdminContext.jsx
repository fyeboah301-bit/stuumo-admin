import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AdminContext = createContext({})
export const useAdmin = () => useContext(AdminContext)

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const { data } = await supabase.from('admins').select('*').eq('id', session.user.id).single()
        setAdmin(data || null)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const { data } = await supabase.from('admins').select('*').eq('id', session.user.id).single()
        setAdmin(data || null)
      } else {
        setAdmin(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const { data: adminData } = await supabase.from('admins').select('*').eq('id', data.user.id).single()
    if (!adminData) {
      await supabase.auth.signOut()
      throw new Error('Access denied. You are not an admin.')
    }
    setAdmin(adminData)
    return adminData
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setAdmin(null)
  }

  return (
    <AdminContext.Provider value={{ admin, loading, signIn, signOut }}>
      {!loading && children}
    </AdminContext.Provider>
  )
}
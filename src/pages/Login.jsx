import { useState } from 'react'
import { useAdmin } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const { signIn } = useAdmin()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signIn(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontFamily: "'Roboto Serif', Georgia, serif", fontSize: '30px', fontWeight: '700', color: '#fff' }}>
            Stuumo
          </div>
          <p style={{ color: '#94A3B8', fontSize: '13px', marginTop: '4px' }}>Admin Platform</p>
        </div>

        <div style={{ background: '#1E293B', borderRadius: '12px', padding: '2rem', border: '1px solid #334155' }}>
          <h2 style={{ color: '#fff', fontSize: '18px', fontWeight: '600', marginBottom: '1.5rem' }}>Sign in to admin</h2>
          {error && (
            <div style={{ background: '#450A0A', color: '#FCA5A5', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={lbl}>Email</label>
              <input style={inp} type="email" placeholder="admin@teachme.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label style={lbl}>Password</label>
              <input style={inp} type="password" placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', cursor: 'pointer', fontWeight: '600', marginTop: '0.5rem' }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

const lbl = { fontSize: '12px', fontWeight: '600', color: '#94A3B8', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }
const inp = { width: '100%', padding: '10px 12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', fontSize: '14px', color: '#fff', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }
'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  credits: number
}

export default function SimplePage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  const API_URL = 'http://localhost:8000'

  // Forms
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  })

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchUserInfo()
    }
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/users/me`)
      setCurrentUser(response.data)
    } catch (error) {
      console.log('User not logged in')
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/login`, loginForm)
      const { access_token, user } = response.data
      localStorage.setItem('access_token', access_token)
      setCurrentUser(user)
      setShowLogin(false)
      setLoginForm({ email: '', password: '' })
      alert('Login successful!')
    } catch (error: any) {
      alert('Login failed: ' + (error.response?.data?.detail || 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/register`, registerForm)
      alert('Registration successful! You get 100 free credits!')
      setShowRegister(false)
      setRegisterForm({ email: '', password: '', first_name: '', last_name: '' })
    } catch (error: any) {
      alert('Registration failed: ' + (error.response?.data?.detail || 'Unknown error'))
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    setCurrentUser(null)
    alert('Logged out successfully!')
  }

  if (showLogin) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>🎧 Podcast Muse</h1>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginTop: '1rem' }}>Sign in to your account</h2>
          </div>

          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Email address</label>
                <input
                  type="email"
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Password</label>
                <input
                  type="password"
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={() => setShowLogin(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showRegister) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>🎧 Podcast Muse</h1>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1f2937', marginTop: '1rem' }}>Create your free account</h2>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>Get 100 free credits to start creating podcasts</p>
          </div>

          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>First Name</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    value={registerForm.first_name}
                    onChange={(e) => setRegisterForm({...registerForm, first_name: e.target.value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Last Name</label>
                  <input
                    type="text"
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                    value={registerForm.last_name}
                    onChange={(e) => setRegisterForm({...registerForm, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Email address</label>
                <input
                  type="email"
                  required
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                {isLoading ? 'Creating account...' : 'Create free account'}
              </button>
            </form>

            <div style={{ marginTop: '1rem' }}>
              <button
                onClick={() => setShowRegister(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (currentUser) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
        {/* Header */}
        <header style={{ backgroundColor: 'white', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>🎧 Podcast Muse</h1>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#6b7280' }}>{currentUser.credits} credits 💰</span>
                <button
                  onClick={handleLogout}
                  style={{ color: '#6b7280', padding: '0.5rem 1rem', borderRadius: '0.375rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard */}
        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
              Welcome back, {currentUser.first_name || currentUser.email}! 👋
            </h1>
            <p style={{ color: '#6b7280' }}>Ready to create your next amazing podcast?</p>
          </div>

          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>💰</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Available Credits</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{currentUser.credits}</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>🎙️</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Podcasts Created</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>0</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>⚡</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Status</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>Active</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Create New Podcast</h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Start creating your podcast episode with AI-powered script generation,
                natural voice synthesis, and automatic media creation.
              </p>

              <button
                onClick={() => alert('Project creation coming soon!')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '1rem'
                }}
              >
                ➕ Create New Podcast
              </button>

              <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '0.375rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e40af', marginBottom: '0.5rem' }}>What's included?</h3>
                <ul style={{ fontSize: '0.875rem', color: '#1e40af', listStyle: 'none', padding: 0 }}>
                  <li>• AI-generated script</li>
                  <li>• High-quality audio</li>
                  <li>• Cover image generation</li>
                  <li>• Animated video creation</li>
                  <li>• Complete download package</li>
                </ul>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Quick Test API</h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                Test the backend API to see how it works!
              </p>

              <button
                onClick={() => window.open('http://localhost:8000/docs', '_blank')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '1rem'
                }}
              >
                📚 Open API Documentation
              </button>

              <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.375rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>Available Endpoints:</h3>
                <ul style={{ fontSize: '0.875rem', color: '#6b7280', listStyle: 'none', padding: 0 }}>
                  <li>• User Authentication</li>
                  <li>• Project Management</li>
                  <li>• Credit System</li>
                  <li>• Podcast Generation</li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Landing Page
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'white' }}>
        <nav style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>🎧 Podcast Muse</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => setShowLogin(true)}
                style={{ color: '#6b7280', padding: '0.5rem 1rem', borderRadius: '0.375rem', backgroundColor: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                Sign In
              </button>
              <button
                onClick={() => setShowRegister(true)}
                style={{ backgroundColor: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '500', cursor: 'pointer' }}
              >
                Get Started Free
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', lineHeight: '1.2' }}>
          Create Podcasts with
          <span style={{ color: '#3b82f6' }}> AI Magic</span>
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#6b7280', maxWidth: '48rem', margin: '0 auto 2rem', lineHeight: '1.6' }}>
          Transform your ideas into complete podcast episodes in minutes.
          From script to audio, cover images to videos - all powered by AI.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setShowRegister(true)}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1.125rem',
              cursor: 'pointer',
              border: 'none'
            }}
          >
            Start Creating Free
          </button>
          <button
            onClick={() => window.open('http://localhost:8000/docs', '_blank')}
            style={{
              border: '2px solid #3b82f6',
              color: '#3b82f6',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1.125rem',
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
          >
            View API Docs
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginTop: '4rem' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>100+</div>
            <div style={{ color: '#6b7280' }}>Free Credits</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>&lt; 10min</div>
            <div style={{ color: '#6b7280' }}>Average Generation Time</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>BYOK</div>
            <div style={{ color: '#6b7280' }}>Bring Your Own API Keys</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', color: 'white', padding: '2rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <p style={{ color: '#9ca3af' }}>
            © 2024 Podcast Muse. AI-powered podcast generation platform.
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Backend API: http://localhost:8000 | API Docs: http://localhost:8000/docs
          </p>
        </div>
      </footer>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import Navigation from '../components/Navigation'

export default function SimplePage() {
  const { currentUser, setCurrentUser, isLoading, login } = useAuth()
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  // Forms
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await login(loginForm.email, loginForm.password)
    if (result.success) {
      setShowLogin(false)
      setLoginForm({ email: '', password: '' })
      alert('Login successful!')
    } else {
      alert('Login failed: ' + (result.error || 'Unknown error'))
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:8000/api/v1/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerForm)
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem('access_token', data.access_token)
        await login(registerForm.email, registerForm.password)
        setShowRegister(false)
        setRegisterForm({ email: '', password: '', first_name: '', last_name: '' })
        alert('Registration successful! Welcome to Podcast Muse!')
      } else {
        const error = await response.json()
        alert('Registration failed: ' + (error.detail || 'Unknown error'))
      }
    } catch (error) {
      alert('Registration failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
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

            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <Link
                href="/forgot-password"
                style={{
                  color: '#3b82f6',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  display: 'inline-block'
                }}
              >
                Forgot your password?
              </Link>
            </div>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>🎧 Podcast Muse</h1>
                <nav style={{ display: 'flex', gap: '1rem' }}>
                  <Link href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem', borderRadius: '0.375rem', hover: { backgroundColor: '#f3f4f6' } }}>📊 Dashboard</Link>
                  <Link href="/topics" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem', borderRadius: '0.375rem', hover: { backgroundColor: '#f3f4f6' } }}>💡 Topics</Link>
                  <Link href="/create" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem', borderRadius: '0.375rem', hover: { backgroundColor: '#f3f4f6' } }}>🎬 Create</Link>
                  <Link href="/compose" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem', borderRadius: '0.375rem', hover: { backgroundColor: '#f3f4f6' } }}>✍️ Compose</Link>
                  <Link href="/settings" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem', borderRadius: '0.375rem', hover: { backgroundColor: '#f3f4f6' } }}>⚙️ Settings</Link>
                </nav>
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

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <Link
                  href="/topics"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}
                >
                  💡 หาหัวข้อก่อน
                </Link>
                <Link
                  href="/create"
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
                    textDecoration: 'none'
                  }}
                >
                  ➕ Create New Podcast
                </Link>
              </div>

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
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>Features:</h3>
                <ul style={{ fontSize: '0.875rem', color: '#6b7280', listStyle: 'none', padding: 0 }}>
                  <li>✨ AI-powered topic ideas</li>
                  <li>🎙️ Professional script writing</li>
                  <li>🎵 Natural voice synthesis</li>
                  <li>🖼️ Cover image generation</li>
                  <li>🎬 Animated video creation</li>
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
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      {/* Header */}
      <header style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
        <nav style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#764ba2' }}>🎧 Podcast Muse</h1>
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
                style={{ backgroundColor: '#764ba2', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.375rem', border: 'none', fontWeight: '500', cursor: 'pointer' }}
              >
                Get Started Free
              </button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 1rem', textAlign: 'center' }}>
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem', padding: '3rem', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1.5rem', lineHeight: '1.2' }}>
            Transform Your Ideas into
            <span style={{ color: '#764ba2' }}> AI-Powered Podcasts</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#6b7280', maxWidth: '48rem', margin: '0 auto 2rem', lineHeight: '1.6' }}>
            Create professional podcast episodes in minutes with our advanced AI.
            From intelligent script writing to natural voice synthesis and stunning visuals.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowRegister(true)}
              style={{
                backgroundColor: '#764ba2',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '1.125rem',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 4px 15px rgba(118, 75, 162, 0.3)'
              }}
            >
              🚀 Start Creating Free
            </button>
            <button
              onClick={() => setShowLogin(true)}
              style={{
                border: '2px solid #764ba2',
                color: '#764ba2',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                fontWeight: '600',
                fontSize: '1.125rem',
                cursor: 'pointer',
                backgroundColor: 'transparent'
              }}
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem', padding: '2rem', textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✨</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>AI Script Generation</h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
              Advanced AI writes compelling podcast scripts tailored to your topic and audience.
              Support for multiple languages and content styles.
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem', padding: '2rem', textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎙️</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Natural Voice Synthesis</h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
              High-quality AI voices that sound natural and engaging.
              Multiple voice options with emotional tone control.
            </p>
          </div>

          <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem', padding: '2rem', textAlign: 'left' }}>
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎨</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Visual Content Creation</h3>
            <p style={{ color: '#6b7280', lineHeight: '1.6' }}>
              AI-generated cover images and animated videos to make your podcast stand out.
              Custom branding and style options.
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem', padding: '2rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>Why Content Creators Love Podcast Muse</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#764ba2', marginBottom: '0.5rem' }}>1000+</div>
              <div style={{ color: '#6b7280', fontSize: '1rem' }}>Free Credits for New Users</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#764ba2', marginBottom: '0.5rem' }}>&lt; 5min</div>
              <div style={{ color: '#6b7280', fontSize: '1rem' }}>Average Generation Time</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#764ba2', marginBottom: '0.5rem' }}>50+</div>
              <div style={{ color: '#6b7280', fontSize: '1rem' }}>AI Voice Options</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#764ba2', marginBottom: '0.5rem' }}>BYOK</div>
              <div style={{ color: '#6b7280', fontSize: '1rem' }}>Bring Your Own API Keys</div>
            </div>
          </div>
        </div>

        {/* Pricing Preview */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem', padding: '2rem', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '2rem' }}>Simple, Transparent Pricing</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
            <div style={{ border: '2px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Free Starter</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#764ba2', marginBottom: '1rem' }}>฿0<span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6b7280' }}>/month</span></div>
              <ul style={{ textAlign: 'left', color: '#6b7280', listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ 1000 free credits</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Basic AI voices</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ 5 podcasts per month</li>
                <li>✓ Standard quality</li>
              </ul>
            </div>

            <div style={{ border: '2px solid #764ba2', borderRadius: '0.5rem', padding: '1.5rem', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '-10px', right: '20px', backgroundColor: '#764ba2', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem' }}>POPULAR</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Creator Pro</h3>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#764ba2', marginBottom: '1rem' }}>฿299<span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#6b7280' }}>/month</span></div>
              <ul style={{ textAlign: 'left', color: '#6b7280', listStyle: 'none', padding: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>✓ Unlimited credits</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Premium AI voices</li>
                <li style={{ marginBottom: '0.5rem' }}>✓ Unlimited podcasts</li>
                <li>✓ 4K video export</li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderRadius: '1rem', padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>Ready to Create Amazing Podcasts?</h2>
          <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '2rem' }}>
            Join thousands of content creators using AI to produce professional podcasts
          </p>
          <button
            onClick={() => setShowRegister(true)}
            style={{
              backgroundColor: '#764ba2',
              color: 'white',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '1.125rem',
              cursor: 'pointer',
              border: 'none',
              boxShadow: '0 4px 15px rgba(118, 75, 162, 0.3)'
            }}
          >
            🎉 Start Free Today
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: '#111827', color: 'white', padding: '2rem 0', textAlign: 'center' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1rem' }}>
          <p style={{ color: '#9ca3af' }}>
            © 2024 Podcast Muse. AI-powered podcast generation platform.
          </p>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Built with ❤️ for content creators worldwide
          </p>
        </div>
      </footer>
    </div>
  )
}
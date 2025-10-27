'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import axios from 'axios'
import { useAuth } from '../../hooks/useAuth'
import Navigation from '../../components/Navigation'

interface Project {
  id: string
  title: string
  status: string
  total_credits_used: number
  created_at: string
}

export default function DashboardPage() {
  const { currentUser, setCurrentUser } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const API_URL = 'http://localhost:8000'

  useEffect(() => {
    if (!currentUser) {
      // Redirect to login
      window.location.href = '/'
      return
    }
    fetchProjects()
  }, [currentUser])

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/projects`)
      setProjects(response.data)
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('api_keys')
    window.location.href = '/'
  }

  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <Navigation currentUser={currentUser} setCurrentUser={setCurrentUser} />

      {/* Dashboard */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            Welcome back, {currentUser.first_name || currentUser.email}! 👋
          </h1>
          <p style={{ color: '#6b7280' }}>
            Ready to create your next amazing podcast?
          </p>
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
                <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{projects.length}</p>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Create Content</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Start with our AI-powered script composer or jump straight to full podcast creation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link href="/compose">
                <button
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
                    textDecoration: 'none',
                    marginBottom: '0.5rem'
                  }}
                >
                  📝 Compose Script (3 credits)
                </button>
              </Link>

              <Link href="/create">
                <button
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
                    textDecoration: 'none',
                    marginBottom: '1rem'
                  }}
                >
                  🚀 Create Full Podcast (18 credits)
                </button>
              </Link>

              <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '0.375rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#1e40af', marginBottom: '0.5rem' }}>What's included?</h3>
                <ul style={{ fontSize: '0.875rem', color: '#1e40af', listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '0.25rem' }}>📝 AI-generated script</li>
                  <li style={{ marginBottom: '0.25rem' }}>🎙️ High-quality audio</li>
                  <li style={{ marginBottom: '0.25rem' }}>🎨 Cover image generation</li>
                  <li style={{ marginBottom: '0.25rem' }}>🎬 Animated video creation</li>
                  <li>📦 Complete download package</li>
                </ul>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>Quick Actions</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Link href="/settings">
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    textAlign: 'left'
                  }}
                >
                  🔑 Configure API Keys
                </button>
              </Link>

              <Link href="/compose">
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    textAlign: 'left'
                  }}
                >
                  📝 Compose Another Script
                </button>
              </Link>

              <Link href="/create">
                <button
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    textAlign: 'left'
                  }}
                >
                  🎬 Create Full Podcast
                </button>
              </Link>

              <button
                onClick={() => window.open('http://localhost:8000/docs', '_blank')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                📚 View API Documentation
              </button>
            </div>

            <div style={{ backgroundColor: '#f9fafb', padding: '1rem', borderRadius: '0.375rem', marginTop: '1rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>Quick Tips</h3>
              <ul style={{ fontSize: '0.875rem', color: '#6b7280', listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.25rem' }}>• Configure API keys before creating podcasts</li>
                <li style={{ marginBottom: '0.25rem' }}>• Each generation costs 18 credits total</li>
                <li>• Your external API costs are separate from platform fees</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Projects */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827' }}>Recent Projects</h2>
            {projects.length > 0 && (
              <Link href="/projects" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}>
                View all →
              </Link>
            )}
          </div>

          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎙️</div>
              <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>No projects yet</h3>
              <p style={{ marginBottom: '1rem' }}>Get started by creating your first podcast.</p>
              <Link href="/create">
                <button
                  style={{
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
                  Create Your First Podcast
                </button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {projects.slice(0, 5).map((project) => (
                <div key={project.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                  <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>{project.title}</p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: project.status === 'completed' ? '#ecfdf5' : project.status === 'generating' ? '#fef3c7' : '#f3f4f6',
                      color: project.status === 'completed' ? '#065f46' : project.status === 'generating' ? '#92400e' : '#374151'
                    }}>
                      {project.status}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {project.total_credits_used} credits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
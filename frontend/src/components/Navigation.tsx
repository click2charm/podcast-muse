'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import axios from 'axios'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  credits: number
  is_admin?: boolean
}

interface NavigationProps {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  onLogout?: () => void
}

export default function Navigation({ currentUser, setCurrentUser, onLogout }: NavigationProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    setIsLoading(true)
    try {
      localStorage.removeItem('access_token')
      setCurrentUser(null)
      if (onLogout) onLogout()
      // Redirect to home using Next.js router
      router.push('/')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <nav style={{
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 1rem',
      height: '4rem',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
              🎧 Podcast Muse
            </h1>
          </Link>

          {/* Navigation Links */}
          {currentUser && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link
                href="/dashboard"
                style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: pathname === '/dashboard' ? '#f3f4f6' : 'transparent'
                }}
              >
                📊 Dashboard
              </Link>
              <Link
                href="/topics"
                style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: pathname === '/topics' ? '#f3f4f6' : 'transparent'
                }}
              >
                💡 Topics
              </Link>
              <Link
                href="/create"
                style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: pathname === '/create' ? '#f3f4f6' : 'transparent'
                }}
              >
                🎬 Create
              </Link>
              <Link
                href="/compose"
                style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: pathname === '/compose' ? '#f3f4f6' : 'transparent'
                }}
              >
                ✍️ Compose
              </Link>
              <Link
                href="/settings"
                style={{
                  color: '#6b7280',
                  textDecoration: 'none',
                  padding: '0.5rem',
                  borderRadius: '0.375rem',
                  backgroundColor: pathname === '/settings' ? '#f3f4f6' : 'transparent'
                }}
              >
                ⚙️ Settings
              </Link>
              {currentUser.is_admin && (
                <Link
                  href="/admin"
                  style={{
                    color: '#dc2626',
                    textDecoration: 'none',
                    padding: '0.5rem',
                    borderRadius: '0.375rem',
                    backgroundColor: pathname === '/admin' ? '#fee2e2' : 'transparent'
                  }}
                >
                  🛠️ Admin
                </Link>
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentUser ? (
            <>
              <div style={{ textAlign: 'right', fontSize: '0.875rem' }}>
                <div style={{ color: '#374151', fontWeight: '500' }}>
                  {currentUser.first_name} {currentUser.last_name}
                  {currentUser.is_admin && (
                    <span style={{
                      backgroundColor: '#fef3c7',
                      color: '#92400e',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.25rem',
                      marginLeft: '0.5rem',
                      fontSize: '0.75rem'
                    }}>
                      Admin
                    </span>
                  )}
                </div>
                <div style={{ color: '#6b7280' }}>
                  Credits: <span style={{ fontWeight: '600', color: '#059669' }}>{currentUser.credits}</span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1
                }}
              >
                {isLoading ? 'Logging out...' : 'Logout'}
              </button>
            </>
          ) : (
            <Link
              href="/"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem'
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
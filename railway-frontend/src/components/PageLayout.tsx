import React from 'react'
import Link from 'next/link'
import { useAuth } from '../hooks/useAuth'
import Navigation from './Navigation'

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  currentUser: any
  setCurrentUser: (user: any) => void
}

export default function PageLayout({ children, title, subtitle, currentUser, setCurrentUser }: PageLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Navigation */}
      <Navigation currentUser={currentUser} setCurrentUser={setCurrentUser} />

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Page Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '48rem', margin: '0 auto', lineHeight: '1.6' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Page Content */}
        {children}
      </main>
    </div>
  )
}
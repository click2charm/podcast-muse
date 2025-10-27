'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const API_URL = 'http://localhost:8000'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await axios.post(`${API_URL}/api/v1/auth/forgot-password`, {
        email: email
      })

      if (response.data.reset_token) {
        // For testing - show the reset token
        setMessage(`✅ Password reset link sent! 📧\n\n🔧 For testing, your reset token is:\n${response.data.reset_token}\n\nExpires at: ${new Date(response.data.expires_at).toLocaleString()}`)
      } else {
        setMessage('✅ If your email is registered, you will receive a reset link')
      }
      setIsSuccess(true)
    } catch (error: any) {
      setMessage('❌ Failed to send reset link. Please try again.')
      setIsSuccess(false)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6', marginBottom: '0.5rem' }}>
            🎧 Podcast Muse
          </h1>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
            Forgot Password?
          </h2>
          <p style={{ color: '#6b7280' }}>
            No worries! We'll send you a reset link.
          </p>
        </div>

        {/* Form */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
          {message && (
            <div style={{
              padding: '1rem',
              borderRadius: '0.375rem',
              marginBottom: '1.5rem',
              backgroundColor: isSuccess ? '#ecfdf5' : '#fef2f2',
              color: isSuccess ? '#065f46' : '#991b1b',
              border: `1px solid ${isSuccess ? '#d1fae5' : '#fecaca'}`,
              whiteSpace: 'pre-line',
              fontSize: '0.875rem'
            }}>
              {message}
            </div>
          )}

          {!isSuccess ? (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'border-color 0.15s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{ width: '1rem', height: '1rem', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Sending...
                  </>
                ) : (
                  '📧 Send Reset Link'
                )}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
              <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                Check your email!
              </h3>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                We've sent you instructions to reset your password.
              </p>
              <Link href="/reset-password">
                <button
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    fontSize: '0.875rem'
                  }}
                >
                  🔄 Reset Password
                </button>
              </Link>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link href="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}>
              ← Back to Login
            </Link>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
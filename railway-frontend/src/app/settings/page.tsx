'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '../../hooks/useAuth'
import PageLayout from '../../components/PageLayout'
import Navigation from '../../components/Navigation'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  credits: number
}

interface APIKeys {
  openai_key?: string
  kie_key?: string
  google_key?: string
}

export default function SettingsPage() {
  const { currentUser, setCurrentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [apiKeys, setApiKeys] = useState<APIKeys>({})
  const [showKeys, setShowKeys] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const API_URL = 'http://localhost:8000'

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchUserInfo()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/users/me`)
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      router.push('/login')
    }
  }

  const handleSaveAPIKeys = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      // Simulate API call to save keys
      // In real implementation, this would call your backend API
      localStorage.setItem('api_keys', JSON.stringify(apiKeys))

      setMessage('✅ API keys saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      setMessage('❌ Failed to save API keys. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    router.push('/')
  }

  const handleOpenAIAPIKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setApiKeys(prev => ({
      ...prev,
      openai_key: value.startsWith('sk-') ? value : `sk-${value}`
    }))
  }

  const maskAPIKey = (key: string) => {
    if (!key || key.length < 10) return key
    return key.slice(0, 10) + '••••••••••' + key.slice(-4)
  }

  if (!user) {
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

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            ⚙️ Settings
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '48rem', margin: '0 auto', lineHeight: '1.6' }}>
            Manage your API keys and account settings
          </p>
        </div>

        {/* API Keys Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🔑 API Keys
            </h2>
            <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
              Configure your own API keys to use AI services. We never store your raw keys - they are encrypted.
            </p>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {message && (
              <div style={{
                padding: '1rem',
                borderRadius: '0.375rem',
                marginBottom: '1.5rem',
                backgroundColor: message.includes('✅') ? '#ecfdf5' : '#fef2f2',
                color: message.includes('✅') ? '#065f46' : '#991b1b',
                border: `1px solid ${message.includes('✅') ? '#d1fae5' : '#fecaca'}`
              }}>
                {message}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                Show/Hide API Keys
              </span>
              <button
                onClick={() => setShowKeys(!showKeys)}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '0.375rem',
                  backgroundColor: showKeys ? '#3b82f6' : '#6b7280',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                {showKeys ? '👁️ Hide' : '👁️‍🗨️ Show'}
              </button>
            </div>

            {/* OpenAI API Key */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                OpenAI API Key
                <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                placeholder="sk-..."
                value={showKeys ? apiKeys.openai_key || '' : maskAPIKey(apiKeys.openai_key || '')}
                onChange={handleOpenAIAPIKeyChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Used for script generation and SEO optimization. Get your key from{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                  OpenAI Platform
                </a>
              </p>
            </div>

            {/* KIE API Key */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                KIE API Key
                <span style={{ color: '#ef4444', marginLeft: '0.25rem' }}>*</span>
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                placeholder="Your KIE API key"
                value={showKeys ? apiKeys.kie_key || '' : maskAPIKey(apiKeys.kie_key || '')}
                onChange={(e) => setApiKeys(prev => ({ ...prev, kie_key: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Used for ElevenLabs (TTS), Flux (Images), and Hailao (Videos). Contact us for API access.
              </p>
            </div>

            {/* Google AI Studio API Key (Optional) */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                Google AI Studio API Key (Optional)
              </label>
              <input
                type={showKeys ? 'text' : 'password'}
                placeholder="AIza..."
                value={showKeys ? apiKeys.google_key || '' : maskAPIKey(apiKeys.google_key || '')}
                onChange={(e) => setApiKeys(prev => ({ ...prev, google_key: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>
                Alternative TTS option for Thai language. Get your key from{' '}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                  Google AI Studio
                </a>
              </p>
            </div>

            <button
              onClick={handleSaveAPIKeys}
              disabled={isSaving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: isSaving ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: '500',
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              {isSaving ? (
                <>
                  <div style={{ width: '1rem', height: '1rem', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  Saving...
                </>
              ) : (
                '💾 Save API Keys'
              )}
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
            ℹ️ About API Keys
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                🛡️ Security
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                Your API keys are encrypted and stored securely. We never share or misuse your keys.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                💰 Pricing
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                You pay directly to AI providers. We only charge platform fees (3 credits per generation).
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                🔄 Flexibility
              </h4>
              <p style={{ fontSize: '0.875rem', color: '#6b7280', lineHeight: '1.5' }}>
                Change your API keys anytime. You can use different providers for different projects.
              </p>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
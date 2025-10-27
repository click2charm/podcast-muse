'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { useAuth } from '../../hooks/useAuth'
import Navigation from '../../components/Navigation'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  credits: number
}

interface ProjectFormData {
  title: string
  description: string
  language: string
  targetDuration: number
  voiceGender: string
  voiceTone: string
  scriptTemplate: string
  imageStyle: string
  videoMotion: string
  scriptContent?: string
}

interface APIKeys {
  openai_key?: string
  kie_key?: string
  google_key?: string
}

interface GenerationProgress {
  script: 'pending' | 'generating' | 'completed' | 'error'
  audio: 'pending' | 'generating' | 'completed' | 'error'
  image: 'pending' | 'generating' | 'completed' | 'error'
  video: 'pending' | 'generating' | 'completed' | 'error'
}

export default function CreatePage() {
  const { currentUser, setCurrentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [projectId, setProjectId] = useState('')
  const [message, setMessage] = useState('')
  const [useExistingScript, setUseExistingScript] = useState(false)
  const [existingScripts, setExistingScripts] = useState([])
  const router = useRouter()

  const API_URL = 'http://localhost:8000'

  // Form data
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    language: 'th',
    targetDuration: 10,
    voiceGender: 'female',
    voiceTone: 'professional',
    scriptTemplate: 'storytelling',
    imageStyle: 'studio_mic',
    videoMotion: 'subtle'
  })

  // Generation results
  const [generationResults, setGenerationResults] = useState({
    script: '',
    audioUrl: '',
    imageUrl: '',
    videoUrl: ''
  })

  // Generation progress
  const [progress, setProgress] = useState<GenerationProgress>({
    script: 'pending',
    audio: 'pending',
    image: 'pending',
    video: 'pending'
  })

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/')
      return
    }
    fetchUserInfo()
    fetchExistingScripts()
  }, [])

  const fetchUserInfo = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/v1/users/me`)
      setUser(response.data)
    } catch (error) {
      console.error('Failed to fetch user info:', error)
      router.push('/')
    }
  }

  const fetchExistingScripts = async () => {
    try {
      // Mock existing scripts - in real implementation, fetch from database
      setExistingScripts([
        { id: '1', title: 'AI กับการสร้างสรรค์', content: 'บทสนทนาเกี่ยวกับ AI...' },
        { id: '2', title: 'การลงทุนสำหรับมือใหม่', content: 'แนะนำการลงทุน...' }
      ])
    } catch (error) {
      console.error('Failed to fetch existing scripts:', error)
    }
  }

  const checkAPIKeys = () => {
    const keys = localStorage.getItem('api_keys')
    if (!keys) {
      setMessage('⚠️ กรุณาตั้งค่า API Keys ในหน้า Settings ก่อน!')
      return false
    }
    const apiKeys = JSON.parse(keys)
    if (!apiKeys.openai_key || !apiKeys.kie_key) {
      setMessage('⚠️ กรุณาตั้งค่า OpenAI และ KIE API Keys ในหน้า Settings ก่อน!')
      return false
    }
    return true
  }

  const handleNextStep = () => {
    setMessage('')

    if (step === 1) {
      if (!formData.title.trim()) {
        setMessage('⚠️ กรุณาใส่ชื่อพอดคาสต์')
        return
      }
      if (!formData.description.trim()) {
        setMessage('⚠️ กรุณาใส่คำอธิบายพอดคาสต์')
        return
      }
      if (!checkAPIKeys()) {
        return
      }
      setStep(2)
    } else if (step === 2) {
      if (!useExistingScript && !formData.scriptContent?.trim()) {
        setMessage('⚠️ กรุณาเลือกใช้สคริปต์ที่มีอยู่หรือเขียนสคริปต์ใหม่')
        return
      }
      if (user && user.credits < 18) {
        setMessage('⚠️ Credits ไม่พอสำหรับสร้างพอดคาสต์ (ต้องการ 18 credits)')
        return
      }
      setStep(3)
    } else if (step === 3) {
      startGeneration()
    }
  }

  const handlePrevStep = () => {
    setMessage('')
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const generateScript = async () => {
    setIsLoading(true)
    setMessage('🤖 กำลังสร้างสคริปต์...')

    try {
      // Simulate script generation with OpenAI
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockScript = `# ${formData.title}

## Introduction
สวัสดีครับทุกคน ยินดีต้อนรับสู่ ${formData.title} วันนี้เราจะมาพูดถึงเรื่อง ${formData.description}

## Main Content
### บทที่ 1: พื้นฐาน
${formData.description} เป็นเรื่องที่น่าสนใจมาก เพราะ...

### บทที่ 2: เทคนิค
วิธีการทำงานมีดังนี้ครับ...

### บทที่ 3: ตัวอย่าง
มาดูตัวอย่างจริงกัน...

## Conclusion
หวังว่าเนื้อหาวันนี้จะเป็นประโยชน์กับเพื่อนๆ นะครับ
ขอบคุณที่ฟังครับ!

---

*สร้างโดย AI จาก Podcast Muse*
`

      setFormData(prev => ({ ...prev, scriptContent: mockScript }))
      setMessage('✅ สร้างสคริปต์สำเร็จแล้ว!')

    } catch (error: any) {
      setMessage('❌ สร้างสคริปต์ไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }

  const startGeneration = async () => {
    setIsLoading(true)
    setMessage('')
    setProgress({
      script: 'pending',
      audio: 'pending',
      image: 'pending',
      video: 'pending'
    })

    try {
      // Step 1: Create project
      const projectResponse = await axios.post(`${API_URL}/api/v1/projects`, {
        title: formData.title,
        description: formData.description
      })

      const newProjectId = projectResponse.data.id
      setProjectId(newProjectId)

      // Step 2: Generate Script (if not provided)
      if (!useExistingScript) {
        setProgress(prev => ({ ...prev, script: 'generating' }))
        await new Promise(resolve => setTimeout(resolve, 2000))
        setGenerationResults(prev => ({ ...prev, script: formData.scriptContent || '' }))
        setProgress(prev => ({ ...prev, script: 'completed' }))
      } else {
        // Use existing script
        setProgress(prev => ({ ...prev, script: 'completed' }))
      }

      // Step 3: Generate Audio
      setProgress(prev => ({ ...prev, audio: 'generating' }))
      setMessage('🎙️ กำลังสร้างไฟล์เสียง...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      setGenerationResults(prev => ({
        ...prev,
        audioUrl: 'https://example.com/audio.mp3' // Mock URL
      }))
      setProgress(prev => ({ ...prev, audio: 'completed' }))

      // Step 4: Generate Cover Image
      setProgress(prev => ({ ...prev, image: 'generating' }))
      setMessage('🎨 กำลังสร้างภาพปก...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      setGenerationResults(prev => ({
        ...prev,
        imageUrl: 'https://picsum.photos/800/800?random=' + Math.random() // Mock image
      }))
      setProgress(prev => ({ ...prev, image: 'completed' }))

      // Step 5: Generate Video
      setProgress(prev => ({ ...prev, video: 'generating' }))
      setMessage('🎬 กำลังสร้างวิดีโอ...')
      await new Promise(resolve => setTimeout(resolve, 4000))
      setGenerationResults(prev => ({
        ...prev,
        videoUrl: 'https://example.com/video.mp4' // Mock URL
      }))
      setProgress(prev => ({ ...prev, video: 'completed' }))

      // Update project status to completed
      await axios.put(`${API_URL}/api/v1/projects/${newProjectId}`, {
        status: 'completed',
        total_credits_used: 18
      })

      setMessage('✅ สร้างพอดคาสต์สำเร็จแล้ว! กำลังจะ redirect ไปหน้า dashboard...')

      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)

    } catch (error: any) {
      setMessage('❌ การสร้างพอดคาสต์ล้มเหลว กรุณาลองใหม่')
      console.error('Generation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
            🎬 AI Podcast Creator
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '48rem', margin: '0 auto', lineHeight: '1.6' }}>
            สร้างพ็อดแคสต์เต็มรูปแบบด้วย AI ตั้งแต่สคริปต์ ไปจนถึงเสียงพูด รูปภาพ และวิดีโอ เพียงไม่กี่ขั้นตอนง่ายๆ
          </p>
        </div>
        {/* Progress Steps */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
          {['📝 Details', '📜 Script', '🚀 Generate'].map((label, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem',
                borderRadius: '50%',
                backgroundColor: step > index + 1 ? '#10b981' : step === index + 1 ? '#3b82f6' : '#e5e7eb',
                color: step > index + 1 ? 'white' : step === index + 1 ? 'white' : '#6b7280',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {step > index + 1 ? '✓' : index + 1}
              </div>
              <span style={{
                marginLeft: '0.5rem',
                fontSize: '0.875rem',
                color: step >= index + 1 ? '#374151' : '#9ca3af',
                display: index === 2 ? 'block' : 'none'
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>

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

        {/* Step 1: Basic Details */}
        {step === 1 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
              📝 Podcast Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  ชื่อพอดคาสต์
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="เช่น AI กับการสร้างสรรค์ในยุคดิจิทัล"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  คำอธิบายพอดคาสต์
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="บอกเราเกี่ยวกับพอดคาสต์ที่คุณต้องการสร้าง..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  ภาษา
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="th">🇹🇭 ไทย</option>
                  <option value="en">🇺🇸 English</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  ระยะเวลา (นาที)
                </label>
                <select
                  value={formData.targetDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetDuration: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value={5}>5 นาที</option>
                  <option value={10}>10 นาที</option>
                  <option value={15}>15 นาที</option>
                  <option value={20}>20 นาที</option>
                  <option value={30}>30 นาที</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  เพศเสียง
                </label>
                <select
                  value={formData.voiceGender}
                  onChange={(e) => setFormData(prev => ({ ...prev, voiceGender: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="female">👩‍🦰 ผู้หญิง</option>
                  <option value="male">👨‍🦱 ผู้ชาย</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  โทนเสียง
                </label>
                <select
                  value={formData.voiceTone}
                  onChange={(e) => setFormData(prev => ({ ...prev, voiceTone: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="professional">🎓 มืออาชีพ</option>
                  <option value="friendly">😊 เป็นกันเอง</option>
                  <option value="energetic">⚡ สดใส</option>
                  <option value="calm">🧘 สงบ</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  สไตล์ภาพปก
                </label>
                <select
                  value={formData.imageStyle}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageStyle: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="studio_mic">🎙️ สตูดิโอไมค์</option>
                  <option value="abstract">🎨 นามธรรม</option>
                  <option value="professional">💼 มืออาชีพ</option>
                  <option value="minimal">⚪ มินิมอล</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  การเคลื่อนไหววิดีโอ
                </label>
                <select
                  value={formData.videoMotion}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoMotion: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="subtle">🍃 เบาๆ</option>
                  <option value="dynamic">⚡ ไดนามิก</option>
                  <option value="none">❌ ไม่มี</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                onClick={() => router.push('/dashboard')}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleNextStep}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Next: Script →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Script */}
        {step === 2 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
              📜 Script Content
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={useExistingScript}
                  onChange={(e) => setUseExistingScript(e.target.checked)}
                  style={{ marginRight: '0.5rem' }}
                />
                ใช้สคริปต์ที่มีอยู่แล้ว
              </label>
            </div>

            {useExistingScript ? (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  เลือกสคริปต์ที่มีอยู่
                </label>
                <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.375rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {existingScripts.map(script => (
                    <div key={script.id} style={{ padding: '1rem', borderBottom: '1px solid #f3f4f6' }}>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginBottom: '0.25rem' }}>
                        {script.title}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                        {script.content.substring(0, 100)}...
                      </p>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, scriptContent: script.content }))}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        เลือกสคริปต์นี้
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                    สคริปต์พอดคาสต์
                  </label>
                  <button
                    onClick={generateScript}
                    disabled={isLoading}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: isLoading ? '#9ca3af' : '#10b981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      cursor: isLoading ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div style={{ width: '1rem', height: '1rem', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        Generating...
                      </>
                    ) : (
                      '🤖 Generate with AI'
                    )}
                  </button>
                </div>
                <textarea
                  value={formData.scriptContent || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, scriptContent: e.target.value }))}
                  placeholder="วางหรือพิมพ์สคริปต์ของคุณที่นี่..."
                  rows={12}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                />
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem' }}>
                  💡 คำแนะนำ: สคริปต์ควรมีความยาวเหมาะสำหรับ {formData.targetDuration} นาที (ประมาณ {formData.targetDuration * 145} คำ)
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                onClick={handlePrevStep}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleNextStep}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                🚀 Create Podcast (18 credits) →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Generation Progress */}
        {step === 3 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
              🚀 Creating Your Podcast
            </h2>

            <div style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
              {/* Script Generation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: progress.script === 'completed' ? '#10b981' : progress.script === 'generating' ? '#3b82f6' : progress.script === 'error' ? '#ef4444' : '#e5e7eb',
                  color: 'white',
                  fontSize: '0.875rem'
                }}>
                  {progress.script === 'completed' ? '✓' : progress.script === 'generating' ? '↻' : progress.script === 'error' ? '✕' : '1'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                    📝 Script Generation
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {progress.script === 'pending' && 'รอดำเนินการ'}
                    {progress.script === 'generating' && 'กำลังสร้างสคริปต์...'}
                    {progress.script === 'completed' && 'สร้างสคริปต์สำเร็จ'}
                    {progress.script === 'error' && 'เกิดข้อผิดพลาด'}
                  </div>
                </div>
              </div>

              {/* Audio Generation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: progress.audio === 'completed' ? '#10b981' : progress.audio === 'generating' ? '#3b82f6' : progress.audio === 'error' ? '#ef4444' : '#e5e7eb',
                  color: 'white',
                  fontSize: '0.875rem'
                }}>
                  {progress.audio === 'completed' ? '✓' : progress.audio === 'generating' ? '↻' : progress.audio === 'error' ? '✕' : '2'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                    🎙️ Audio Generation
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {progress.audio === 'pending' && 'รอดำเนินการ'}
                    {progress.audio === 'generating' && 'กำลังสร้างไฟล์เสียง...'}
                    {progress.audio === 'completed' && 'สร้างไฟล์เสียงสำเร็จ'}
                    {progress.audio === 'error' && 'เกิดข้อผิดพลาด'}
                  </div>
                </div>
              </div>

              {/* Image Generation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: progress.image === 'completed' ? '#10b981' : progress.image === 'generating' ? '#3b82f6' : progress.image === 'error' ? '#ef4444' : '#e5e7eb',
                  color: 'white',
                  fontSize: '0.875rem'
                }}>
                  {progress.image === 'completed' ? '✓' : progress.image === 'generating' ? '↻' : progress.image === 'error' ? '✕' : '3'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                    🎨 Cover Image Generation
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {progress.image === 'pending' && 'รอดำเนินการ'}
                    {progress.image === 'generating' && 'กำลังสร้างภาพปก...'}
                    {progress.image === 'completed' && 'สร้างภาพปกสำเร็จ'}
                    {progress.image === 'error' && 'เกิดข้อผิดพลาด'}
                  </div>
                </div>
              </div>

              {/* Video Generation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '50%',
                  backgroundColor: progress.video === 'completed' ? '#10b981' : progress.video === 'generating' ? '#3b82f6' : progress.video === 'error' ? '#ef4444' : '#e5e7eb',
                  color: 'white',
                  fontSize: '0.875rem'
                }}>
                  {progress.video === 'completed' ? '✓' : progress.video === 'generating' ? '↻' : progress.video === 'error' ? '✕' : '4'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                    🎬 Video Generation
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {progress.video === 'pending' && 'รอดำเนินการ'}
                    {progress.video === 'generating' && 'กำลังสร้างวิดีโอ...'}
                    {progress.video === 'completed' && 'สร้างวิดีโอสำเร็จ'}
                    {progress.video === 'error' && 'เกิดข้อผิดพลาด'}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            {(progress.script === 'completed' || progress.audio === 'completed' || progress.image === 'completed' || progress.video === 'completed') && (
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                backgroundColor: '#f9fafb',
                marginTop: '2rem'
              }}>
                <h3 style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
                  📦 ผลลัพธ์ของคุณ
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {generationResults.audioUrl && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎙️</div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                        Audio File
                      </h4>
                      <button
                        onClick={() => downloadFile(generationResults.audioUrl, 'podcast-audio.mp3')}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Download MP3
                      </button>
                    </div>
                  )}

                  {generationResults.imageUrl && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎨</div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                        Cover Image
                      </h4>
                      <button
                        onClick={() => downloadFile(generationResults.imageUrl, 'podcast-cover.jpg')}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Download Image
                      </button>
                    </div>
                  )}

                  {generationResults.videoUrl && (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎬</div>
                      <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>
                        Video
                      </h4>
                      <button
                        onClick={() => downloadFile(generationResults.videoUrl, 'podcast-video.mp4')}
                        style={{
                          padding: '0.5rem 1rem',
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          cursor: 'pointer'
                        }}
                      >
                        Download MP4
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                onClick={() => {
                  if (confirm('คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการสร้างพอดคาสต์?')) {
                    setStep(2)
                  }
                }}
                disabled={isLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
              >
                ← Cancel
              </button>
              <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'flex', alignItems: 'center' }}>
                💰 Total Cost: 18 credits
              </div>
            </div>
          </div>
        )}
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
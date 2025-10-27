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

interface AdvancedComposeFormData {
  // A) ข้อมูลรายการ/ภาษา
  language: 'th' | 'en'
  episode_length_min: 5 | 10 | 15 | 20 | 30 | 45 | 60
  format: 'solo_talk' | 'interview' | 'co_host' | 'storytelling' | 'news_recap' | 'howto_framework' | 'case_study' | 'review' | 'other'

  // B) เป้าหมาย/ผู้ฟัง/โทน
  goal: 'educate' | 'entertain' | 'brand_building' | 'lead_gen' | 'sell' | 'community'
  audience_level: 'beginner' | 'general' | 'advanced'
  audience_persona: 'students' | 'office_workers' | 'creators' | 'marketers' | 'entrepreneurs' | 'tech_staff' | 'investors' | 'parents' | 'other'
  tone: string[]

  // C) โครงสร้างบท
  structure: 'hook_3act_cta' | 'problem_solution_cta' | 'news_why_takeaways' | 'interview_blocks' | 'checklist_steps' | 'custom'

  // D) สไตล์ภาษา & จังหวะอ่าน
  narration_person: 'first_person' | 'second_person' | 'third_person'
  wpm_speed: 'slow_120' | 'normal_145' | 'fast_170'
  ssml_guidance: 'none' | 'light' | 'rich'

  // E) หัวข้อ & ขอบเขต
  topic_mode: 'user_provided' | 'auto_title'
  topic: string
  must_include: string[]
  must_avoid: string[]
  depth: 'shallow_overview' | 'medium_detail' | 'deep_technical'
  key_takeaways_count: 3 | 4 | 5

  // F) CTA & เมทาดาท้า
  cta_type: 'subscribe' | 'download_lead_magnet' | 'visit_website' | 'follow_social' | 'purchase' | 'book_call' | 'join_newsletter' | 'none'
  seo_title_style: 'neutral' | 'curiosity' | 'benefit_led' | 'number_list' | 'howto' | 'vs_compare'
  tags_mode: 'auto' | 'user_provided'
  tags: string

  // G) สัมภาษณ์ (ถ้าเลือก format = interview)
  guest_intro_depth: 'short' | 'standard' | 'extended'
  interview_questions_style: 'fundamentals' | 'insights' | 'tactical_howto' | 'career_story' | 'mixed'

  // H) คอมพลาย/ข้อกำหนด
  disclaimer_need: 'none' | 'medical' | 'financial' | 'research_sources'
  source_links_required: 'no' | 'yes_basic' | 'yes_strict'
  brand_terms: string

  // Custom fields
  custom_format: string
  custom_structure: string
  custom_audience_persona: string
  custom_tone: string
  custom_must_include: string
  custom_must_avoid: string
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

interface GenerationProgress {
  script: 'pending' | 'generating' | 'completed' | 'error'
  audio: 'pending' | 'generating' | 'completed' | 'error'
  image: 'pending' | 'generating' | 'completed' | 'error'
  video: 'pending' | 'generating' | 'completed' | 'error'
}

export default function ComposePage() {
  const { currentUser, setCurrentUser } = useAuth()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0) // 0 = mode selection, 1+ = actual steps
  const [generatedScript, setGeneratedScript] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [editedScript, setEditedScript] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Mode selection
  const [creationMode, setCreationMode] = useState<'script' | 'full'>('script')

  // Full podcast creation state
  const [fullPodcastStep, setFullPodcastStep] = useState(1)
  const [projectId, setProjectId] = useState('')
  const [useExistingScript, setUseExistingScript] = useState(false)
  const [existingScripts, setExistingScripts] = useState([])
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress>({
    script: 'pending',
    audio: 'pending',
    image: 'pending',
    video: 'pending'
  })
  const [generationResults, setGenerationResults] = useState({
    script: '',
    audioUrl: '',
    imageUrl: '',
    videoUrl: ''
  })

  const router = useRouter()

  const API_URL = 'http://localhost:8000'

  const defaultFormData: AdvancedComposeFormData = {
    language: 'th',
    episode_length_min: 20,
    format: 'howto_framework',
    goal: 'educate',
    audience_level: 'general',
    audience_persona: 'creators',
    tone: ['friendly', 'expert', 'warm'],
    structure: 'hook_3act_cta',
    narration_person: 'first_person',
    wpm_speed: 'normal_145',
    ssml_guidance: 'light',
    topic_mode: 'user_provided',
    topic: '',
    must_include: ['checklist', 'examples'],
    must_avoid: ['hard_sell'],
    depth: 'medium_detail',
    key_takeaways_count: 4,
    cta_type: 'download_lead_magnet',
    seo_title_style: 'benefit_led',
    tags_mode: 'auto',
    tags: '',
    guest_intro_depth: 'short',
    interview_questions_style: 'mixed',
    disclaimer_need: 'none',
    source_links_required: 'no',
    brand_terms: '',
    custom_format: '',
    custom_structure: '',
    custom_audience_persona: '',
    custom_tone: '',
    custom_must_include: '',
    custom_must_avoid: ''
  }

  const [formData, setFormData] = useState<AdvancedComposeFormData>(defaultFormData)

  // Full podcast creation form data
  const [projectFormData, setProjectFormData] = useState<ProjectFormData>({
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

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/')
      return
    }
    fetchUserInfo()
    if (creationMode === 'full') {
      fetchExistingScripts()
    }
  }, [creationMode])

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

  const handleInputChange = (field: keyof AdvancedComposeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleMultiSelectChange = (field: keyof AdvancedComposeFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }))
  }

  const generatePrompt = (data: AdvancedComposeFormData): string => {
    let prompt = `[LANGUAGE]: ${data.language}
[EPISODE_LENGTH]: ${data.episode_length_min} minutes (≈ ${data.wpm_speed} wpm)
[FORMAT]: ${data.format}${data.format === 'other' && data.custom_format ? ` (${data.custom_format})` : ''}
[GOAL]: ${data.goal}
[AUDIENCE_LEVEL]: ${data.audience_level}
[AUDIENCE_PERSONA]: ${data.audience_persona}${data.audience_persona === 'other' && data.custom_audience_persona ? ` (${data.custom_audience_persona})` : ''}
[TONE]: ${data.tone.join(', ')}${data.tone.includes('other') && data.custom_tone ? ` (${data.custom_tone})` : ''}
[NARRATION_PERSON]: ${data.narration_person}
[STRUCTURE]: ${data.structure}${data.structure === 'custom' && data.custom_structure ? ` (${data.custom_structure})` : ''}
[SSML_GUIDANCE]: ${data.ssml_guidance}
[TOPIC_MODE]: ${data.topic_mode}
[TOPIC]: ${data.topic}
[MUST_INCLUDE]: ${data.must_include.join(', ')}${data.must_include.includes('other') && data.custom_must_include ? ` (${data.custom_must_include})` : ''}
[MUST_AVOID]: ${data.must_avoid.join(', ')}${data.must_avoid.includes('other') && data.custom_must_avoid ? ` (${data.custom_must_avoid})` : ''}
[DEPTH]: ${data.depth}
[KEY_TAKEAWAYS_COUNT]: ${data.key_takeaways_count}
[CTA_TYPE]: ${data.cta_type}
[SEO_TITLE_STYLE]: ${data.seo_title_style}
[TAGS_MODE]: ${data.tags_mode}
[TAGS]: ${data.tags || 'auto-generated'}

${data.format === 'interview' ? `
[INTERVIEW_GUEST_INTRO_DEPTH]: ${data.guest_intro_depth}
[INTERVIEW_QUESTIONS_STYLE]: ${data.interview_questions_style}
` : ''}

[COMPLIANCE]:
- disclaimer_need: ${data.disclaimer_need}
- source_links_required: ${data.source_links_required}
- brand_terms: ${data.brand_terms || '(none)'}

TASKS:
1) Generate a full podcast script in ${data.language === 'th' ? 'Thai' : 'English'} with hook, clear sections, transitions, and natural spoken language.
2) Include [KEY TAKEAWAYS] exactly ${data.key_takeaways_count} bullets.
3) Add [TIMESTAMPS ESTIMATE] per section based on length.
4) Provide [SHOW NOTES] summary and [SEO PACK]: 3 alternative titles (${data.seo_title_style}), description (120–160 words), tags (if auto).
5) If SSML guidance = ${data.ssml_guidance}, add ${data.ssml_guidance === 'none' ? 'no' : data.ssml_guidance === 'light' ? 'subtle notes like (pause), (emphasize: ...)' : 'full SSML tags'}.
6) End with a single, clear CTA: ${data.cta_type === 'none' ? 'no call to action' : data.cta_type}.
`

    return prompt
  }

  const generateScript = async () => {
    if (!formData.topic && formData.topic_mode === 'user_provided') {
      setMessage('⚠️ Please enter a topic for your podcast.')
      return
    }

    setIsGenerating(true)
    setMessage('')

    try {
      const prompt = generatePrompt(formData)

      // Simulate API call to OpenAI
      await new Promise(resolve => setTimeout(resolve, 3000))

      const mockScript = `# ${formData.topic || 'AI Generated Podcast Episode'}

## 🎯 Introduction (Hook)
${formData.language === 'th' ? 'สวัสดีครับ ยินดีต้อนรับสู่ Podcast Muse วันนี้เราจะมาพูดถึงเรื่อง' : 'Hello and welcome to Podcast Muse! Today we\'re diving into'} ${formData.topic}...

## 📝 Main Content

### Act 1: The Foundation
${formData.language === 'th' ? 'ก่อนอื่นเรามาทำความเข้าใจพื้นฐานกันก่อนเลยครับ' : 'First, let\'s understand the fundamentals...'}

### Act 2: Key Insights
${formData.language === 'th' ? 'ตอนนี้เรามาดูข้อมูลเชิงลึกและตัวอย่างจริงกัน' : 'Now let\'s look at deep insights and real examples...'}

### Act 3: Practical Applications
${formData.language === 'th' ? 'มาลองประยุกต์ใช้ในชีวิตจริงกันดีกว่า' : 'Let\'s try applying this to real life...'}

## 🎯 Key Takeaways
• ${formData.language === 'th' ? 'ข้อเท็จจริงสำคัญที่ 1' : 'Key takeaway 1'}: Lorem ipsum dolor sit amet
• ${formData.language === 'th' ? 'ข้อเท็จจริงสำคัญที่ 2' : 'Key takeaway 2'}: Consectetur adipiscing elit
• ${formData.language === 'th' ? 'ข้อเท็จจริงสำคัญที่ 3' : 'Key takeaway 3'}: Sed do eiusmod tempor
• ${formData.language === 'th' ? 'ข้อเท็จจริงสำคัญที่ 4' : 'Key takeaway 4'}: Incididunt ut labore

## 📞 Call to Action
${formData.language === 'th' ? 'ขอบคุณที่ฟังนะครับ อย่าลืม' : 'Thanks for listening! Don\'t forget to'} ${formData.cta_type}!

---

## 📋 Show Notes
${formData.language === 'th' ? 'ในตอนนี้เราได้เรียนรู้เกี่ยวกับ' : 'In this episode we learned about'} ${formData.topic}...

## 🎤 SEO Pack
**Alternative Titles:**
1. ${formData.topic} - ${formData.language === 'th' ? 'คู่มือฉบับสมบูรณ์' : 'Complete Guide'}
2. ${formData.language === 'th' ? 'วิธีการ' : 'How to'} ${formData.topic} - ${formData.language === 'th' ? 'ขั้นตอนง่ายๆ' : 'Easy Steps'}
3. ${formData.topic} - ${formData.language === 'th' ? 'เคล็ดลับที่คุณต้องรู้' : 'Tips You Must Know'}

**Description:** ${formData.language === 'th' ? 'Podcast นี้เหมาะสำหรับผู้ที่สนใจเรียนรู้เกี่ยวกับ' : 'This podcast is perfect for anyone interested in learning about'} ${formData.topic}...

**Tags:** ${formData.language === 'th' ? 'เทคโนโลยี, AI, พอดคาสต์, การเรียนรู้' : 'technology, AI, podcast, learning'}
`

      setGeneratedScript(mockScript)
      setEditedScript(mockScript)
      setCurrentStep(3)
      setMessage('✅ Script generated successfully!')

    } catch (error: any) {
      setMessage('❌ Failed to generate script. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const saveAsProject = async () => {
    setIsSaving(true)
    setMessage('')

    try {
      const response = await axios.post(`${API_URL}/api/v1/projects`, {
        title: formData.topic || 'Untitled Podcast Script',
        description: `${formData.format} podcast script (${formData.episode_length_min} min) - ${formData.tone.join(', ')}`
      })

      // In real implementation, would save the script content too
      setMessage('✅ Project saved successfully! Redirecting to dashboard...')

      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)

    } catch (error: any) {
      setMessage('❌ Failed to save project. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const downloadScript = () => {
    const scriptContent = isEditing ? editedScript : generatedScript
    const blob = new Blob([scriptContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `podcast-script-${formData.topic || 'untitled'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Full podcast creation functions
  const handleFullPodcastNextStep = () => {
    setMessage('')

    if (fullPodcastStep === 1) {
      if (!projectFormData.title.trim()) {
        setMessage('⚠️ กรุณาใส่ชื่อพอดคาสต์')
        return
      }
      if (!projectFormData.description.trim()) {
        setMessage('⚠️ กรุณาใส่คำอธิบายพอดคาสต์')
        return
      }
      if (!checkAPIKeys()) {
        return
      }
      setFullPodcastStep(2)
    } else if (fullPodcastStep === 2) {
      if (!useExistingScript && !projectFormData.scriptContent?.trim()) {
        setMessage('⚠️ กรุณาเลือกใช้สคริปต์ที่มีอยู่หรือเขียนสคริปต์ใหม่')
        return
      }
      if (user && user.credits < 18) {
        setMessage('⚠️ Credits ไม่พอสำหรับสร้างพอดคาสต์ (ต้องการ 18 credits)')
        return
      }
      setFullPodcastStep(3)
    } else if (fullPodcastStep === 3) {
      startFullPodcastGeneration()
    }
  }

  const handleFullPodcastPrevStep = () => {
    setMessage('')
    if (fullPodcastStep > 1) {
      setFullPodcastStep(fullPodcastStep - 1)
    }
  }

  const generateScriptForFullPodcast = async () => {
    setIsLoading(true)
    setMessage('🤖 กำลังสร้างสคริปต์...')

    try {
      await new Promise(resolve => setTimeout(resolve, 2000))

      const mockScript = `# ${projectFormData.title}

## Introduction
สวัสดีครับทุกคน ยินดีต้อนรับสู่ ${projectFormData.title} วันนี้เราจะมาพูดถึงเรื่อง ${projectFormData.description}

## Main Content
### บทที่ 1: พื้นฐาน
${projectFormData.description} เป็นเรื่องที่น่าสนใจมาก เพราะ...

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

      setProjectFormData(prev => ({ ...prev, scriptContent: mockScript }))
      setMessage('✅ สร้างสคริปต์สำเร็จแล้ว!')

    } catch (error: any) {
      setMessage('❌ สร้างสคริปต์ไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setIsLoading(false)
    }
  }

  const startFullPodcastGeneration = async () => {
    setIsLoading(true)
    setMessage('')
    setGenerationProgress({
      script: 'pending',
      audio: 'pending',
      image: 'pending',
      video: 'pending'
    })

    try {
      // Step 1: Create project
      const projectResponse = await axios.post(`${API_URL}/api/v1/projects`, {
        title: projectFormData.title,
        description: projectFormData.description
      })

      const newProjectId = projectResponse.data.id
      setProjectId(newProjectId)

      // Step 2: Generate Script (if not provided)
      if (!useExistingScript) {
        setGenerationProgress(prev => ({ ...prev, script: 'generating' }))
        await new Promise(resolve => setTimeout(resolve, 2000))
        setGenerationResults(prev => ({ ...prev, script: projectFormData.scriptContent || '' }))
        setGenerationProgress(prev => ({ ...prev, script: 'completed' }))
      } else {
        setGenerationProgress(prev => ({ ...prev, script: 'completed' }))
      }

      // Step 3: Generate Audio
      setGenerationProgress(prev => ({ ...prev, audio: 'generating' }))
      setMessage('🎙️ กำลังสร้างไฟล์เสียง...')
      await new Promise(resolve => setTimeout(resolve, 3000))
      setGenerationResults(prev => ({
        ...prev,
        audioUrl: 'https://example.com/audio.mp3'
      }))
      setGenerationProgress(prev => ({ ...prev, audio: 'completed' }))

      // Step 4: Generate Cover Image
      setGenerationProgress(prev => ({ ...prev, image: 'generating' }))
      setMessage('🎨 กำลังสร้างภาพปก...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      setGenerationResults(prev => ({
        ...prev,
        imageUrl: 'https://picsum.photos/800/800?random=' + Math.random()
      }))
      setGenerationProgress(prev => ({ ...prev, image: 'completed' }))

      // Step 5: Generate Video
      setGenerationProgress(prev => ({ ...prev, video: 'generating' }))
      setMessage('🎬 กำลังสร้างวิดีโอ...')
      await new Promise(resolve => setTimeout(resolve, 4000))
      setGenerationResults(prev => ({
        ...prev,
        videoUrl: 'https://example.com/video.mp4'
      }))
      setGenerationProgress(prev => ({ ...prev, video: 'completed' }))

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

  // Mode selection handlers
  const handleModeSelect = (mode: 'script' | 'full') => {
    setCreationMode(mode)
    setCurrentStep(1)
    if (mode === 'script') {
      // Reset script generation mode
      setGeneratedScript('')
      setEditedScript('')
      setIsEditing(false)
    } else {
      // Reset full podcast mode
      setFullPodcastStep(1)
      setProjectFormData({
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
      setGenerationResults({
        script: '',
        audioUrl: '',
        imageUrl: '',
        videoUrl: ''
      })
    }
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    )
  }

  const scriptSteps = [
    '📝 Episode Details',
    '🎯 Audience & Style',
    '✨ Generated Script'
  ]

  const fullPodcastSteps = [
    '📝 Details',
    '📜 Script',
    '🚀 Generate'
  ]

  const languageOptions = [
    { value: 'th', label: '🇹🇭 ไทย' },
    { value: 'en', label: '🇺🇸 English' }
  ]

  const formatOptions = [
    { value: 'solo_talk', label: '🎤 พูดเดี่ยว' },
    { value: 'interview', label: '🎙️ สัมภาษณ์' },
    { value: 'co_host', label: '👥 คุย 2 คน' },
    { value: 'storytelling', label: '📖 เล่าเรื่อง' },
    { value: 'news_recap', label: '📰 ข่าว/สรุป' },
    { value: 'howto_framework', label: '🔧 สอนเป็นขั้นตอน/กรอบคิด' },
    { value: 'case_study', label: '📊 กรณีศึกษา' },
    { value: 'review', label: '⭐ รีวิว/วิเคราะห์' },
    { value: 'other', label: '🎯 อื่นๆ' }
  ]

  const goalOptions = [
    { value: 'educate', label: '🎓 สอน/ให้ความรู้' },
    { value: 'entertain', label: '🎭 บันเทิง' },
    { value: 'brand_building', label: '🏢 สร้างแบรนด์' },
    { value: 'lead_gen', label: '📈 สร้างลูกค้า' },
    { value: 'sell', label: '💰 ขายสินค้า' },
    { value: 'community', label: '🤝 สร้างชุมชน' }
  ]

  const toneOptions = [
    { value: 'friendly', label: '😊 เป็นกันเอง' },
    { value: 'expert', label: '🧠 ผู้เชี่ยวชาญ' },
    { value: 'warm', label: '🤗 อบอุ่น' },
    { value: 'inspiring', label: '✨ ให้แรงบันดาลใจ' },
    { value: 'humorous', label: '😆 ตลกขบขัน' },
    { value: 'serious', label: '🎯 จริงจัง' },
    { value: 'concise', label: '📏 กระชับ' },
    { value: 'energetic', label: '⚡ สดใส' },
    { value: 'calm', label: '🧘 สงบ' },
    { value: 'other', label: '🎯 อื่นๆ' }
  ]

  const structureOptions = [
    { value: 'hook_3act_cta', label: '🎣 Hook → Act1/2/3 → Summary → CTA' },
    { value: 'problem_solution_cta', label: '❓ Problem → Insight → Solution → Action → CTA' },
    { value: 'news_why_takeaways', label: '📰 Facts → Why it matters → Takeaways → CTA' },
    { value: 'interview_blocks', label: '🎙️ Intro guest → Q1–Q10 → Lightning → CTA' },
    { value: 'checklist_steps', label: '✅ Checklist/Step-by-step → CTA' },
    { value: 'custom', label: '🎯 แบบกำหนดเอง' }
  ]

  const durationOptions = [5, 10, 15, 20, 30, 45, 60].map(min => ({
    value: min,
    label: `⏱️ ${min} นาที`
  }))

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <Navigation currentUser={currentUser} setCurrentUser={setCurrentUser} />

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            ✍️ AI Podcast Creator
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#6b7280', maxWidth: '48rem', margin: '0 auto', lineHeight: '1.6' }}>
            สร้างพอดคาสต์ด้วย AI ตามความต้องการของคุณ เริ่มจากสคริปต์หรือสร้างพอดคาสต์เต็มรูปแบบ
          </p>
        </div>

        {/* Mode Selection */}
        {currentStep === 0 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem', textAlign: 'center' }}>
              เลือกโหมดการสร้าง
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <button
                onClick={() => handleModeSelect('script')}
                style={{
                  padding: '2rem',
                  border: '2px solid #3b82f6',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f0f9ff',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0f9ff'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                  Script Generation
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                  สร้างสคริปต์พอดคาสต์ด้วย AI พร้อมการปรับแต่งรายละเอียด
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#059669', fontWeight: '500' }}>
                    💰 3 credits
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#3b82f6', fontWeight: '500' }}>
                    3 ขั้นตอน →
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleModeSelect('full')}
                style={{
                  padding: '2rem',
                  border: '2px solid #10b981',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f0fdf4',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dcfce7'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f0fdf4'}
              >
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                  Full Podcast Creation
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
                  สร้างพอดคาสต์เต็มรูปแบบ สคริปต์ + เสียง + ภาพปก + วิดีโอ
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#059669', fontWeight: '500' }}>
                    💰 18 credits
                  </span>
                  <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '500' }}>
                    3 ขั้นตอน →
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Progress Steps - Show only after mode selection */}
        {currentStep > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            {(creationMode === 'script' ? scriptSteps : fullPodcastSteps).map((step, index) => {
              const actualStep = creationMode === 'script' ? currentStep : fullPodcastStep
              return (
                <div key={index} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '2rem',
                    height: '2rem',
                    borderRadius: '50%',
                    backgroundColor: actualStep > index + 1 ? '#10b981' : actualStep === index + 1 ? '#3b82f6' : '#e5e7eb',
                    color: actualStep > index + 1 ? 'white' : actualStep === index + 1 ? 'white' : '#6b7280',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {actualStep > index + 1 ? '✓' : index + 1}
                  </div>
                  <span style={{
                    marginLeft: '0.5rem',
                    fontSize: '0.875rem',
                    color: actualStep >= index + 1 ? '#374151' : '#9ca3af',
                    display: index === (creationMode === 'script' ? scriptSteps.length - 1 : fullPodcastSteps.length - 1) ? 'block' : 'none'
                  }}>
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        )}

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

        {currentStep > 0 && creationMode === 'script' && currentStep === 1 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
              📝 Episode Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Language */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  ภาษา / Language
                </label>
                <select
                  value={formData.language}
                  onChange={(e) => handleInputChange('language', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {languageOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Episode Length */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  ความยาวตอน (นาที)
                </label>
                <select
                  value={formData.episode_length_min}
                  onChange={(e) => handleInputChange('episode_length_min', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Format */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  รูปแบบรายการ
                </label>
                <select
                  value={formData.format}
                  onChange={(e) => handleInputChange('format', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {formatOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Custom Format */}
              {formData.format === 'other' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    ระบุรูปแบบที่ต้องการ
                  </label>
                  <input
                    type="text"
                    value={formData.custom_format}
                    onChange={(e) => handleInputChange('custom_format', e.target.value)}
                    placeholder="เช่น พอดคาสต์สัมภาษณ์ผู้เชี่ยวชาญ"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              )}

              {/* Goal */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  เป้าหมายของตอน
                </label>
                <select
                  value={formData.goal}
                  onChange={(e) => handleInputChange('goal', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {goalOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Topic Mode */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  โหมดหัวข้อ
                </label>
                <select
                  value={formData.topic_mode}
                  onChange={(e) => handleInputChange('topic_mode', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="user_provided">📝 ใช้หัวข้อที่ผู้ใช้กรอก</option>
                  <option value="auto_title">🤖 ให้ระบบตั้งชื่ออัตโนมัติ</option>
                </select>
              </div>

              {/* Topic */}
              {formData.topic_mode === 'user_provided' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    หัวข้อที่ต้องการทำพอดคาสต์
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    placeholder="เช่น เทคนิคการสร้างพอดคาสต์ด้วย AI สำหรับมือใหม่"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    ไม่มีไอเดีย?
                    <button
                      onClick={() => window.open('/topics', '_blank')}
                      style={{
                        color: '#3b82f6',
                        textDecoration: 'underline',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        font: 'inherit'
                      }}
                    >
                      💡 ใช้ AI หาหัวข้อ
                    </button>
                  </div>
                </div>
              )}

              {/* Keywords for auto title */}
              {formData.topic_mode === 'auto_title' && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    คำสำคัญ (สำหรับสร้างชื่ออัตโนมัติ)
                  </label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    placeholder="เช่น AI, podcast, การสร้างเนื้อหา"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              )}

              {/* Structure */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  โครงสร้างบท
                </label>
                <select
                  value={formData.structure}
                  onChange={(e) => handleInputChange('structure', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  {structureOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Custom Structure */}
              {formData.structure === 'custom' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    ระบุโครงสร้างที่ต้องการ
                  </label>
                  <input
                    type="text"
                    value={formData.custom_structure}
                    onChange={(e) => handleInputChange('custom_structure', e.target.value)}
                    placeholder="เช่น Introduction → ข้อมูลหลัก → ตัวอย่าง → สรุป"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              )}
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
                onClick={() => setCurrentStep(2)}
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
                Next: Audience & Style →
              </button>
            </div>
          </div>
        )}

        {currentStep > 0 && creationMode === 'script' && currentStep === 2 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
              🎯 Audience & Style Settings
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              {/* Audience Level */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  ระดับผู้ฟัง
                </label>
                <select
                  value={formData.audience_level}
                  onChange={(e) => handleInputChange('audience_level', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="beginner">🌱 ผู้เริ่มต้น</option>
                  <option value="general">👥 คนทั่วไป</option>
                  <option value="advanced">🚀 ผู้มีความรู้</option>
                </select>
              </div>

              {/* Audience Persona */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  กลุ่มผู้ฟังเป้าหมาย
                </label>
                <select
                  value={formData.audience_persona}
                  onChange={(e) => handleInputChange('audience_persona', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="students">🎓 นักเรียน/นักศึกษา</option>
                  <option value="office_workers">💼 พนักงานออฟฟิศ</option>
                  <option value="creators">🎨 ครีเอเตอร์/ผู้สร้างสรรค์</option>
                  <option value="marketers">📈 นักการตลาด</option>
                  <option value="entrepreneurs">🚀 ผู้ประกอบการ</option>
                  <option value="tech_staff">💻 บุคลากรด้านเทคโนโลยี</option>
                  <option value="investors">💰 นักลงทุน</option>
                  <option value="parents">👨‍👩‍👧‍👦 ผู้ปกครอง</option>
                  <option value="other">🎯 อื่นๆ</option>
                </select>
              </div>

              {/* Custom Audience Persona */}
              {formData.audience_persona === 'other' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    ระบุกลุ่มผู้ฟัง
                  </label>
                  <input
                    type="text"
                    value={formData.custom_audience_persona}
                    onChange={(e) => handleInputChange('custom_audience_persona', e.target.value)}
                    placeholder="เช่น ครู/อาจารย์"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              )}

              {/* Tone (Multi-select) */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  โทนเสียง (เลือกได้หลายอย่าง)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                  {toneOptions.map(option => (
                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.tone.includes(option.value)}
                        onChange={() => handleMultiSelectChange('tone', option.value)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Tone */}
              {formData.tone.includes('other') && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    ระบุโทนเสียงที่ต้องการ
                  </label>
                  <input
                    type="text"
                    value={formData.custom_tone}
                    onChange={(e) => handleInputChange('custom_tone', e.target.value)}
                    placeholder="เช่น เป็นทางการแต่ไม่เคร่งครัด"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              )}

              {/* Narration Person */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    บุรคลแสดง (Person)
                </label>
                <select
                  value={formData.narration_person}
                  onChange={(e) => handleInputChange('narration_person', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="first_person">🙋‍♂️ บุรคลที่ 1 (ฉัน/เรา)</option>
                  <option value="second_person">👥 บุรคลที่ 2 (คุณ)</option>
                  <option value="third_person">👨‍👩‍👧‍👦 บุรคลที่ 3 (เขา/พวกเขา)</option>
                </select>
              </div>

              {/* WPM Speed */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  ความเร็วในการพูด (คำต่อนาที)
                </label>
                <select
                  value={formData.wpm_speed}
                  onChange={(e) => handleInputChange('wpm_speed', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="slow_120">🐌 ช้า (120 คำ/นาที)</option>
                  <option value="normal_145">🚶 ปกติ (145 คำ/นาที)</option>
                  <option value="fast_170">🏃 เร็ว (170 คำ/นาที)</option>
                </select>
              </div>

              {/* SSML Guidance */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  คำแนะนำ SSML
                </label>
                <select
                  value={formData.ssml_guidance}
                  onChange={(e) => handleInputChange('ssml_guidance', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="none">❌ ไม่ใช้</option>
                  <option value="light">💡 เบา (pause สั้น/เน้นคำสำคัญ)</option>
                  <option value="rich">🎨 เต็ม (break/strong emphasis/จังหวะชัด)</option>
                </select>
              </div>

              {/* Depth */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  ความลึกของเนื้อหา
                </label>
                <select
                  value={formData.depth}
                  onChange={(e) => handleInputChange('depth', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="shallow_overview">📋 ภาพรวมตื้นๆ</option>
                  <option value="medium_detail">📊 รายละเอียดปานกลาง</option>
                  <option value="deep_technical">🔬 ลึก/เทคนิค</option>
                </select>
              </div>

              {/* Key Takeaways Count */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  จำนวนประเด็นหลักที่ต้องการ
                </label>
                <select
                  value={formData.key_takeaways_count}
                  onChange={(e) => handleInputChange('key_takeaways_count', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value={3}>3 ประเด็น</option>
                  <option value={4}>4 ประเด็น</option>
                  <option value={5}>5 ประเด็น</option>
                </select>
              </div>

              {/* CTA Type */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  ประเภท Call to Action
                </label>
                <select
                  value={formData.cta_type}
                  onChange={(e) => handleInputChange('cta_type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="subscribe">📝 ติดตาม/สมัครสมาชิก</option>
                  <option value="download_lead_magnet">📥 ดาวน์โหลดของแถม</option>
                  <option value="visit_website">🌐 เยี่ยมชมเว็บไซต์</option>
                  <option value="follow_social">📱 ติดตามโซเชียล</option>
                  <option value="purchase">💰 ซื้อสินค้า/บริการ</option>
                  <option value="book_call">📅 นัดหมาย</option>
                  <option value="join_newsletter">📧 สมัครจดหมายข่าว</option>
                  <option value="none">❌ ไม่มี CTA</option>
                </select>
              </div>

              {/* Must Include */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  สิ่งที่ต้องรวม (เลือกได้หลายอย่าง)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { value: 'definition', label: '📖 คำจำกัดความ' },
                    { value: '1_case_study', label: '📊 กรณีศึกษา' },
                    { value: 'checklist', label: '✅ เช็คลิสต์' },
                    { value: 'stats', label: '📈 สถิติ' },
                    { value: 'quotes', label: '💬 คำคม' },
                    { value: 'examples', label: '💡 ตัวอย่าง' },
                    { value: 'tool_recos', label: '🔧 แนะนำเครื่องมือ' },
                    { value: 'caveats', label: '⚠️ ข้อควรระวัง' },
                    { value: 'none', label: '❌ ไม่ต้องการ' },
                    { value: 'other', label: '🎯 อื่นๆ' }
                  ].map(option => (
                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.must_include.includes(option.value)}
                        onChange={() => handleMultiSelectChange('must_include', option.value)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Must Include */}
              {formData.must_include.includes('other') && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    ระบุสิ่งที่ต้องรวม
                  </label>
                  <input
                    type="text"
                    value={formData.custom_must_include}
                    onChange={(e) => handleInputChange('custom_must_include', e.target.value)}
                    placeholder="เช่น การสาธิตสด"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              )}

              {/* Must Avoid */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  สิ่งที่ต้องหลีกเลี่ยง (เลือกได้หลายอย่าง)
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.5rem' }}>
                  {[
                    { value: 'jargon_heavy', label: '🔤 ศัพท์เทคนิคเยอะ' },
                    { value: 'hard_sell', label: '💵 ขายแข็ง' },
                    { value: 'sensitive_politics', label: '🏛️ การเมือง' },
                    { value: 'medical_claims', label: '⚕️ ข้อมูลทางการแพทย์' },
                    { value: 'financial_advice', label: '💰 คำแนะนำการเงิน' },
                    { value: 'plagiarism', label: '📋 ลอกเลียน' },
                    { value: 'other', label: '🎯 อื่นๆ' }
                  ].map(option => (
                    <label key={option.value} style={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                      <input
                        type="checkbox"
                        checked={formData.must_avoid.includes(option.value)}
                        onChange={() => handleMultiSelectChange('must_avoid', option.value)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Must Avoid */}
              {formData.must_avoid.includes('other') && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                    ระบุสิ่งที่ต้องหลีกเลี่ยง
                  </label>
                  <input
                    type="text"
                    value={formData.custom_must_avoid}
                    onChange={(e) => handleInputChange('custom_must_avoid', e.target.value)}
                    placeholder="เช่น เรื่องที่ละเอียดอ่อน"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem'
                    }}
                  />
                </div>
              )}

              {/* Brand Terms */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                  คำ/สโลแกนที่ห้ามใช้ (ถ้ามี)
                </label>
                <input
                  type="text"
                  value={formData.brand_terms}
                  onChange={(e) => handleInputChange('brand_terms', e.target.value)}
                  placeholder="เช่น คำของคู่แข่ง"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                onClick={() => setCurrentStep(1)}
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
                onClick={generateScript}
                disabled={isGenerating || user.credits < 3}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: (isGenerating || user.credits < 3) ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: (isGenerating || user.credits < 3) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {isGenerating ? (
                  <>
                    <div style={{ width: '1rem', height: '1rem', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    Generating...
                  </>
                ) : (
                  <>
                    🤖 Generate Script (3 credits)
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {currentStep > 0 && creationMode === 'script' && currentStep === 3 && (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1.5rem' }}>
              ✨ Your Generated Podcast Script
            </h2>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                📊 {generatedScript.split(' ').length} words • ⏱️ ~{Math.round(generatedScript.split(' ').length / 145)} minutes
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: isEditing ? '#10b981' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  {isEditing ? '✓ Save' : '✏️ Edit'}
                </button>
                <button
                  onClick={downloadScript}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  📥 Download
                </button>
              </div>
            </div>

            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              padding: '1rem',
              minHeight: '400px',
              maxHeight: '600px',
              overflowY: 'auto',
              backgroundColor: '#f9fafb'
            }}>
              {isEditing ? (
                <textarea
                  value={editedScript}
                  onChange={(e) => setEditedScript(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '400px',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.875rem',
                    lineHeight: '1.5',
                    fontFamily: 'monospace',
                    backgroundColor: 'transparent',
                    resize: 'vertical'
                  }}
                />
              ) : (
                <div style={{
                  fontSize: '0.875rem',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                  color: '#374151'
                }}>
                  {generatedScript}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                onClick={() => setCurrentStep(2)}
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
                ← Back to Settings
              </button>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={generateScript}
                  disabled={isGenerating || user.credits < 3}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: (isGenerating || user.credits < 3) ? '#9ca3af' : '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    cursor: (isGenerating || user.credits < 3) ? 'not-allowed' : 'pointer'
                  }}
                >
                  🔄 Regenerate
                </button>
                <button
                  onClick={saveAsProject}
                  disabled={isSaving}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: isSaving ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontWeight: '500',
                    cursor: isSaving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSaving ? (
                    <>
                      <div style={{ width: '1rem', height: '1rem', border: '2px solid #ffffff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', display: 'inline-block', marginRight: '0.5rem' }}></div>
                      Saving...
                    </>
                  ) : (
                    '💾 Save as Project'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Full Podcast Creation Mode */}
        {creationMode === 'full' && fullPodcastStep === 1 && (
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
                  value={projectFormData.title}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, title: e.target.value }))}
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
                  value={projectFormData.description}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, description: e.target.value }))}
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
                  value={projectFormData.language}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, language: e.target.value }))}
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
                  value={projectFormData.targetDuration}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, targetDuration: parseInt(e.target.value) }))}
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
                  value={projectFormData.voiceGender}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, voiceGender: e.target.value }))}
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
                  value={projectFormData.voiceTone}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, voiceTone: e.target.value }))}
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
                  value={projectFormData.imageStyle}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, imageStyle: e.target.value }))}
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
                  value={projectFormData.videoMotion}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, videoMotion: e.target.value }))}
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
                onClick={() => {
                  setCreationMode('script')
                  setCurrentStep(0)
                }}
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
                onClick={handleFullPodcastNextStep}
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

        {creationMode === 'full' && fullPodcastStep === 2 && (
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
                        onClick={() => setProjectFormData(prev => ({ ...prev, scriptContent: script.content }))}
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
                    onClick={generateScriptForFullPodcast}
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
                  value={projectFormData.scriptContent || ''}
                  onChange={(e) => setProjectFormData(prev => ({ ...prev, scriptContent: e.target.value }))}
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
                  💡 คำแนะนำ: สคริปต์ควรมีความยาวเหมาะสำหรับ {projectFormData.targetDuration} นาที (ประมาณ {projectFormData.targetDuration * 145} คำ)
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button
                onClick={handleFullPodcastPrevStep}
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
                onClick={handleFullPodcastNextStep}
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

        {creationMode === 'full' && fullPodcastStep === 3 && (
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
                  backgroundColor: generationProgress.script === 'completed' ? '#10b981' : generationProgress.script === 'generating' ? '#3b82f6' : generationProgress.script === 'error' ? '#ef4444' : '#e5e7eb',
                  color: 'white',
                  fontSize: '0.875rem'
                }}>
                  {generationProgress.script === 'completed' ? '✓' : generationProgress.script === 'generating' ? '↻' : generationProgress.script === 'error' ? '✕' : '1'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                    📝 Script Generation
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {generationProgress.script === 'pending' && 'รอดำเนินการ'}
                    {generationProgress.script === 'generating' && 'กำลังสร้างสคริปต์...'}
                    {generationProgress.script === 'completed' && 'สร้างสคริปต์สำเร็จ'}
                    {generationProgress.script === 'error' && 'เกิดข้อผิดพลาด'}
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
                  backgroundColor: generationProgress.audio === 'completed' ? '#10b981' : generationProgress.audio === 'generating' ? '#3b82f6' : generationProgress.audio === 'error' ? '#ef4444' : '#e5e7eb',
                  color: 'white',
                  fontSize: '0.875rem'
                }}>
                  {generationProgress.audio === 'completed' ? '✓' : generationProgress.audio === 'generating' ? '↻' : generationProgress.audio === 'error' ? '✕' : '2'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                    🎙️ Audio Generation
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {generationProgress.audio === 'pending' && 'รอดำเนินการ'}
                    {generationProgress.audio === 'generating' && 'กำลังสร้างไฟล์เสียง...'}
                    {generationProgress.audio === 'completed' && 'สร้างไฟล์เสียงสำเร็จ'}
                    {generationProgress.audio === 'error' && 'เกิดข้อผิดพลาด'}
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
                  backgroundColor: generationProgress.image === 'completed' ? '#10b981' : generationProgress.image === 'generating' ? '#3b82f6' : generationProgress.image === 'error' ? '#ef4444' : '#e5e7eb',
                  color: 'white',
                  fontSize: '0.875rem'
                }}>
                  {generationProgress.image === 'completed' ? '✓' : generationProgress.image === 'generating' ? '↻' : generationProgress.image === 'error' ? '✕' : '3'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                    🎨 Cover Image Generation
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {generationProgress.image === 'pending' && 'รอดำเนินการ'}
                    {generationProgress.image === 'generating' && 'กำลังสร้างภาพปก...'}
                    {generationProgress.image === 'completed' && 'สร้างภาพปกสำเร็จ'}
                    {generationProgress.image === 'error' && 'เกิดข้อผิดพลาด'}
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
                  backgroundColor: generationProgress.video === 'completed' ? '#10b981' : generationProgress.video === 'generating' ? '#3b82f6' : generationProgress.video === 'error' ? '#ef4444' : '#e5e7eb',
                  color: 'white',
                  fontSize: '0.875rem'
                }}>
                  {generationProgress.video === 'completed' ? '✓' : generationProgress.video === 'generating' ? '↻' : generationProgress.video === 'error' ? '✕' : '4'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827' }}>
                    🎬 Video Generation
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {generationProgress.video === 'pending' && 'รอดำเนินการ'}
                    {generationProgress.video === 'generating' && 'กำลังสร้างวิดีโอ...'}
                    {generationProgress.video === 'completed' && 'สร้างวิดีโอสำเร็จ'}
                    {generationProgress.video === 'error' && 'เกิดข้อผิดพลาด'}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            {(generationProgress.script === 'completed' || generationProgress.audio === 'completed' || generationProgress.image === 'completed' || generationProgress.video === 'completed') && (
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
                    setFullPodcastStep(2)
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
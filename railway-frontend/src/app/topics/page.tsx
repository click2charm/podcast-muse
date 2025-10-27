'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../hooks/useAuth'
import Navigation from '../../components/Navigation'

interface TopicSuggestion {
  title: string
  description: string
  target_audience: string
  estimated_length: string
  keywords: string[]
}

const TOPICS_DATABASE = {
  'การเงิน': [
    {
      title: 'การลงทุนสำหรับคนเริ่มต้น',
      description: 'แนะนำพื้นฐานการลงทุน การวางแผนการเงิน และกลยุทธ์การสร้างความมั่งคั่งสำหรับผู้ที่ไม่มีพื้นฐานด้านการเงิน',
      target_audience: 'คนทำงาน อายุ 25-40 ปี ที่ต้องการเริ่มลงทุน',
      estimated_length: '15-20 นาที',
      keywords: ['การลงทุน', 'กองทุนรวม', 'หุ้น', 'การเงินส่วนบุคคล', 'แผนการเกษียณ']
    },
    {
      title: 'การจัดการหนี้สินในชีวิตประจำวัน',
      description: 'เทคนิคการจัดการหนี้บัตรเครดิต สินเชื่อรถยนต์ และสินเชื่อบ้าน พร้อมวิธีการวางแผนการชำระหนี้อย่างมีประสิทธิภาพ',
      target_audience: 'คนทำงานที่มีหนี้สินต้องการจัดการ',
      estimated_length: '12-15 นาที',
      keywords: ['การจัดการหนี้', 'บัตรเครดิต', 'สินเชื่อ', 'การแผนการเงิน', 'การออมเงิน']
    },
    {
      title: 'Crypto 101: คริปโตเคอร์เรนซีสำหรับมือใหม่',
      description: 'อธิบายพื้นฐานของ Bitcoin, Ethereum และคริปโตเคอร์เรนซีอื่นๆ พร้อมความเสี่ยงและโอกาสในการลงทุน',
      target_audience: 'ผู้สนใจคริปโตที่ไม่มีความรู้พื้นฐาน',
      estimated_length: '20-25 นาที',
      keywords: ['Bitcoin', 'Ethereum', 'Blockchain', 'การลงทุนคริปโต', 'DeFi']
    }
  ],
  'การพัฒนาตัวเอง': [
    {
      title: 'การสร้างทักษะการสื่อสารที่มีประสิทธิภาพ',
      description: 'เทคนิคการพูดในที่สาธารณะ การเจรจาต่อรอง และการสร้างเครือข่ายความสัมพันธ์เพื่อความสำเร็จในอาชีพ',
      target_audience: 'คนทำงาน นักธุรกิจ และนักเรียนที่ต้องการพัฒนาทักษะ',
      estimated_length: '15-18 นาที',
      keywords: ['การสื่อสาร', 'การพูด', 'การนำเสนอ', 'confidence', 'networking']
    },
    {
      title: 'จิตวิทยาความสำเร็จ: สร้างนิสัยผู้ชนะ',
      description: 'ศึกษานิสัยของคนสำเร็จ การจัดการเวลา การตั้งเป้าหมาย และการพัฒนา mindset เพื่อความสำเร็จ',
      target_audience: 'ผู้ที่ต้องการพัฒนาตัวเองและความสำเร็จ',
      estimated_length: '18-22 นาที',
      keywords: ['mindset', 'นิสัย', 'การตั้งเป้าหมาย', 'ความสำเร็จ', 'การพัฒนาตัวเอง']
    },
    {
      title: 'สมดุลชีวิตการทำงาน: Work-Life Balance',
      description: 'กลยุทธ์การจัดการเวลา การลดความเครียด และการสร้างความสมดุลระหว่างการงาน ชีวิตส่วนตัว และสุขภาพจิต',
      target_audience: 'คนทำงานที่รู้สึกเหนื่อยล้าและต้องการสมดุลชีวิต',
      estimated_length: '12-15 นาที',
      keywords: ['work-life balance', 'การจัดการเวลา', 'ความเครียด', 'การทำงาน', 'สุขภาพจิต']
    }
  ],
  'การเงินวัยรุ่น': [
    {
      title: 'เงินเดือนแรก: จัดการการเงินสำหรับคนเริ่มทำงาน',
      description: 'แนะนำการวางแผนการเงินสำหรับคนที่เพิ่งเริ่มทำงาน การออมเงิน การลงทุนเริ่มต้น และการหลีกเลี่ยงหนี้สิน',
      target_audience: 'นักศึกษาจบใหม่และคนเริ่มทำงาน',
      estimated_length: '10-12 นาที',
      keywords: ['เงินเดือนแรก', 'การออมเงิน', 'การเริ่มลงทุน', 'การเงินคนรุ่นใหม่', 'อนาคตการเงิน']
    },
    {
      title: 'Side Hustle ยุคดิจิทัล: สร้างรายได้เสริม',
      description: 'ไอเดียการสร้างรายได้เสริมในยุคดิจิทัล ตั้งแต่การขายออนไลน์ สอนพิเศษ ไปจนถึงการทำธุรกิจขนาดเล็ก',
      target_audience: 'คนรุ่นใหม่ที่ต้องการสร้างรายได้เพิ่ม',
      estimated_length: '15-20 นาที',
      keywords: ['side hustle', 'รายได้เสริม', 'ออนไลน์', 'ธุรกิจขนาดเล็ก', 'freelance']
    },
    {
      title: 'การเตรียมตัวซื้อบ้านหลังแรก',
      description: 'แผนการเตรียมความพร้อมทางการเงินสำหรับการซื้อบ้าน การเก็บเงินดาวน์ และการวางแผนกู้เงินซื้อบ้าน',
      target_audience: 'คนรุ่นใหม่ที่วางแผนจะซื้อบ้าน',
      estimated_length: '18-22 นาที',
      keywords: ['ซื้อบ้าน', 'กู้ซื้อบ้าน', 'เงินดาวน์', 'การวางแผนการเงิน', 'อสังหาริมทรัพย์']
    }
  ]
}

export default function TopicsGeneratorPage() {
  const { currentUser, setCurrentUser } = useAuth()
  const [keyword, setKeyword] = useState('')
  const [suggestions, setSuggestions] = useState<TopicSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<TopicSuggestion | null>(null)

  const handleGenerateTopics = () => {
    if (!keyword.trim()) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const foundTopics: TopicSuggestion[] = []

      // Search in database
      Object.keys(TOPICS_DATABASE).forEach(category => {
        if (category.includes(keyword) || keyword.includes(category)) {
          foundTopics.push(...TOPICS_DATABASE[category as keyof typeof TOPICS_DATABASE])
        }
      })

      // If no exact match, suggest related topics
      if (foundTopics.length === 0) {
        const allTopics = Object.values(TOPICS_DATABASE).flat()
        foundTopics.push(...allTopics.slice(0, 3))
      }

      setSuggestions(foundTopics)
      setIsLoading(false)
    }, 1000)
  }

  const handleSelectTopic = (topic: TopicSuggestion) => {
    setSelectedTopic(topic)
  }

  const handleUseTopic = () => {
    if (selectedTopic) {
      // Store in localStorage for use in create/compose pages
      localStorage.setItem('selected_topic', JSON.stringify(selectedTopic))
      alert('เลือกหัวข้อแล้ว! คุณสามารถไปที่หน้าเขียน script หรือสร้าง podcast ต่อได้เลย')
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header */}
      <Navigation currentUser={currentUser} setCurrentUser={setCurrentUser} />

      {/* Main Content */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '1rem' }}>
            💡 AI Topics Generator
          </h1>
          <p style={{ fontSize: '1.125rem', color: '6b7280', maxWidth: '48rem', margin: '0 auto', lineHeight: '1.6' }}>
            ไม่รู้จะทำ Podcast หัวข้ออะไร? แค่ใส่คีย์เวิร์ดสั้นๆ เช่น "การเงิน", "การพัฒนาตัวเอง" หรือ "การเงินวัยรุ่น"
            แล้วระบบจะแนะนำหัวข้อน่าสนใจพร้อมรายละเอียดให้!
          </p>
        </div>

        {/* Search Section */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerateTopics()}
              placeholder="ใส่คีย์เวิร์ดเช่น: การเงิน, การพัฒนาตัวเอง, การเงินวัยรุ่น..."
              style={{
                flex: 1,
                minWidth: '200px',
                padding: '0.75rem 1rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem'
              }}
            />
            <button
              onClick={handleGenerateTopics}
              disabled={isLoading || !keyword.trim()}
              style={{
                padding: '0.75rem 2rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontWeight: '500',
                cursor: isLoading || !keyword.trim() ? 'not-allowed' : 'pointer',
                opacity: isLoading || !keyword.trim() ? 0.5 : 1
              }}
            >
              {isLoading ? 'กำลังค้นหา...' : '🔍 แนะนำหัวข้อ'}
            </button>
          </div>

          {/* Popular Keywords */}
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>คีย์เวิร์ดยอดนิยม:</p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {['การเงิน', 'การพัฒนาตัวเอง', 'การเงินวัยรุ่น', 'ธุรกิจ', 'สุขภาพ', 'เทคโนโลยี'].map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setKeyword(tag)
                    handleGenerateTopics()
                  }}
                  style={{
                    padding: '0.25rem 0.75rem',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: '1px solid #d1d5db',
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {suggestions.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              หัวข้อแนะนำ ({suggestions.length} หัวข้อ)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
              {suggestions.map((topic, index) => (
                <div
                  key={index}
                  onClick={() => handleSelectTopic(topic)}
                  style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '0.5rem',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    border: selectedTopic === topic ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                    {topic.title}
                  </h3>
                  <p style={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: '1.5', marginBottom: '1rem' }}>
                    {topic.description}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#374151' }}>👥</span>
                      <span style={{ color: '#6b7280' }}>{topic.target_audience}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ color: '#374151' }}>⏱️</span>
                      <span style={{ color: '#6b7280' }}>{topic.estimated_length}</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                      {topic.keywords.map((keyword, ki) => (
                        <span
                          key={ki}
                          style={{
                            backgroundColor: '#eff6ff',
                            color: '#1e40af',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '1rem',
                            fontSize: '0.75rem'
                          }}
                        >
                          #{keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Topic Actions */}
        {selectedTopic && (
          <div style={{ backgroundColor: '#eff6ff', padding: '2rem', borderRadius: '0.5rem', border: '1px solid #bfdbfe' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e40af', marginBottom: '1rem' }}>
              เลือกหัวข้อ: {selectedTopic.title}
            </h3>
            <p style={{ color: '#1e40af', marginBottom: '1.5rem' }}>
              คุณเลือกหัวข้อนี้แล้ว ต้องการจะทำอะไรต่อ?
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                onClick={handleUseTopic}
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
                ✅ ใช้หัวข้อนี้
              </button>
              <Link
                href="/compose"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#3b82f6',
                  border: '1px solid #3b82f6',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                ✍️ เขียน script ต่อ
              </Link>
              <Link
                href="/create"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'white',
                  color: '#10b981',
                  border: '1px solid #10b981',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}
              >
                🎬 สร้าง podcast ต่อ
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
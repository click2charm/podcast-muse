'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import Navigation from '../../components/Navigation'

interface User {
  id: string
  email: string
  first_name?: string
  last_name?: string
  credits: number
  is_admin: boolean
  created_at: string
}

interface AdminStats {
  users: {
    total: number
    admins: number
    regular_users: number
  }
  credits: {
    total_distributed: number
  }
  projects: {
    total: number
    completed: number
    in_progress: number
  }
  recent_users: Array<{
    email: string
    name: string
    joined: string
  }>
}

export default function AdminDashboard() {
  const { currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAddCredits, setShowAddCredits] = useState(false)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [creditsAmount, setCreditsAmount] = useState('')
  const [creditsReason, setCreditsReason] = useState('')

  const API_URL = 'http://localhost:8000'

  useEffect(() => {
    if (!currentUser || !currentUser.is_admin) {
      return
    }
    fetchAdminData()
  }, [currentUser])

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) return

      const [usersResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/api/v1/admin/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${API_URL}/api/v1/admin/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ])

      if (usersResponse.ok && statsResponse.ok) {
        const usersData = await usersResponse.json()
        const statsData = await statsResponse.json()
        setUsers(usersData)
        setStats(statsData)
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCredits = async () => {
    if (!selectedUser || !creditsAmount) return

    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/v1/admin/add-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          credits: parseInt(creditsAmount),
          reason: creditsReason
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(`เพิ่ม ${creditsAmount} credits ให้ ${selectedUser.email} เรียบร้อย!`)
        setShowAddCredits(false)
        setSelectedUser(null)
        setCreditsAmount('')
        setCreditsReason('')
        fetchAdminData() // Refresh data
      } else {
        const error = await response.json()
        alert('เกิดข้อผิดพลาด: ' + (error.detail || 'Unknown error'))
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleToggleAdmin = async (user: User) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/v1/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          is_admin: !user.is_admin
        })
      })

      if (response.ok) {
        alert(`${user.email} ${!user.is_admin ? 'ได้รับ' : 'สูญเสีย'} สถานะ Admin เรียบร้อย`)
        fetchAdminData() // Refresh data
      } else {
        const error = await response.json()
        alert('เกิดข้อผิดพลาด: ' + (error.detail || 'Unknown error'))
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleDeleteUser = async (user: User) => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await fetch(`${API_URL}/api/v1/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert(`ลบผู้ใช้ ${user.email} เรียบร้อยแล้ว`)
        setShowDeleteConfirm(false)
        setSelectedUser(null)
        fetchAdminData() // Refresh data
      } else {
        const error = await response.json()
        alert('เกิดข้อผิดพลาด: ' + (error.detail || 'Unknown error'))
      }
    } catch (error) {
      alert('เกิดข้อผิดพลาด: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  if (!currentUser || !currentUser.is_admin) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ef4444', marginBottom: '1rem' }}>
            403 - Access Denied
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
            คุณไม่มีสิทธิ์เข้าถึงหน้า Admin Dashboard
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading admin data...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <Navigation currentUser={currentUser} setCurrentUser={() => {}} />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
            🛠️ Admin Dashboard
          </h1>
          <p style={{ color: '#6b7280' }}>
            จัดการผู้ใช้และระบบ Podcast Muse
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>👥</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>ผู้ใช้ทั้งหมด</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.users.total}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Admin: {stats.users.admins} | ธรรมดา: {stats.users.regular_users}</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>💰</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>Credits ทั้งหมด</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.credits.total_distributed.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '2rem', marginRight: '1rem' }}>🎙️</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#6b7280' }}>โปรเจกต์ทั้งหมด</p>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#111827' }}>{stats.projects.total}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>สำเร็จ: {stats.projects.completed} | กำลังทำ: {stats.projects.in_progress}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', marginBottom: '2rem' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: 0 }}>
              จัดการผู้ใช้ ({users.length} คน)
            </h2>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '500' }}>อีเมล</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '500' }}>ชื่อ</th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '500' }}>Credits</th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '500' }}>สถานะ</th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '500' }}>เข้าร่วม</th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '1px solid #e5e7eb', color: '#6b7280', fontWeight: '500' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: '500', color: '#111827' }}>{user.email}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ color: '#6b7280' }}>
                        {user.first_name} {user.last_name || '-'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}>
                        {user.credits.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{
                        backgroundColor: user.is_admin ? '#fef3c7' : '#f3f4f6',
                        color: user.is_admin ? '#92400e' : '#374151',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '1rem',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {user.is_admin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center', color: '#6b7280', fontSize: '0.875rem' }}>
                      {new Date(user.created_at).toLocaleDateString('th-TH')}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowUserDetails(true)
                          }}
                          style={{
                            backgroundColor: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          👁️ ดูรายละเอียด
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowAddCredits(true)
                          }}
                          style={{
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          + เพิ่ม Credits
                        </button>
                        <button
                          onClick={() => handleToggleAdmin(user)}
                          style={{
                            backgroundColor: user.is_admin ? '#ef4444' : '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          {user.is_admin ? 'ถอด Admin' : 'มอบ Admin'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowDeleteConfirm(true)
                          }}
                          style={{
                            backgroundColor: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          🗑️ ลบ
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Users */}
        {stats && stats.recent_users.length > 0 && (
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              ผู้ใช้ล่าสุด
            </h3>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {stats.recent_users.map((user, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                  <div>
                    <div style={{ fontWeight: '500', color: '#111827' }}>{user.name}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</div>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {new Date(user.joined).toLocaleDateString('th-TH')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* User Details Modal */}
      {showUserDetails && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                รายละเอียดผู้ใช้
              </h3>
              <button
                onClick={() => {
                  setShowUserDetails(false)
                  setSelectedUser(null)
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'start' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>อีเมล:</span>
                <span style={{ color: '#111827' }}>{selectedUser.email}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'start' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>ชื่อ-นามสกุล:</span>
                <span style={{ color: '#111827' }}>
                  {selectedUser.first_name || '-'} {selectedUser.last_name || ''}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'start' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>Credits:</span>
                <span style={{
                  backgroundColor: '#dcfce7',
                  color: '#166534',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  display: 'inline-block'
                }}>
                  {selectedUser.credits.toLocaleString()} credits
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'start' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>สถานะ:</span>
                <span style={{
                  backgroundColor: selectedUser.is_admin ? '#fef3c7' : '#f3f4f6',
                  color: selectedUser.is_admin ? '#92400e' : '#374151',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  display: 'inline-block'
                }}>
                  {selectedUser.is_admin ? 'Admin' : 'User'}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'start' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>วันที่สมัคร:</span>
                <span style={{ color: '#111827' }}>
                  {new Date(selectedUser.created_at).toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1rem', alignItems: 'start' }}>
                <span style={{ fontWeight: '500', color: '#6b7280' }}>User ID:</span>
                <span style={{ color: '#6b7280', fontSize: '0.875rem', fontFamily: 'monospace' }}>
                  {selectedUser.id}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button
                onClick={() => {
                  setShowUserDetails(false)
                  setSelectedUser(null)
                  setShowAddCredits(true)
                }}
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
                + เพิ่ม Credits
              </button>
              <button
                onClick={() => {
                  setShowUserDetails(false)
                  handleToggleAdmin(selectedUser)
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: selectedUser.is_admin ? '#ef4444' : '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {selectedUser.is_admin ? 'ถอด Admin' : 'มอบ Admin'}
              </button>
              <button
                onClick={() => {
                  setShowUserDetails(false)
                  setSelectedUser(null)
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', maxWidth: '500px', width: '90%' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#111827', marginBottom: '0.5rem' }}>
                ยืนยันการลบผู้ใช้
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                คุณต้องการลบผู้ใช้ <strong>{selectedUser.email}</strong> ใช่หรือไม่?
              </p>
              <p style={{ color: '#ef4444', fontSize: '0.875rem' }}>
                ⚠️ การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setSelectedUser(null)
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={() => handleDeleteUser(selectedUser)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Credits Modal */}
      {showAddCredits && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', padding: '2rem', maxWidth: '500px', width: '90%' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', marginBottom: '1rem' }}>
              เพิ่ม Credits ให้ {selectedUser.email}
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                จำนวน Credits
              </label>
              <input
                type="number"
                value={creditsAmount}
                onChange={(e) => setCreditsAmount(e.target.value)}
                placeholder="กรอกจำนวน credits"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
                เหตุผล (ไม่ระบุก็ได้)
              </label>
              <input
                type="text"
                value={creditsReason}
                onChange={(e) => setCreditsReason(e.target.value)}
                placeholder="เหตุผลในการเพิ่ม credits"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowAddCredits(false)
                  setSelectedUser(null)
                  setCreditsAmount('')
                  setCreditsReason('')
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleAddCredits}
                disabled={!creditsAmount}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontWeight: '500',
                  cursor: creditsAmount ? 'pointer' : 'not-allowed',
                  opacity: creditsAmount ? 1 : 0.5
                }}
              >
                เพิ่ม Credits
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
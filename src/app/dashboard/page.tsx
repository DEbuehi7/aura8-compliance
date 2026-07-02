'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Tab = 'overview' | 'records' | 'audit_log' | 'reports'

interface ComplianceRecord {
  id: string
  [key: string]: unknown
}

interface User {
  username: string
  name: string
  role: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('overview')
  const [records, setRecords] = useState<ComplianceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [dataError, setDataError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('compliance_token')
    const storedUser = localStorage.getItem('compliance_user')

    if (!token || !storedUser) {
      router.replace('/')
      return
    }

    try {
      setUser(JSON.parse(storedUser))
    } catch {
      router.replace('/')
      return
    }

    setLoading(false)
  }, [router])

  useEffect(() => {
    if (!user || activeTab === 'overview') return
    fetchTabData(activeTab)
  }, [user, activeTab])

  async function fetchTabData(tab: Tab) {
    setLoading(true)
    setDataError('')
    setRecords([])

    const tableMap: Record<Tab, string> = {
      overview: '',
      records: 'compliance_records',
      audit_log: 'audit_logs',
      reports: 'compliance_reports',
    }

    const table = tableMap[tab]
    if (!table) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.from(table).select('*').limit(50)
      if (error) {
        setDataError(`No data available for this section. (${error.message})`)
      } else {
        setRecords((data as ComplianceRecord[]) ?? [])
      }
    } catch {
      setDataError('Unable to connect to database.')
    } finally {
      setLoading(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('compliance_token')
    localStorage.removeItem('compliance_user')
    router.replace('/')
  }

  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#0a0a0a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#71717a',
        }}
      >
        Loading…
      </div>
    )
  }

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'overview', label: 'Overview', icon: '📊' },
    { key: 'records', label: 'Compliance Records', icon: '📋' },
    { key: 'audit_log', label: 'Audit Log', icon: '🔍' },
    { key: 'reports', label: 'Reports', icon: '📄' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#f5f5f5' }}>
      {/* Top Nav */}
      <nav
        style={{
          background: '#141414',
          borderBottom: '1px solid #2a2a2a',
          padding: '0 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '60px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            style={{
              background: 'linear-gradient(135deg, #ec4899, #be185d)',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1rem',
            }}
          >
            🔒
          </span>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>Aura8 Compliance</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ color: '#71717a', fontSize: '0.875rem' }}>
            {user.name} · <span style={{ color: '#ec4899' }}>{user.role}</span>
          </span>
          <button
            onClick={handleLogout}
            style={{
              padding: '0.4rem 1rem',
              background: 'transparent',
              border: '1px solid #3f3f46',
              borderRadius: '6px',
              color: '#a1a1aa',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {/* Page title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 0.25rem' }}>
            Compliance Dashboard
          </h1>
          <p style={{ color: '#71717a', fontSize: '0.875rem', margin: 0 }}>
            CCBill audit review — read-only access
          </p>
        </div>

        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.5rem',
            borderBottom: '1px solid #2a2a2a',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '0.6rem 1.2rem',
                background: 'transparent',
                border: 'none',
                borderBottom:
                  activeTab === tab.key ? '2px solid #ec4899' : '2px solid transparent',
                color: activeTab === tab.key ? '#ec4899' : '#71717a',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: activeTab === tab.key ? 600 : 400,
                whiteSpace: 'nowrap',
                transition: 'color 0.15s',
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab user={user} />}

        {activeTab !== 'overview' && (
          <div
            style={{
              background: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              overflow: 'hidden',
            }}
          >
            {loading && (
              <div
                style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#71717a',
                }}
              >
                Loading data…
              </div>
            )}

            {!loading && dataError && (
              <div
                style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#71717a',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
                {dataError}
              </div>
            )}

            {!loading && !dataError && records.length === 0 && (
              <div
                style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: '#71717a',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📭</div>
                No records found.
              </div>
            )}

            {!loading && !dataError && records.length > 0 && (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#1e1e1e' }}>
                      {Object.keys(records[0]).map((col) => (
                        <th
                          key={col}
                          style={{
                            padding: '0.75rem 1rem',
                            textAlign: 'left',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: '#71717a',
                            borderBottom: '1px solid #2a2a2a',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          borderBottom: '1px solid #1e1e1e',
                        }}
                      >
                        {Object.values(row).map((val, j) => (
                          <td
                            key={j}
                            style={{
                              padding: '0.75rem 1rem',
                              fontSize: '0.875rem',
                              color: '#d4d4d8',
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {val == null ? '—' : String(val)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function OverviewTab({ user }: { user: User }) {
  const stats = [
    { label: 'Status', value: 'Active', color: '#22c55e' },
    { label: 'Access Level', value: user.role, color: '#ec4899' },
    { label: 'Last Login', value: new Date().toLocaleDateString(), color: '#f5f5f5' },
    { label: 'Portal', value: 'CCBill Audit', color: '#f5f5f5' },
  ]

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: '#141414',
              border: '1px solid #2a2a2a',
              borderRadius: '12px',
              padding: '1.25rem',
            }}
          >
            <p style={{ color: '#71717a', fontSize: '0.8rem', margin: '0 0 0.5rem' }}>
              {s.label}
            </p>
            <p
              style={{
                color: s.color,
                fontSize: '1.1rem',
                fontWeight: 600,
                margin: 0,
              }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div
        style={{
          background: '#141414',
          border: '1px solid #2a2a2a',
          borderRadius: '12px',
          padding: '1.5rem',
        }}
      >
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            margin: '0 0 1rem',
            color: '#f5f5f5',
          }}
        >
          Welcome, {user.name}
        </h2>
        <p style={{ color: '#71717a', fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
          You have read-only access to the Aura8 compliance portal. Use the tabs above to
          browse compliance records, audit logs, and reports. All activity is monitored and
          logged for compliance purposes.
        </p>
      </div>
    </div>
  )
}

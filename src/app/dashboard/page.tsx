'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  username: string;
  role: string;
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#0a0a0a',
  } as React.CSSProperties,
  loading: {
    minHeight: '100vh',
    background: '#0a0a0a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#999999',
  } as React.CSSProperties,
  header: {
    borderBottom: '1px solid #2a2a2e',
    background: '#121214',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    gap: '1rem',
  } as React.CSSProperties,
  headerTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
    margin: 0,
  } as React.CSSProperties,
  headerSubtitle: {
    fontSize: '0.875rem',
    color: '#999999',
    marginTop: '0.25rem',
    margin: 0,
  } as React.CSSProperties,
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  } as React.CSSProperties,
  userInfo: {
    textAlign: 'right' as const,
  },
  userName: {
    fontSize: '0.875rem',
    color: '#cccccc',
    margin: 0,
  } as React.CSSProperties,
  userRole: {
    fontSize: '0.75rem',
    color: '#808080',
    margin: 0,
  } as React.CSSProperties,
  logoutButton: {
    padding: '0.5rem 1rem',
    background: '#2a2a2e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  } as React.CSSProperties,
  content: {
    maxWidth: '80rem',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  } as React.CSSProperties,
  tabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: '1px solid #2a2a2e',
  } as React.CSSProperties,
  tab: {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: 500,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
    transition: 'all 0.2s',
    color: '#999999',
  } as React.CSSProperties,
  tabActive: {
    borderBottom: '2px solid #ec4899',
    color: '#ec4899',
  } as React.CSSProperties,
  tabContent: {
    marginTop: '1.5rem',
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  } as React.CSSProperties,
  card: {
    background: '#121214',
    border: '1px solid #2a2a2e',
    borderRadius: '8px',
    padding: '1.5rem',
  } as React.CSSProperties,
  cardLabel: {
    fontSize: '0.875rem',
    color: '#999999',
    marginBottom: '0.5rem',
  } as React.CSSProperties,
  cardValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#ffffff',
  } as React.CSSProperties,
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: 600,
    color: '#ffffff',
    margin: '0 0 1rem 0',
  } as React.CSSProperties,
  cardText: {
    fontSize: '0.875rem',
    color: '#999999',
    margin: 0,
  } as React.CSSProperties,
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = localStorage.getItem('compliance_session');
    const userData = localStorage.getItem('compliance_user');

    if (!session || !userData) {
      router.push('/');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (err) {
      console.error('Failed to parse user data:', err);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('compliance_session');
    localStorage.removeItem('compliance_user');
    router.push('/');
  };

  if (loading) {
    return <div style={styles.loading}>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>Compliance Dashboard</h1>
          <p style={styles.headerSubtitle}>Aura8 CCBill Review System</p>
        </div>
        <div style={styles.headerRight}>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user.username}</p>
            <p style={styles.userRole}>{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.background = '#3a3a3e';
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.background = '#2a2a2e';
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div style={styles.content}>
        <div style={styles.tabs}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'records', label: 'Compliance Records' },
            { id: 'audit', label: 'Audit Log' },
            { id: 'reports', label: 'Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={styles.tabContent}>
          {activeTab === 'overview' && (
            <div style={styles.grid}>
              <div style={styles.card}>
                <div style={styles.cardLabel}>Total Reviews</div>
                <div style={styles.cardValue}>1,234</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardLabel}>Pending</div>
                <div style={{ ...styles.cardValue, color: '#ec4899' }}>47</div>
              </div>
              <div style={styles.card}>
                <div style={styles.cardLabel}>Completed Today</div>
                <div style={{ ...styles.cardValue, color: '#00ff00' }}>12</div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Compliance Records</h3>
              <p style={styles.cardText}>No records available</p>
            </div>
          )}

          {activeTab === 'audit' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Audit Log</h3>
              <p style={styles.cardText}>No audit entries yet</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Reports</h3>
              <p style={styles.cardText}>No reports available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

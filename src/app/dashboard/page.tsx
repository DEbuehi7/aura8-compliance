'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

interface User {
  username: string;
  role: string;
}

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
          <button onClick={handleLogout} style={styles.logoutButton}>
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
                ...(activeTab === tab.id ? styles.tabActive : styles.tabInactive),
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

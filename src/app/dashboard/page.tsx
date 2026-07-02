'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
    // Check if user is authenticated
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
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <div className="border-b border-[#2a2a2e] bg-[#121214]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Compliance Dashboard</h1>
            <p className="text-sm text-gray-400 mt-1">Aura8 CCBill Review System</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-300">{user.username}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#2a2a2e] hover:bg-[#3a3a3e] text-white rounded-lg text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[#2a2a2e]">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'records', label: 'Compliance Records' },
            { id: 'audit', label: 'Audit Log' },
            { id: 'reports', label: 'Reports' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-[#ec4899] text-[#ec4899]'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#121214] border border-[#2a2a2e] rounded-lg p-6">
                <div className="text-gray-400 text-sm mb-2">Total Reviews</div>
                <div className="text-3xl font-bold text-white">1,234</div>
              </div>
              <div className="bg-[#121214] border border-[#2a2a2e] rounded-lg p-6">
                <div className="text-gray-400 text-sm mb-2">Pending</div>
                <div className="text-3xl font-bold text-[#ec4899]">47</div>
              </div>
              <div className="bg-[#121214] border border-[#2a2a2e] rounded-lg p-6">
                <div className="text-gray-400 text-sm mb-2">Completed Today</div>
                <div className="text-3xl font-bold text-green-400">12</div>
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="bg-[#121214] border border-[#2a2a2e] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Compliance Records
              </h3>
              <p className="text-gray-400">No records available</p>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="bg-[#121214] border border-[#2a2a2e] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Audit Log</h3>
              <p className="text-gray-400">No audit entries yet</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-[#121214] border border-[#2a2a2e] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Reports</h3>
              <p className="text-gray-400">No reports available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

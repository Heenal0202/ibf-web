import React, { useState, useEffect } from 'react';

export default function Admin({ onNavigate }) {
  // Auth state
  const [token, setToken] = useState(() => localStorage.getItem('bennett_admin_token') || '');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'members'
  const [dbStatus, setDbStatus] = useState({ isMongoConnected: false, mode: 'Checking...' });

  // Applications state
  const [applications, setApplications] = useState([]);
  const [appLoading, setAppLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTrack, setFilterTrack] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Members state
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    fullName: '',
    email: '',
    role: 'Core Contributor',
    year: '2nd Year',
    track: 'Smart Contracts & EVM',
    handle: ''
  });

  // Verify / load on token change
  useEffect(() => {
    fetchDbStatus();
    if (token) {
      loadApplications();
      loadMembers();
    }
  }, [token]);

  // Fetch DB Status
  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setDbStatus(data);
    } catch (e) {
      setDbStatus({ isMongoConnected: false, mode: 'Local Store' });
    }
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authForm)
      });
      const data = await res.json();

      if (data.success && data.token) {
        localStorage.setItem('bennett_admin_token', data.token);
        setToken(data.token);
        if (window.showToast) window.showToast('🛡️ Admin authentication verified');
      } else {
        setAuthError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setAuthError('Connection to backend failed. Please ensure backend server is running.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('bennett_admin_token');
    setToken('');
    setAuthForm({ username: '', password: '' });
    if (window.showToast) window.showToast('Logged out of admin session');
  };

  // Load Applications
  const loadApplications = async () => {
    setAppLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterTrack !== 'all') params.append('track', filterTrack);
      if (filterYear !== 'all') params.append('year', filterYear);
      params.append('sortBy', sortBy);
      params.append('order', sortOrder);

      const res = await fetch(`/api/applications?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setApplications(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAppLoading(false);
    }
  };

  // Re-fetch applications on filter/sort changes
  useEffect(() => {
    if (token) {
      const timer = setTimeout(loadApplications, 150);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, filterStatus, filterTrack, filterYear, sortBy, sortOrder]);

  // Update application status
  const handleUpdateStatus = async (id, newStatus, autoAddMember = false) => {
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus, autoAddMember })
      });
      const data = await res.json();
      if (data.success) {
        if (window.showToast) {
          window.showToast(
            autoAddMember
              ? 'Candidate accepted & added to Club Members!'
              : `Application status updated to ${newStatus}`
          );
        }
        loadApplications();
        if (autoAddMember) loadMembers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete application
  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Are you sure you want to delete this application record?')) return;
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (window.showToast) window.showToast('Application deleted');
        loadApplications();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Load Members
  const loadMembers = async () => {
    setMembersLoading(true);
    try {
      const res = await fetch('/api/members');
      const data = await res.json();
      if (data.success) {
        setMembers(data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMembersLoading(false);
    }
  };

  // Add Member
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newMemberForm)
      });
      const data = await res.json();
      if (data.success) {
        if (window.showToast) window.showToast(`🎉 ${newMemberForm.fullName} added to Bennett Blockchain!`);
        setShowAddMemberModal(false);
        setNewMemberForm({
          fullName: '',
          email: '',
          role: 'Core Contributor',
          year: '2nd Year',
          track: 'Smart Contracts & EVM',
          handle: ''
        });
        loadMembers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Remove Member
  const handleRemoveMember = async (id, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from club membership?`)) return;
    try {
      const res = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (window.showToast) window.showToast(`Member ${memberName} removed`);
        loadMembers();
      }
    } catch (e) {
      console.error(e);
    }
  };

  /* =========================================================================
     RENDER 1: LOGIN SCREEN IF NOT AUTHENTICATED
     ========================================================================= */
  if (!token) {
    return (
      <div id="page-admin" className="page-view active" style={{ minHeight: '80vh', padding: '140px 1.5rem 60px' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto', background: 'var(--ink-2)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.8rem' }}>
            <span className="pill pill--yellow" style={{ marginBottom: '0.8rem', display: 'inline-block' }}>
              Admin Portal · MongoDB
            </span>
            <h2 style={{ color: 'var(--paper)', fontSize: '1.8rem', fontWeight: 700 }}>Bennett Web3 Admin</h2>
            <p style={{ color: 'var(--muted-dark)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
              Sign in to manage candidate recruitment applications and club members.
            </p>
          </div>

          {authError && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#fca5a5', padding: '0.75rem', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '1.2rem', textAlign: 'center' }}>
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="react-form-group" style={{ marginBottom: '1.2rem' }}>
              <label className="react-form-label" style={{ display: 'block', color: 'var(--paper)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Admin Username
              </label>
              <input
                type="text"
                className="react-form-input"
                required
                value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                placeholder="admin"
                style={{ width: '100%' }}
              />
            </div>

            <div className="react-form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="react-form-label" style={{ display: 'block', color: 'var(--paper)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
                Password
              </label>
              <input
                type="password"
                className="react-form-input"
                required
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                placeholder="••••••••"
                style={{ width: '100%' }}
              />
            </div>

            <button
              type="submit"
              className="react-modal-submit"
              disabled={authLoading}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', cursor: 'pointer' }}
            >
              {authLoading ? 'Verifying Credentials...' : 'Authenticate & Enter Dashboard →'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', background: 'rgba(255,255,255,0.04)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--muted-dark)', textAlign: 'center' }}>
            🔑 Default credentials: <b style={{ color: 'var(--yellow)' }}>admin</b> / <b style={{ color: 'var(--yellow)' }}>admin</b>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================================
     RENDER 2: AUTHENTICATED ADMIN DASHBOARD
     ========================================================================= */
  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const acceptedCount = applications.filter((a) => a.status === 'Accepted').length;

  return (
    <div id="page-admin" className="page-view active" style={{ minHeight: '90vh', padding: '110px 1.5rem 80px' }}>
      <div style={{ maxWidth: '1240px', margin: '0 auto' }}>

        {/* TOP STATUS BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', paddingBottom: '1.2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <span className="pill pill--yellow">Chapter Administration</span>
              <span style={{ fontSize: '0.8rem', color: dbStatus.isMongoConnected ? '#4ade80' : '#facc15', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: dbStatus.isMongoConnected ? '#4ade80' : '#facc15', display: 'inline-block' }}></span>
                {dbStatus.isMongoConnected ? 'MongoDB Connected' : 'Local Fallback Storage'}
              </span>
            </div>
            <h1 style={{ color: 'var(--paper)', fontSize: '2.2rem', fontWeight: 800 }}>Lead Control Dashboard</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <button
              onClick={() => {
                if (activeTab === 'applications') loadApplications();
                else loadMembers();
                fetchDbStatus();
              }}
              className="btn btn--ghost"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              title="Refresh Data from MongoDB"
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleLogout}
              className="btn btn--ghost"
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'var(--ink-2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ color: 'var(--muted-dark)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Applications</span>
            <div style={{ color: 'var(--paper)', fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>{applications.length}</div>
          </div>
          <div style={{ background: 'var(--ink-2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ color: 'var(--yellow)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Review</span>
            <div style={{ color: 'var(--yellow)', fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>{pendingCount}</div>
          </div>
          <div style={{ background: 'var(--ink-2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ color: '#4ade80', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Accepted Candidates</span>
            <div style={{ color: '#4ade80', fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>{acceptedCount}</div>
          </div>
          <div style={{ background: 'var(--ink-2)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ color: 'var(--cyan)', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Club Members</span>
            <div style={{ color: 'var(--cyan)', fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem' }}>{members.length}</div>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div style={{ display: 'flex', gap: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '1.8rem' }}>
          <button
            onClick={() => setActiveTab('applications')}
            style={{
              padding: '0.8rem 1.4rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'applications' ? '3px solid var(--yellow)' : '3px solid transparent',
              color: activeTab === 'applications' ? 'var(--paper)' : 'var(--muted-dark)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            📋 Candidate Applications ({applications.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            style={{
              padding: '0.8rem 1.4rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'members' ? '3px solid var(--yellow)' : '3px solid transparent',
              color: activeTab === 'members' ? 'var(--paper)' : 'var(--muted-dark)',
              fontWeight: 600,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            👥 Manage Club Members ({members.length})
          </button>
        </div>

        {/* TAB 1: APPLICATIONS DASHBOARD */}
        {activeTab === 'applications' && (
          <div>
            {/* FILTER & SORT CONTROLS BAR */}
            <div style={{ background: 'var(--ink-2)', padding: '1.2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'center' }}>
              <div>
                <label style={{ display: 'block', color: 'var(--muted-dark)', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Search Candidates</label>
                <input
                  type="text"
                  placeholder="Filter name, email, GitHub..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="react-form-input"
                  style={{ width: '100%', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted-dark)', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Status</label>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="react-form-select" style={{ width: '100%', fontSize: '0.85rem' }}>
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted-dark)', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Core Focus Track</label>
                <select value={filterTrack} onChange={(e) => setFilterTrack(e.target.value)} className="react-form-select" style={{ width: '100%', fontSize: '0.85rem' }}>
                  <option value="all">All Tracks</option>
                  <option value="Smart Contracts & EVM">Smart Contracts & EVM</option>
                  <option value="ZK Proofs & Cryptography">ZK Proofs & Cryptography</option>
                  <option value="Rust & Solana / Cosmos">Rust & Solana / Cosmos</option>
                  <option value="Web3 Frontend & UX">Web3 Frontend & UX</option>
                  <option value="DeFi & Tokenomics">DeFi & Tokenomics</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted-dark)', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Academic Year</label>
                <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className="react-form-select" style={{ width: '100%', fontSize: '0.85rem' }}>
                  <option value="all">All Years</option>
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: 'var(--muted-dark)', fontSize: '0.78rem', marginBottom: '0.3rem' }}>Sort Order</label>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="react-form-select" style={{ flex: 1, fontSize: '0.85rem' }}>
                    <option value="date">Date Applied</option>
                    <option value="name">Candidate Name</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="btn btn--ghost"
                    style={{ padding: '0 0.6rem', fontSize: '0.85rem' }}
                    title={`Current: ${sortOrder.toUpperCase()}`}
                  >
                    {sortOrder === 'asc' ? '▲' : '▼'}
                  </button>
                </div>
              </div>
            </div>

            {/* APPLICATIONS LIST / TABLE */}
            {appLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-dark)' }}>Loading candidate data...</div>
            ) : applications.length === 0 ? (
              <div style={{ background: 'var(--ink-2)', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p style={{ color: 'var(--paper)', fontSize: '1.1rem', fontWeight: 600 }}>No applications matching current filters</p>
                <p style={{ color: 'var(--muted-dark)', fontSize: '0.9rem', marginTop: '0.4rem' }}>Try clearing your search query or switching filters.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applications.map((app) => {
                  const statusColors = {
                    Pending: { bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15', border: 'rgba(234, 179, 8, 0.3)' },
                    Accepted: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
                    Rejected: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', border: 'rgba(239, 68, 68, 0.3)' }
                  };
                  const colors = statusColors[app.status] || statusColors.Pending;

                  return (
                    <article
                      key={app._id}
                      style={{
                        background: 'var(--ink-2)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '12px',
                        padding: '1.4rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.8rem',
                        transition: 'border-color 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.8rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                            <h3 style={{ color: 'var(--paper)', fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{app.fullName}</h3>
                            <span style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}`, padding: '2px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                              {app.status}
                            </span>
                            <span className="pill pill--yellow" style={{ fontSize: '0.72rem', padding: '2px 8px' }}>{app.year}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '1.2rem', color: 'var(--muted-dark)', fontSize: '0.85rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                            <span>📧 {app.email}</span>
                            <span>🎯 {app.track}</span>
                            {app.handle && (
                              <span>🔗 <a href={app.handle.startsWith('http') ? app.handle : `https://${app.handle}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>{app.handle}</a></span>
                            )}
                            <span style={{ fontSize: '0.8rem' }}>🕒 {new Date(app.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {app.status !== 'Accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(app._id, 'Accepted', true)}
                              style={{
                                background: '#10b981',
                                color: '#07090e',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              ✓ Accept & Add Member
                            </button>
                          )}
                          {app.status !== 'Rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                              style={{
                                background: 'transparent',
                                color: '#f87171',
                                border: '1px solid rgba(239, 68, 68, 0.4)',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              Reject
                            </button>
                          )}
                          {app.status !== 'Pending' && (
                            <button
                              onClick={() => handleUpdateStatus(app._id, 'Pending')}
                              style={{
                                background: 'transparent',
                                color: '#facc15',
                                border: '1px solid rgba(234, 179, 8, 0.4)',
                                borderRadius: '6px',
                                padding: '6px 12px',
                                fontSize: '0.8rem',
                                cursor: 'pointer'
                              }}
                            >
                              Reset Pending
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteApplication(app._id)}
                            style={{
                              background: 'transparent',
                              color: 'var(--muted-dark)',
                              border: '1px solid rgba(255,255,255,0.1)',
                              borderRadius: '6px',
                              padding: '6px 10px',
                              fontSize: '0.8rem',
                              cursor: 'pointer'
                            }}
                            title="Delete Record"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      {app.notes && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.6rem 0.8rem', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--paper)' }}>
                          💡 <i>"{app.notes}"</i>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEMBERS MANAGEMENT */}
        {activeTab === 'members' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ color: 'var(--paper)', fontSize: '1.4rem', fontWeight: 700 }}>Club Roster ({members.length} Members)</h2>
                <p style={{ color: 'var(--muted-dark)', fontSize: '0.88rem' }}>Active core engineers, leads, and student contributors.</p>
              </div>
              <button
                onClick={() => setShowAddMemberModal(true)}
                className="btn btn--yellow"
                style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}
              >
                + Add Club Member
              </button>
            </div>

            {membersLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-dark)' }}>Loading roster...</div>
            ) : members.length === 0 ? (
              <div style={{ background: 'var(--ink-2)', padding: '3rem', textAlign: 'center', borderRadius: '12px' }}>
                <p style={{ color: 'var(--paper)' }}>No members found in roster.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.2rem' }}>
                {members.map((member) => (
                  <article
                    key={member._id}
                    style={{
                      background: 'var(--ink-2)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '1.4rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                        <div>
                          <h3 style={{ color: 'var(--paper)', fontSize: '1.2rem', fontWeight: 700 }}>{member.fullName}</h3>
                          <span style={{ color: 'var(--yellow)', fontSize: '0.82rem', fontWeight: 600 }}>{member.role}</span>
                        </div>
                        <span className="pill pill--yellow" style={{ fontSize: '0.72rem' }}>{member.year}</span>
                      </div>
                      <p style={{ color: 'var(--muted-dark)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>📧 {member.email}</p>
                      <p style={{ color: 'var(--muted-dark)', fontSize: '0.85rem', marginBottom: '0.4rem' }}>🛠️ {member.track}</p>
                      {member.handle && (
                        <p style={{ color: 'var(--muted-dark)', fontSize: '0.85rem' }}>
                          🔗 <a href={member.handle.startsWith('http') ? member.handle : `https://${member.handle}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--cyan)' }}>{member.handle}</a>
                        </p>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.8rem', marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'var(--muted-dark)', fontSize: '0.75rem' }}>Added: {new Date(member.addedAt || Date.now()).toLocaleDateString()}</span>
                      <button
                        onClick={() => handleRemoveMember(member._id, member.fullName)}
                        style={{
                          background: 'transparent',
                          color: '#f87171',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '0.78rem',
                          cursor: 'pointer'
                        }}
                      >
                        Remove Member
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL: ADD NEW MEMBER */}
      {showAddMemberModal && (
        <div className="react-modal-overlay react-modal-overlay--open" onClick={(e) => { if (e.target === e.currentTarget) setShowAddMemberModal(false); }}>
          <div className="react-modal-container" style={{ maxWidth: '520px' }}>
            <button className="react-modal-close" onClick={() => setShowAddMemberModal(false)}>✕</button>
            <span className="react-modal-badge">Roster Management</span>
            <h2 className="react-modal-title">Add Club Member</h2>
            <p className="react-modal-desc">Manually register a contributor or faculty mentor into the Bennett Blockchain database.</p>

            <form onSubmit={handleAddMember} className="react-modal-form">
              <div className="react-form-group">
                <label className="react-form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="react-form-input"
                  placeholder="e.g. Satoshi Nakamoto"
                  value={newMemberForm.fullName}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, fullName: e.target.value })}
                />
              </div>

              <div className="react-form-group">
                <label className="react-form-label">University Email</label>
                <input
                  type="email"
                  required
                  className="react-form-input"
                  placeholder="e.g. satoshi@bennett.edu.in"
                  value={newMemberForm.email}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <div className="react-form-group">
                  <label className="react-form-label">Role in Club</label>
                  <input
                    type="text"
                    required
                    className="react-form-input"
                    placeholder="e.g. Core Contributor, Tech Lead"
                    value={newMemberForm.role}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, role: e.target.value })}
                  />
                </div>

                <div className="react-form-group">
                  <label className="react-form-label">Academic Year</label>
                  <select
                    className="react-form-select"
                    value={newMemberForm.year}
                    onChange={(e) => setNewMemberForm({ ...newMemberForm, year: e.target.value })}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Postgraduate</option>
                    <option value="Faculty">Faculty Advisor</option>
                  </select>
                </div>
              </div>

              <div className="react-form-group">
                <label className="react-form-label">Core Track / Specialization</label>
                <select
                  className="react-form-select"
                  value={newMemberForm.track}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, track: e.target.value })}
                >
                  <option value="Smart Contracts & EVM">Smart Contracts & EVM</option>
                  <option value="ZK Proofs & Cryptography">ZK Proofs & Cryptography</option>
                  <option value="Rust & Solana / Cosmos">Rust & Solana / Cosmos</option>
                  <option value="Web3 Frontend & UX">Web3 Frontend & UX</option>
                  <option value="DeFi & Tokenomics">DeFi & Tokenomics</option>
                </select>
              </div>

              <div className="react-form-group">
                <label className="react-form-label">GitHub / Portfolio Handle</label>
                <input
                  type="text"
                  className="react-form-input"
                  placeholder="github.com/username"
                  value={newMemberForm.handle}
                  onChange={(e) => setNewMemberForm({ ...newMemberForm, handle: e.target.value })}
                />
              </div>

              <button type="submit" className="react-modal-submit" style={{ width: '100%', marginTop: '0.8rem' }}>
                Save Member to Database →
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

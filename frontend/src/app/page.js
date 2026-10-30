'use client';

import { useState, useEffect } from 'react';

const FLEET_DATA = [
  {
    reg: 'VT-ABC',
    model: 'Airbus A320neo',
    airline: 'AeroSync Express',
    from: 'BLR',
    to: 'DEL',
    duration: '2h 45m',
    status: 'Airworthy',
    hours: '14,250 hrs',
    cycles: '8,410 cycles',
    hangar: 'Bengaluru Hangar 01',
    health: '98%',
    badgeBg: '#ecfdf5',
    badgeColor: '#059669',
  },
  {
    reg: 'VT-ABG',
    model: 'Airbus A350-900',
    airline: 'SkyBridge Global',
    from: 'BOM',
    to: 'LHR',
    duration: '9h 15m',
    status: 'In Maintenance',
    hours: '8,410 hrs',
    cycles: '2,920 cycles',
    hangar: 'Hyderabad MRO Bay',
    health: '84%',
    badgeBg: '#fffbeb',
    badgeColor: '#d97706',
  },
  {
    reg: 'VT-ABJ',
    model: 'Boeing 787-9 Dreamliner',
    airline: 'Pacific Airways',
    from: 'DEL',
    to: 'SFO',
    duration: '15h 30m',
    status: 'Inspection Due',
    hours: '19,800 hrs',
    cycles: '5,310 cycles',
    hangar: 'Kolkata Hangar 03',
    health: '91%',
    badgeBg: '#f0f9ff',
    badgeColor: '#0284c7',
  },
  {
    reg: 'VT-ABM',
    model: 'Boeing 737 MAX 8',
    airline: 'AeroSync Shuttle',
    from: 'HYD',
    to: 'DXB',
    duration: '3h 50m',
    status: 'Airworthy',
    hours: '6,120 hrs',
    cycles: '3,840 cycles',
    hangar: 'Jaipur Hangar 01',
    health: '99%',
    badgeBg: '#ecfdf5',
    badgeColor: '#059669',
  },
];

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: 'achinthya', password: '' });
  const [loginError, setLoginError] = useState('');
  const [authenticating, setAuthenticating] = useState(false);

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('passports');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', error: false });
  const [formData, setFormData] = useState({
    maintenanceId: '',
    maintType: 'Routine Inspection',
    date: new Date().toISOString().split('T')[0],
    description: '',
    cost: '450.00',
    status: 'Completed',
    hangarId: '1',
    aircraftId: '1',
    technicianId: '1',
    partLogId: '',
    partId: '1',
    quantityUsed: '1',
    unitCost: '50.00',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setAuthenticating(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        loadSummary();
      } else {
        setLoginError(data.error || 'Authentication failed.');
      }
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setAuthenticating(false);
    }
  };

  const loadSummary = () => {
    fetch('/api/summary')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRecords(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    setSearchError('');
    setSearchResults(null);

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.results)) {
          setSearchResults({ type: 'array', items: data.results });
        } else if (data.rawOutput) {
          setSearchResults({ type: 'raw', text: data.rawOutput });
        } else {
          setSearchResults({ type: 'raw', text: JSON.stringify(data, null, 2) });
        }
      } else {
        setSearchError(data.error || 'Vector semantic lookup failed.');
      }
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  };

  const handleLogMaintenance = async (e) => {
    e.preventDefault();
    setFormMsg({ text: '', error: false });

    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, userRole: currentUser.role }),
      });
      const data = await res.json();
      if (data.success) {
        setFormMsg({ text: 'Work order executed atomically via Stored Procedure!', error: false });
        loadSummary();
        setTimeout(() => setShowModal(false), 1200);
      } else {
        setFormMsg({ text: data.error, error: true });
      }
    } catch (err) {
      setFormMsg({ text: err.message, error: true });
    }
  };

  // 1. DUAL-PANE LOGIN PAGE WITH B777 AND B747 PHOTO
  if (!currentUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: '#eef4fc', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        
        {/* LEFT COLUMN: Large High-Resolution Airport Image */}
        <div style={{
          flex: '1.2',
          backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.7)), url("https://images.unsplash.com/photo-1520437358207-323b43b50729?auto=format&fit=crop&w=1600&q=80")',
          backgroundColor: '#0f172a', // Fallback
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '48px',
          color: '#ffffff',
          position: 'relative'
        }}>
          {/* Accent Border & Badges */}
          <div style={{ position: 'absolute', top: '32px', left: '32px', display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', backgroundColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '999px', border: '1px solid rgba(255,255,255,0.3)' }}>
              ✈ AIRCRAFT MRO
            </span>
          </div>

          <div style={{ maxWidth: '580px', textShadow: '0 2px 10px rgba(0,0,0,0.5)', zIndex: 10 }}>
            <h2 style={{ fontSize: '32px', fontWeight: 900, margin: '0 0 12px 0', lineHeight: '1.2' }}>
              Maintenance, Repair & Overhaul Deck
            </h2>
            <p style={{ fontSize: '14px', color: '#cbd5e1', margin: '0 0 24px 0', lineHeight: '1.6', fontWeight: 500 }}>
              Connecting predictive flight health telemetry, live relational database views, and automated inventory trigger systems.
            </p>
            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '20px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Heavy Fleet Operations</span>
                <strong style={{ fontSize: '15px' }}>B777W & B747-8 Ready</strong>
              </div>
              <div style={{ width: '1px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div>
              <div>
                <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>Telemetry Update</span>
                <strong style={{ fontSize: '15px' }}>Database Secure (RBAC)</strong>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Box */}
        <div style={{ flex: '0.8', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
          <div style={{ maxWidth: '380px', width: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.25)', marginBottom: '16px' }}>
                ✈
              </div>
              <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#0f172a' }}>Welcome back</h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Authenticate to access Flighty MRO operations</p>
            </div>

            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '13px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 600 }}>Username</label>
                <input
                  type="text"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontSize: '14px' }}
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                  placeholder="e.g. achinthya, janya, pooja"
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#475569', fontWeight: 600 }}>Password</label>
                <input
                  type="password"
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', outline: 'none', boxSizing: 'border-box', fontSize: '14px' }}
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '12px', fontSize: '11px', color: '#475569', lineHeight: '1.5' }}>
                <strong>Authorized Demo Crew:</strong><br />
                • Admin: <code>achinthya</code> / <code>admin123</code><br />
                • Admin: <code>pooja</code> / <code>pooja123</code><br />
                • Technicians: <code>arjun</code>, <code>janya</code>, <code>rohan</code>, <code>aditya</code> / pass + <code>123</code>
              </div>

              {loginError && (
                <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '10px', color: '#dc2626', fontSize: '12px', fontWeight: 600 }}>
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={authenticating}
                style={{ border: 'none', backgroundColor: '#2563eb', color: '#ffffff', padding: '12px', borderRadius: '14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(37,99,235,0.3)', marginTop: '8px' }}
              >
                {authenticating ? 'Checking Authorization...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED: SHOW MAIN DASHBOARD
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#eef4fc', padding: '32px 16px', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Top Header */}
        <header style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', borderRadius: '24px', padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)', border: '1px solid rgba(255, 255, 255, 0.8)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'linear-gradient(135deg, #2563eb, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '22px', boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)' }}>
              ✈
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>Flighty MRO</h1>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '999px', border: '1px solid #bfdbfe' }}>
                  OPERATIONS
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>Fleet Maintenance & Semantic Defect Intelligence</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '12px', textAlign: 'right' }}>
              <span style={{ color: '#64748b', display: 'block', fontSize: '10px' }}>Authenticated Role</span>
              <strong style={{ color: currentUser.role === 'Admin' ? '#2563eb' : '#059669' }}>
                {currentUser.name} ({currentUser.role})
              </strong>
            </div>
            <button
              onClick={() => setCurrentUser(null)}
              style={{ border: 'none', backgroundColor: '#f1f5f9', color: '#64748b', padding: '8px 14px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* Hero Card */}
        <div style={{ background: 'linear-gradient(135deg, #1d4ed8, #0ea5e9)', borderRadius: '28px', padding: '32px', color: '#ffffff', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 30px rgba(14, 165, 233, 0.25)' }}>
          <div style={{ maxWidth: '580px', position: 'relative', zIndex: 2 }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '999px' }}>
              Fleet Operations Deck
            </span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: '12px 0 8px 0' }}>The Fleet Is Just One Flight Away</h2>
            <p style={{ fontSize: '13px', color: '#e0f2fe', lineHeight: '1.6', margin: 0 }}>
              Track airworthiness passports, diagnose faults via Chroma ONNX vector search, and execute atomic work orders directly into MySQL 8.0.
            </p>

            <div style={{ display: 'flex', gap: '16px', marginTop: '20px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '10px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#bae6fd', display: 'block' }}>Active Fleet</span>
                <strong style={{ fontSize: '18px' }}>12 Aircraft</strong>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '10px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#bae6fd', display: 'block' }}>Verified Logs</span>
                <strong style={{ fontSize: '18px' }}>{records.length} Recorded</strong>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', padding: '10px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.2)' }}>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#bae6fd', display: 'block' }}>Security Tier</span>
                <strong style={{ fontSize: '18px' }}>SHA-256 RBAC</strong>
              </div>
            </div>
          </div>

          <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.15, fontSize: '200px', userSelect: 'none' }}>
            ✈
          </div>
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.7)', padding: '4px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <button
              onClick={() => setActiveTab('passports')}
              style={{ border: 'none', padding: '8px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', backgroundColor: activeTab === 'passports' ? '#2563eb' : 'transparent', color: activeTab === 'passports' ? '#ffffff' : '#64748b' }}
            >
              Fleet Passports & Routes
            </button>
            <button
              onClick={() => setActiveTab('operations')}
              style={{ border: 'none', padding: '8px 18px', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', backgroundColor: activeTab === 'operations' ? '#2563eb' : 'transparent', color: activeTab === 'operations' ? '#ffffff' : '#64748b' }}
            >
              Operations & Vector Search
            </button>
          </div>

          <button
            onClick={() => setShowModal(true)}
            style={{ border: 'none', backgroundColor: currentUser.role === 'Admin' ? '#2563eb' : '#94a3b8', color: '#ffffff', padding: '10px 20px', borderRadius: '14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 6px 16px rgba(37,99,235,0.3)', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            + Execute Work Order {currentUser.role !== 'Admin' && '(Admin Only)'}
          </button>
        </div>

        {/* TAB 1: FLEET PASSPORTS */}
        {activeTab === 'passports' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
            {FLEET_DATA.map((plane) => (
              <div
                key={plane.reg}
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '22px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{plane.reg}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', backgroundColor: plane.badgeBg, color: plane.badgeColor }}>
                        {plane.status}
                      </span>
                    </div>
                    <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: 600 }}>{plane.model} &bull; {plane.airline}</p>
                  </div>

                  <div style={{ width: '40px', height: '40px', borderRadius: '14px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 800, fontSize: '12px' }}>
                    {plane.health}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0f7ff', borderRadius: '18px', padding: '14px 18px', margin: '14px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>Origin</span>
                    <strong style={{ fontSize: '16px', color: '#1e3a8a' }}>{plane.from}</strong>
                  </div>

                  <div style={{ flex: 1, padding: '0 16px', textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{plane.duration}</span>
                    <div style={{ height: '2px', backgroundColor: '#bfdbfe', position: 'relative', margin: '4px 0' }}>
                      <span style={{ position: 'absolute', top: '-8px', left: '46%', backgroundColor: '#2563eb', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>✈</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, display: 'block' }}>Destination</span>
                    <strong style={{ fontSize: '16px', color: '#1e3a8a' }}>{plane.to}</strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Flight Hours</span>
                    <strong style={{ fontSize: '12px', color: '#334155' }}>{plane.hours}</strong>
                  </div>
                  <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '12px' }}>
                    <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>Flight Cycles</span>
                    <strong style={{ fontSize: '12px', color: '#334155' }}>{plane.cycles}</strong>
                  </div>
                </div>

                <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                  <span>Hangar: <strong style={{ color: '#1e293b' }}>{plane.hangar}</strong></span>
                  <span style={{ color: '#2563eb', fontWeight: 700 }}>Telemetry Synchronized</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 2: OPERATIONS & VECTOR SEARCH */}
        {activeTab === 'operations' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }}></div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Chroma Semantic Defect Search
                </h3>
              </div>
              <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
                Query unstructured flight defect logs using natural language via local ONNX vector embeddings.
              </p>

              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  style={{ flex: 1, backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '12px 16px', fontSize: '12px', outline: 'none' }}
                  placeholder="e.g. hydraulic fluid leak in landing gear or engine vibration on climb..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={searching}
                  style={{ border: 'none', backgroundColor: '#2563eb', color: '#fff', padding: '12px 20px', borderRadius: '14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
                >
                  {searching ? 'Querying...' : 'Find Defect'}
                </button>
              </form>

              {searchError && (
                <div style={{ marginTop: '12px', padding: '10px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', color: '#dc2626', fontSize: '12px' }}>
                  {searchError}
                </div>
              )}

              {searchResults && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Vector Matches</p>
                  {searchResults.type === 'array' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
                      {searchResults.items.map((item, idx) => (
                        <div key={idx} style={{ backgroundColor: '#f0f7ff', border: '1px solid #dbeafe', borderRadius: '14px', padding: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#1e3a8a', fontSize: '12px', marginBottom: '4px' }}>
                            <span>Record #{item.id}</span>
                            <span style={{ fontSize: '10px', backgroundColor: '#ffffff', padding: '2px 6px', borderRadius: '999px', border: '1px solid #bfdbfe' }}>
                              {item.metadata?.status || 'Logged'}
                            </span>
                          </div>
                          <p style={{ margin: 0, fontSize: '11px', color: '#475569', lineHeight: '1.4' }}>{item.document}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <pre style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', fontSize: '11px', margin: 0, overflowX: 'auto' }}>
                      {searchResults.text}
                    </pre>
                  )}
                </div>
              )}
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', borderRadius: '24px', padding: '24px', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 18px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Maintenance Operations View (MySQL 8.0)
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>Live presentation layer from <code>view_aircraft_maintenance_summary</code></p>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 700, backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '999px', color: '#475569' }}>
                  {records.length} Records
                </span>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', padding: '24px 0' }}>Loading database records...</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#94a3b8', fontSize: '11px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '10px' }}>ID</th>
                        <th style={{ padding: '10px' }}>Reg No</th>
                        <th style={{ padding: '10px' }}>Model</th>
                        <th style={{ padding: '10px' }}>Service Type</th>
                        <th style={{ padding: '10px' }}>Date</th>
                        <th style={{ padding: '10px' }}>Cost</th>
                        <th style={{ padding: '10px' }}>Status</th>
                        <th style={{ padding: '10px' }}>Lead Technician</th>
                        <th style={{ padding: '10px' }}>Hangar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((r) => (
                        <tr key={r.Maintenance_ID} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px', fontWeight: 700, color: '#2563eb' }}>{r.Maintenance_ID}</td>
                          <td style={{ padding: '10px', fontWeight: 700, color: '#0f172a' }}>{r.Reg_No}</td>
                          <td style={{ padding: '10px', color: '#475569' }}>{r.Model}</td>
                          <td style={{ padding: '10px', color: '#475569' }}>{r.Maintenance_Type}</td>
                          <td style={{ padding: '10px', color: '#64748b' }}>{new Date(r.Maintenance_Date).toLocaleDateString()}</td>
                          <td style={{ padding: '10px', fontWeight: 700, color: '#059669' }}>${Number(r.Cost).toFixed(2)}</td>
                          <td style={{ padding: '10px' }}>
                            <span style={{ padding: '3px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700, backgroundColor: r.Maintenance_Status === 'Completed' ? '#ecfdf5' : '#fffbeb', color: r.Maintenance_Status === 'Completed' ? '#059669' : '#d97706' }}>
                              {r.Maintenance_Status}
                            </span>
                          </td>
                          <td style={{ padding: '10px', color: '#475569' }}>{r.Lead_Technician}</td>
                          <td style={{ padding: '10px', color: '#64748b' }}>{r.Hangar_Location}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transactional Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 100 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '24px', padding: '24px', maxWidth: '440px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>Execute Transactional Work Order</h4>
              <button onClick={() => setShowModal(false)} style={{ border: 'none', background: 'transparent', fontSize: '16px', cursor: 'pointer', color: '#94a3b8' }}>✕</button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '12px', color: '#64748b' }}>
              Calls Stored Procedure <code>sp_log_maintenance_with_part</code> with atomic multi-table rollback and stock deduction trigger.
            </p>

            <form onSubmit={handleLogMaintenance} style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>Maintenance ID</label>
                  <input
                    type="number"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    value={formData.maintenanceId}
                    onChange={(e) => setFormData({ ...formData, maintenanceId: e.target.value })}
                    placeholder="e.g. 104"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>Part Log ID</label>
                  <input
                    type="number"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    value={formData.partLogId}
                    onChange={(e) => setFormData({ ...formData, partLogId: e.target.value })}
                    placeholder="e.g. 204"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>Work Order Description</label>
                <input
                  type="text"
                  required
                  style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Pitot tube heater circuit inspection"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>Aircraft ID (1-12)</label>
                  <input
                    type="number"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    value={formData.aircraftId}
                    onChange={(e) => setFormData({ ...formData, aircraftId: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>Part ID</label>
                  <input
                    type="number"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    value={formData.partId}
                    onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>Quantity Used</label>
                  <input
                    type="number"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    value={formData.quantityUsed}
                    onChange={(e) => setFormData({ ...formData, quantityUsed: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#64748b', fontWeight: 600 }}>Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  />
                </div>
              </div>

              {formMsg.text && (
                <div style={{ padding: '10px', borderRadius: '10px', fontSize: '11px', fontWeight: 700, backgroundColor: formMsg.error ? '#fef2f2' : '#ecfdf5', color: formMsg.error ? '#dc2626' : '#059669' }}>
                  {formMsg.text}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ border: 'none', backgroundColor: '#f1f5f9', color: '#64748b', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: 700 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={currentUser.role !== 'Admin'}
                  style={{ border: 'none', backgroundColor: currentUser.role === 'Admin' ? '#2563eb' : '#94a3b8', color: '#fff', padding: '8px 16px', borderRadius: '10px', cursor: currentUser.role === 'Admin' ? 'pointer' : 'not-allowed', fontWeight: 700 }}
                >
                  Commit Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

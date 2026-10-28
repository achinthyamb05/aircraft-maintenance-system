'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', error: false });
  const [formData, setFormData] = useState({
    maintenanceId: '',
    maintType: 'Routine Inspection',
    date: new Date().toISOString().split('T')[0],
    description: '',
    cost: '500.00',
    status: 'Completed',
    hangarId: '1',
    aircraftId: '1',
    technicianId: '1',
    partLogId: '',
    partId: '1',
    quantityUsed: '1',
    unitCost: '50.00'
  });

  const loadSummary = () => {
    fetch('/api/summary')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRecords(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadSummary();
  }, []);

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
        setSearchError(data.error || 'Vector search failed.');
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
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setFormMsg({ text: 'Record committed atomically via Stored Procedure!', error: false });
        loadSummary();
        setTimeout(() => setShowModal(false), 1200);
      } else {
        setFormMsg({ text: data.error, error: true });
      }
    } catch (err) {
      setFormMsg({ text: err.message, error: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Aircraft Maintenance & Service Management System
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Relational: MySQL 8.0 &bull; Vector: Chroma &bull; Interface: Next.js
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg text-xs">
          {currentUser ? (
            <div>
              <p className="text-slate-300">Active User: <span className="font-semibold text-white">{currentUser.name}</span></p>
              <p className="text-slate-400">Role: <span className="font-semibold text-sky-400">{currentUser.role}</span></p>
              <button onClick={() => setCurrentUser(null)} className="mt-2 text-rose-400 hover:underline">Log Out</button>
            </div>
          ) : (
            <div>
              <p className="text-slate-400 mb-1 font-medium">RBAC User Simulator:</p>
              <div className="flex gap-2">
                <button onClick={() => setCurrentUser({ name: 'Admin_Achinthya', role: 'System Admin' })} className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-slate-200">Admin</button>
                <button onClick={() => setCurrentUser({ name: 'Tech_Arjun', role: 'Aircraft Technician' })} className="bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded text-slate-200">Technician</button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Semantic Search Section */}
      <section className="mb-10 bg-slate-900 border border-slate-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2 text-sky-400">
          Chroma Semantic Fault Log Search
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Vector similarity retrieval matching natural-language fault descriptions with historical records.
        </p>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input
            type="text"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-4 py-2 text-sm text-white focus:outline-none focus:border-sky-500"
            placeholder="e.g. Engine vibration during departure or hydraulic line leak..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 px-5 py-2 rounded-md text-sm font-medium transition cursor-pointer"
          >
            {searching ? 'Querying Vector DB...' : 'Semantic Search'}
          </button>
        </form>

        {searchError && (
          <p className="mt-3 text-xs text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900">
            {searchError}
          </p>
        )}

        {searchResults && (
          <div className="mt-5 space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Matched Historical Reports</h3>
            {searchResults.type === 'array' ? (
              searchResults.items.map((item, idx) => (
                <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-md">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-mono font-bold text-sky-400">
                      Match {idx + 1} &bull; Maintenance ID #{item.id}
                    </span>
                    <span className="text-xs bg-slate-800 px-2 py-0.5 rounded text-emerald-400">
                      {item.metadata?.status || 'Logged'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-200">{item.document}</p>
                </div>
              ))
            ) : (
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-md">
                <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap">
                  {searchResults.text}
                </pre>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Structured SQL Data Section */}
      <section className="bg-slate-900 border border-slate-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-sky-400">
            Maintenance Operations (MySQL View)
          </h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer"
            >
              + Log Service (Stored Procedure)
            </button>
            <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              Records: {records.length}
            </span>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-slate-400">Loading records from MySQL...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs">
                  <th className="py-2 px-3">ID</th>
                  <th className="py-2 px-3">Reg No</th>
                  <th className="py-2 px-3">Model</th>
                  <th className="py-2 px-3">Maintenance Type</th>
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Cost ($)</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Technician</th>
                  <th className="py-2 px-3">Hangar</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.Maintenance_ID} className="border-b border-slate-800/60 hover:bg-slate-800/30">
                    <td className="py-2 px-3 font-mono text-xs">{r.Maintenance_ID}</td>
                    <td className="py-2 px-3 font-medium text-white">{r.Reg_No}</td>
                    <td className="py-2 px-3">{r.Model}</td>
                    <td className="py-2 px-3">{r.Maintenance_Type}</td>
                    <td className="py-2 px-3 text-slate-400">
                      {new Date(r.Maintenance_Date).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3 font-mono">{Number(r.Cost).toFixed(2)}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded text-xs bg-slate-800 text-slate-200">
                        {r.Maintenance_Status}
                      </span>
                    </td>
                    <td className="py-2 px-3">{r.Lead_Technician}</td>
                    <td className="py-2 px-3">{r.Hangar_Location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal for Atomic Procedure */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-bold text-white mb-3">Execute Transactional Service Log</h3>
            <p className="text-xs text-slate-400 mb-4">
              Invokes <code>sp_log_maintenance_with_part</code>: logs maintenance and triggers auto-inventory deduction atomically.
            </p>

            <form onSubmit={handleLogMaintenance} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Maintenance ID</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
                    value={formData.maintenanceId}
                    onChange={(e) => setFormData({ ...formData, maintenanceId: e.target.value })}
                    placeholder="e.g. 102"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Part Log ID</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
                    value={formData.partLogId}
                    onChange={(e) => setFormData({ ...formData, partLogId: e.target.value })}
                    placeholder="e.g. 202"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Fault / Service Description</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Rudder actuator pressure check and seal replacement"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Aircraft ID</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
                    value={formData.aircraftId}
                    onChange={(e) => setFormData({ ...formData, aircraftId: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Part ID to Deduct</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
                    value={formData.partId}
                    onChange={(e) => setFormData({ ...formData, partId: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Quantity Used</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
                    value={formData.quantityUsed}
                    onChange={(e) => setFormData({ ...formData, quantityUsed: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Total Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="w-full bg-slate-950 border border-slate-700 p-2 rounded text-white"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  />
                </div>
              </div>

              {formMsg.text && (
                <p className={`p-2 rounded text-xs ${formMsg.error ? 'bg-rose-950/60 text-rose-300' : 'bg-emerald-950/60 text-emerald-300'}`}>
                  {formMsg.text}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 rounded bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium"
                >
                  Commit Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
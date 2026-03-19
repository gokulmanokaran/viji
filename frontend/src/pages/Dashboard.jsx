import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboard, getBills } from '../services/api'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reportMonth, setReportMonth] = useState(new Date().toISOString().slice(0, 7))
  const [downloading, setDownloading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let ignore = false
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard()
        if (!ignore) setStats(res.data)
      } catch (err) {
        if (!ignore) toast.error('Failed to load dashboard')
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchDashboard()
    return () => { ignore = true }
  }, [])

  if (loading) return (
    <div className="loading"><div className="spinner" /> Loading...</div>
  )

  const handleDownload = async () => {
    if (!reportMonth) return toast.error('Please select a month')
    setDownloading(true)
    try {
      const year = parseInt(reportMonth.split('-')[0])
      const month = parseInt(reportMonth.split('-')[1])

      const startDate = new Date(year, month - 1, 1).toISOString()
      const endDate = new Date(year, month, 0, 23, 59, 59, 999).toISOString()

      const res = await getBills({ startDate, endDate })
      const bills = res.data

      if (bills.length === 0) {
        toast.error('No records found for this month')
        setDownloading(false)
        return
      }

      const headers = ['Date', 'Owner Name', 'Owner Phone', 'Cow Tag', 'Cow Breed', 'Diagnosis', 'Medicine Cost', 'Doctor Fee', 'Total Amount', 'Status']
      const rows = bills.map(b => [
        new Date(b.date).toLocaleDateString('en-IN'),
        `"${b.owner?.name || ''}"`,
        `"${b.owner?.phone || ''}"`,
        `"${b.cow?.tagNumber || ''}"`,
        `"${b.cow?.breed || ''}"`,
        `"${(b.visit?.diagnosis || '').replace(/"/g, '""')}"`,
        b.medicineCost || 0,
        b.doctorFee || 0,
        b.totalAmount || 0,
        b.status || ''
      ])

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `VetCare-Report-${reportMonth}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Report downloaded')
    } catch (err) {
      toast.error('Failed to generate report')
    } finally {
      setDownloading(false)
    }
  }


  return (
    <div>
      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">🩺</div>
          <div className="stat-info">
            <h3>{stats?.todayVisits ?? 0}</h3>
            <p>Today's Visits</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💰</div>
          <div className="stat-info">
            <h3>₹{(stats?.todayRevenue ?? 0).toLocaleString()}</h3>
            <p>Today's Revenue</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">📊</div>
          <div className="stat-info">
            <h3>₹{(stats?.totalRevenue ?? 0).toLocaleString()}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Recent Visits */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">📋 Recent Cases</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/visits')}>
            + New Visit
          </button>
        </div>

        {stats?.recentVisits?.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🐄</div>
            <p>No visits yet. Start by adding a new case.</p>
            <button className="btn btn-primary" onClick={() => navigate('/visits')}>
              + Add First Visit
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Owner</th>
                  <th>Cow Tag</th>
                  <th>Symptoms</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentVisits?.map((v) => (
                  <tr key={v._id}>
                    <td>{new Date(v.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{v.owner?.name}</div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>{v.owner?.phone}</div>
                    </td>
                    <td><span className="badge badge-blue">{v.cow?.tagNumber}</span></td>
                    <td style={{ maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {v.symptoms}
                      </div>
                    </td>
                    <td>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate('/visits')}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Links Group */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {[
          { label: 'Add New Owner', icon: '👨‍🌾', path: '/owners', color: '#eff6ff' },
          { label: 'Register Cow', icon: '🐄', path: '/cows', color: '#f0fdf4' },
          { label: 'New Visit / Case', icon: '🩺', path: '/visits', color: '#fff7ed' },
          { label: 'View Billing', icon: '💰', path: '/billing', color: '#faf5ff' },
        ].map((item) => (
          <button
            key={item.path}
            className="card"
            onClick={() => navigate(item.path)}
            style={{ cursor: 'pointer', textAlign: 'center', background: item.color, border: 'none' }}
          >
            <div style={{ fontSize: 28, marginBottom: 8 }}>{item.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</div>
          </button>
        ))}
      </div>

      {/* Reports & Quick Links */}
      <div className="dashboard-grid">

        {/* Reports Download Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>📦</span> Monthly Report
          </h2>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Export a full detailed CSV report of all bills, treatments, and revenues for a specific month.
          </p>
          <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', flexWrap: 'wrap' }}>
            <input
              type="month"
              className="form-control"
              style={{ flex: 1, minWidth: '140px' }}
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={handleDownload}
              disabled={downloading || !reportMonth}
            >
              {downloading ? '⏳...' : '📥 Download CSV'}
            </button>
          </div>
        </div>


      </div>
    </div>
  )
}

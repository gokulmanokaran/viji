import { useState, useEffect, useCallback } from 'react'
import { getBills, updateBill, getOwners } from '../services/api'
import toast from 'react-hot-toast'

export default function Billing() {
  const [bills, setBills] = useState([])
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterOwner, setFilterOwner] = useState('')
  const [detailBill, setDetailBill] = useState(null)

  const loadBills = useCallback(async () => {
    const params = {}
    if (filterDate) params.date = filterDate
    if (filterOwner) params.owner = filterOwner
    try {
      const res = await getBills(params)
      setBills(res.data)
    } catch { toast.error('Failed to load bills') }
    finally { setLoading(false) }
  }, [filterDate, filterOwner])

  useEffect(() => { loadBills() }, [loadBills])
  useEffect(() => { getOwners().then((r) => setOwners(r.data)) }, [])

  const togglePaid = async (bill) => {
    try {
      const res = await updateBill(bill._id, { paid: !bill.paid })
      setBills(bills.map((b) => b._id === bill._id ? res.data : b))
      toast.success(res.data.paid ? '✅ Marked as paid' : '❌ Marked as unpaid')
    } catch { toast.error('Update failed') }
  }

  const totalRevenue = bills.reduce((s, b) => s + b.totalAmount, 0)
  const paidRevenue = bills.filter((b) => b.paid).reduce((s, b) => s + b.totalAmount, 0)
  const unpaidRevenue = totalRevenue - paidRevenue

  // WhatsApp bill message
  const waMessage = (b) => encodeURIComponent(
    ` *VetCare Clinic - Bill*\n\nOwner: ${b.owner?.name}\nCow Tag: ${b.cow?.tagNumber}\nDate: ${new Date(b.date).toLocaleDateString('en-IN')}\n\nConsultation: ₹${b.consultationFee}\nMedicines: ₹${b.medicineCharges}\nOther: ₹${b.otherCharges}\n*Total: ₹${b.totalAmount}*\n\nThank you for visiting VetCare Clinic! `
  )

  return (
    <div>
      {/* Summary stats */}
      <div className="stats-grid" style={{ marginBottom: 16 }}>
        <div className="stat-card">
          <div className="stat-icon green">💰</div>
          <div className="stat-info">
            <h3>₹{totalRevenue.toLocaleString()}</h3>
            <p>Total ({bills.length} bills)</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">✅</div>
          <div className="stat-info">
            <h3>₹{paidRevenue.toLocaleString()}</h3>
            <p>Collected</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange">⏳</div>
          <div className="stat-info">
            <h3>₹{unpaidRevenue.toLocaleString()}</h3>
            <p>Pending</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-header" style={{ marginBottom: 16 }}>
        <div className="filter-bar">
          <input type="date" className="form-control" style={{ width: 'auto' }} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          <select className="form-control" style={{ width: 'auto', minWidth: 160 }} value={filterOwner} onChange={(e) => setFilterOwner(e.target.value)}>
            <option value="">All Owners</option>
            {owners.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
          </select>
          {(filterDate || filterOwner) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setFilterDate(''); setFilterOwner('') }}>✕ Clear</button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : bills.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <p>No bills found. Bills are auto-generated when you create a visit.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Owner</th>
                  <th>Cow</th>
                  <th>Consult.</th>
                  <th>Medicine</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.map((b) => (
                  <tr key={b._id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(b.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.owner?.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{b.owner?.phone}</div>
                    </td>
                    <td><span className="badge badge-blue">{b.cow?.tagNumber}</span></td>
                    <td>₹{b.consultationFee}</td>
                    <td>₹{b.medicineCharges}</td>
                    <td style={{ fontWeight: 700, color: '#1d4ed8' }}>₹{b.totalAmount.toLocaleString()}</td>
                    <td>
                      <button
                        className={`badge ${b.paid ? 'badge-green' : 'badge-orange'}`}
                        onClick={() => togglePaid(b)}
                        style={{ cursor: 'pointer', border: 'none' }}
                        title="Click to toggle payment status"
                      >
                        {b.paid ? '✅ Paid' : '⏳ Pending'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setDetailBill(b)}>👁️</button>
                        <a
                          className="btn btn-whatsapp btn-sm"
                          href={`https://wa.me/${b.owner?.phone?.replace(/[^0-9]/g, '')}?text=${waMessage(b)}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Send bill via WhatsApp"
                        >
                          📱
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Bill Detail Modal */}
      {detailBill && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetailBill(null)}>
          <div className="modal modal-sm">
            <div className="modal-header">
              <h2>🧾 Bill Details</h2>
              <button className="modal-close" onClick={() => setDetailBill(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 28 }}>🐄</div>
                <div style={{ fontWeight: 700, fontSize: 17 }}>VetCare Clinic</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>Date: {new Date(detailBill.date).toLocaleDateString('en-IN')}</div>
              </div>

              <div className="visit-detail-section">
                <div className="visit-detail-label">Owner</div>
                <div style={{ fontWeight: 600 }}>{detailBill.owner?.name}</div>
                <div style={{ color: '#64748b', fontSize: 12 }}>{detailBill.owner?.phone}</div>
              </div>
              <div className="visit-detail-section">
                <div className="visit-detail-label">Cow</div>
                <div style={{ fontWeight: 600 }}>{detailBill.cow?.tagNumber} - {detailBill.cow?.breed}</div>
              </div>

              {detailBill.visit?.symptoms && (
                <div className="visit-detail-section">
                  <div className="visit-detail-label">Diagnosis / Treatment</div>
                  <div style={{ fontSize: 13 }}>{detailBill.visit?.diagnosis || detailBill.visit?.symptoms}</div>
                </div>
              )}

              <div className="bill-summary">
                <div className="bill-row">
                  <span>Consultation Fee</span>
                  <span>₹{detailBill.consultationFee}</span>
                </div>
                <div className="bill-row">
                  <span>Medicine Charges</span>
                  <span>₹{detailBill.medicineCharges}</span>
                </div>
                {detailBill.otherCharges > 0 && (
                  <div className="bill-row">
                    <span>Other Charges</span>
                    <span>₹{detailBill.otherCharges}</span>
                  </div>
                )}
                <div className="bill-row total">
                  <span>Total</span>
                  <span>₹{detailBill.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: 12 }}>
                <span className={`badge ${detailBill.paid ? 'badge-green' : 'badge-red'}`} style={{ padding: '6px 16px' }}>
                  {detailBill.paid ? '✅ PAID' : '❌ UNPAID'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => togglePaid(detailBill)}>
                  {detailBill.paid ? '↩️ Mark Unpaid' : '✅ Mark Paid'}
                </button>
                <a
                  className="btn btn-whatsapp"
                  href={`https://wa.me/${detailBill.owner?.phone?.replace(/[^0-9]/g, '')}?text=${waMessage(detailBill)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  📱 Send via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

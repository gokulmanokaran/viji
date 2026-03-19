import { useState, useEffect, useCallback } from 'react'
import { getVisits, createVisit, deleteVisit, getOwners, getCows } from '../services/api'
import toast from 'react-hot-toast'

const emptyMed = { name: '', dosage: '', quantity: 1 }
const todayStr = () => new Date().toISOString().split('T')[0]

const emptyForm = {
  owner: '', cow: '', date: todayStr(), symptoms: '', diagnosis: '',
  treatment: '', medicines: [{ ...emptyMed }], notes: '', followUpDate: '',
  consultationFee: 200, medicineCharges: 0, otherCharges: 0,
}

export default function Visits() {
  const [visits, setVisits] = useState([])
  const [owners, setOwners] = useState([])
  const [cows, setCows] = useState([])
  const [filteredCows, setFilteredCows] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detailVisit, setDetailVisit] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filterDate, setFilterDate] = useState('')
  const [filterOwner, setFilterOwner] = useState('')

  const loadVisits = useCallback(async () => {
    const params = {}
    if (filterDate) params.date = filterDate
    if (filterOwner) params.owner = filterOwner
    try {
      const res = await getVisits(params)
      setVisits(res.data)
    } catch { toast.error('Failed to load visits') }
    finally { setLoading(false) }
  }, [filterDate, filterOwner])

  useEffect(() => { loadVisits() }, [loadVisits])

  useEffect(() => {
    getOwners().then((r) => setOwners(r.data))
    getCows().then((r) => setCows(r.data))
  }, [])

  // Filter cows by selected owner
  useEffect(() => {
    if (form.owner) {
      setFilteredCows(cows.filter((c) => c.owner?._id === form.owner))
      setForm((f) => ({ ...f, cow: '' }))
    } else {
      setFilteredCows(cows)
    }
  }, [form.owner, cows])

  const openAdd = () => { setForm(emptyForm); setModal(true) }
  const close = () => setModal(false)

  // Medicine handlers
  const addMed = () => setForm((f) => ({ ...f, medicines: [...f.medicines, { ...emptyMed }] }))
  const removeMed = (i) => setForm((f) => ({ ...f, medicines: f.medicines.filter((_, idx) => idx !== i) }))
  const updateMed = (i, field, val) => setForm((f) => {
    const meds = [...f.medicines]
    meds[i] = { ...meds[i], [field]: val }
    return { ...f, medicines: meds }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.owner || !form.cow || !form.symptoms) return toast.error('Owner, cow and symptoms are required')
    const validMeds = form.medicines.filter((m) => m.name.trim())
    setSaving(true)
    try {
      const res = await createVisit({ ...form, medicines: validMeds })
      setVisits([res.data.visit, ...visits])
      toast.success('Visit saved & bill generated! 🎉')
      close()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving visit')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this visit and its bill?')) return
    try {
      await deleteVisit(id)
      setVisits(visits.filter((v) => v._id !== id))
      toast.success('Visit deleted')
    } catch { toast.error('Delete failed') }
  }

  return (
    <div>
      {/* Filters */}
      <div className="card-header" style={{ marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div className="filter-bar">
          <input
            type="date"
            className="form-control"
            style={{ width: 'auto' }}
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: 160 }}
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
          >
            <option value="">All Owners</option>
            {owners.map((o) => <option key={o._id} value={o._id}>{o.name}</option>)}
          </select>
          {(filterDate || filterOwner) && (
            <button className="btn btn-secondary btn-sm" onClick={() => { setFilterDate(''); setFilterOwner('') }}>✕ Clear</button>
          )}
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ New Visit</button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : visits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🩺</div>
            <p>No visits found. Create a new case.</p>
            <button className="btn btn-primary" onClick={openAdd}>+ New Visit</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Owner</th>
                  <th>Cow</th>
                  <th>Symptoms</th>
                  <th>Diagnosis</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((v) => (
                  <tr key={v._id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(v.date).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{v.owner?.name}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>{v.owner?.phone}</div>
                    </td>
                    <td><span className="badge badge-blue">{v.cow?.tagNumber}</span><br /><span style={{ fontSize: 11, color: '#64748b' }}>{v.cow?.breed}</span></td>
                    <td style={{ maxWidth: 160 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.symptoms}</div>
                    </td>
                    <td style={{ maxWidth: 140, color: '#64748b', fontSize: 12 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.diagnosis || '—'}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setDetailVisit(v)}>👁️ View</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(v._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Visit Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>🩺 New Visit / Case</h2>
              <button className="modal-close" onClick={close}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {/* Basic Info */}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Owner <span className="req">*</span></label>
                    <select className="form-control" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>
                      <option value="">Select Owner</option>
                      {owners.map((o) => <option key={o._id} value={o._id}>{o.name} - {o.phone}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cow <span className="req">*</span></label>
                    <select className="form-control" value={form.cow} onChange={(e) => setForm({ ...form, cow: e.target.value })} disabled={!form.owner}>
                      <option value="">Select Cow</option>
                      {filteredCows.map((c) => <option key={c._id} value={c._id}>{c.tagNumber} - {c.breed}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-control" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>

                {/* Clinical */}
                <div className="form-group">
                  <label className="form-label">Symptoms <span className="req">*</span></label>
                  <textarea className="form-control" rows={2} value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} placeholder="Describe symptoms..." />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Diagnosis</label>
                    <textarea className="form-control" rows={2} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} placeholder="Diagnosis..." />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Treatment</label>
                    <textarea className="form-control" rows={2} value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} placeholder="Treatment given..." />
                  </div>
                </div>

                {/* Medicines */}
                <div className="form-group">
                  <div className="card-header" style={{ marginBottom: 8 }}>
                    <label className="form-label" style={{ margin: 0 }}>💊 Medicines</label>
                    <button type="button" className="btn btn-secondary btn-sm" onClick={addMed}>+ Add</button>
                  </div>
                  <div className="medicines-list">
                    {form.medicines.map((med, i) => (
                      <div key={i} className="medicine-row">
                        <input className="form-control" placeholder="Medicine name" value={med.name} onChange={(e) => updateMed(i, 'name', e.target.value)} />
                        <input className="form-control" placeholder="Dosage" value={med.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} />
                        <input className="form-control" type="number" min={1} placeholder="Qty" value={med.quantity} onChange={(e) => updateMed(i, 'quantity', e.target.value)} />
                        {form.medicines.length > 1 && (
                          <button type="button" className="btn btn-danger btn-sm btn-icon" onClick={() => removeMed(i)}>×</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes, follow-up instructions..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Follow-up Date</label>
                  <input type="date" className="form-control" value={form.followUpDate} onChange={(e) => setForm({ ...form, followUpDate: e.target.value })} />
                </div>

                {/* Billing */}
                <div style={{ background: '#f0f9ff', borderRadius: 8, padding: 16, marginTop: 8 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12, color: '#0369a1' }}>💰 Bill Details</div>
                  <div className="form-grid-3">
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Consultation Fee (₹)</label>
                      <input type="number" className="form-control" min={0} value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: Number(e.target.value) })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Medicine Charges (₹)</label>
                      <input type="number" className="form-control" min={0} value={form.medicineCharges} onChange={(e) => setForm({ ...form, medicineCharges: Number(e.target.value) })} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Other Charges (₹)</label>
                      <input type="number" className="form-control" min={0} value={form.otherCharges} onChange={(e) => setForm({ ...form, otherCharges: Number(e.target.value) })} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 700, fontSize: 16, color: '#1d4ed8' }}>
                    Total: ₹{(form.consultationFee + form.medicineCharges + form.otherCharges).toLocaleString()}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? '⏳ Saving...' : '💾 Save Visit & Generate Bill'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailVisit && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetailVisit(null)}>
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>🩺 Visit Details</h2>
              <button className="modal-close" onClick={() => setDetailVisit(null)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div className="visit-detail-section">
                  <div className="visit-detail-label">Owner</div>
                  <div className="visit-detail-value" style={{ fontWeight: 600 }}>{detailVisit.owner?.name}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{detailVisit.owner?.phone}</div>
                </div>
                <div className="visit-detail-section">
                  <div className="visit-detail-label">Cow</div>
                  <div className="visit-detail-value" style={{ fontWeight: 600 }}>{detailVisit.cow?.tagNumber}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{detailVisit.cow?.breed}</div>
                </div>
              </div>
              <div className="visit-detail-section">
                <div className="visit-detail-label">Date</div>
                <div className="visit-detail-value">{new Date(detailVisit.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
              <div className="visit-detail-section">
                <div className="visit-detail-label">Symptoms</div>
                <div className="visit-detail-value">{detailVisit.symptoms}</div>
              </div>
              {detailVisit.diagnosis && (
                <div className="visit-detail-section">
                  <div className="visit-detail-label">Diagnosis</div>
                  <div className="visit-detail-value">{detailVisit.diagnosis}</div>
                </div>
              )}
              {detailVisit.treatment && (
                <div className="visit-detail-section">
                  <div className="visit-detail-label">Treatment</div>
                  <div className="visit-detail-value">{detailVisit.treatment}</div>
                </div>
              )}
              {detailVisit.medicines?.length > 0 && (
                <div className="visit-detail-section">
                  <div className="visit-detail-label">Medicines</div>
                  {detailVisit.medicines.map((m, i) => (
                    <div key={i} className="visit-detail-value">
                      💊 {m.name} {m.dosage && `- ${m.dosage}`} × {m.quantity}
                    </div>
                  ))}
                </div>
              )}
              {detailVisit.notes && (
                <div className="visit-detail-section">
                  <div className="visit-detail-label">Notes</div>
                  <div className="visit-detail-value">{detailVisit.notes}</div>
                </div>
              )}

              {/* WhatsApp Button */}
              <div style={{ marginTop: 16 }}>
                <a
                  className="btn btn-whatsapp"
                  href={`https://wa.me/${detailVisit.owner?.phone?.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `🐄 *VetCare Clinic - Visit Summary*\n\nOwner: ${detailVisit.owner?.name}\nCow Tag: ${detailVisit.cow?.tagNumber} (${detailVisit.cow?.breed})\nDate: ${new Date(detailVisit.date).toLocaleDateString('en-IN')}\n\nSymptoms: ${detailVisit.symptoms}\nTreatment: ${detailVisit.treatment || 'N/A'}\n\n_Please follow the prescribed treatment. Contact us for queries._\n📞 VetCare Clinic`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  📱 Send Summary via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

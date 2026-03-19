import { useState, useEffect } from 'react'
import { getCows, createCow, updateCow, deleteCow, getOwners } from '../services/api'
import toast from 'react-hot-toast'

const BREEDS = ['Holstein', 'Jersey', 'Gir', 'Sahiwal', 'Murrah Buffalo', 'HF Cross', 'Tharparkar', 'Rathi', 'Kankrej', 'Other']
const emptyForm = { tagNumber: '', breed: '', age: '', gender: 'Female', owner: '', notes: '' }

export default function Cows() {
  const [cows, setCows] = useState([])
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterOwner, setFilterOwner] = useState('')
  const [modal, setModal] = useState(false)
  const [editCow, setEditCow] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const loadCows = async (owner = '') => {
    try {
      const res = await getCows(owner ? { owner } : {})
      setCows(res.data)
    } catch { toast.error('Failed to load cows') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    loadCows()
    getOwners().then((r) => setOwners(r.data))
  }, [])

  useEffect(() => { loadCows(filterOwner) }, [filterOwner])

  const openAdd = () => { setEditCow(null); setForm(emptyForm); setModal(true) }
  const openEdit = (c) => {
    setEditCow(c)
    setForm({ tagNumber: c.tagNumber, breed: c.breed, age: c.age, gender: c.gender, owner: c.owner?._id || '', notes: c.notes || '' })
    setModal(true)
  }
  const close = () => setModal(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.tagNumber || !form.breed || !form.age || !form.owner) return toast.error('Please fill all required fields')
    setSaving(true)
    try {
      if (editCow) {
        const res = await updateCow(editCow._id, form)
        setCows(cows.map((c) => c._id === editCow._id ? res.data : c))
        toast.success('Cow updated')
      } else {
        const res = await createCow(form)
        setCows([res.data, ...cows])
        toast.success('Cow registered')
      }
      close()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving cow')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this cow record?')) return
    try {
      await deleteCow(id)
      setCows(cows.filter((c) => c._id !== id))
      toast.success('Cow deleted')
    } catch { toast.error('Delete failed') }
  }

  return (
    <div>
      <div className="card-header" style={{ marginBottom: 16 }}>
        <div className="filter-bar">
          <select
            className="form-control"
            style={{ width: 'auto', minWidth: 180 }}
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
          >
            <option value="">All Owners</option>
            {owners.map((o) => <option key={o._id} value={o._id}>{o.name} - {o.phone}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Register Cow</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : cows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🐄</div>
            <p>No cows registered. Add a cow to get started.</p>
            <button className="btn btn-primary" onClick={openAdd}>+ Register Cow</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Tag #</th>
                  <th>Breed</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Owner</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cows.map((c) => (
                  <tr key={c._id}>
                    <td><span className="badge badge-blue">{c.tagNumber}</span></td>
                    <td style={{ fontWeight: 500 }}>{c.breed}</td>
                    <td>{c.age} yr{c.age !== 1 ? 's' : ''}</td>
                    <td>
                      <span className={`badge ${c.gender === 'Female' ? 'badge-green' : 'badge-blue'}`}>
                        {c.gender === 'Female' ? '♀' : '♂'} {c.gender}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{c.owner?.name}</div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>{c.owner?.phone}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>✏️</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && close()}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editCow ? '✏️ Edit Cow' : '🐄 Register Cow'}</h2>
              <button className="modal-close" onClick={close}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Tag Number <span className="req">*</span></label>
                    <input className="form-control" value={form.tagNumber} onChange={(e) => setForm({ ...form, tagNumber: e.target.value })} placeholder="e.g. COW-001" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select className="form-control" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                      <option>Female</option>
                      <option>Male</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Breed <span className="req">*</span></label>
                    <select className="form-control" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })}>
                      <option value="">Select Breed</option>
                      {BREEDS.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Age (years) <span className="req">*</span></label>
                    <input className="form-control" type="number" min="0" max="30" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} placeholder="e.g. 4" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Owner <span className="req">*</span></label>
                  <select className="form-control" value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })}>
                    <option value="">Select Owner</option>
                    {owners.map((o) => <option key={o._id} value={o._id}>{o.name} - {o.phone}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any additional notes..." />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? '⏳ Saving...' : editCow ? 'Update Cow' : 'Register Cow'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { getOwners, createOwner, updateOwner, deleteOwner } from '../services/api'
import toast from 'react-hot-toast'

const emptyForm = { name: '', phone: '', address: '' }

export default function Owners() {
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(false)
  const [editOwner, setEditOwner] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = async (q = '') => {
    try {
      const res = await getOwners(q ? { search: q } : {})
      setOwners(res.data)
    } catch { toast.error('Failed to load owners') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => load(search), 400)
    return () => clearTimeout(t)
  }, [search])

  const openAdd = () => { setEditOwner(null); setForm(emptyForm); setModal(true) }
  const openEdit = (o) => { setEditOwner(o); setForm({ name: o.name, phone: o.phone, address: o.address || '' }); setModal(true) }
  const close = () => setModal(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.phone) return toast.error('Name and phone are required')
    setSaving(true)
    try {
      if (editOwner) {
        const res = await updateOwner(editOwner._id, form)
        setOwners(owners.map((o) => o._id === editOwner._id ? res.data : o))
        toast.success('Owner updated')
      } else {
        const res = await createOwner(form)
        setOwners([res.data, ...owners])
        toast.success('Owner added')
      }
      close()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving owner')
    } finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this owner?')) return
    try {
      await deleteOwner(id)
      setOwners(owners.filter((o) => o._id !== id))
      toast.success('Owner deleted')
    } catch { toast.error('Delete failed') }
  }

  return (
    <div>
      {/* Header */}
      <div className="card-header" style={{ marginBottom: 16 }}>
        <div className="filter-bar">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Owner</button>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading"><div className="spinner" /> Loading...</div>
        ) : owners.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👨‍🌾</div>
            <p>No owners found. Add your first owner.</p>
            <button className="btn btn-primary" onClick={openAdd}>+ Add Owner</button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {owners.map((o, i) => (
                  <tr key={o._id}>
                    <td style={{ color: '#94a3b8' }}>{i + 1}</td>
                    <td style={{ fontWeight: 500 }}>{o.name}</td>
                    <td>
                      <a href={`tel:${o.phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        📞 {o.phone}
                      </a>
                    </td>
                    <td style={{ color: '#64748b' }}>{o.address || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(o)}>✏️ Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o._id)}>🗑️</button>
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
          <div className="modal modal-sm">
            <div className="modal-header">
              <h2>{editOwner ? '✏️ Edit Owner' : '👨‍🌾 Add Owner'}</h2>
              <button className="modal-close" onClick={close}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Name <span className="req">*</span></label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Owner's full name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone <span className="req">*</span></label>
                  <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit phone number" type="tel" />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input className="form-control" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Village / Address" />
                </div>
                <div className="form-actions">
                  <button type="button" className="btn btn-secondary" onClick={close}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? '⏳ Saving...' : editOwner ? 'Update' : 'Add Owner'}
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

import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { setAuthToken, fetchCV, createCV, updateCV, deleteCV, fetchCertifications, createCertification, updateCertification, deleteCertification } from '../lib/api'

// Resources Management Component (CV & Certifications)
export default function ResourcesTab(){
  const { token } = useContext(AuthContext)
  const [cv, setCv] = useState(null)
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [cvForm, setCvForm] = useState({ file: null, title: 'CV', is_active: true })
  const [certForm, setCertForm] = useState({ file: null, title: '', issuer: '', issue_date: '', expiry_date: '', is_published: true, order: 0 })
  const [editCert, setEditCert] = useState(null)
  const [toasts, setToasts] = useState([])

  function addToast(message, kind='info'){
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, kind }])
    setTimeout(()=> setToasts(t => t.filter(x=>x.id !== id)), 5000)
  }

  useEffect(() => {
    if (token) {
      setAuthToken(token) // Ensure token is set in API instance
      loadCV()
      loadCertifications()
    }
  }, [token])

  async function loadCV(){
    setLoading(true)
    try{
      const data = await fetchCV()
      setCv(data)
    }catch(err){
      console.error('Error loading CV:', err)
      addToast('Failed to load CV', 'error')
    }
    setLoading(false)
  }

  async function loadCertifications(){
    try{
      const data = await fetchCertifications()
      setCertifications(Array.isArray(data) ? data : (data.results || []))
    }catch(err){
      console.error('Error loading certifications:', err)
      addToast('Failed to load certifications', 'error')
      setCertifications([])
    }
  }

  async function handleUploadCV(e){
    e.preventDefault()
    if (!cvForm.file && !cv) {
      addToast('Please select a file', 'error')
      return
    }
    if (!token) {
      addToast('You must be logged in to upload CV', 'error')
      return
    }
    // Ensure token is set before making the request
    setAuthToken(token)
    try{
      if (cv) {
        await updateCV(cv.id, cvForm)
        addToast('CV updated successfully', 'success')
      } else {
        await createCV(cvForm)
        addToast('CV uploaded successfully', 'success')
      }
      setCvForm({ file: null, title: 'CV', is_active: true })
      loadCV()
    }catch(err){
      console.error('CV upload error:', err)
      if (err.response?.status === 401) {
        addToast('Authentication failed. Please log in again.', 'error')
      } else {
        addToast(err.message || 'Failed to upload CV', 'error')
      }
    }
  }

  async function handleDeleteCV(){
    if (!cv) return
    if (!confirm('Are you sure you want to delete this CV?')) return
    if (!token) {
      addToast('You must be logged in to delete CV', 'error')
      return
    }
    // Ensure token is set before making the request
    setAuthToken(token)
    try{
      await deleteCV(cv.id)
      addToast('CV deleted successfully', 'success')
      setCv(null)
      loadCV()
    }catch(err){
      console.error('CV delete error:', err)
      if (err.response?.status === 401) {
        addToast('Authentication failed. Please log in again.', 'error')
      } else {
        addToast('Failed to delete CV', 'error')
      }
    }
  }

  async function handleCreateCert(e){
    e.preventDefault()
    if (!certForm.file) {
      addToast('Please select a file', 'error')
      return
    }
    if (!token) {
      addToast('You must be logged in to upload certifications', 'error')
      return
    }
    // Ensure token is set before making the request
    setAuthToken(token)
    try{
      await createCertification(certForm)
      addToast('Certification uploaded successfully', 'success')
      setCertForm({ file: null, title: '', issuer: '', issue_date: '', expiry_date: '', is_published: true, order: 0 })
      loadCertifications()
    }catch(err){
      console.error('Certification upload error:', err)
      if (err.response?.status === 401) {
        addToast('Authentication failed. Please log in again.', 'error')
      } else {
        addToast(err.message || 'Failed to upload certification', 'error')
      }
    }
  }

  async function handleUpdateCert(e){
    e.preventDefault()
    if (!editCert) return
    if (!token) {
      addToast('You must be logged in to update certifications', 'error')
      return
    }
    // Ensure token is set before making the request
    setAuthToken(token)
    try{
      await updateCertification(editCert.id, certForm)
      addToast('Certification updated successfully', 'success')
      setEditCert(null)
      setCertForm({ file: null, title: '', issuer: '', issue_date: '', expiry_date: '', is_published: true, order: 0 })
      loadCertifications()
    }catch(err){
      console.error('Certification update error:', err)
      if (err.response?.status === 401) {
        addToast('Authentication failed. Please log in again.', 'error')
      } else {
        addToast(err.message || 'Failed to update certification', 'error')
      }
    }
  }

  async function handleDeleteCert(id){
    if (!confirm('Are you sure you want to delete this certification?')) return
    if (!token) {
      addToast('You must be logged in to delete certifications', 'error')
      return
    }
    // Ensure token is set before making the request
    setAuthToken(token)
    try{
      await deleteCertification(id)
      addToast('Certification deleted successfully', 'success')
      loadCertifications()
    }catch(err){
      console.error('Certification delete error:', err)
      if (err.response?.status === 401) {
        addToast('Authentication failed. Please log in again.', 'error')
      } else {
        addToast('Failed to delete certification', 'error')
      }
    }
  }

  function openEditCert(cert){
    setEditCert(cert)
    setCertForm({ 
      file: null, 
      title: cert.title || '', 
      issuer: cert.issuer || '', 
      issue_date: cert.issue_date || '', 
      expiry_date: cert.expiry_date || '', 
      is_published: cert.is_published,
      order: cert.order || 0
    })
  }

  return (
    <>
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.kind}`}>
            {toast.kind === 'success' && '✓ '}
            {toast.kind === 'error' && '✕ '}
            {toast.message}
          </div>
        ))}
      </div>

      {/* CV Section */}
      <div className="content-card">
        <h2>CV / Resume</h2>
        <p className="muted" style={{marginBottom: '1rem'}}>Upload your CV. Only one active CV will be displayed publicly.</p>
        {cv && (
          <div className="item-card" style={{marginBottom: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)'}}>
            <div className="item-info">
              <div className="item-title">{cv.title || 'CV'}</div>
              <div className="item-meta">
                {cv.is_active ? '✓ Active' : 'Inactive'} | Uploaded: {new Date(cv.uploaded_at).toLocaleDateString()}
              </div>
            </div>
            {cv.file_url && (
              <a href={cv.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{marginTop: '0.5rem'}}>
                View Current CV
              </a>
            )}
          </div>
        )}
        <form onSubmit={handleUploadCV}>
          <div className="form-grid">
            <div className="form-group">
              <label>Title</label>
              <input 
                value={cvForm.title} 
                onChange={e=>setCvForm({...cvForm, title: e.target.value})}
                placeholder="e.g., My CV"
              />
            </div>
            <div className="form-group">
              <label>PDF File {!cv && '*'}</label>
              <input 
                type="file" 
                accept=".pdf"
                onChange={e=>setCvForm({...cvForm, file: e.target.files[0]})}
                required={!cv}
              />
              {cv && (
                <p className="muted" style={{fontSize: '0.875rem', marginTop: '0.25rem'}}>
                  Leave empty to keep current file
                </p>
              )}
            </div>
          </div>
          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                checked={cvForm.is_active} 
                onChange={e=>setCvForm({...cvForm, is_active: e.target.checked})}
              />
              <label>Set as active CV</label>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              {cv ? 'Update CV' : 'Upload CV'}
            </button>
            {cv && (
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={handleDeleteCV}
              >
                Delete CV
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Certifications Section */}
      <div className="content-card">
        <h2>{editCert ? 'Edit Certification' : 'Add New Certification'}</h2>
        <form onSubmit={editCert ? handleUpdateCert : handleCreateCert}>
          <div className="form-grid">
            <div className="form-group">
              <label>Title *</label>
              <input 
                required 
                value={certForm.title} 
                onChange={e=>setCertForm({...certForm, title: e.target.value})}
                placeholder="e.g., AWS Certified Solutions Architect"
              />
            </div>
            <div className="form-group">
              <label>Issuer</label>
              <input 
                value={certForm.issuer} 
                onChange={e=>setCertForm({...certForm, issuer: e.target.value})}
                placeholder="e.g., Amazon Web Services"
              />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Issue Date</label>
              <input 
                type="date" 
                value={certForm.issue_date} 
                onChange={e=>setCertForm({...certForm, issue_date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Expiry Date (if applicable)</label>
              <input 
                type="date" 
                value={certForm.expiry_date} 
                onChange={e=>setCertForm({...certForm, expiry_date: e.target.value})}
              />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>PDF File *</label>
              <input 
                type="file" 
                accept=".pdf"
                onChange={e=>setCertForm({...certForm, file: e.target.files[0]})}
                required={!editCert}
              />
            </div>
            <div className="form-group">
              <label>Display Order</label>
              <input 
                type="number" 
                value={certForm.order} 
                onChange={e=>setCertForm({...certForm, order: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                checked={certForm.is_published} 
                onChange={e=>setCertForm({...certForm, is_published: e.target.checked})}
              />
              <label>Published</label>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              {editCert ? 'Update Certification' : 'Add Certification'}
            </button>
            {editCert && (
              <button type="button" className="btn btn-secondary" onClick={() => {
                setEditCert(null)
                setCertForm({ file: null, title: '', issuer: '', issue_date: '', expiry_date: '', is_published: true, order: 0 })
              }}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="content-card">
        <h2>Manage Certifications ({certifications.length})</h2>
        {loading ? (
          <div className="loading">Loading certifications...</div>
        ) : certifications.length === 0 ? (
          <div className="empty-state">No certifications yet. Add your first one above!</div>
        ) : (
          <div className="items-list">
            {certifications.map(cert => (
              <div key={cert.id} className="item-card">
                <div className="item-info">
                  <div className="item-title">{cert.title}</div>
                  <div className="item-meta">
                    {cert.issuer && `Issuer: ${cert.issuer} | `}
                    {cert.issue_date && `Issued: ${new Date(cert.issue_date).toLocaleDateString()} | `}
                    {cert.expiry_date && `Expires: ${new Date(cert.expiry_date).toLocaleDateString()} | `}
                    Order: {cert.order} | {cert.is_published ? 'Published' : 'Draft'}
                  </div>
                </div>
                <div className="item-actions">
                  {cert.file_url && (
                    <a href={cert.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      View
                    </a>
                  )}
                  <button className="btn btn-warning" onClick={()=>openEditCert(cert)}>Edit</button>
                  <button className="btn btn-danger" onClick={()=>handleDeleteCert(cert.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}


import React, { useState, useEffect } from 'react'
import { fetchProjectsForSale, createProjectForSale, updateProjectForSale, deleteProjectForSale } from '../lib/api'

export default function ProjectsForSaleTab() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ 
    title: '', 
    description: '', 
    price: '', 
    whatsapp_url: '', 
    live_url: '',
    image: null,
    is_published: true 
  })
  const [status, setStatus] = useState(null)
  const [edit, setEdit] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editStatus, setEditStatus] = useState(null)

  // Load all projects
  useEffect(() => {
    loadProjects()
  }, [])

  async function loadProjects() {
    try {
      setLoading(true)
      const data = await fetchProjectsForSale()
      // For admin, we want to see all projects including unpublished
      setProjects(data.results || [])
    } catch (err) {
      setStatus({ message: 'Failed to load projects', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e) {
    e.preventDefault()
    if (!form.title.trim()) {
      setStatus({ message: 'Title is required', type: 'error' })
      return
    }

    try {
      setStatus({ message: 'Creating project...', type: 'info' })
      const formData = new FormData()
      formData.append('title', form.title)
      formData.append('description', form.description)
      formData.append('price', form.price || '0')
      formData.append('whatsapp_url', form.whatsapp_url)
      formData.append('live_url', form.live_url)
      formData.append('is_published', form.is_published)
      if (form.image) {
        formData.append('image', form.image)
      }

      const result = await createProjectForSale(formData)
      setStatus({ message: 'Project created successfully!', type: 'success' })
      setForm({ title: '', description: '', price: '', whatsapp_url: '', live_url: '', image: null, is_published: true })
      await loadProjects()
    } catch (err) {
      setStatus({ message: err.message || 'Failed to create project', type: 'error' })
    }
  }

  function openEdit(project) {
    setEdit(project)
    setEditForm({
      title: project.title,
      description: project.description,
      price: project.price || '',
      whatsapp_url: project.whatsapp_url || '',
      live_url: project.live_url || '',
      image: null,
      is_published: project.is_published
    })
    setEditStatus(null)
  }

  async function handleUpdate(e) {
    e.preventDefault()
    if (!edit) return

    try {
      setEditStatus({ message: 'Updating...', type: 'info' })
      const formData = new FormData()
      formData.append('title', editForm.title)
      formData.append('description', editForm.description)
      formData.append('price', editForm.price || '0')
      formData.append('whatsapp_url', editForm.whatsapp_url)
      formData.append('live_url', editForm.live_url)
      formData.append('is_published', editForm.is_published)
      if (editForm.image) {
        formData.append('image', editForm.image)
      }

      await updateProjectForSale(edit.slug, formData)
      setEditStatus({ message: 'Project updated!', type: 'success' })
      setEdit(null)
      await loadProjects()
    } catch (err) {
      setEditStatus({ message: err.message || 'Failed to update', type: 'error' })
    }
  }

  async function handleDelete(slug) {
    if (!window.confirm('Delete this project?')) return
    try {
      await deleteProjectForSale(slug)
      setStatus({ message: 'Project deleted', type: 'success' })
      await loadProjects()
    } catch (err) {
      setStatus({ message: 'Failed to delete', type: 'error' })
    }
  }

  return (
    <>
      {/* Create Form */}
      {!edit && (
        <div className="content-card">
          <h2>Create New Project for Sale</h2>
          {status && (
            <div className={`status-message status-${status.type}`}>
              {status.message}
            </div>
          )}
          <form onSubmit={handleCreate}>
            <div className="form-grid">
              <div className="form-group">
                <label>Title *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Project title"
                />
              </div>
              <div className="form-group">
                <label>Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Project description"
                rows="4"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>WhatsApp URL</label>
                <input
                  value={form.whatsapp_url}
                  onChange={(e) => setForm({ ...form, whatsapp_url: e.target.value })}
                  placeholder="https://wa.me/..."
                />
              </div>
              <div className="form-group">
                <label>Live URL / Demo</label>
                <input
                  value={form.live_url}
                  onChange={(e) => setForm({ ...form, live_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="form-group">
              <label>Project Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                />
                Publish
              </label>
            </div>

            <button type="submit" className="btn btn-primary">
              Create Project
            </button>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {edit && (
        <div className="content-card">
          <h2>Edit Project: {edit.title}</h2>
          {editStatus && (
            <div className={`status-message status-${editStatus.type}`}>
              {editStatus.message}
            </div>
          )}
          <form onSubmit={handleUpdate}>
            <div className="form-grid">
              <div className="form-group">
                <label>Title *</label>
                <input
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editForm.price}
                  onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows="4"
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>WhatsApp URL</label>
                <input
                  value={editForm.whatsapp_url}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp_url: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Live URL / Demo</label>
                <input
                  value={editForm.live_url}
                  onChange={(e) => setEditForm({ ...editForm, live_url: e.target.value })}
                />
              </div>
            </div>

            {edit.image && (
              <div className="form-group">
                <p>Current image:</p>
                <img src={edit.image} alt={edit.title} style={{ maxWidth: '200px', marginBottom: '1rem' }} />
              </div>
            )}

            <div className="form-group">
              <label>Update Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditForm({ ...editForm, image: e.target.files[0] })}
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={editForm.is_published}
                  onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                />
                Publish
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Update Project
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setEdit(null)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {!edit && (
        <div className="content-card">
          <h2>Projects for Sale ({projects.length})</h2>
          {loading ? (
            <p>Loading projects...</p>
          ) : projects.length === 0 ? (
            <p>No projects yet. Create one above!</p>
          ) : (
            <div className="items-list">
              {projects.map((project) => (
                <div key={project.id} className="item">
                  {project.image && (
                    <img src={project.image} alt={project.title} className="item-image" />
                  )}
                  <div className="item-content">
                    <div className="item-title">{project.title}</div>
                    <div className="item-meta">
                      {project.description && <p>{project.description.substring(0, 100)}</p>}
                      Price: ${project.price || '0'} | {project.is_published ? 'Published' : 'Draft'}
                    </div>
                  </div>
                  <div className="item-actions">
                    <button className="btn btn-warning" onClick={() => openEdit(project)}>
                      Edit
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDelete(project.slug)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

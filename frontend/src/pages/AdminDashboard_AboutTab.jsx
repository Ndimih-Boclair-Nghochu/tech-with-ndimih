import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { setAuthToken, fetchAbout, createAbout, updateAbout } from '../lib/api'

export default function AboutTab(){
  const { token } = useContext(AuthContext)
  const [about, setAbout] = useState(null)
  const [loading, setLoading] = useState(false)
  const [aboutForm, setAboutForm] = useState({
    name: '',
    title: '',
    profile_image: null,
    bio: '',
    long_description: '',
    location: '',
    email: '',
    website: '',
    linkedin_url: '',
    github_url: '',
    twitter_url: '',
    resume_url: '',
    is_published: true
  })
  const [toasts, setToasts] = useState([])

  function addToast(message, kind='info'){
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, kind }])
    setTimeout(()=> setToasts(t => t.filter(x=>x.id !== id)), 5000)
  }

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      loadAbout()
    }
  }, [token])

  async function loadAbout(){
    setLoading(true)
    try{
      const data = await fetchAbout()
      if (data) {
        setAbout(data)
        setAboutForm({
          name: data.name || '',
          title: data.title || '',
          profile_image: null,
          bio: data.bio || '',
          long_description: data.long_description || '',
          location: data.location || '',
          email: data.email || '',
          website: data.website || '',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          twitter_url: data.twitter_url || '',
          resume_url: data.resume_url || '',
          is_published: data.is_published !== undefined ? data.is_published : true
        })
      }
    }catch(err){
      console.error('Error loading about:', err)
      addToast('Failed to load about page: ' + (err.message || 'Check backend connection'), 'error')
    }
    setLoading(false)
  }

  async function handleSubmit(e){
    e.preventDefault()
    if (!token) {
      addToast('You must be logged in to save about page', 'error')
      return
    }
    setAuthToken(token)
    setLoading(true)
    try{
      if (about) {
        await updateAbout(about.id, aboutForm)
        addToast('About page updated successfully', 'success')
      } else {
        await createAbout(aboutForm)
        addToast('About page created successfully', 'success')
      }
      loadAbout()
    }catch(err){
      console.error('About save error:', err)
      if (err.response?.status === 401) {
        addToast('Authentication failed. Please log in again.', 'error')
      } else {
        addToast(err.message || 'Failed to save about page', 'error')
      }
    }
    setLoading(false)
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

      <div className="content-card">
        <h2>About Page Content</h2>
        <p className="muted mb-4" style={{fontSize: '0.875rem'}}>
          Manage your about page content. Upload a profile picture and fill in your information.
          <strong> Note: Only one About page can exist at a time.</strong>
        </p>

        {loading && !about && (
          <div className="loading">Loading about page...</div>
        )}

        {about && (
          <div className="mb-4 p-4 glass rounded-lg border border-blue-500/10">
            <div className="text-sm text-gray-300">
              <strong>Current Status:</strong> {about.is_published ? 'Published' : 'Draft'} | 
              Last updated: {new Date(about.updated_at).toLocaleDateString()}
            </div>
            {about.profile_image_url && (
              <div className="mt-2">
                <strong className="text-sm text-gray-300">Current Profile Image:</strong>
                <img 
                  src={about.profile_image_url} 
                  alt="Profile" 
                  style={{maxWidth: '100px', maxHeight: '100px', borderRadius: '8px', marginTop: '0.5rem'}}
                />
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                required
                value={aboutForm.name}
                onChange={e => setAboutForm({ ...aboutForm, name: e.target.value })}
                placeholder="e.g., John Doe"
              />
            </div>
            <div className="form-group">
              <label>Professional Title *</label>
              <input
                required
                value={aboutForm.title}
                onChange={e => setAboutForm({ ...aboutForm, title: e.target.value })}
                placeholder="e.g., Full Stack Developer"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setAboutForm({ ...aboutForm, profile_image: e.target.files[0] })}
            />
            <p className="text-sm text-gray-400 mt-1">
              Upload your profile picture here. Recommended: Square image, at least 400x400px.
            </p>
            {about?.profile_image_url && !aboutForm.profile_image && (
              <p className="text-sm text-gray-400 mt-1">
                Current image will be kept if no new file is selected.
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Short Bio *</label>
            <textarea
              required
              rows={4}
              value={aboutForm.bio}
              onChange={e => setAboutForm({ ...aboutForm, bio: e.target.value })}
              placeholder="A brief introduction about yourself..."
            />
          </div>

          <div className="form-group">
            <label>Long Description</label>
            <textarea
              rows={8}
              value={aboutForm.long_description}
              onChange={e => setAboutForm({ ...aboutForm, long_description: e.target.value })}
              placeholder="Detailed information about yourself, your experience, skills, etc. You can use line breaks for formatting."
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Location</label>
              <input
                value={aboutForm.location}
                onChange={e => setAboutForm({ ...aboutForm, location: e.target.value })}
                placeholder="e.g., New York, NY"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={aboutForm.email}
                onChange={e => setAboutForm({ ...aboutForm, email: e.target.value })}
                placeholder="your.email@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Website URL</label>
            <input
              type="url"
              value={aboutForm.website}
              onChange={e => setAboutForm({ ...aboutForm, website: e.target.value })}
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>LinkedIn URL</label>
              <input
                type="url"
                value={aboutForm.linkedin_url}
                onChange={e => setAboutForm({ ...aboutForm, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>
            <div className="form-group">
              <label>GitHub URL</label>
              <input
                type="url"
                value={aboutForm.github_url}
                onChange={e => setAboutForm({ ...aboutForm, github_url: e.target.value })}
                placeholder="https://github.com/yourusername"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Twitter/X URL</label>
              <input
                type="url"
                value={aboutForm.twitter_url}
                onChange={e => setAboutForm({ ...aboutForm, twitter_url: e.target.value })}
                placeholder="https://twitter.com/yourusername"
              />
            </div>
            <div className="form-group">
              <label>Resume/CV URL</label>
              <input
                type="url"
                value={aboutForm.resume_url}
                onChange={e => setAboutForm({ ...aboutForm, resume_url: e.target.value })}
                placeholder="https://yourresume.com or link to CV"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                checked={aboutForm.is_published}
                onChange={e => setAboutForm({ ...aboutForm, is_published: e.target.checked })}
              />
              <label>Published (visible on public About page)</label>
            </div>
          </div>

          <div className="btn-group">
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading && <span className="spinner"></span>}
              {loading ? 'Saving...' : (about ? 'Update About Page' : 'Create About Page')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}


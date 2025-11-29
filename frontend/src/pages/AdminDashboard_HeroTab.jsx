import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { setAuthToken, fetchHero, createHero, updateHero } from '../lib/api'

export default function HeroTab(){
  const { token } = useContext(AuthContext)
  const [hero, setHero] = useState(null)
  const [loading, setLoading] = useState(false)
  const [heroForm, setHeroForm] = useState({
    greeting: 'Hi — I design & operate cloud-first apps',
    typing_prefix: 'I am',
    typing_strings: 'Cloud Engineer\nWeb Developer\nGraphics & Logo Designer',
    main_title: 'Building Cloud-Powered Digital Experiences That Scale',
    button1_text: 'Hire me',
    button1_link: '#contact',
    button2_text: 'View portfolio',
    button2_link: '/portfolio',
    background_video: null,
    background_image: null,
    scroll_text: 'Scroll to explore',
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
      loadHero()
    }
  }, [token])

  async function loadHero(){
    setLoading(true)
    try{
      const data = await fetchHero()
      if (data) {
        setHero(data)
        setHeroForm({
          greeting: data.greeting || '',
          typing_prefix: data.typing_prefix || 'I am',
          typing_strings: data.typing_strings || '',
          main_title: data.main_title || '',
          button1_text: data.button1_text || '',
          button1_link: data.button1_link || '',
          button2_text: data.button2_text || '',
          button2_link: data.button2_link || '',
          background_video: null,
          background_image: null,
          scroll_text: data.scroll_text || '',
          is_published: data.is_published !== undefined ? data.is_published : true
        })
      }
    }catch(err){
      console.error('Error loading hero:', err)
      // Don't show error if no hero exists yet
      if (err.response?.status !== 404) {
        addToast('Failed to load hero: ' + (err.message || 'Check backend connection'), 'error')
      }
    }
    setLoading(false)
  }

  async function handleSubmit(e){
    e.preventDefault()
    if (!token) {
      addToast('You must be logged in to save hero', 'error')
      return
    }
    setAuthToken(token)
    setLoading(true)
    try{
      if (hero) {
        await updateHero(hero.id, heroForm)
        addToast('Hero section updated successfully', 'success')
      } else {
        await createHero(heroForm)
        addToast('Hero section created successfully', 'success')
      }
      loadHero()
    }catch(err){
      console.error('Hero save error:', err)
      if (err.response?.status === 401) {
        addToast('Authentication failed. Please log in again.', 'error')
      } else {
        addToast(err.message || 'Failed to save hero section', 'error')
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
        <h2>Hero Section Content</h2>
        <p className="muted mb-4" style={{fontSize: '0.875rem'}}>
          Manage your hero section (the main banner on the homepage). Edit text, buttons, and upload background media.
          <strong> Note: Only one Hero section can exist at a time.</strong>
        </p>

        {loading && !hero && (
          <div className="loading">Loading hero section...</div>
        )}

        {hero && (
          <div className="mb-4 p-4 glass rounded-lg border border-blue-500/10">
            <div className="text-sm text-gray-300">
              <strong>Current Status:</strong> {hero.is_published ? 'Published' : 'Draft'} | 
              Last updated: {new Date(hero.updated_at).toLocaleDateString()}
            </div>
            {hero.background_video_url && (
              <div className="mt-2">
                <strong className="text-sm text-gray-300">Current Background Video:</strong>
                <video 
                  src={hero.background_video_url} 
                  style={{maxWidth: '200px', maxHeight: '100px', borderRadius: '8px', marginTop: '0.5rem'}}
                  controls
                  muted
                />
              </div>
            )}
            {hero.background_image_url && !hero.background_video_url && (
              <div className="mt-2">
                <strong className="text-sm text-gray-300">Current Background Image:</strong>
                <img 
                  src={hero.background_image_url} 
                  alt="Background" 
                  style={{maxWidth: '200px', maxHeight: '100px', borderRadius: '8px', marginTop: '0.5rem', objectFit: 'cover'}}
                />
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Greeting Text *</label>
            <input
              required
              value={heroForm.greeting}
              onChange={e => setHeroForm({ ...heroForm, greeting: e.target.value })}
              placeholder="e.g., Hi — I design & operate cloud-first apps"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Typing Prefix *</label>
              <input
                required
                value={heroForm.typing_prefix}
                onChange={e => setHeroForm({ ...heroForm, typing_prefix: e.target.value })}
                placeholder="e.g., I am"
              />
            </div>
            <div className="form-group">
              <label>Typing Strings *</label>
              <textarea
                required
                rows={4}
                value={heroForm.typing_strings}
                onChange={e => setHeroForm({ ...heroForm, typing_strings: e.target.value })}
                placeholder="One per line or comma-separated:&#10;Cloud Engineer&#10;Web Developer&#10;Graphics & Logo Designer"
              />
              <p className="text-sm text-gray-400 mt-1">
                Enter strings for the typing animation, one per line or separated by commas.
              </p>
            </div>
          </div>

          <div className="form-group">
            <label>Main Title *</label>
            <input
              required
              value={heroForm.main_title}
              onChange={e => setHeroForm({ ...heroForm, main_title: e.target.value })}
              placeholder="e.g., Building Cloud-Powered Digital Experiences That Scale"
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Button 1 Text *</label>
              <input
                required
                value={heroForm.button1_text}
                onChange={e => setHeroForm({ ...heroForm, button1_text: e.target.value })}
                placeholder="e.g., Hire me"
              />
            </div>
            <div className="form-group">
              <label>Button 1 Link *</label>
              <input
                required
                value={heroForm.button1_link}
                onChange={e => setHeroForm({ ...heroForm, button1_link: e.target.value })}
                placeholder="e.g., #contact or /contact"
              />
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Button 2 Text *</label>
              <input
                required
                value={heroForm.button2_text}
                onChange={e => setHeroForm({ ...heroForm, button2_text: e.target.value })}
                placeholder="e.g., View portfolio"
              />
            </div>
            <div className="form-group">
              <label>Button 2 Link *</label>
              <input
                required
                value={heroForm.button2_link}
                onChange={e => setHeroForm({ ...heroForm, button2_link: e.target.value })}
                placeholder="e.g., /portfolio"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Scroll Text</label>
            <input
              value={heroForm.scroll_text}
              onChange={e => setHeroForm({ ...heroForm, scroll_text: e.target.value })}
              placeholder="e.g., Scroll to explore"
            />
          </div>

          <div className="form-group">
            <label>Background Video (MP4)</label>
            <input
              type="file"
              accept="video/mp4"
              onChange={e => setHeroForm({ ...heroForm, background_video: e.target.files[0] })}
            />
            <p className="text-sm text-gray-400 mt-1">
              Upload a video file for the hero background. Video takes priority over image if both are provided.
            </p>
            {hero?.background_video_url && !heroForm.background_video && (
              <p className="text-sm text-gray-400 mt-1">
                Current video will be kept if no new file is selected.
              </p>
            )}
          </div>

          <div className="form-group">
            <label>Background Image (Fallback)</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setHeroForm({ ...heroForm, background_image: e.target.files[0] })}
            />
            <p className="text-sm text-gray-400 mt-1">
              Upload an image as fallback if no video is provided, or as video poster.
            </p>
            {hero?.background_image_url && !hero.background_video_url && !heroForm.background_image && (
              <p className="text-sm text-gray-400 mt-1">
                Current image will be kept if no new file is selected.
              </p>
            )}
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                checked={heroForm.is_published}
                onChange={e => setHeroForm({ ...heroForm, is_published: e.target.checked })}
              />
              <label>Published (visible on homepage)</label>
            </div>
          </div>

          <div className="btn-group">
            <button
              type="submit"
              className="btn btn-success"
              disabled={loading}
            >
              {loading && <span className="spinner"></span>}
              {loading ? 'Saving...' : (hero ? 'Update Hero Section' : 'Create Hero Section')}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}


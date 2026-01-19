import React, { useState, useContext, useEffect } from 'react'
import '../styles/AdminDashboard.css'
import { AuthContext } from '../context/AuthContext'
import ResourcesTab from './AdminDashboard_ResourcesTab'
import AboutTab from './AdminDashboard_AboutTab'
import HeroTab from './AdminDashboard_HeroTab'
import DonationsTab from './AdminDashboard_DonationsTab'
import BlogTab from './AdminDashboard_BlogTab'
import ReviewsTab from './AdminDashboard_ReviewsTab'
import { 
  createPortfolio, 
  uploadFile,
  fetchPortfolioPage, 
  updatePortfolio, 
  deletePortfolio,
  fetchProducts, 
  createProduct, 
  deleteProduct, 
  updateProduct,
  fetchServices,
  createService,
  updateService,
  deleteService,
  fetchSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  fetchCV,
  createCV,
  updateCV,
  deleteCV,
  fetchCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  fetchAbout,
  createAbout,
  updateAbout,
  fetchHero,
  createHero,
  updateHero,
  fetchDonationInfo,
  createDonationInfo,
  updateDonationInfo,
  fetchBankDetails,
  createBankDetail,
  updateBankDetail,
  deleteBankDetail,
  fetchGiftCards,
  createGiftCard,
  deleteGiftCard,
  updateGiftCard,
  default as api 
} from '../lib/api'

export default function AdminDashboard(){
  const { token, login, logout } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('portfolio')
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [form, setForm] = useState({ title: '', excerpt: '', body: '', tags: '', cover: null, live_url: '', github_url: '', images: [] })
  const [status, setStatus] = useState(null)
  const [portfolios, setPortfolios] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [productForm, setProductForm] = useState({ title: '', description: '', price: '', cover: null, file: null, live_url: '', youtube_url: '', whatsapp_url: '', github_url: '', affiliate_url: '', is_published: true })
  
  const [productStatus, setProductStatus] = useState(null)
  const [productEdit, setProductEdit] = useState(null)
  const [productEditForm, setProductEditForm] = useState({ title: '', description: '', price: '', cover: null, file: null, live_url: '', youtube_url: '', whatsapp_url: '', github_url: '', affiliate_url: '', is_published: true })
  const [productEditStatus, setProductEditStatus] = useState(null)
  const [affiliateStats, setAffiliateStats] = useState([])
  const [loadingStats, setLoadingStats] = useState(false)

  // simple toasts
  const [toasts, setToasts] = useState([])
  function addToast(message, kind='info'){
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, kind }])
    setTimeout(()=> setToasts(t => t.filter(x=>x.id !== id)), 5000)
  }

  async function loadPortfolios(){
    setLoadingList(true)
    try{
      const data = await fetchPortfolioPage({ page: 1 })
      setPortfolios(data.results || [])
    }catch(err){
      addToast('Failed to load portfolios', 'error')
    }
    setLoadingList(false)
  }

  // edit form state
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', excerpt: '', body: '', tags: '', cover: null, live_url: '', github_url: '' })

  function openEdit(p){
    setEditItem(p)
    setEditForm({ title: p.title || '', excerpt: p.excerpt || '', body: p.body || '', tags: (p.tags||[]).join(', '), cover: null, live_url: p.live_url || '', github_url: p.github_url || '' })
  }

  async function saveEdit(e){
    e.preventDefault()
    try{
      // Ensure we use slug (backend requires slug, not id)
      const portfolioId = editItem.slug
      if(!portfolioId){
        addToast('Portfolio slug is missing. Please refresh and try again.', 'error')
        return
      }
      await updatePortfolio(portfolioId, {
        title: editForm.title,
        excerpt: editForm.excerpt,
        body: editForm.body,
        tags: editForm.tags,
        cover: editForm.cover,
        live_url: editForm.live_url,
        github_url: editForm.github_url
      })
      setEditItem(null)
      addToast('Portfolio updated successfully', 'success')
      loadPortfolios()
    }catch(err){
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to update portfolio'
      console.error('Portfolio update error:', err)
      addToast(`Failed to update portfolio: ${errorMsg}`, 'error')
    }
  }

  React.useEffect(()=>{ if(token) loadPortfolios() }, [token])

  async function loadProducts(){
    setLoadingProducts(true)
    try{
      const data = await fetchProducts()
      setProducts(data.results || [])
    }catch(err){
      addToast('Failed to load products', 'error')
    }
    setLoadingProducts(false)
  }

  React.useEffect(()=>{ if(token) loadProducts() }, [token])

  async function handleLogin(e){
    e.preventDefault()
    setStatus('logging-in')
    try{
      await login(credentials.username, credentials.password)
      setStatus('logged-in')
      addToast('Login successful', 'success')
      setCredentials({ username: '', password: '' })
    }catch(err){
      setStatus('login-error')
      addToast(err.message || 'Login failed', 'error')
    }
  }

  async function handleCreate(e){
    e.preventDefault()
    setStatus('creating')
    try{
      const payload = await createPortfolio(form)
      if(form.images && form.images.length){
        for(const f of form.images){
          await uploadFile(f, payload.id)
        }
      }
      setStatus('created')
      setForm({ title: '', excerpt: '', body: '', tags: '', cover: null, live_url: '', github_url: '', images: [] })
      addToast('Portfolio created successfully', 'success')
      loadPortfolios()
    }catch(err){
      setStatus('create-error')
      addToast('Failed to create portfolio', 'error')
    }
  }

  async function handleCreateProduct(e){
    e.preventDefault()
    setProductStatus('creating')
    try{
      if(!productForm.title || productForm.title.trim() === '') throw new Error('Title required')
      if(productForm.price && Number(productForm.price) < 0) throw new Error('Price must be non-negative')
      if(productForm.file){
        const maxBytes = (window.MAX_PRODUCT_MB || 25) * 1024 * 1024
        const f = productForm.file
        const allowed = ['application/zip','application/x-zip-compressed','application/pdf','image/png','image/jpeg','application/octet-stream']
        if(f.size > maxBytes) throw new Error('File too large (max 25MB)')
        if(allowed.indexOf(f.type) === -1 && !f.name.match(/\.(zip|pdf|png|jpe?g)$/i)) throw new Error('Invalid file type')
      }
      let cents = 0
      if(productForm.price && productForm.price !== ''){
        const parsed = parseFloat(String(productForm.price))
        if(!Number.isNaN(parsed)) cents = Math.round(parsed * 100)
      }
      const payload = {
        title: productForm.title,
        description: productForm.description,
        price_cents: cents,
        cover: productForm.cover,
        file: productForm.file,
        is_published: productForm.is_published,
        live_url: productForm.live_url,
        youtube_url: productForm.youtube_url,
        whatsapp_url: productForm.whatsapp_url,
        github_url: productForm.github_url,
        affiliate_url: productForm.affiliate_url
      }
      await createProduct(payload)
      setProductStatus('created')
      setProductForm({ title: '', description: '', price: '', cover: null, file: null, live_url: '', youtube_url: '', whatsapp_url: '', github_url: '', affiliate_url: '', is_published: true })
      addToast('Product created successfully', 'success')
      loadProducts()
    }catch(err){
      setProductStatus('create-error')
      addToast(err.message || 'Error creating product', 'error')
    }
  }

  async function handleDeleteProduct(id){
    if(!confirm('Are you sure you want to delete this product?')) return
    try{
      await deleteProduct(id)
      addToast('Product deleted successfully', 'success')
      loadProducts()
    }catch(err){
      addToast('Failed to delete product', 'error')
    }
  }

  function openProductEdit(prod){
    setProductEdit(prod)
    setProductEditForm({ title: prod.title || '', description: prod.description || '', price: prod.price_cents ? (prod.price_cents/100).toFixed(2) : '', cover: null, file: null, live_url: prod.live_url || '', youtube_url: prod.youtube_url || '', whatsapp_url: prod.whatsapp_url || '', github_url: prod.github_url || '', affiliate_url: prod.affiliate_url || '', is_published: prod.is_published })
    loadAffiliateStats(prod.id)
  }

  async function loadAffiliateStats(productId){
    setLoadingStats(true)
    try{
      const res = await api.get(`/affiliate/${productId}/stats/?days=30`)
      setAffiliateStats(res.data || [])
    }catch(err){
      setAffiliateStats([])
    }
    setLoadingStats(false)
  }

  async function downloadAffiliateCsv(productId){
    try{
      const res = await api.get(`/affiliate/${productId}/csv/`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `affiliate_clicks_product_${productId}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      addToast('CSV downloaded successfully', 'success')
    }catch(err){
      addToast('Failed to download CSV', 'error')
    }
  }

  async function handleUpdateProduct(e){
    e.preventDefault()
    setProductEditStatus('updating')
    try{
      if(!productEdit) throw new Error('No product selected')
      if(!productEditForm.title || productEditForm.title.trim() === '') throw new Error('Title required')
      if(productEditForm.price && Number(productEditForm.price) < 0) throw new Error('Price must be non-negative')
      if(productEditForm.file){
        const maxBytes = (window.MAX_PRODUCT_MB || 25) * 1024 * 1024
        const f = productEditForm.file
        const allowed = ['application/zip','application/x-zip-compressed','application/pdf','image/png','image/jpeg','application/octet-stream']
        if(f.size > maxBytes) throw new Error('File too large (max 25MB)')
        if(allowed.indexOf(f.type) === -1 && !f.name.match(/\.(zip|pdf|png|jpe?g)$/i)) throw new Error('Invalid file type')
      }
      let cents = 0
      if(productEditForm.price && productEditForm.price !== ''){
        const parsed = parseFloat(String(productEditForm.price))
        if(!Number.isNaN(parsed)) cents = Math.round(parsed * 100)
      }
      const payload = {
        title: productEditForm.title,
        description: productEditForm.description,
        price_cents: cents,
        cover: productEditForm.cover,
        file: productEditForm.file,
        is_published: productEditForm.is_published,
        live_url: productEditForm.live_url,
        youtube_url: productEditForm.youtube_url,
        whatsapp_url: productEditForm.whatsapp_url,
        github_url: productEditForm.github_url,
        affiliate_url: productEditForm.affiliate_url
      }
      await updateProduct(productEdit.id, payload)
      setProductEditStatus('updated')
      setProductEdit(null)
      addToast('Product updated successfully', 'success')
      loadProducts()
    }catch(err){
      setProductEditStatus('update-error')
      addToast(err.message || 'Failed to update product', 'error')
    }
  }

  // preview URLs for local file selections
  const [productFormPreview, setProductFormPreview] = useState(null)
  const [productEditPreview, setProductEditPreview] = useState(null)
  const [productFormCoverPreview, setProductFormCoverPreview] = useState(null)
  const [productEditCoverPreview, setProductEditCoverPreview] = useState(null)

  React.useEffect(()=>{
    if(productForm.file){
      const u = URL.createObjectURL(productForm.file)
      setProductFormPreview(u)
      return ()=> { URL.revokeObjectURL(u); setProductFormPreview(null) }
    }
    setProductFormPreview(null)
  }, [productForm.file])

  React.useEffect(()=>{
    if(productForm.cover){
      const u = URL.createObjectURL(productForm.cover)
      setProductFormCoverPreview(u)
      return ()=> { URL.revokeObjectURL(u); setProductFormCoverPreview(null) }
    }
    setProductFormCoverPreview(null)
  }, [productForm.cover])

  React.useEffect(()=>{
    if(productEditForm.file){
      const u = URL.createObjectURL(productEditForm.file)
      setProductEditPreview(u)
      return ()=> { URL.revokeObjectURL(u); setProductEditPreview(null) }
    }
    setProductEditPreview(null)
  }, [productEditForm.file])

  React.useEffect(()=>{
    if(productEditForm.cover){
      const u = URL.createObjectURL(productEditForm.cover)
      setProductEditCoverPreview(u)
      return ()=> { URL.revokeObjectURL(u); setProductEditCoverPreview(null) }
    }
    setProductEditCoverPreview(null)
  }, [productEditForm.cover])

  return (
    <div className="admin-dashboard">
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.kind}`}>
            {toast.kind === 'success' && '✓ '}
            {toast.kind === 'error' && '✕ '}
            {toast.message}
          </div>
        ))}
      </div>

      <div className="dashboard-container">
        {!token ? (
          <div className="login-container">
            <h2>Admin Login</h2>
            <p>Enter your credentials to access the admin dashboard</p>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  type="text" 
                  value={credentials.username} 
                  onChange={e=>setCredentials({...credentials, username: e.target.value})}
                  required
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={credentials.password} 
                  onChange={e=>setCredentials({...credentials, password: e.target.value})}
                  required
                />
              </div>
              <button 
                className="login-btn" 
                type="submit" 
                disabled={status === 'logging-in'}
              >
                {status === 'logging-in' && <span className="spinner"></span>}
                {status === 'logging-in' ? 'Logging in...' : 'Login'}
              </button>
              {status === 'login-error' && (
                <div className="error-message">Login failed. Please check your credentials.</div>
              )}
            </form>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="dashboard-header">
              <h1>Admin Dashboard</h1>
              <div className="user-info">
                <button className="logout-btn" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="tabs">
              <button 
                className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
                onClick={() => setActiveTab('portfolio')}
              >
                📁 Portfolio
              </button>
              <button 
                className={`tab ${activeTab === 'blog' ? 'active' : ''}`}
                onClick={() => setActiveTab('blog')}
              >
                📝 Blog
              </button>
              <button 
                className={`tab ${activeTab === 'services' ? 'active' : ''}`}
                onClick={() => setActiveTab('services')}
              >
                💼 Services
              </button>
              <button 
                className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
                onClick={() => setActiveTab('skills')}
              >
                ⚡ Skills
              </button>
              <button 
                className={`tab ${activeTab === 'resources' ? 'active' : ''}`}
                onClick={() => setActiveTab('resources')}
              >
                📄 Resources
              </button>
              <button 
                className={`tab ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                ⭐ Reviews
              </button>
              <button 
                className={`tab ${activeTab === 'about' ? 'active' : ''}`}
                onClick={() => setActiveTab('about')}
              >
                👤 About
              </button>
              <button 
                className={`tab ${activeTab === 'hero' ? 'active' : ''}`}
                onClick={() => setActiveTab('hero')}
              >
                🎬 Hero
              </button>
              <button 
                className={`tab ${activeTab === 'donations' ? 'active' : ''}`}
                onClick={() => setActiveTab('donations')}
              >
                💰 Donations
              </button>
            </div>

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <>
                <div className="content-card">
                  <h2>Create New Portfolio Item</h2>
                  <form onSubmit={handleCreate}>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Title *</label>
                        <input 
                          required 
                          value={form.title} 
                          onChange={e=>setForm({...form, title: e.target.value})}
                          placeholder="Enter portfolio title"
                        />
                      </div>
                      <div className="form-group">
                        <label>Tags</label>
                        <input 
                          value={form.tags} 
                          onChange={e=>setForm({...form, tags: e.target.value})}
                          placeholder="web, design, app (comma-separated)"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Excerpt</label>
                      <input 
                        value={form.excerpt} 
                        onChange={e=>setForm({...form, excerpt: e.target.value})}
                        placeholder="Short description"
                      />
                    </div>
                    <div className="form-group">
                      <label>Body Content</label>
                      <textarea 
                        value={form.body} 
                        onChange={e=>setForm({...form, body: e.target.value})}
                        placeholder="Full content description"
                      />
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Live URL</label>
                        <input 
                          type="url" 
                          value={form.live_url} 
                          onChange={e=>setForm({...form, live_url: e.target.value})}
                          placeholder="https://example.com"
                        />
                      </div>
                      <div className="form-group">
                        <label>GitHub URL</label>
                        <input 
                          type="url" 
                          value={form.github_url} 
                          onChange={e=>setForm({...form, github_url: e.target.value})}
                          placeholder="https://github.com/username/repo"
                        />
                      </div>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Cover Image</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={e=>setForm({...form, cover: e.target.files[0]})}
                        />
                      </div>
                      <div className="form-group">
                        <label>Additional Images</label>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={e=>setForm({...form, images: Array.from(e.target.files)})}
                        />
                      </div>
                    </div>
                    <div className="btn-group">
                      <button 
                        className="btn btn-success" 
                        type="submit" 
                        disabled={status === 'creating'}
                      >
                        {status === 'creating' && <span className="spinner"></span>}
                        {status === 'creating' ? 'Creating...' : 'Create Portfolio'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="content-card">
                  <h2>Manage Portfolios ({portfolios.length})</h2>
                  {loadingList ? (
                    <div className="loading">
                      <span className="spinner"></span> Loading portfolios...
                    </div>
                  ) : portfolios.length === 0 ? (
                    <div className="empty-state">
                      <p>No portfolio items yet. Create your first one above!</p>
                    </div>
                  ) : (
                    <div className="items-list">
                      {portfolios.map(p => (
                        <div key={p.id} className="item-card">
                          <div className="item-info">
                            <div className="item-title">{p.title}</div>
                            <div className="item-meta">{p.excerpt || 'No excerpt'}</div>
                            {p.tags && p.tags.length > 0 && (
                              <div style={{marginTop: '0.5rem'}}>
                                {p.tags.map((tag, i) => (
                                  <span key={i} className="item-badge">{tag}</span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="item-actions">
                            <button className="btn btn-warning" onClick={()=>openEdit(p)}>
                              Edit
                            </button>
                            <button 
                              className="btn btn-danger" 
                              onClick={async ()=>{
                                if(!confirm('Are you sure you want to delete this portfolio?')) return
                                try {
                                  // Backend uses slug as lookup field, so use slug if available
                                  const portfolioId = p.slug || p.id
                                  if(!portfolioId){
                                    addToast('Portfolio identifier missing. Please refresh and try again.', 'error')
                                    return
                                  }
                                  await deletePortfolio(portfolioId)
                                  addToast('Portfolio deleted successfully', 'success')
                                  loadPortfolios()
                                } catch(err) {
                                  const errorMsg = err.response?.data?.detail || err.message || 'Failed to delete portfolio'
                                  addToast(`Failed to delete portfolio: ${errorMsg}`, 'error')
                                }
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && <ServicesTab />}

            {/* Skills Tab */}
            {activeTab === 'skills' && <SkillsTab />}

            {/* Resources Tab */}
            {activeTab === 'resources' && <ResourcesTab />}

            {/* Blog Tab */}
            {activeTab === 'blog' && <BlogTab />}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && <ReviewsTab />}

            {/* About Tab */}
            {activeTab === 'about' && <AboutTab />}

            {/* Hero Tab */}
            {activeTab === 'hero' && <HeroTab />}

            {/* Donations Tab */}
            {activeTab === 'donations' && (
              <DonationsTab 
                fetchDonationInfo={fetchDonationInfo}
                createDonationInfo={createDonationInfo}
                updateDonationInfo={updateDonationInfo}
                fetchBankDetails={fetchBankDetails}
                createBankDetail={createBankDetail}
                updateBankDetail={updateBankDetail}
                deleteBankDetail={deleteBankDetail}
                fetchGiftCards={fetchGiftCards}
                createGiftCard={createGiftCard}
                deleteGiftCard={deleteGiftCard}
                updateGiftCard={updateGiftCard}
                addToast={addToast}
              />
            )}
          </>
        )}

        {/* Edit Portfolio Modal */}
        {editItem && (
          <div className="modal-overlay" onClick={() => setEditItem(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Portfolio: {editItem.title}</h3>
                <button className="modal-close" onClick={() => setEditItem(null)}>×</button>
              </div>
              <form onSubmit={saveEdit}>
                <div className="form-group">
                  <label>Title</label>
                  <input 
                    value={editForm.title} 
                    onChange={e=>setEditForm({...editForm, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Excerpt</label>
                  <input 
                    value={editForm.excerpt} 
                    onChange={e=>setEditForm({...editForm, excerpt: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Body</label>
                  <textarea 
                    value={editForm.body} 
                    onChange={e=>setEditForm({...editForm, body: e.target.value})}
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Live URL</label>
                    <input 
                      type="url" 
                      value={editForm.live_url} 
                      onChange={e=>setEditForm({...editForm, live_url: e.target.value})}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="form-group">
                    <label>GitHub URL</label>
                    <input 
                      type="url" 
                      value={editForm.github_url} 
                      onChange={e=>setEditForm({...editForm, github_url: e.target.value})}
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tags</label>
                  <input 
                    value={editForm.tags} 
                    onChange={e=>setEditForm({...editForm, tags: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Cover Image</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={e=>setEditForm({...editForm, cover: e.target.files[0]})}
                  />
                </div>
                <div className="btn-group">
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditItem(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {productEdit && (
          <div className="modal-overlay" onClick={() => setProductEdit(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Edit Product: {productEdit.title}</h3>
                <button className="modal-close" onClick={() => setProductEdit(null)}>×</button>
              </div>
              <form onSubmit={handleUpdateProduct}>
                <div className="form-group">
                  <label>Title *</label>
                  <input 
                    required 
                    value={productEditForm.title} 
                    onChange={e=>setProductEditForm({...productEditForm, title: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={productEditForm.description} 
                    onChange={e=>setProductEditForm({...productEditForm, description: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Price (USD)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    value={productEditForm.price} 
                    onChange={e=>setProductEditForm({...productEditForm, price: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Cover Image (optional)</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={e=>setProductEditForm({...productEditForm, cover: e.target.files[0]})}
                  />
                  {productEditCoverPreview && (
                    <img src={productEditCoverPreview} alt="cover preview" className="preview-image" style={{marginTop: '0.5rem'}} />
                  )}
                  {!productEditCoverPreview && productEdit && productEdit.cover && !productEditForm.cover && (
                    <img src={productEdit.cover} alt="existing cover" className="preview-image" style={{marginTop: '0.5rem'}} />
                  )}
                </div>
                <div className="form-group">
                  <label>Live URL (optional)</label>
                  <input 
                    type="url" 
                    value={productEditForm.live_url} 
                    onChange={e=>setProductEditForm({...productEditForm, live_url: e.target.value})}
                    placeholder="https://example.com"
                  />
                </div>
                <div className="form-group">
                  <label>YouTube URL (optional)</label>
                  <input 
                    type="url" 
                    value={productEditForm.youtube_url} 
                    onChange={e=>setProductEditForm({...productEditForm, youtube_url: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div className="form-group">
                  <label>GitHub URL (optional)</label>
                  <input 
                    type="url" 
                    value={productEditForm.github_url} 
                    onChange={e=>setProductEditForm({...productEditForm, github_url: e.target.value})}
                    placeholder="https://github.com/username/repo"
                  />
                </div>
                <div className="form-group">
                  <label>WhatsApp URL (optional)</label>
                  <input 
                    type="url" 
                    value={productEditForm.whatsapp_url} 
                    onChange={e=>setProductEditForm({...productEditForm, whatsapp_url: e.target.value})}
                    placeholder="https://api.whatsapp.com/send?text=..."
                  />
                  <small style={{color: '#999', marginTop: '0.25rem', display: 'block'}}>Create link at: https://wa.me/[YOUR_NUMBER]</small>
                </div>
                <div className="form-group">
                  <label>Affiliate URL (optional)</label>
                  <input 
                    type="url" 
                    value={productEditForm.affiliate_url} 
                    onChange={e=>setProductEditForm({...productEditForm, affiliate_url: e.target.value})}
                    placeholder="https://affiliate-link.com"
                  />
                </div>
                <div className="form-group">
                  <label>Replace File (optional)</label>
                  <input 
                    type="file" 
                    onChange={e=>setProductEditForm({...productEditForm, file: e.target.files[0]})}
                  />
                  {productEditPreview && (
                    <img src={productEditPreview} alt="preview" className="preview-image" />
                  )}
                  {productEditForm.file && !productEditPreview && (
                    <div className="preview-file">
                      {productEditForm.file.name} ({(productEditForm.file.size/1024/1024).toFixed(2)} MB)
                    </div>
                  )}
                  {productEdit && productEdit.file && !productEditForm.file && (
                    <div className="preview-file">
                      Existing file: <a href={productEdit.file} target="_blank" rel="noreferrer">{productEdit.file.split('/').pop()}</a>
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <div className="checkbox-group">
                    <input 
                      type="checkbox" 
                      checked={productEditForm.is_published} 
                      onChange={e=>setProductEditForm({...productEditForm, is_published: e.target.checked})}
                    />
                    <label>Published</label>
                  </div>
                </div>
                {productEdit.affiliate_url && (
                  <div className="analytics-chart">
                    <div className="analytics-header">
                      <h4>Affiliate Analytics (30 days)</h4>
                      <button className="btn btn-primary" onClick={()=>downloadAffiliateCsv(productEdit.id)}>
                        Download CSV
                      </button>
                    </div>
                    {loadingStats ? (
                      <div className="loading">Loading analytics...</div>
                    ) : affiliateStats.length > 0 ? (
                      <>
                        <svg viewBox="0 0 600 120" width="100%" height="120" preserveAspectRatio="none" style={{background:'#fafafa', borderRadius:6, padding:8}}>
                          {(()=>{
                            const data = affiliateStats.slice(-30)
                            const max = Math.max(1, ...data.map(d=>d.count))
                            const w = 600 / Math.max(1, data.length)
                            return data.map((d,i)=>{
                              const h = Math.round((d.count / max) * 100)
                              const x = i * w
                              const y = 110 - h
                              return <rect key={d.date} x={x+2} y={y} width={Math.max(1, w-4)} height={h} fill="#667eea" opacity={0.9} />
                            })
                          })()}
                        </svg>
                        <div style={{marginTop: '0.5rem', textAlign: 'center', color: '#718096'}}>
                          Total clicks: <strong>{affiliateStats.reduce((s,it)=>s+it.count,0)}</strong>
                        </div>
                      </>
                    ) : (
                      <div className="empty-state">No analytics data available</div>
                    )}
                  </div>
                )}
                <div className="btn-group">
                  <button 
                    type="submit" 
                    className="btn btn-primary" 
                    disabled={productEditStatus === 'updating'}
                  >
                    {productEditStatus === 'updating' && <span className="spinner"></span>}
                    {productEditStatus === 'updating' ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setProductEdit(null)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Services Management Component
function ServicesTab(){
  const { token } = useContext(AuthContext)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [serviceForm, setServiceForm] = useState({ title: '', description: '', icon: '', order: 0, is_published: true })
  const [editService, setEditService] = useState(null)
  const [toasts, setToasts] = useState([])

  function addToast(message, kind='info'){
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, kind }])
    setTimeout(()=> setToasts(t => t.filter(x=>x.id !== id)), 5000)
  }

  useEffect(() => {
    if (token) loadServices()
  }, [token])

  async function loadServices(){
    setLoading(true)
    try{
      const data = await fetchServices()
      setServices(Array.isArray(data) ? data : (data.results || []))
    }catch(err){
      console.error('Error loading services:', err)
      addToast('Failed to load services: ' + (err.message || 'Check backend connection'), 'error')
      setServices([])
    }
    setLoading(false)
  }

  async function handleCreate(e){
    e.preventDefault()
    try{
      await createService(serviceForm)
      addToast('Service created successfully', 'success')
      setServiceForm({ title: '', description: '', icon: '', order: 0, is_published: true })
      loadServices()
    }catch(err){
      addToast(err.message || 'Failed to create service', 'error')
    }
  }

  async function handleUpdate(e){
    e.preventDefault()
    if (!editService) return
    try{
      await updateService(editService.id, serviceForm)
      addToast('Service updated successfully', 'success')
      setEditService(null)
      setServiceForm({ title: '', description: '', icon: '', order: 0, is_published: true })
      loadServices()
    }catch(err){
      addToast(err.message || 'Failed to update service', 'error')
    }
  }

  async function handleDelete(id){
    if (!confirm('Are you sure you want to delete this service?')) return
    try{
      await deleteService(id)
      addToast('Service deleted successfully', 'success')
      loadServices()
    }catch(err){
      addToast('Failed to delete service', 'error')
    }
  }

  function openEdit(s){
    setEditService(s)
    setServiceForm({ title: s.title, description: s.description || '', icon: s.icon || '', order: s.order || 0, is_published: s.is_published })
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
        <h2>{editService ? 'Edit Service' : 'Create New Service'}</h2>
        <form onSubmit={editService ? handleUpdate : handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label>Title *</label>
              <input 
                required 
                value={serviceForm.title} 
                onChange={e=>setServiceForm({...serviceForm, title: e.target.value})}
                placeholder="Service name"
              />
            </div>
            <div className="form-group">
              <label>Icon (emoji or identifier)</label>
              <input 
                value={serviceForm.icon} 
                onChange={e=>setServiceForm({...serviceForm, icon: e.target.value})}
                placeholder="☁️ or cloud"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea 
              value={serviceForm.description} 
              onChange={e=>setServiceForm({...serviceForm, description: e.target.value})}
              placeholder="Service description"
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Display Order</label>
              <input 
                type="number" 
                value={serviceForm.order} 
                onChange={e=>setServiceForm({...serviceForm, order: parseInt(e.target.value) || 0})}
              />
            </div>
            <div className="form-group">
              <div className="checkbox-group">
                <input 
                  type="checkbox" 
                  checked={serviceForm.is_published} 
                  onChange={e=>setServiceForm({...serviceForm, is_published: e.target.checked})}
                />
                <label>Published</label>
              </div>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              {editService ? 'Update Service' : 'Create Service'}
            </button>
            {editService && (
              <button type="button" className="btn btn-secondary" onClick={() => {
                setEditService(null)
                setServiceForm({ title: '', description: '', icon: '', order: 0, is_published: true })
              }}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="content-card">
        <h2>Manage Services ({services.length})</h2>
        {loading ? (
          <div className="loading">Loading services...</div>
        ) : services.length === 0 ? (
          <div className="empty-state">No services yet. Create your first one above!</div>
        ) : (
          <div className="items-list">
            {services.map(s => (
              <div key={s.id} className="item-card">
                <div className="item-info">
                  <div className="item-title">{s.icon && <span style={{marginRight: '0.5rem'}}>{s.icon}</span>}{s.title}</div>
                  <div className="item-meta">{s.description || 'No description'}</div>
                  <div style={{marginTop: '0.5rem', fontSize: '0.875rem', color: '#718096'}}>
                    Order: {s.order} | {s.is_published ? 'Published' : 'Draft'}
                  </div>
                </div>
                <div className="item-actions">
                  <button className="btn btn-warning" onClick={()=>openEdit(s)}>Edit</button>
                  <button className="btn btn-danger" onClick={()=>handleDelete(s.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

// Skills Management Component
function SkillsTab(){
  const { token } = useContext(AuthContext)
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [skillForm, setSkillForm] = useState({ name: '', proficiency: 0, icon: '', order: 0, is_published: true })
  const [editSkill, setEditSkill] = useState(null)
  const [toasts, setToasts] = useState([])

  function addToast(message, kind='info'){
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, kind }])
    setTimeout(()=> setToasts(t => t.filter(x=>x.id !== id)), 5000)
  }

  useEffect(() => {
    if (token) loadSkills()
  }, [token])

  async function loadSkills(){
    setLoading(true)
    try{
      const data = await fetchSkills()
      setSkills(Array.isArray(data) ? data : (data.results || []))
    }catch(err){
      console.error('Error loading skills:', err)
      addToast('Failed to load skills: ' + (err.message || 'Check backend connection'), 'error')
      setSkills([])
    }
    setLoading(false)
  }

  async function handleCreate(e){
    e.preventDefault()
    try{
      await createSkill(skillForm)
      addToast('Skill created successfully', 'success')
      setSkillForm({ name: '', proficiency: 0, icon: '', order: 0, is_published: true })
      loadSkills()
    }catch(err){
      addToast(err.message || 'Failed to create skill', 'error')
    }
  }

  async function handleUpdate(e){
    e.preventDefault()
    if (!editSkill) return
    try{
      await updateSkill(editSkill.id, skillForm)
      addToast('Skill updated successfully', 'success')
      setEditSkill(null)
      setSkillForm({ name: '', proficiency: 0, icon: '', order: 0, is_published: true })
      loadSkills()
    }catch(err){
      addToast(err.message || 'Failed to update skill', 'error')
    }
  }

  async function handleDelete(id){
    if (!confirm('Are you sure you want to delete this skill?')) return
    try{
      await deleteSkill(id)
      addToast('Skill deleted successfully', 'success')
      loadSkills()
    }catch(err){
      addToast('Failed to delete skill', 'error')
    }
  }

  function openEdit(s){
    setEditSkill(s)
    setSkillForm({ name: s.name, proficiency: s.proficiency || 0, icon: s.icon || '', order: s.order || 0, is_published: s.is_published })
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
        <h2>{editSkill ? 'Edit Skill' : 'Create New Skill'}</h2>
        <form onSubmit={editSkill ? handleUpdate : handleCreate}>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input 
                required 
                value={skillForm.name} 
                onChange={e=>setSkillForm({...skillForm, name: e.target.value})}
                placeholder="Skill name (e.g., React)"
              />
            </div>
            <div className="form-group">
              <label>Proficiency (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                value={skillForm.proficiency} 
                onChange={e=>setSkillForm({...skillForm, proficiency: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Icon (emoji or identifier)</label>
              <input 
                value={skillForm.icon} 
                onChange={e=>setSkillForm({...skillForm, icon: e.target.value})}
                placeholder="⚡ or react"
              />
            </div>
            <div className="form-group">
              <label>Display Order</label>
              <input 
                type="number" 
                value={skillForm.order} 
                onChange={e=>setSkillForm({...skillForm, order: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                checked={skillForm.is_published} 
                onChange={e=>setSkillForm({...skillForm, is_published: e.target.checked})}
              />
              <label>Published</label>
            </div>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              {editSkill ? 'Update Skill' : 'Create Skill'}
            </button>
            {editSkill && (
              <button type="button" className="btn btn-secondary" onClick={() => {
                setEditSkill(null)
                setSkillForm({ name: '', proficiency: 0, icon: '', order: 0, is_published: true })
              }}>Cancel</button>
            )}
          </div>
        </form>
      </div>

      <div className="content-card">
        <h2>Manage Skills ({skills.length})</h2>
        {loading ? (
          <div className="loading">Loading skills...</div>
        ) : skills.length === 0 ? (
          <div className="empty-state">No skills yet. Create your first one above!</div>
        ) : (
          <div className="items-list">
            {skills.map(s => (
              <div key={s.id} className="item-card">
                <div className="item-info">
                  <div className="item-title">{s.icon && <span style={{marginRight: '0.5rem'}}>{s.icon}</span>}{s.name}</div>
                  <div className="item-meta">Proficiency: {s.proficiency}%</div>
                  <div style={{marginTop: '0.5rem', fontSize: '0.875rem', color: '#718096'}}>
                    Order: {s.order} | {s.is_published ? 'Published' : 'Draft'}
                  </div>
                </div>
                <div className="item-actions">
                  <button className="btn btn-warning" onClick={()=>openEdit(s)}>Edit</button>
                  <button className="btn btn-danger" onClick={()=>handleDelete(s.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { setAuthToken, fetchBlogList, createBlog, updateBlog, deleteBlog, fetchProducts, fetchTags } from '../lib/api'

export default function BlogTab(){
  const { token } = useContext(AuthContext)
  const [blogs, setBlogs] = useState([])
  const [products, setProducts] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [toasts, setToasts] = useState([])
  const [blogForm, setBlogForm] = useState({
    title: '',
    excerpt: '',
    body: '',
    cover: null,
    tags: [],
    products: [],
    existing_cover_url: null
  })

  function addToast(message, kind='info'){
    const id = Date.now() + Math.random()
    setToasts(t => [...t, { id, message, kind }])
    setTimeout(()=> setToasts(t => t.filter(x=>x.id !== id)), 5000)
  }

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      loadData()
    }
  }, [token])

  async function loadData(){
    setLoading(true)
    try{
      const [blogsData, productsData, tagsData] = await Promise.all([
        fetchBlogList(),
        fetchProducts(),
        fetchTags()
      ])
      setBlogs(blogsData.results || [])
      setProducts(productsData.results || [])
      setTags(tagsData || [])
    }catch(err){
      console.error('Error loading blog data:', err)
      addToast('Failed to load blog data: ' + (err.message || 'Check backend connection'), 'error')
    }
    setLoading(false)
  }

  function resetForm(){
    setBlogForm({
      title: '',
      excerpt: '',
      body: '',
      cover: null,
      tags: [],
      products: [],
      existing_cover_url: null
    })
    setEditingId(null)
  }

  function editBlog(blog){
    setEditingId(blog.id)
    setBlogForm({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      body: blog.body || '',
      cover: null,
      tags: blog.tags || [],
      products: blog.products || [],
      existing_cover_url: blog.cover_url || null
    })
  }

  async function handleSubmit(e){
    e.preventDefault()
    if (!token) {
      addToast('You must be logged in to save blog post', 'error')
      return
    }
    if (!blogForm.title.trim()) {
      addToast('Blog title is required', 'error')
      return
    }
    
    setAuthToken(token)
    setLoading(true)
    try{
      if (editingId) {
        await updateBlog(editingId, blogForm)
        addToast('Blog post updated successfully', 'success')
      } else {
        await createBlog(blogForm)
        addToast('Blog post created successfully', 'success')
      }
      resetForm()
      loadData()
    }catch(err){
      console.error('Blog save error:', err)
      if (err.response?.status === 401) {
        addToast('Authentication failed. Please log in again.', 'error')
      } else {
        addToast(err.message || 'Failed to save blog post', 'error')
      }
    }
    setLoading(false)
  }

  async function handleDelete(id){
    if (!window.confirm('Are you sure you want to delete this blog post?')) return
    setAuthToken(token)
    setLoading(true)
    try{
      await deleteBlog(id)
      addToast('Blog post deleted successfully', 'success')
      loadData()
    }catch(err){
      console.error('Delete error:', err)
      addToast(err.message || 'Failed to delete blog post', 'error')
    }
    setLoading(false)
  }

  function toggleTag(tag){
    setBlogForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  function toggleProduct(productId){
    setBlogForm(prev => ({
      ...prev,
      products: prev.products.includes(productId)
        ? prev.products.filter(p => p !== productId)
        : [...prev.products, productId]
    }))
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
        <h2>Blog Management</h2>
        <p className="muted mb-4" style={{fontSize: '0.875rem'}}>
          Create and manage blog posts. Posts will appear on your blog page and homepage.
        </p>

        {loading && !blogs.length && (
          <div className="loading">Loading blog posts...</div>
        )}

        {/* Blog Form */}
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="form-group">
            <label>Title *</label>
            <input
              required
              value={blogForm.title}
              onChange={e => setBlogForm({ ...blogForm, title: e.target.value })}
              placeholder="e.g., Getting Started with React"
            />
          </div>

          <div className="form-group">
            <label>Excerpt</label>
            <textarea
              rows={3}
              value={blogForm.excerpt}
              onChange={e => setBlogForm({ ...blogForm, excerpt: e.target.value })}
              placeholder="Brief summary of the blog post (optional)"
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              rows={10}
              value={blogForm.body}
              onChange={e => setBlogForm({ ...blogForm, body: e.target.value })}
              placeholder="Blog post content..."
            />
          </div>

          <div className="form-group">
            <label>Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={e => setBlogForm({ ...blogForm, cover: e.target.files[0] })}
            />
            <p className="text-sm text-gray-400 mt-1">
              Upload a cover image for your blog post. Recommended: 1200x630px.
            </p>
            {blogForm.existing_cover_url && !blogForm.cover && (
              <div className="mt-2">
                <p className="text-sm text-gray-300">Current cover:</p>
                <img 
                  src={blogForm.existing_cover_url} 
                  alt="Cover" 
                  style={{maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', marginTop: '0.5rem'}}
                />
                <p className="text-sm text-gray-400 mt-1">Upload a new file to replace it.</p>
              </div>
            )}
          </div>

          {/* Tags Selection */}
          {tags.length > 0 && (
            <div className="form-group">
              <label>Tags</label>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
                {tags.map(tag => (
                  <button
                    key={tag.name || tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.name || tag.id)}
                    style={{
                      padding: '0.4rem 0.8rem',
                      borderRadius: '0.4rem',
                      border: blogForm.tags.includes(tag.name || tag.id)
                        ? '2px solid #3b82f6'
                        : '1px solid rgba(148, 163, 184, 0.3)',
                      backgroundColor: blogForm.tags.includes(tag.name || tag.id)
                        ? 'rgba(59, 130, 246, 0.2)'
                        : 'transparent',
                      color: '#e2e8f0',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    {tag.name || tag.id}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Products Selection */}
          {products.length > 0 && (
            <div className="form-group">
              <label>Link Products</label>
              <p className="text-sm text-gray-400 mb-2">Select products to link with this blog post.</p>
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                {products.map(product => (
                  <label key={product.id} style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={blogForm.products.includes(product.id)}
                      onChange={() => toggleProduct(product.id)}
                    />
                    <span>{product.title}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem'}}>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {editingId ? 'Update Post' : 'Create Post'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                disabled={loading}
                className="btn"
                style={{backgroundColor: 'rgba(107, 114, 128, 0.3)', color: '#d1d5db'}}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* Blog List */}
        <div className="mt-8">
          <h3 style={{marginBottom: '1rem', fontSize: '1.1rem'}}>Blog Posts ({blogs.length})</h3>
          {blogs.length === 0 ? (
            <p className="text-gray-400">No blog posts yet. Create your first post above.</p>
          ) : (
            <div style={{display: 'grid', gap: '1rem'}}>
              {blogs.map(blog => (
                <div
                  key={blog.id}
                  style={{
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    backgroundColor: 'rgba(15, 23, 42, 0.5)'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem'}}>
                    <div style={{flex: 1}}>
                      <h4 style={{margin: '0 0 0.5rem 0', color: '#e2e8f0'}}>{blog.title}</h4>
                      <p style={{margin: '0.25rem 0', fontSize: '0.875rem', color: '#94a3b8'}}>
                        Slug: <code style={{backgroundColor: 'rgba(0,0,0,0.3)', padding: '0.2rem 0.4rem', borderRadius: '0.2rem'}}>{blog.slug}</code>
                      </p>
                      {blog.excerpt && (
                        <p style={{margin: '0.5rem 0', fontSize: '0.875rem', color: '#cbd5e1'}}>{blog.excerpt}</p>
                      )}
                      {blog.tags && blog.tags.length > 0 && (
                        <div style={{display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem'}}>
                          {blog.tags.map((tag, i) => (
                            <span key={i} style={{fontSize: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', padding: '0.2rem 0.4rem', borderRadius: '0.2rem', color: '#93c5fd'}}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                      <button
                        onClick={() => editBlog(blog)}
                        disabled={loading}
                        className="btn"
                        style={{backgroundColor: 'rgba(59, 130, 246, 0.3)', color: '#93c5fd', padding: '0.4rem 0.8rem', fontSize: '0.875rem'}}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={loading}
                        className="btn"
                        style={{backgroundColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5', padding: '0.4rem 0.8rem', fontSize: '0.875rem'}}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .btn {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.4rem;
          background-color: rgba(59, 130, 246, 0.5);
          color: #bfdbfe;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        .btn:hover:not(:disabled) {
          background-color: rgba(59, 130, 246, 0.7);
        }
        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .btn-primary {
          background-color: #3b82f6;
          color: white;
        }
        .btn-primary:hover:not(:disabled) {
          background-color: #2563eb;
        }
      `}</style>
    </>
  )
}

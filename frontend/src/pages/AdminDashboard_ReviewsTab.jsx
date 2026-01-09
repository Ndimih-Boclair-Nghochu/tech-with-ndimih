import React, { useState, useContext, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext'
import { setAuthToken, fetchAllReviews, updateReview, deleteReview, fetchProducts } from '../lib/api'

export default function ReviewsTab(){
  const { token } = useContext(AuthContext)
  const [reviews, setReviews] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])
  const [filterPublished, setFilterPublished] = useState(null) // null = all, true = published, false = unpublished

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
      const [reviewsData, productsData] = await Promise.all([
        fetchAllReviews(),
        fetchProducts()
      ])
      setReviews(reviewsData.results || [])
      setProducts(productsData.results || [])
    }catch(err){
      console.error('Error loading reviews:', err)
      addToast('Failed to load reviews: ' + (err.message || 'Check backend connection'), 'error')
    }
    setLoading(false)
  }

  async function togglePublish(review){
    setAuthToken(token)
    setLoading(true)
    try{
      await updateReview(review.id, { is_published: !review.is_published })
      addToast(
        review.is_published ? 'Review unpublished' : 'Review published',
        'success'
      )
      loadData()
    }catch(err){
      console.error('Update error:', err)
      addToast(err.message || 'Failed to update review', 'error')
    }
    setLoading(false)
  }

  async function handleDelete(id, name){
    if (!window.confirm(`Delete review from "${name}"?`)) return
    setAuthToken(token)
    setLoading(true)
    try{
      await deleteReview(id)
      addToast('Review deleted successfully', 'success')
      loadData()
    }catch(err){
      console.error('Delete error:', err)
      addToast(err.message || 'Failed to delete review', 'error')
    }
    setLoading(false)
  }

  // Filter reviews based on selection
  const filteredReviews = reviews.filter(r => {
    if (filterPublished === null) return true
    return r.is_published === filterPublished
  })

  const publishedCount = reviews.filter(r => r.is_published).length
  const unpublishedCount = reviews.filter(r => !r.is_published).length

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
        <h2>Reviews & Testimonials Management</h2>
        <p className="muted mb-4" style={{fontSize: '0.875rem'}}>
          Manage customer reviews and testimonials. Only published reviews appear on the homepage.
        </p>

        {loading && !reviews.length && (
          <div className="loading">Loading reviews...</div>
        )}

        {/* Filter Tabs */}
        <div style={{display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(148, 163, 184, 0.2)', paddingBottom: '0.5rem'}}>
          <button
            onClick={() => setFilterPublished(null)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              backgroundColor: filterPublished === null ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
              borderBottom: filterPublished === null ? '2px solid #3b82f6' : 'none',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            All ({reviews.length})
          </button>
          <button
            onClick={() => setFilterPublished(true)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              backgroundColor: filterPublished === true ? 'rgba(34, 197, 94, 0.3)' : 'transparent',
              borderBottom: filterPublished === true ? '2px solid #22c55e' : 'none',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Published ({publishedCount})
          </button>
          <button
            onClick={() => setFilterPublished(false)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              backgroundColor: filterPublished === false ? 'rgba(239, 68, 68, 0.3)' : 'transparent',
              borderBottom: filterPublished === false ? '2px solid #ef4444' : 'none',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            Pending ({unpublishedCount})
          </button>
        </div>

        {/* Reviews List */}
        {filteredReviews.length === 0 ? (
          <p className="text-gray-400">
            {filterPublished === null && 'No reviews yet.'}
            {filterPublished === true && 'No published reviews yet.'}
            {filterPublished === false && 'No pending reviews to moderate.'}
          </p>
        ) : (
          <div style={{display: 'grid', gap: '1rem'}}>
            {filteredReviews.map(review => (
              <div
                key={review.id}
                style={{
                  padding: '1.5rem',
                  borderRadius: '0.5rem',
                  border: `1px solid ${review.is_published ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  position: 'relative'
                }}
              >
                {/* Status Badge */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '0.3rem',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  backgroundColor: review.is_published ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: review.is_published ? '#86efac' : '#fca5a5',
                  textTransform: 'uppercase'
                }}>
                  {review.is_published ? 'Published' : 'Pending'}
                </div>

                {/* Reviewer Info */}
                <div>
                  <div style={{marginBottom: '0.5rem'}}>
                    <h4 style={{margin: 0, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                      {review.name}
                      <span style={{
                        fontSize: '1rem',
                        letterSpacing: '-0.2em',
                        color: '#fbbf24'
                      }}>
                        {'★'.repeat(review.rating)}
                        {'☆'.repeat(5 - review.rating)}
                      </span>
                    </h4>
                  </div>

                  {review.product && (
                    <p style={{
                      margin: '0.5rem 0',
                      fontSize: '0.875rem',
                      color: '#94a3b8'
                    }}>
                      Product: <strong>{review.product.title || review.product}</strong>
                    </p>
                  )}

                  <p style={{
                    margin: '0.75rem 0',
                    fontSize: '0.9rem',
                    color: '#cbd5e1',
                    lineHeight: '1.5'
                  }}>
                    {review.message}
                  </p>

                  <p style={{
                    margin: '0.5rem 0 0 0',
                    fontSize: '0.75rem',
                    color: '#64748b'
                  }}>
                    Submitted: {new Date(review.created_at).toLocaleDateString()} at {new Date(review.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>

                {/* Action Buttons */}
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  marginTop: '1rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid rgba(148, 163, 184, 0.2)'
                }}>
                  <button
                    onClick={() => togglePublish(review)}
                    disabled={loading}
                    className="btn"
                    style={{
                      backgroundColor: review.is_published
                        ? 'rgba(239, 68, 68, 0.3)'
                        : 'rgba(34, 197, 94, 0.3)',
                      color: review.is_published ? '#fca5a5' : '#86efac',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.875rem',
                      flex: 1
                    }}
                  >
                    {review.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(review.id, review.name)}
                    disabled={loading}
                    className="btn"
                    style={{
                      backgroundColor: 'rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.875rem'
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
      `}</style>
    </>
  )
}

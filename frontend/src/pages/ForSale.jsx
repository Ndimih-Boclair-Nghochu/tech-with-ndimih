import React, { useEffect, useState } from 'react'
import { fetchProducts } from '../lib/api'
import Card3D from '../components/3DCard'
import YouTubeModal from '../components/YouTubeModal'
import '../styles/ForSale.css'

export default function ForSale(){
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState(null)
  const [videoModalOpen, setVideoModalOpen] = useState(false)

  useEffect(()=>{
    let mounted = true
    fetchProducts().then(data => {
      if(!mounted) return
      const all = data.results || []
      // Backend already filters to published for non-authenticated users,
      // but we filter again for safety in case user logs in/out
      setItems(all.filter(p => p.is_published))
    }).catch(()=>{ if(mounted) setItems([]) }).finally(()=>{ if(mounted) setLoading(false) })
    return ()=> mounted = false
  },[])

  const handleWatchVideo = (product) => {
    setSelectedVideo(product)
    setVideoModalOpen(true)
  }

  const handleCloseVideo = () => {
    setVideoModalOpen(false)
    setTimeout(() => setSelectedVideo(null), 300)
  }

  return (
    <div className="for-sale-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/6 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/6 rounded-full blur-3xl"></div>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">Projects For Sale</h1>
          <p className="muted">Browse available projects. Click WhatsApp to message me about a project, or View Live to see demos.</p>
        </div>

        {loading ? (
          <div className="text-center py-12"><div className="spinner mx-auto mb-4"></div><p className="text-gray-300">Loading...</p></div>
        ) : items.length === 0 ? (
          <div className="text-center text-gray-400 py-12">No projects available for sale yet.</div>
        ) : (
          <div className="for-sale-grid">
            {items.map((p, idx) => (
              <Card3D key={p.id || p.slug} className="lift-on-hover" style={{ animationDelay: `${idx * 80}ms` }}>
                <div className="sale-card glass">
                  <div className="card-body">
                    <div className="card-title">{p.title}</div>
                    <div className="card-desc">{p.description || 'No description provided.'}</div>
                  </div>
                  <div className="card-actions">
                    {p.youtube_url && <button className="btn btn-live" onClick={() => handleWatchVideo(p)}>Live Demo</button>}
                    <a className="btn btn-ghost whatsapp" href={`https://api.whatsapp.com/send?text=${encodeURIComponent("I'm interested in your project: " + p.title)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
                    {p.affiliate_url ? <a className="btn btn-primary" href={p.affiliate_url} target="_blank" rel="noopener noreferrer">View Live</a> : <button className="btn btn-disabled" disabled>View Live</button>}
                  </div>
                </div>
              </Card3D>
            ))}
          </div>
        )}

        {selectedVideo && (
          <YouTubeModal 
            isOpen={videoModalOpen} 
            videoUrl={selectedVideo.youtube_url} 
            onClose={handleCloseVideo}
            title={selectedVideo.title}
          />
        )}
      </main>
    </div>
  )
}

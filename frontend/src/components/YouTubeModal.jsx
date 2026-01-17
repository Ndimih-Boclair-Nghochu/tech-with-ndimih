import React from 'react'
import '../styles/YouTubeModal.css'

export default function YouTubeModal({ isOpen, videoUrl, onClose, title }) {
  if (!isOpen) return null

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null
    
    // Handle different YouTube URL formats
    let videoId = null
    
    // Format: https://www.youtube.com/watch?v=dQw4w9WgXcQ
    if (url.includes('youtube.com/watch')) {
      const match = url.match(/v=([a-zA-Z0-9_-]{11})/)
      videoId = match ? match[1] : null
    }
    // Format: https://youtu.be/dQw4w9WgXcQ
    else if (url.includes('youtu.be/')) {
      const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
      videoId = match ? match[1] : null
    }
    // Format: https://www.youtube.com/embed/dQw4w9WgXcQ
    else if (url.includes('youtube.com/embed/')) {
      const match = url.match(/embed\/([a-zA-Z0-9_-]{11})/)
      videoId = match ? match[1] : null
    }
    
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null
  }

  const embedUrl = getYouTubeEmbedUrl(videoUrl)

  return (
    <div className="youtube-modal-overlay" onClick={onClose}>
      <div className="youtube-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="youtube-modal-close" onClick={onClose} aria-label="Close video">
          ✕
        </button>
        
        <h2 className="youtube-modal-title">{title} - Demo</h2>
        
        {embedUrl ? (
          <div className="youtube-iframe-wrapper">
            <iframe
              src={embedUrl}
              title={`${title} demo video`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="youtube-iframe"
            ></iframe>
          </div>
        ) : (
          <div className="youtube-error">
            <p>Unable to load video. Please check the URL and try again.</p>
          </div>
        )}
      </div>
    </div>
  )
}

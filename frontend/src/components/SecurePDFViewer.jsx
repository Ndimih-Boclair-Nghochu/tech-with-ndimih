import React, { useEffect, useRef, useState } from 'react'
import '../styles/SecurePDFViewer.css'

export default function SecurePDFViewer({ pdfUrl, title, onClose }) {
  const containerRef = useRef(null)
  const iframeRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault()
      return false
    }

    // Disable common keyboard shortcuts
    const handleKeyDown = (e) => {
      // Disable Ctrl+S, Ctrl+P, Ctrl+A, F12, Print Screen
      if (
        (e.ctrlKey && (e.key === 's' || e.key === 'p' || e.key === 'a')) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen' ||
        (e.shiftKey && e.key === 'F12')
      ) {
        e.preventDefault()
        return false
      }
    }

    // Disable text selection
    const handleSelectStart = (e) => {
      e.preventDefault()
      return false
    }

    // Disable drag
    const handleDragStart = (e) => {
      e.preventDefault()
      return false
    }

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('selectstart', handleSelectStart)
    document.addEventListener('dragstart', handleDragStart)

    // Add watermark overlay
    const watermark = document.createElement('div')
    watermark.className = 'pdf-watermark'
    watermark.textContent = 'View Only - Not for Download'
    if (containerRef.current) {
      containerRef.current.appendChild(watermark)
    }

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('selectstart', handleSelectStart)
      document.removeEventListener('dragstart', handleDragStart)
      if (watermark.parentNode) {
        watermark.parentNode.removeChild(watermark)
      }
    }
  }, [])

  // Load PDF directly in iframe - optimized for faster loading
  useEffect(() => {
    if (!pdfUrl) {
      setError('No PDF URL provided')
      setLoading(false)
      return
    }
    
    if (!iframeRef.current) return

    console.log('Loading PDF from URL:', pdfUrl)
    setLoading(true)
    setError(null)
    
    // Validate URL - allow both absolute (http/https) and relative URLs (for Vite proxy)
    if (!pdfUrl || (typeof pdfUrl !== 'string')) {
      setError('Invalid PDF URL provided')
      setLoading(false)
      return
    }
    
    // For relative URLs (starting with /), they'll be handled by Vite proxy
    // For absolute URLs, use them directly
    let finalUrl = pdfUrl
    
    // If it's a relative URL, ensure it starts with /
    if (!pdfUrl.startsWith('http://') && !pdfUrl.startsWith('https://') && !pdfUrl.startsWith('/')) {
      finalUrl = `/${pdfUrl}`
    }
    
    // Add PDF viewer parameters to hide toolbar (only for absolute URLs or if not already present)
    // For relative URLs, the browser will handle it
    let pdfUrlWithParams = finalUrl
    if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
      const separator = finalUrl.includes('?') ? '&' : (finalUrl.includes('#') ? '&' : '#')
      pdfUrlWithParams = `${finalUrl}${separator}toolbar=0&navpanes=0`
    } else {
      // For relative URLs, add params after the path
      const separator = finalUrl.includes('?') ? '&' : (finalUrl.includes('#') ? '&' : '#')
      pdfUrlWithParams = `${finalUrl}${separator}toolbar=0&navpanes=0`
    }
    
    console.log('PDF URL with params:', pdfUrlWithParams)
    
    // Set src immediately - don't wait
    iframeRef.current.src = pdfUrlWithParams
    
    // Handle load event - PDFs load incrementally, so we show content as soon as possible
    const iframe = iframeRef.current
    let loadTimeout
    
    const handleLoad = () => {
      console.log('PDF iframe loaded')
      // PDFs can load in chunks, so we hide loading after a short delay
      loadTimeout = setTimeout(() => {
        setLoading(false)
        setError(null)
      }, 500) // Short delay to ensure PDF starts rendering
    }
    
    const handleError = () => {
      console.error('PDF iframe error')
      clearTimeout(loadTimeout)
      setLoading(false)
      setError(`Failed to load PDF from: ${pdfUrl}. Please check if the file exists and is accessible.`)
    }
    
    // Show content after 2 seconds even if still loading (progressive loading)
    const progressiveTimeout = setTimeout(() => {
      if (loading) {
        console.log('Progressive loading: hiding spinner')
        setLoading(false) // Hide loading spinner, let PDF continue loading in background
      }
    }, 2000) // 2 second timeout for initial display
    
    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)
    
    return () => {
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
      clearTimeout(loadTimeout)
      clearTimeout(progressiveTimeout)
    }
  }, [pdfUrl])

  return (
    <div className="secure-pdf-viewer-overlay" onClick={onClose}>
      <div 
        className={`secure-pdf-viewer-container ${isFullscreen ? 'fullscreen' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="secure-pdf-viewer-header">
          <h3>{title || 'Document Viewer'}</h3>
          <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
            <button 
              className="close-btn" 
              onClick={() => setIsFullscreen(!isFullscreen)}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              style={{fontSize: '1.5rem', width: 'auto', padding: '0 0.5rem'}}
              title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {isFullscreen ? '⤓' : '⤢'}
            </button>
            <button className="close-btn" onClick={onClose} aria-label="Close viewer">
              ×
            </button>
          </div>
        </div>
        <div className="secure-pdf-viewer-content" ref={containerRef}>
          {loading && !error && (
            <div className="pdf-loading">
              <div className="spinner"></div>
              <p>Loading document...</p>
            </div>
          )}
          {error ? (
            <div className="pdf-error-message">
              <p>{error}</p>
              <div style={{marginTop: '1rem', fontSize: '0.875rem', opacity: 0.8, wordBreak: 'break-all'}}>
                <p>URL: {pdfUrl}</p>
              </div>
              <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap'}}>
                <button 
                  className="btn-retry" 
                  onClick={() => {
                    setError(null)
                    setLoading(true)
                    if (iframeRef.current) {
                      iframeRef.current.src = iframeRef.current.src
                    }
                  }}
                >
                  Retry
                </button>
                <button 
                  className="btn-retry" 
                  onClick={(e) => {
                    e.stopPropagation() // Prevent modal from closing
                    // Open in new tab as fallback - convert relative URLs to absolute
                    const urlToOpen = pdfUrl.startsWith('http') 
                      ? pdfUrl 
                      : `${window.location.origin}${pdfUrl.startsWith('/') ? '' : '/'}${pdfUrl}`
                    window.open(urlToOpen, '_blank')
                  }}
                >
                  Open in New Tab
                </button>
              </div>
            </div>
          ) : (
            <iframe
              ref={iframeRef}
              className="secure-pdf-iframe"
              title={title || 'Document'}
              // Removed sandbox to allow PDF display - security is handled via other measures
              style={{
                border: 'none',
                width: '100%',
                minHeight: '100%',
                height: 'auto',
                opacity: loading ? 0 : 1,
                transition: 'opacity 0.3s ease',
                display: loading ? 'none' : 'block'
              }}
              onLoad={() => {
                // PDF loaded, hide loading after brief delay
                setTimeout(() => {
                  setLoading(false)
                  setError(null)
                }, 300)
              }}
              onError={() => {
                setLoading(false)
                setError('Failed to load PDF. The file may be corrupted or the URL is invalid.')
                console.error('PDF failed to load')
              }}
            />
          )}
        </div>
        <div className="secure-pdf-viewer-footer">
          <p className="view-only-notice">⚠️ This document is for viewing only. Downloading and screenshots are disabled.</p>
        </div>
      </div>
    </div>
  )
}


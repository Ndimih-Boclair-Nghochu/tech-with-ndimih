import React, { useEffect, useState } from 'react'
import { fetchCV, fetchCertifications } from '../lib/api'
import SecurePDFViewer from '../components/SecurePDFViewer'
import '../styles/Resources.css'

export default function Resources() {
  const [cv, setCv] = useState(null)
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewingPDF, setViewingPDF] = useState(null)
  const [viewingTitle, setViewingTitle] = useState('')

  useEffect(() => {
    loadResources()
  }, [])

  async function loadResources() {
    setLoading(true)
    try {
      const [cvData, certData] = await Promise.all([
        fetchCV().catch((err) => {
          console.error('Error fetching CV:', err)
          return null
        }),
        fetchCertifications().catch((err) => {
          console.error('Error fetching certifications:', err)
          return { results: [] }
        })
      ])
      
      // Debug logging
      console.log('CV Data:', cvData)
      console.log('Certifications Data:', certData)
      
      // Process CV data - handle both file_url and file field
      if (cvData) {
        // If file_url is not present, try to construct it from file field
        if (!cvData.file_url && cvData.file) {
          // In dev, use relative URLs so Vite can proxy them
          if (import.meta.env.DEV && (cvData.file.startsWith('/media/') || cvData.file.startsWith('/static/'))) {
            cvData.file_url = cvData.file
          } else if (cvData.file.startsWith('http')) {
            cvData.file_url = cvData.file
          } else {
            const baseUrl = import.meta.env.VITE_API_URL 
              ? import.meta.env.VITE_API_URL.replace('/api', '')
              : (import.meta.env.DEV ? '' : 'http://localhost:8000')
            cvData.file_url = `${baseUrl}${cvData.file.startsWith('/') ? '' : '/'}${cvData.file}`
          }
        }
        console.log('CV file_url:', cvData.file_url)
      }
      
      // Process certifications
      const certs = Array.isArray(certData) ? certData : (certData.results || [])
      certs.forEach(cert => {
        // If file_url is not present, try to construct it from file field
        if (!cert.file_url && cert.file) {
          // In dev, use relative URLs so Vite can proxy them
          if (import.meta.env.DEV && (cert.file.startsWith('/media/') || cert.file.startsWith('/static/'))) {
            cert.file_url = cert.file
          } else if (cert.file.startsWith('http')) {
            cert.file_url = cert.file
          } else {
            const baseUrl = import.meta.env.VITE_API_URL 
              ? import.meta.env.VITE_API_URL.replace('/api', '')
              : (import.meta.env.DEV ? '' : 'http://localhost:8000')
            cert.file_url = `${baseUrl}${cert.file.startsWith('/') ? '' : '/'}${cert.file}`
          }
        }
      })
      
      setCv(cvData)
      setCertifications(certs)
    } catch (error) {
      console.error('Error loading resources:', error)
    } finally {
      setLoading(false)
    }
  }

  function openPDFViewer(url, title) {
    console.log('Opening PDF viewer with URL:', url, 'Title:', title)
    
    // Pre-validate URL
    if (!url) {
      console.error('No URL provided')
      alert('PDF URL is not available. Please check if the file was uploaded correctly.')
      return
    }
    
    // Ensure URL is absolute
    let absoluteUrl = url
    
    // If URL is relative (starts with /media/), use the current origin in dev or construct properly
    if (!url.startsWith('http')) {
      if (url.startsWith('/media/') || url.startsWith('/static/')) {
        // In development, use the Vite dev server origin (which proxies to Django)
        // In production, use the full backend URL
        if (import.meta.env.DEV) {
          // Use relative URL - Vite will proxy /media requests to Django
          absoluteUrl = url
          console.log('Using Vite proxy for media file:', absoluteUrl)
        } else {
          const baseUrl = import.meta.env.VITE_API_URL 
            ? import.meta.env.VITE_API_URL.replace('/api', '')
            : 'http://localhost:8000'
          absoluteUrl = `${baseUrl}${url}`
        }
      } else {
        // Other relative URLs
        const baseUrl = import.meta.env.VITE_API_URL 
          ? import.meta.env.VITE_API_URL.replace('/api', '')
          : (import.meta.env.DEV ? 'http://localhost:8000' : 'http://localhost:8000')
        absoluteUrl = `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`
      }
      console.log('Converted relative URL to absolute:', absoluteUrl)
    } else {
      // If URL already has http://127.0.0.1, try converting to use Vite proxy or localhost
      if (import.meta.env.DEV && url.includes('127.0.0.1:8000')) {
        // Convert to use Vite proxy instead
        const mediaPath = url.replace(/^https?:\/\/[^/]+/, '')
        if (mediaPath.startsWith('/media/') || mediaPath.startsWith('/static/')) {
          absoluteUrl = mediaPath
          console.log('Converted 127.0.0.1 URL to Vite proxy:', absoluteUrl)
        } else {
          // Try localhost instead of 127.0.0.1
          absoluteUrl = url.replace('127.0.0.1', 'localhost')
          console.log('Converted 127.0.0.1 to localhost:', absoluteUrl)
        }
      }
    }
    
    console.log('Final PDF URL:', absoluteUrl)
    setViewingPDF(absoluteUrl)
    setViewingTitle(title)
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden'
  }

  function closePDFViewer() {
    setViewingPDF(null)
    setViewingTitle('')
    document.body.style.overflow = ''
  }

  // Handle escape key to close viewer
  useEffect(() => {
    if (!viewingPDF) return

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closePDFViewer()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [viewingPDF])

  return (
    <div className="resources-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">Resources</h1>
          <p className="text-base sm:text-lg muted">View my CV and professional certifications</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-300">Loading resources...</p>
          </div>
        ) : (
          <div className="resources-container">
            {/* CV Section */}
            <section className="resource-section">
              <div className="resource-card">
                <div className="resource-icon">📄</div>
                <h2 className="resource-title">Curriculum Vitae</h2>
                <p className="resource-description">
                  View my professional CV and work experience
                </p>
                {cv ? (
                  cv.file_url || cv.file ? (
                    <button
                      className="resource-btn"
                      onClick={() => openPDFViewer(cv.file_url || cv.file, cv.title || 'CV')}
                    >
                      View CV
                    </button>
                  ) : (
                    <p className="resource-unavailable">CV file not uploaded</p>
                  )
                ) : (
                  <p className="resource-unavailable">CV not available</p>
                )}
              </div>
            </section>

            {/* Certifications Section */}
            <section className="resource-section">
              <h2 className="section-title">Certifications</h2>
              {certifications.length === 0 ? (
                <div className="resource-card">
                  <p className="resource-unavailable">No certifications available</p>
                </div>
              ) : (
                <div className="certifications-grid">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="certification-card">
                      <div className="cert-icon">🏆</div>
                      <h3 className="cert-title">{cert.title}</h3>
                      {cert.issuer && (
                        <p className="cert-issuer">Issued by: {cert.issuer}</p>
                      )}
                      <div className="cert-dates">
                        {cert.issue_date && (
                          <span className="cert-date">
                            Issued: {new Date(cert.issue_date).toLocaleDateString()}
                          </span>
                        )}
                        {cert.expiry_date && (
                          <span className="cert-date">
                            Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {cert.file_url || cert.file ? (
                        <button
                          className="cert-view-btn"
                          onClick={() => openPDFViewer(cert.file_url || cert.file, cert.title)}
                        >
                          View Certificate
                        </button>
                      ) : (
                        <p className="cert-unavailable">Certificate file not uploaded</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {viewingPDF && (
          <SecurePDFViewer
            pdfUrl={viewingPDF}
            title={viewingTitle}
            onClose={closePDFViewer}
          />
        )}
      </main>
    </div>
  )
}


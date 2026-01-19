import React from 'react'
import { Link } from 'react-router-dom'
import '../styles/Footer.css'

const getBackendRoot = () => {
  try{
    const api = import.meta.env.VITE_API_URL || 'https://api.ndimihboclair.com/api'
    return api.replace(/\/api\/?$/,'')
  }catch(e){ return 'https://api.ndimihboclair.com' }
}

export default function Footer(){
  return (
    <footer className="site-footer mt-16 text-sm glass-card">
      <div className="max-w-6xl mx-auto px-4">
        <div className="inner">
          <div className="brand">My Portfolio</div>

            <nav className="links footer-nav" role="navigation" aria-label="Footer navigation">
              <Link to="/services" onClick={() => window.scrollTo(0,0)}>Services</Link>
              <Link to="/portfolio" onClick={() => window.scrollTo(0,0)}>Portfolio</Link>
              <Link to="/projects-for-sale" onClick={() => window.scrollTo(0,0)}>Projects</Link>
              <Link to="/blog" onClick={() => window.scrollTo(0,0)}>Blog</Link>
              <Link to="/contact" onClick={() => window.scrollTo(0,0)}>Contact</Link>
              <Link to="/admin" onClick={() => window.scrollTo(0,0)}>Admin</Link>
            </nav>

          <div className="social">
            <a aria-label="GitHub" href="#" className="social">GitHub</a>
            <a aria-label="LinkedIn" href="#" className="social">LinkedIn</a>
            <a aria-label="Twitter" href="#" className="social">Twitter</a>
          </div>

          <div className="copyright">© {new Date().getFullYear()} My Portfolio</div>
          <div className="powered-by" style={{marginTop: '0.5rem', fontSize: '0.875rem', color: '#888', fontStyle: 'italic'}}>
            Powered by TECH WITH NDIMIH
          </div>
        </div>
      </div>
    </footer>
  )
}

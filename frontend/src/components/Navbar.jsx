import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import DonateModal from './DonateModal'
import '../styles/Navbar.css'
import logo from '../assets/logo-cloud.svg'

const getBackendRoot = () => {
  try{
    const api = import.meta.env.VITE_API_URL || 'https://api.ndimihboclair.com/api'
    return api.replace(/\/api\/?$/,'')
  }catch(e){ return 'https://api.ndimihboclair.com' }
}

export default function Navbar(){
  const [dark, setDark] = useState(false)
  const [open, setOpen] = useState(false)
  const [showDonate, setShowDonate] = useState(false)

  useEffect(()=>{
    const saved = localStorage.getItem('site_theme')
    if(saved) { setDark(saved === 'dark'); document.documentElement.setAttribute('data-theme', saved) }
  },[])

  // Set a CSS variable with the header height so other components (hero) can
  // position relative to the actual header size. This keeps vertical centering
  // robust across layout/zoom changes and when the header size changes.
  useEffect(()=>{
    const setHeaderHeight = ()=>{
      const el = document.querySelector('.site-navbar')
      if(el && el.offsetHeight) {
        document.documentElement.style.setProperty('--header-height', `${el.offsetHeight}px`)
      }
    }
    setHeaderHeight()
    window.addEventListener('resize', setHeaderHeight)

    // watch for DOM changes that could alter header height (logo swap, nav items)
    const headerEl = document.querySelector('.site-navbar')
    let mo
    if(window.MutationObserver && headerEl){
      mo = new MutationObserver(setHeaderHeight)
      mo.observe(headerEl, { attributes: true, childList: true, subtree: true })
    }

    return ()=>{
      window.removeEventListener('resize', setHeaderHeight)
      if(mo) mo.disconnect()
    }
  },[])

  function toggle(){
    const next = !dark
    setDark(next)
    const t = next ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem('site_theme', t)
  }

  function toggleMenu(){ setOpen(o => !o) }

  return (
    <header className="site-navbar shadow-sm" role="banner">
      <div className="navbar-container">
        <Link to="/" className="brand flex items-center gap-2" aria-label="Home">
          <img src={logo} alt="Tech with Ndimih" />
          <span>Tech with Ndimih</span>
        </Link>

        <nav className="site-nav" role="navigation" aria-label="Primary navigation">
          <div className="nav-links">
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/services" className="nav-link">Services</Link>
            <Link to="/for-sale" className="nav-link">For Sale</Link>
            <Link to="/portfolio" className="nav-link">Portfolio</Link>
            <Link to="/blog" className="nav-link">Blog</Link>
            <Link to="/resources" className="nav-link">Resources</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/admin" className="nav-link">Admin</Link>
          </div>
        </nav>

        <div className="nav-actions">
          <button onClick={() => setShowDonate(true)} className="btn hidden lg:inline-flex" aria-label="Donate">Donate</button>
          <button aria-label="Toggle theme" onClick={toggle} className="theme-toggle">
            {dark ? '🌙' : '☀️'}
          </button>

          <button className="mobile-toggle" aria-expanded={open} aria-controls="mobile-menu" onClick={toggleMenu} aria-label="Toggle menu">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>

      {/* mobile menu panel */}
      <div id="mobile-menu" className={`mobile-menu ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="mobile-inner">
          <Link to="/about" className="mobile-link" onClick={()=>setOpen(false)}>About</Link>
          <Link to="/services" className="mobile-link" onClick={()=>setOpen(false)}>Services</Link>
          <Link to="/for-sale" className="mobile-link" onClick={()=>setOpen(false)}>For Sale</Link>
          <Link to="/portfolio" className="mobile-link" onClick={()=>setOpen(false)}>Portfolio</Link>
          <Link to="/blog" className="mobile-link" onClick={()=>setOpen(false)}>Blog</Link>
          <Link to="/resources" className="mobile-link" onClick={()=>setOpen(false)}>Resources</Link>
          <Link to="/contact" className="mobile-link" onClick={()=>setOpen(false)}>Contact</Link>
          <Link to="/admin" className="mobile-link" onClick={()=>setOpen(false)}>Admin</Link>
          <button className="mobile-link hero-cta" onClick={()=>{setOpen(false); setShowDonate(true)}}>Donate</button>
        </div>
      </div>
      <DonateModal isOpen={showDonate} onClose={() => setShowDonate(false)} />
    </header>
  )
}

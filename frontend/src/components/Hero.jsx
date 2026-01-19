import React, { useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import TypingEffect from './TypingEffect'
import '../styles/Hero.css'

const DonateModalContent = lazy(() => import('../pages/Donate'))

export default function Hero(){
  const [openDonate, setOpenDonate] = useState(false)

  return (
    <section className="hero-section hero-professional">
      <div className="hero-wrap">
        <div className="hero-inner">
          <div className="hero-left">
            <p className="pretitle">Hi — I design & operate cloud-first apps</p>
            <h1 className="hero-title">Building Cloud-Powered Digital Experiences That Scale</h1>
            <p className="lead">I am <TypingEffect words={['Cloud Engineer', 'Full-Stack Developer', 'DevOps Specialist']} /></p>
            <div className="hero-ctas">
              <Link to="/contact" className="btn-primary" onClick={() => window.scrollTo(0, 0)}>Hire me</Link>
              <Link to="/portfolio" className="btn-secondary">View portfolio</Link>
            </div>
          </div>

          <div className="hero-right" role="img" aria-hidden="true">
            <div className="hero-visual">
              <div className="card">
                <div className="card-header">Featured</div>
                <div className="card-body">
                  <h3>Fast, secure, accessible</h3>
                  <p>Performance-first React + Django sites with progressive SEO and accessibility baked in.</p>
                  <ul>
                    <li>React (Vite) frontend</li>
                    <li>Django + DRF backend</li>
                    <li>Stripe & affiliate-ready</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {openDonate && (
        <div className="donate-modal" role="dialog" aria-modal="true" aria-label="Donate modal">
          <div className="donate-modal-backdrop" onClick={()=>setOpenDonate(false)}></div>
          <div className="donate-modal-panel">
            <button className="donate-close" onClick={()=>setOpenDonate(false)} aria-label="Close donate">✕</button>
            <Suspense fallback={<div className="p-4">Loading…</div>}>
              <DonateModalContent />
            </Suspense>
          </div>
        </div>
      )}
    </section>
  )
}

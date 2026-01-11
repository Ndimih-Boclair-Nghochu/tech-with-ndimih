import React, { Suspense, lazy, useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Particles from './components/Particles'
import FloatingActionButton from './components/FloatingActionButton'

const Home = lazy(() => import('./pages/Home'))
const About = lazy(() => import('./pages/About'))
const Services = lazy(() => import('./pages/Services'))
const Skills = lazy(() => import('./pages/Skills'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const ForSale = lazy(() => import('./pages/ForSale'))
const PortfolioDetail = lazy(() => import('./pages/PortfolioDetail'))
const BlogList = lazy(() => import('./pages/BlogList'))
const BlogDetail = lazy(() => import('./pages/BlogDetail'))
const Contact = lazy(() => import('./pages/Contact'))
const AddReview = lazy(() => import('./pages/AddReview'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const Donate = lazy(() => import('./pages/Donate'))
const Resources = lazy(() => import('./pages/Resources'))

export default function App(){
  const [reduce3D, setReduce3D] = useState(false)
  useEffect(()=>{
    const saved = localStorage.getItem('reduce3D')
    if(saved) setReduce3D(saved === 'true')
  },[])
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] text-white flex flex-col" style={{position: 'relative'}}>
      <a className="skip-link sr-only" href="#main">Skip to content</a>
      <Particles />
      <Navbar />

      <main id="main" className="flex-1 w-full">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="spinner mx-auto mb-4" style={{width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTop: '4px solid #00A8FF', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></div>
              <p className="text-gray-300">Loading page...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home reduce3D={reduce3D} setReduce3D={setReduce3D} />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/for-sale" element={<ForSale />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/:slug" element={<PortfolioDetail />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/add-review" element={<AddReview />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/admin" element={<AdminDashboard />} />
            {/* alias for older link names */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/resources" element={<Resources />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
      <FloatingActionButton />
    </div>
  )
}

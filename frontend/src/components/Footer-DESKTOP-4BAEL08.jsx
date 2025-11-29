import React from 'react'
import logo from '../assets/logo-cloud.svg'

export default function Footer(){
  return (
    <footer className="mt-16 pt-8 text-sm text-gray-300">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Tech with Ndimih" className="w-12 h-12 rounded" />
            <div>
              <div className="font-semibold">Tech with Ndimih</div>
              <div className="text-gray-400 text-xs">Building cloud-powered digital experiences</div>
            </div>
          </div>

          <nav className="flex items-center gap-4">
            <a href="/" className="text-gray-300 hover:text-white glow-on-hover">Home</a>
            <a href="/portfolio" className="text-gray-300 hover:text-white glow-on-hover">Portfolio</a>
            <a href="/blog" className="text-gray-300 hover:text-white glow-on-hover">Blog</a>
            <a href="/contact" className="text-gray-300 hover:text-white glow-on-hover">Contact</a>
          </nav>

          <div className="flex items-center gap-3">
            <a aria-label="GitHub" href="#" className="text-gray-300 hover:text-white glow-on-hover">GitHub</a>
            <a aria-label="LinkedIn" href="#" className="text-gray-300 hover:text-white glow-on-hover">LinkedIn</a>
            <a aria-label="Twitter" href="#" className="text-gray-300 hover:text-white glow-on-hover">Twitter</a>
          </div>
        </div>

        <div className="mt-6 text-center text-gray-500">© {new Date().getFullYear()} Tech with Ndimih — All rights reserved</div>
      </div>
    </footer>
  )
}

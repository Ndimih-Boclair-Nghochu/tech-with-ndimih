import React, { useEffect, useState } from 'react'
import api from '../lib/api'
import '../styles/ContactPage.css'

const getBackendRoot = () => {
  try{
    const apiUrl = import.meta.env.VITE_API_URL || 'https://api.ndimihboclair.com/api'
    return apiUrl.replace(/\/api\/?$/,'')
  }catch(e){ return 'https://api.ndimihboclair.com' }
}

export default function ContactDownloads(){
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    let mounted = true
    async function load(){
      try{
        const res = await api.get('/contact/files/')
        if(!mounted) return
        setFiles(res.data || [])
      }catch(e){
        setFiles([])
        console.error('Failed to load contact files:', e)
      }finally{ if(mounted) setLoading(false) }
    }
    load()
    return ()=> mounted = false
  },[])

  const cvs = files.filter(f => f.type === 'cv')
  const certs = files.filter(f => f.type === 'cert')
  const others = files.filter(f => !['cv','cert'].includes(f.type))

  const adminRoot = getBackendRoot()

  return (
    <aside className="contact-info appreciation-message">
      <div className="appreciation-content">
        <p className="appreciation-text">
          Thank you for your interest in my services. I appreciate the opportunity to work with you and I am confident that you will be satisfied with the quality and professionalism of my work. I am committed to delivering exceptional results that exceed your expectations.
        </p>
      </div>
    </aside>
  )
}

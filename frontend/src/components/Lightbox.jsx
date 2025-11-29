import React from 'react'
import '../styles/Lightbox.css'

export default function Lightbox({ images = [], current = 0, onClose = ()=>{} }){
  if(images.length === 0) return null
  const src = images[current]
  // Derive a usable alt from the filename when no explicit alt provided
  const alt = (() => {
    try{
      const url = new URL(src, window.location.origin)
      const name = url.pathname.split('/').pop() || 'image'
      return decodeURIComponent(name.replace(/[-_\d]+/g, ' ').replace(/\.(jpg|jpeg|png|webp|gif)$/i, '')).trim() || 'Image'
    }catch(e){
      return 'Image'
    }
  })()

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" onKeyDown={(e)=>{ if(e.key==='Escape') onClose() }} tabIndex={-1}>
      <div className="frame" onClick={(e)=>e.stopPropagation()}>
        <button className="close" aria-label="Close" onClick={onClose}>✕</button>
        <img src={src} alt={alt} />
      </div>
    </div>
  )
}

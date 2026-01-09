import React, { useState } from 'react'

export default function Card3D({ children, className = '', hoverLift = true, perspective = '1200' }){
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e) => {
    if (!hoverLift) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    
    const rotX = ((y - centerY) / centerY) * 5
    const rotY = ((centerX - x) / centerX) * 5
    
    setRotateX(rotX)
    setRotateY(rotY)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <div
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{
        perspective: `${perspective}px`,
        transform: hoverLift ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)` : 'none',
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  )
}

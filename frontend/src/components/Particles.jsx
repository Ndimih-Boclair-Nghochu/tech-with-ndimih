import React, { useEffect, useRef } from 'react'
import '../styles/Particles.css'

export default function Particles({ count = 40 }){
  const canvasRef = useRef(null)
  const rafRef = useRef(null)

  useEffect(()=>{
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if(prefersReduced) return

    const canvas = canvasRef.current
    if(!canvas) return
    const ctx = canvas.getContext('2d')
    let width = canvas.clientWidth
    let height = canvas.clientHeight
    canvas.width = width * devicePixelRatio
    canvas.height = height * devicePixelRatio
    ctx.scale(devicePixelRatio, devicePixelRatio)

    let particles = []
    function rand(min, max){ return Math.random() * (max - min) + min }
    for(let i=0;i<count;i++){
      particles.push({
        x: rand(0, width),
        y: rand(0, height),
        r: rand(0.6, 2.8),
        dx: rand(-0.2, 0.2),
        dy: rand(-0.1, 0.1),
        life: rand(60, 240)
      })
    }

    function resize(){
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      ctx.setTransform(devicePixelRatio,0,0,devicePixelRatio,0,0)
    }

    function draw(){
      ctx.clearRect(0,0,width,height)
      particles.forEach(p=>{
        p.x += p.dx
        p.y += p.dy
        p.life -= 1
        if(p.x < -10) p.x = width + 10
        if(p.x > width + 10) p.x = -10
        if(p.y < -10) p.y = height + 10
        if(p.y > height + 10) p.y = -10
        if(p.life <= 0){ p.x = rand(0,width); p.y = rand(0,height); p.life = rand(60,240)}

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6)
        grad.addColorStop(0, 'rgba(0,201,255,0.14)')
        grad.addColorStop(1, 'rgba(146,254,157,0)')
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r*3, 0, Math.PI*2)
        ctx.fill()
      })
      rafRef.current = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    draw()

    return ()=>{
      window.removeEventListener('resize', resize)
      if(rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [count])

  return (
    <div className="particles-wrap" aria-hidden="true">
      <canvas ref={canvasRef} className="particles-canvas" />
    </div>
  )
}

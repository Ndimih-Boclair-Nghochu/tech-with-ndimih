import React, { useEffect, useState } from 'react'
import skillsImg from '../assets/skills.png'
import { fetchSkills } from '../lib/api'

const SKILLS_FALLBACK = [
  { id: 'react', name: 'React' },
  { id: 'django', name: 'Django' },
  { id: 'tailwind', name: 'Tailwind' },
  { id: 'aws', name: 'AWS' },
  { id: 'docker', name: 'Docker' },
  { id: 'git', name: 'Git' },
  { id: 'cicd', name: 'CI/CD' },
  { id: 'three', name: 'Three.js' },
]

function Icon({ id }){
  const base = { width: 28, height: 28 }
  switch(id){
    case 'react':
      return (
        <svg {...base} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg"><g stroke="#00A8FF" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="128" cy="128" rx="84" ry="36" transform="rotate(0 128 128)"/><ellipse cx="128" cy="128" rx="84" ry="36" transform="rotate(60 128 128)"/><ellipse cx="128" cy="128" rx="84" ry="36" transform="rotate(120 128 128)"/><circle cx="128" cy="128" r="12" fill="#00A8FF"/></g></svg>
      )
    case 'django':
      return (
        <svg {...base} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="4" width="20" height="16" rx="2" fill="#0A0F1F" stroke="#00A8FF" strokeWidth="1.5"/><text x="12" y="16" fontSize="8" fill="#00A8FF" textAnchor="middle" fontFamily="Arial">DJ</text></svg>
      )
    case 'tailwind':
      return (
        <svg {...base} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 12c6 6 10 6 20 0-6-6-10-6-20 0z" fill="#00A8FF"/></svg>
      )
    case 'aws':
      return (
        <svg {...base} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 4l6 10H6z" fill="#00A8FF" opacity="0.9"/></svg>
      )
    case 'docker':
      return (
        <svg {...base} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="20" height="8" rx="2" fill="#00A8FF"/></svg>
      )
    case 'git':
      return (
        <svg {...base} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 3v6" stroke="#00A8FF" strokeWidth="2" strokeLinecap="round"/><path d="M6 9l8 6" stroke="#00A8FF" strokeWidth="2" strokeLinecap="round"/><circle cx="6" cy="3" r="1.6" fill="#00A8FF"/><circle cx="14" cy="15" r="1.6" fill="#00A8FF"/><circle cx="6" cy="9" r="1.6" fill="#00A8FF"/></svg>
      )
    case 'cicd':
      return (
        <svg {...base} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6" stroke="#00A8FF" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="14" r="6" stroke="#00A8FF" strokeWidth="2" fill="none"/></svg>
      )
    case 'three':
      return (
        <svg {...base} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2l8 4v8l-8 4-8-4V6z" stroke="#00A8FF" strokeWidth="1.6" fill="none"/></svg>
      )
    default:
      return <svg {...base}><circle cx="14" cy="14" r="10" fill="#00A8FF"/></svg>
  }
}

export default function SkillsGrid(){
  const [start, setStart] = React.useState(0)
  const [visible, setVisible] = React.useState(4)
  const [skills, setSkills] = React.useState([])

  React.useEffect(() => {
    let mounted = true
    fetchSkills()
      .then(data => {
        if (!mounted) return
        const skillsData = Array.isArray(data) ? data : (data.results || [])
        if (skillsData.length > 0) {
          setSkills(skillsData.map(s => ({ id: s.id?.toString() || s.name.toLowerCase(), name: s.name, icon: s.icon })))
        } else {
          setSkills(SKILLS_FALLBACK)
        }
      })
      .catch(() => {
        if (mounted) setSkills(SKILLS_FALLBACK)
      })
    return () => { mounted = false }
  }, [])

  React.useEffect(()=>{
    function update(){
      const w = window.innerWidth
      if(w >= 1200) setVisible(4)
      else if(w >= 900) setVisible(3)
      else if(w >= 640) setVisible(2)
      else setVisible(3) // show 3 items even on small/mobile screens per user request
    }
    update()
    window.addEventListener('resize', update)
    return ()=> window.removeEventListener('resize', update)
  }, [])

  // start the carousel at a specific skill if available
  React.useEffect(()=>{
    if (skills.length > 0) {
      const awsIndex = skills.findIndex(s => s.name?.toLowerCase() === 'aws' || s.id === 'aws')
      if(awsIndex >= 0) setStart(awsIndex)
    }
  }, [skills])

  const next = ()=> setStart(s => skills.length > 0 ? (s + 1) % skills.length : 0)
  const prev = ()=> setStart(s => skills.length > 0 ? (s - 1 + skills.length) % skills.length : 0)

  // auto-rotate right-to-left
  React.useEffect(()=>{
    if (skills.length === 0) return
    const t = setInterval(()=> setStart(s => (s + 1) % skills.length), 2600)
    return ()=> clearInterval(t)
  }, [skills.length])

  const itemsToShow = skills.length > 0 
    ? Array.from({length: Math.min(visible, skills.length)}).map((_, i)=> skills[(start + i) % skills.length])
    : []

  return (
    <section id="skills" className="py-12 px-6 bg-cover bg-center bg-no-repeat relative" style={{backgroundImage: `url(${skillsImg})`}}>
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h2 className="text-2xl font-semibold text-white">Skills</h2>
        <p className="text-gray-300 mt-2">Technology stack and tooling used in client projects.</p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button onClick={prev} className="px-3 py-2 border rounded">◀</button>
          <div
            className="skills-grid-container"
            style={{display: 'grid', gridTemplateColumns: `repeat(${itemsToShow.length}, minmax(0, 1fr))`, gap: '1rem', alignItems: 'stretch'}}
          >
            {itemsToShow.length === 0 ? (
              <div className="col-span-full text-center text-gray-400">No skills available</div>
            ) : (
              itemsToShow.map(s => (
                <div key={s.id} className="glass-card skills-card rounded flex flex-col items-center gap-3 card-hover mx-2">
                  <div className="skills-icon">
                    {s.icon ? <span className="text-3xl">{s.icon}</span> : <Icon id={s.id} />}
                  </div>
                  <div className="text-white font-medium">{s.name}</div>
                </div>
              ))
            )}
          </div>
          <button onClick={next} className="px-3 py-2 border rounded">▶</button>
        </div>
      </div>
    </section>
  )
}

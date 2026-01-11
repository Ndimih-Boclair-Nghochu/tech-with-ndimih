import React, { useEffect, useState } from 'react'
import skillsImg from '../assets/skills.png'
import { fetchSkills } from '../lib/api'

const SKILLS_FALLBACK = [
  { id: 'react', name: 'React' },
  { id: 'nodejs', name: 'Node.js' },
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
    case 'nodejs':
      return (
        <svg {...base} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3 11.5c0 .83-.67 1.5-1.5 1.5S12 14.33 12 13.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm-6 0c0 .83-.67 1.5-1.5 1.5S4 14.33 4 13.5 4.67 12 6 12s1.5.67 1.5 1.5z" fill="#00A8FF"/></svg>
      )
    default:
      return <svg {...base}><circle cx="14" cy="14" r="10" fill="#00A8FF"/></svg>
  }
}

export default function SkillsGrid(){
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

  return (
    <section id="skills" className="py-16 px-6 w-full relative overflow-hidden bg-gradient-to-b from-transparent via-purple-500/5 to-transparent">
      {/* Professional gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 animate-fade-in-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white">Skills</h2>
          <p className="text-gray-300 mt-2 text-lg">Technology stack and tooling used in client projects.</p>
        </div>

        {/* Skills Illustration */}
        <div className="mb-16 flex justify-center">
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden border border-blue-500/30 shadow-2xl hover:shadow-blue-500/30 transition-shadow duration-300">
            <img 
              src="https://storyset.com/illustration/tech-company/rafiki"
              alt="Tech Company"
              className="w-full h-auto object-cover rounded-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 scroll-stagger">
          {skills.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">No skills available</div>
          ) : (
            skills.map((s, idx) => {
              const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-scale', 'animate-pop-bounce', 'animate-pop-elastic', 'animate-pop-rotate', 'animate-pop-wobble']
              const randomAnimation = popAnimations[idx % popAnimations.length]
              const motionAnimations = ['animate-float', 'animate-slow-spin', 'animate-zoom-pulse', 'animate-bounce-loop']
              const motionAnimation = motionAnimations[idx % motionAnimations.length]
              
              return (
                <div key={s.id} className={`group rounded-xl overflow-hidden transition-all duration-400 ${randomAnimation} ${motionAnimation} lift-on-hover`} style={{ animationDelay: `${idx * 60}ms` }}>
                  <div className="bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-700/50 rounded-xl flex flex-col items-center gap-4 p-6 h-full backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300">
                    <div className="skills-icon transform transition-transform duration-300 group-hover:scale-125 group-hover:text-blue-400">
                      {s.icon ? <span className="text-4xl">{s.icon}</span> : <Icon id={s.id} />}
                    </div>
                    <div className="text-white font-bold text-center text-sm group-hover:text-blue-300 transition-colors">{s.name}</div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

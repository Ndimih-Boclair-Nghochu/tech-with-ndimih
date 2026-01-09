import React from 'react'
import '../styles/SkillsBar.css'

export default function SkillsBar({ skill, percent, index = 0 }){
  const popAnimations = ['animate-pop-fade-in-up', 'animate-pop-scale', 'animate-pop-bounce', 'animate-pop-elastic', 'animate-pop-rotate', 'animate-pop-wobble']
  const motionAnimations = ['animate-float', 'animate-slow-spin', 'animate-zoom-pulse', 'animate-bounce-loop', 'animate-tilt']
  
  const randomAnimation = popAnimations[index % popAnimations.length]
  const randomMotion = motionAnimations[index % motionAnimations.length]

  return (
    <div className={`skill mb-4 ${randomAnimation} ${randomMotion} lift-on-hover`} style={{ animationDelay: `${index * 60}ms` }}>
      <div className="flex justify-between text-sm font-medium mb-1">
        <span className="skill-name">{skill}</span>
        <span>{percent}%</span>
      </div>
      <div className="bar w-full h-3 bg-gray-200 rounded">
        <i style={{ width: `${percent}%` }} className="bg-gradient-to-r from-sky-400 to-rose-400" />
      </div>
    </div>
  )
}

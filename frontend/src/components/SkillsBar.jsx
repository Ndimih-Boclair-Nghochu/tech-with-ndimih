import React from 'react'
import '../styles/SkillsBar.css'

export default function SkillsBar({ skill, percent }){
  return (
    <div className="skill mb-4">
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

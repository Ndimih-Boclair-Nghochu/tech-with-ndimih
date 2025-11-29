import React from 'react'
import SkillsBar from '../components/SkillsBar'
import '../styles/Skills.css'

const list = [
  { skill: 'React', percent: 90 },
  { skill: 'Django', percent: 85 },
  { skill: 'AWS', percent: 80 },
  { skill: 'Design', percent: 75 }
]

export default function Skills(){
  return (
    <div className="skills-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white">
      <main className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">Skills</h1>
          <p className="text-lg muted">Technology stack and expertise</p>
        </div>
        <div className="mt-6 max-w-2xl mx-auto skills-grid">
          {list.map(s => <SkillsBar key={s.skill} skill={s.skill} percent={s.percent} />)}
        </div>
      </main>
    </div>
  )
}

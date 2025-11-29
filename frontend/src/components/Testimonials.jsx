import React from 'react'
import '../styles/Testimonials.css'

const sample = [
  { id: 1, name: 'Client A', quote: 'Excellent work — delivered ahead of schedule.' },
  { id: 2, name: 'Client B', quote: 'Great communication and design taste.' }
]

export default function Testimonials(){
  return (
    <section className="mt-12 testimonials-section">
      <h2 className="text-2xl font-semibold">Testimonials</h2>
      <div className="mt-4 testimonials-grid">
        {sample.map(t => (
          <blockquote key={t.id} className="testimonial bg-white p-4 rounded shadow-sm card-3d">
            <p className="quote">"{t.quote}"</p>
            <footer className="author mt-2 text-sm text-gray-500">— {t.name}</footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}

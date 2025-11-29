import React, { useState } from 'react'
import '../styles/ContactForm.css'
import api from '../lib/api'

export default function ContactForm(){
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)

  async function handleSubmit(e){
    e.preventDefault()
    setStatus('pending')
    try{
      const res = await api.post('/contact/', form)
      if(res.status >= 200 && res.status < 300){
        setStatus('sent')
        setForm({ name: '', email: '', message: '' })
      }else{
        setStatus('error')
      }
    }catch(err){
      setStatus('error')
      console.error('Contact form error:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form glass card-3d p-6 rounded shadow-sm">
      <label className="block mb-2">Name
        <input className="w-full border p-2 mt-1 bg-transparent text-gray-200" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required />
      </label>
      <label className="block mb-2">Email
        <input type="email" className="w-full border p-2 mt-1 bg-transparent text-gray-200" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required />
      </label>
      <label className="block mb-2">Message
        <textarea className="w-full border p-2 mt-1 bg-transparent text-gray-200" value={form.message} onChange={e=>setForm({...form, message: e.target.value})} rows={5} required />
      </label>

      <div className="flex items-center gap-4">
        <button className="px-4 py-2 bg-blue-600 text-white rounded" type="submit" disabled={status==='pending'}>Send</button>
        {status === 'sent' && <span className="text-green-400">Sent</span>}
        {status === 'error' && <span className="text-red-500">Error</span>}
        {status === 'pending' && <span className="text-yellow-400">Sending…</span>}
      </div>
    </form>
  )
}

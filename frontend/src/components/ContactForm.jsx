import React, { useState } from 'react'
import '../styles/ContactForm.css'
import api from '../lib/api'

export default function ContactForm(){
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleSubmit(e){
    e.preventDefault()
    setStatus('pending')
    setErrorMessage('')
    try{
      const res = await api.post('/contact/', form)
      if(res.status >= 200 && res.status < 300){
        setStatus('sent')
        setForm({ name: '', email: '', message: '' })
        // Clear success message after 5 seconds
        setTimeout(() => setStatus(null), 5000)
      }else{
        setStatus('error')
        setErrorMessage(res.data?.detail || 'Failed to send message')
      }
    }catch(err){
      setStatus('error')
      const errorDetail = err.response?.data?.detail || err.message || 'Failed to send message. Please check your email configuration.'
      setErrorMessage(errorDetail)
      console.error('Contact form error:', err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="contact-form glass card-3d p-6 rounded shadow-sm">
      <label className="block mb-2 text-white">Name
        <input className="w-full border border-gray-600 p-2 mt-1 bg-transparent text-gray-200 rounded" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required />
      </label>
      <label className="block mb-2 text-white">Email
        <input type="email" className="w-full border border-gray-600 p-2 mt-1 bg-transparent text-gray-200 rounded" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} required />
      </label>
      <label className="block mb-2 text-white">Message
        <textarea className="w-full border border-gray-600 p-2 mt-1 bg-transparent text-gray-200 rounded" value={form.message} onChange={e=>setForm({...form, message: e.target.value})} rows={5} required />
      </label>

      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed" type="submit" disabled={status==='pending'}>
            {status === 'pending' ? 'Sending…' : 'Send Message'}
          </button>
          {status === 'sent' && <span className="text-green-400 font-semibold">✓ Message sent successfully!</span>}
          {status === 'pending' && <span className="text-yellow-400">Sending…</span>}
        </div>
        {status === 'error' && errorMessage && (
          <div className="bg-red-900/30 border border-red-500/50 rounded p-3 text-red-300 text-sm">
            <strong className="block mb-1">Error:</strong>
            <p>{errorMessage}</p>
            {errorMessage.includes('authentication') || errorMessage.includes('password') ? (
              <p className="mt-2 text-xs text-red-200">
                Please check the EMAIL_SETUP.md file for instructions on setting up Gmail App Password.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </form>
  )
}

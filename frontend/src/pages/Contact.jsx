import React from 'react'
import ContactForm from '../components/ContactForm'
import ContactDownloads from '../components/ContactDownloads'
import '../styles/ContactPage.css'

export default function Contact(){
  return (
    <div className="contact-page bg-[linear-gradient(180deg,#071225,rgba(10,15,31,0.95))] min-h-screen text-white w-full">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 w-full">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold gradient-accent mb-3">Get in Touch</h1>
          <p className="text-base sm:text-lg muted">Reach out for projects, consulting, or design work.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="glass rounded-2xl p-6 sm:p-8 border border-blue-500/10">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Send a Message</h2>
            <ContactForm />
          </div>
          
          <div className="glass rounded-2xl p-6 sm:p-8 border border-blue-500/10 resources-card">
            <ContactDownloads />
          </div>
        </div>
      </main>
    </div>
  )
}

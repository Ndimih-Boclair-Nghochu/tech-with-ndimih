import React, { useState } from 'react'
import '../styles/FAB.css'
import DonateModal from './DonateModal'

export default function FloatingActionButton(){
  const [showDonate, setShowDonate] = useState(false)
  
  return (
    <>
      <button className="fab" aria-label="Donate" onClick={() => setShowDonate(true)}> 
        <span className="fab-icon">✦</span>
        <span className="fab-label">Donate</span>
      </button>
      <DonateModal isOpen={showDonate} onClose={() => setShowDonate(false)} />
    </>
  )
}

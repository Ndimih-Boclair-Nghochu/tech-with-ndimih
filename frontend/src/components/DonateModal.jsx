import React, { useEffect, useState } from 'react'
import { fetchDonationInfo, fetchBankDetails, createGiftCard } from '../lib/api'
import '../styles/DonateModal.css'

export default function DonateModal({ isOpen, onClose }){
  const [donationInfo, setDonationInfo] = useState(null)
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [giftCardForm, setGiftCardForm] = useState({ card_image: null, donor_name: '', donor_email: '', amount: '', notes: '' })
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadDonationData()
    }
  }, [isOpen])

  async function loadDonationData(){
    setLoading(true)
    try {
      const [info, bankData] = await Promise.all([
        fetchDonationInfo().catch(() => null),
        fetchBankDetails().catch(() => [])
      ])
      setDonationInfo(info)
      setBanks(bankData)
    } catch (error) {
      console.error('Error loading donation data:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleGiftCardUpload(e){
    e.preventDefault()
    if (!giftCardForm.card_image) {
      alert('Please select a gift card image to upload')
      return
    }

    setUploading(true)
    setUploadSuccess(false)
    try {
      const formData = new FormData()
      formData.append('card_image', giftCardForm.card_image)
      if (giftCardForm.donor_name) formData.append('donor_name', giftCardForm.donor_name)
      if (giftCardForm.donor_email) formData.append('donor_email', giftCardForm.donor_email)
      if (giftCardForm.amount) formData.append('amount', giftCardForm.amount)
      if (giftCardForm.notes) formData.append('notes', giftCardForm.notes)
      
      await createGiftCard(formData)
      setUploadSuccess(true)
      setGiftCardForm({ card_image: null, donor_name: '', donor_email: '', amount: '', notes: '' })
      // Reset file input
      const fileInput = document.querySelector('.gift-card-form input[type="file"]')
      if (fileInput) fileInput.value = ''
      setTimeout(() => {
        setUploadSuccess(false)
      }, 3000)
    } catch (error) {
      console.error('Error uploading gift card:', error)
      alert('Failed to upload gift card. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  function copyToClipboard(text, label){
    if (!text) return
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} copied to clipboard!`)
    }).catch(() => {
      alert(`Failed to copy ${label}`)
    })
  }

  if (!isOpen) return null

  return (
    <div className="donate-modal-overlay" onClick={onClose}>
      <div className="donate-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="donate-modal-close" onClick={onClose}>×</button>
        
        <div className="donate-modal-header">
          <h2>Thank You for Supporting Me</h2>
          <p className="donate-thank-you">Your support is what keeps me going.</p>
        </div>

        {loading ? (
          <div className="donate-loading">Loading donation information...</div>
        ) : (
          <div className="donate-modal-body">
            {/* Mobile Money Section */}
            {(donationInfo?.mtn_mobile_money || donationInfo?.orange_money) && (
              <section className="donate-section">
                <h3>Mobile Money</h3>
                <div className="donate-options">
                  {donationInfo.mtn_mobile_money && (
                    <div className="donate-option">
                      <div className="donate-option-label">MTN Mobile Money</div>
                      <div className="donate-option-value">
                        <span>{donationInfo.mtn_mobile_money}</span>
                        <button 
                          className="donate-copy-btn" 
                          onClick={() => copyToClipboard(donationInfo.mtn_mobile_money, 'MTN Mobile Money number')}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  )}
                  {donationInfo.orange_money && (
                    <div className="donate-option">
                      <div className="donate-option-label">Orange Money</div>
                      <div className="donate-option-value">
                        <span>{donationInfo.orange_money}</span>
                        <button 
                          className="donate-copy-btn" 
                          onClick={() => copyToClipboard(donationInfo.orange_money, 'Orange Money number')}
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Card Number Section */}
            {donationInfo?.card_number && (
              <section className="donate-section">
                <h3>Card Number</h3>
                <div className="donate-option">
                  <div className="donate-option-value">
                    <span>{donationInfo.card_number}</span>
                    <button 
                      className="donate-copy-btn" 
                      onClick={() => copyToClipboard(donationInfo.card_number, 'Card number')}
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>
              </section>
            )}

            {/* Bank Details Section */}
            {banks.length > 0 && (
              <section className="donate-section">
                <h3>Bank Transfer</h3>
                <div className="banks-list">
                  {banks.map(bank => (
                    <div key={bank.id} className="bank-detail-card">
                      <div className="bank-name">{bank.bank_name}</div>
                      <div className="bank-info">
                        <div className="bank-field">
                          <span className="bank-label">Account Name:</span>
                          <span className="bank-value">{bank.account_name}</span>
                        </div>
                        <div className="bank-field">
                          <span className="bank-label">Account Number:</span>
                          <div className="bank-value-with-copy">
                            <span>{bank.account_number}</span>
                            <button 
                              className="donate-copy-btn small" 
                              onClick={() => copyToClipboard(bank.account_number, 'Account number')}
                            >
                              📋
                            </button>
                          </div>
                        </div>
                        {bank.swift_code && (
                          <div className="bank-field">
                            <span className="bank-label">SWIFT Code:</span>
                            <span className="bank-value">{bank.swift_code}</span>
                          </div>
                        )}
                        {bank.branch && (
                          <div className="bank-field">
                            <span className="bank-label">Branch:</span>
                            <span className="bank-value">{bank.branch}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Gift Card Upload Section */}
            <section className="donate-section">
              <h3>Upload Gift Card</h3>
              <form onSubmit={handleGiftCardUpload} className="gift-card-form">
                <div className="form-group">
                  <label>Gift Card Image *</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    required
                    onChange={(e) => setGiftCardForm({...giftCardForm, card_image: e.target.files[0]})}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name (Optional)</label>
                    <input 
                      type="text" 
                      value={giftCardForm.donor_name}
                      onChange={(e) => setGiftCardForm({...giftCardForm, donor_name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label>Your Email (Optional)</label>
                    <input 
                      type="email" 
                      value={giftCardForm.donor_email}
                      onChange={(e) => setGiftCardForm({...giftCardForm, donor_email: e.target.value})}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Amount (Optional)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={giftCardForm.amount}
                    onChange={(e) => setGiftCardForm({...giftCardForm, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Notes (Optional)</label>
                  <textarea 
                    value={giftCardForm.notes}
                    onChange={(e) => setGiftCardForm({...giftCardForm, notes: e.target.value})}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
                {uploadSuccess && (
                  <div className="success-message">✓ Gift card uploaded successfully! Thank you!</div>
                )}
                <button type="submit" className="upload-btn" disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Upload Gift Card'}
                </button>
              </form>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}


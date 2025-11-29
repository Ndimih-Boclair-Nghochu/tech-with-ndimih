import React, { useState, useEffect, useContext } from 'react'
import { AuthContext } from '../context/AuthContext'
import { setAuthToken } from '../lib/api'

export default function DonationsTab({
  fetchDonationInfo,
  createDonationInfo,
  updateDonationInfo,
  fetchBankDetails,
  createBankDetail,
  updateBankDetail,
  deleteBankDetail,
  fetchGiftCards,
  deleteGiftCard,
  updateGiftCard,
  addToast
}) {
  const { token } = useContext(AuthContext)
  const [donationInfo, setDonationInfo] = useState(null)
  const [banks, setBanks] = useState([])
  const [giftCards, setGiftCards] = useState([])
  const [loading, setLoading] = useState(true)
  const [donationForm, setDonationForm] = useState({ mtn_mobile_money: '', orange_money: '', card_number: '', is_active: true })
  const [bankForm, setBankForm] = useState({ bank_name: '', account_name: '', account_number: '', swift_code: '', branch: '', order: 0 })
  const [editingBank, setEditingBank] = useState(null)
  const [editingGiftCard, setEditingGiftCard] = useState(null)

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token])

  async function loadData(){
    setLoading(true)
    try {
      setAuthToken(token)
      const [info, bankData, cardData] = await Promise.all([
        fetchDonationInfo().catch(() => null),
        fetchBankDetails().catch(() => []),
        fetchGiftCards().catch(() => [])
      ])
      setDonationInfo(info)
      setBanks(bankData)
      setGiftCards(cardData)
      if (info) {
        setDonationForm({
          mtn_mobile_money: info.mtn_mobile_money || '',
          orange_money: info.orange_money || '',
          card_number: info.card_number || '',
          is_active: info.is_active !== false
        })
      }
    } catch (error) {
      addToast('Failed to load donation data', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveDonationInfo(e){
    e.preventDefault()
    try {
      setAuthToken(token)
      if (donationInfo) {
        await updateDonationInfo(donationInfo.id, donationForm)
        addToast('Donation info updated successfully', 'success')
      } else {
        await createDonationInfo(donationForm)
        addToast('Donation info created successfully', 'success')
      }
      loadData()
    } catch (error) {
      addToast('Failed to save donation info', 'error')
    }
  }

  async function handleSaveBank(e){
    e.preventDefault()
    if (!donationInfo) {
      addToast('Please create donation info first', 'error')
      return
    }
    try {
      setAuthToken(token)
      if (editingBank) {
        await updateBankDetail(editingBank.id, { ...bankForm, donation_info: donationInfo.id })
        addToast('Bank detail updated successfully', 'success')
        setEditingBank(null)
      } else {
        await createBankDetail({ ...bankForm, donation_info: donationInfo.id })
        addToast('Bank detail added successfully', 'success')
      }
      setBankForm({ bank_name: '', account_name: '', account_number: '', swift_code: '', branch: '', order: 0 })
      loadData()
    } catch (error) {
      addToast('Failed to save bank detail', 'error')
    }
  }

  function openEditBank(bank){
    setEditingBank(bank)
    setBankForm({
      bank_name: bank.bank_name || '',
      account_name: bank.account_name || '',
      account_number: bank.account_number || '',
      swift_code: bank.swift_code || '',
      branch: bank.branch || '',
      order: bank.order || 0
    })
  }

  function cancelEditBank(){
    setEditingBank(null)
    setBankForm({ bank_name: '', account_name: '', account_number: '', swift_code: '', branch: '', order: 0 })
  }

  async function handleDeleteBank(id){
    if (!confirm('Are you sure you want to delete this bank detail?')) return
    try {
      setAuthToken(token)
      await deleteBankDetail(id)
      addToast('Bank detail deleted successfully', 'success')
      loadData()
    } catch (error) {
      addToast('Failed to delete bank detail', 'error')
    }
  }

  async function handleDeleteGiftCard(id){
    if (!confirm('Are you sure you want to delete this gift card?')) return
    try {
      setAuthToken(token)
      await deleteGiftCard(id)
      addToast('Gift card deleted successfully', 'success')
      loadData()
    } catch (error) {
      addToast('Failed to delete gift card', 'error')
    }
  }

  async function handleUpdateGiftCard(e){
    e.preventDefault()
    try {
      setAuthToken(token)
      const formData = new FormData()
      if (editingGiftCard.card_image instanceof File) {
        formData.append('card_image', editingGiftCard.card_image)
      }
      formData.append('donor_name', editingGiftCard.donor_name || '')
      formData.append('donor_email', editingGiftCard.donor_email || '')
      formData.append('amount', editingGiftCard.amount || '')
      formData.append('notes', editingGiftCard.notes || '')
      formData.append('is_processed', editingGiftCard.is_processed || false)
      
      await updateGiftCard(editingGiftCard.id, formData)
      addToast('Gift card updated successfully', 'success')
      setEditingGiftCard(null)
      loadData()
    } catch (error) {
      addToast('Failed to update gift card', 'error')
    }
  }

  if (loading) {
    return <div className="loading">Loading donation data...</div>
  }

  return (
    <>
      {/* Donation Info Section */}
      <div className="content-card">
        <h2>Donation Information</h2>
        <form onSubmit={handleSaveDonationInfo}>
          <div className="form-grid">
            <div className="form-group">
              <label>MTN Mobile Money</label>
              <input 
                type="text" 
                value={donationForm.mtn_mobile_money}
                onChange={(e) => setDonationForm({...donationForm, mtn_mobile_money: e.target.value})}
                placeholder="e.g., 675123456"
              />
            </div>
            <div className="form-group">
              <label>Orange Money</label>
              <input 
                type="text" 
                value={donationForm.orange_money}
                onChange={(e) => setDonationForm({...donationForm, orange_money: e.target.value})}
                placeholder="e.g., 675123456"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Card Number</label>
            <input 
              type="text" 
              value={donationForm.card_number}
              onChange={(e) => setDonationForm({...donationForm, card_number: e.target.value})}
              placeholder="e.g., 1234 5678 9012 3456"
            />
          </div>
          <div className="form-group">
            <label>
              <input 
                type="checkbox" 
                checked={donationForm.is_active}
                onChange={(e) => setDonationForm({...donationForm, is_active: e.target.checked})}
              />
              Active (show on donate modal)
            </label>
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-success">
              {donationInfo ? 'Update Donation Info' : 'Create Donation Info'}
            </button>
          </div>
        </form>
      </div>

      {/* Bank Details Section */}
      {donationInfo && (
        <>
          <div className="content-card">
            <h2>Add Bank Detail</h2>
            <form onSubmit={handleSaveBank}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Bank Name *</label>
                  <input 
                    required
                    type="text" 
                    value={bankForm.bank_name}
                    onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})}
                    placeholder="e.g., First Bank"
                  />
                </div>
                <div className="form-group">
                  <label>Account Name *</label>
                  <input 
                    required
                    type="text" 
                    value={bankForm.account_name}
                    onChange={(e) => setBankForm({...bankForm, account_name: e.target.value})}
                    placeholder="Account holder name"
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Account Number *</label>
                  <input 
                    required
                    type="text" 
                    value={bankForm.account_number}
                    onChange={(e) => setBankForm({...bankForm, account_number: e.target.value})}
                    placeholder="Account number"
                  />
                </div>
                <div className="form-group">
                  <label>Order</label>
                  <input 
                    type="number" 
                    value={bankForm.order}
                    onChange={(e) => setBankForm({...bankForm, order: parseInt(e.target.value) || 0})}
                    placeholder="Display order"
                  />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>SWIFT Code</label>
                  <input 
                    type="text" 
                    value={bankForm.swift_code}
                    onChange={(e) => setBankForm({...bankForm, swift_code: e.target.value})}
                    placeholder="SWIFT/BIC code"
                  />
                </div>
                <div className="form-group">
                  <label>Branch</label>
                  <input 
                    type="text" 
                    value={bankForm.branch}
                    onChange={(e) => setBankForm({...bankForm, branch: e.target.value})}
                    placeholder="Branch name/location"
                  />
                </div>
              </div>
              <div className="btn-group">
                <button type="submit" className="btn btn-success">
                  {editingBank ? 'Update Bank' : 'Add Bank'}
                </button>
                {editingBank && (
                  <button type="button" className="btn btn-secondary" onClick={cancelEditBank}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="content-card">
            <h2>Manage Banks ({banks.length})</h2>
            {banks.length === 0 ? (
              <div className="empty-state">No banks added yet. Add your first bank above!</div>
            ) : (
              <div className="items-list">
                {banks.map(bank => (
                  <div key={bank.id} className="item-card">
                    <div className="item-info">
                      <div className="item-title">{bank.bank_name}</div>
                      <div className="item-meta">Account: {bank.account_name} - {bank.account_number}</div>
                      {bank.swift_code && <div className="item-meta">SWIFT: {bank.swift_code}</div>}
                      {bank.branch && <div className="item-meta">Branch: {bank.branch}</div>}
                      <div className="item-meta">Order: {bank.order}</div>
                    </div>
                    <div className="item-actions">
                      <button className="btn btn-warning" onClick={() => openEditBank(bank)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => handleDeleteBank(bank.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Gift Cards Section */}
      <div className="content-card">
        <h2>Gift Cards ({giftCards.length})</h2>
        {giftCards.length === 0 ? (
          <div className="empty-state">No gift cards uploaded yet.</div>
        ) : (
          <div className="items-list">
            {giftCards.map(card => (
              <div key={card.id} className="item-card">
                <div className="item-info">
                  {card.card_image_url && (
                    <img src={card.card_image_url} alt="Gift card" style={{maxWidth: '200px', maxHeight: '150px', borderRadius: '8px', marginBottom: '0.5rem'}} />
                  )}
                  <div className="item-title">
                    {card.donor_name || 'Anonymous'} 
                    {card.amount && ` - $${parseFloat(card.amount).toFixed(2)}`}
                  </div>
                  {card.donor_email && <div className="item-meta">Email: {card.donor_email}</div>}
                  {card.notes && <div className="item-meta">Notes: {card.notes}</div>}
                  <div className="item-meta">
                    Uploaded: {new Date(card.created_at).toLocaleDateString()} | 
                    Status: {card.is_processed ? 'Processed' : 'Pending'}
                  </div>
                </div>
                <div className="item-actions">
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                    <input 
                      type="checkbox" 
                      checked={card.is_processed || false}
                      onChange={async (e) => {
                        try {
                          setAuthToken(token)
                          await updateGiftCard(card.id, { is_processed: e.target.checked })
                          addToast('Gift card status updated', 'success')
                          loadData()
                        } catch (error) {
                          addToast('Failed to update status', 'error')
                        }
                      }}
                    />
                    Processed
                  </label>
                  <button className="btn btn-danger" onClick={() => handleDeleteGiftCard(card.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}


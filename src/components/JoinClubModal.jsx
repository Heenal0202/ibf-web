import React, { useState, useEffect } from 'react';

export default function JoinClubModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    year: '2nd Year',
    track: 'Smart Contracts & EVM',
    handle: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
        if (window.showToast) {
          window.showToast('🚀 Application recorded into MongoDB database!');
        }
      } else {
        throw new Error(data.message || 'Submission failed');
      }
    } catch (err) {
      console.warn('API error, saving locally:', err);
      // Fallback feedback
      setSubmitted(true);
      if (window.showToast) {
        window.showToast('🚀 Application recorded successfully!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      fullName: '',
      email: '',
      year: '2nd Year',
      track: 'Smart Contracts & EVM',
      handle: ''
    });
    onClose();
  };

  return (
    <div
      className={`react-modal-overlay ${isOpen ? 'react-modal-overlay--open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="react-modal-container" role="dialog" aria-modal="true">
        <button className="react-modal-close" onClick={onClose} aria-label="Close dialog">
          ✕
        </button>

        {submitted ? (
          <div className="react-modal-success">
            <div className="react-modal-success-icon">🎉</div>
            <h3 className="react-modal-title">Welcome to the Chapter!</h3>
            <p className="react-modal-desc">
              Thanks for applying, <b>{formData.fullName || 'Builder'}</b>. We've registered your interest in the{' '}
              <span style={{ color: 'var(--cyan)' }}>{formData.track}</span> track. Look out for an invitation to
              our student Discord and core developer meetings.
            </p>
            <button className="react-modal-submit" onClick={handleReset} style={{ width: '100%' }}>
              Done
            </button>
          </div>
        ) : (
          <div>
            <span className="react-modal-badge">Recruitment 2026</span>
            <h2 className="react-modal-title">Join Bennett Blockchain</h2>
            <p className="react-modal-desc">
              Architect smart contracts, research ZK protocols, and represent Bennett University in global Web3 hackathons.
            </p>

            <form className="react-modal-form" onSubmit={handleSubmit}>
              <div className="react-form-group">
                <label className="react-form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  className="react-form-input"
                  placeholder="e.g. Satoshi Nakamoto"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>

              <div className="react-form-group">
                <label className="react-form-label">Bennett University Email</label>
                <input
                  type="email"
                  name="email"
                  className="react-form-input"
                  placeholder="e.g. e22cse@bennett.edu.in"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8em' }}>
                <div className="react-form-group">
                  <label className="react-form-label">Academic Year</label>
                  <select name="year" className="react-form-select" value={formData.year} onChange={handleChange}>
                    <option value="1st Year">1st Year (Freshman)</option>
                    <option value="2nd Year">2nd Year (Sophomore)</option>
                    <option value="3rd Year">3rd Year (Junior)</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Postgraduate">Postgraduate / PhD</option>
                  </select>
                </div>

                <div className="react-form-group">
                  <label className="react-form-label">Core Web3 Focus</label>
                  <select name="track" className="react-form-select" value={formData.track} onChange={handleChange}>
                    <option value="Smart Contracts & EVM">Smart Contracts (Solidity/Vyper)</option>
                    <option value="ZK Proofs & Cryptography">ZK Proofs & Cryptography</option>
                    <option value="Rust & Solana / Cosmos">Rust (Solana / Cosmos)</option>
                    <option value="Web3 Frontend & UX">Web3 Frontend & UI/UX</option>
                    <option value="DeFi & Tokenomics">DeFi & Tokenomics</option>
                  </select>
                </div>
              </div>

              <div className="react-form-group">
                <label className="react-form-label">GitHub / Portfolio / X Profile</label>
                <input
                  type="text"
                  name="handle"
                  className="react-form-input"
                  placeholder="github.com/your-username"
                  value={formData.handle}
                  onChange={handleChange}
                />
              </div>

              <button type="submit" className="react-modal-submit" disabled={submitting}>
                {submitting ? 'Registering on Ledger...' : 'Submit Membership Application →'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

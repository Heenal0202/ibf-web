/**
 * Bennett Blockchain Club — React Framework Integration
 * Embeds React 18 & ReactDOM without requiring a build step.
 * Powered by React hooks, reactive state, and HTM tagged templates.
 */

// Ensure React and HTM are available
const { useState, useEffect, useCallback, useRef } = window.React || {};
const html = window.htm ? window.htm.bind(window.React.createElement) : null;

if (!window.React || !window.ReactDOM || !html) {
  console.error('React, ReactDOM, or HTM could not be found. Please check CDN script tags.');
}

/* ==========================================================================
   1. GLOBAL TOAST NOTIFICATION COMPONENT (REACT)
   ========================================================================== */
function ToastContainer() {
  const [toast, setToast] = useState({ visible: false, text: '' });
  const timerRef = useRef(null);

  useEffect(() => {
    window.showToast = (text) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setToast({ visible: true, text });
      timerRef.current = setTimeout(() => {
        setToast((prev) => ({ ...prev, visible: false }));
      }, 2600);
    };

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return html`
    <div className=${`toast ${toast.visible ? 'toast--visible' : ''}`} role="status">
      ${toast.text}
    </div>
  `;
}

/* ==========================================================================
   2. REACT NAVBAR COMPONENT
   ========================================================================= */
function Navbar({ route, onNavigate, onOpenJoinModal }) {
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);

  const handleLinkClick = (e, targetRoute) => {
    e.preventDefault();
    setIsBurgerOpen(false);
    onNavigate(targetRoute);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'sponsors', label: 'Sponsors' },
    { id: 'events', label: 'Events' },
    { id: 'leads', label: 'Leads' }
  ];

  return html`
    <nav className="nav">
      <div className="nav__brand">
        <a
          href="#/home"
          onClick=${(e) => handleLinkClick(e, 'home')}
          style=${{ display: 'flex', alignItems: 'center', gap: '0.4em', color: 'inherit' }}
        >
          <span className="nav__mark">B{</span>
          <span>Bennett</span>
          <span className="nav__sep">/</span>
          <span style=${{ fontWeight: 500, color: 'var(--muted)' }}>Blockchain Club</span>
        </a>
      </div>

      <button
        className=${`nav__burger ${isBurgerOpen ? 'nav__burger--active' : ''}`}
        onClick=${() => setIsBurgerOpen(!isBurgerOpen)}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className=${`nav__links ${isBurgerOpen ? 'nav__links--open' : ''}`}>
        ${navLinks.map(
          (link) => html`
            <li key=${link.id}>
              <a
                href=${`#/${link.id}`}
                onClick=${(e) => handleLinkClick(e, link.id)}
                className=${`nav-link ${route === link.id ? 'active' : ''}`}
              >
                ${link.label}
              </a>
            </li>
          `
        )}
        <li>
          <button
            className="nav__cta"
            onClick=${() => {
              setIsBurgerOpen(false);
              onOpenJoinModal();
            }}
            style=${{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'transparent' }}
          >
            Join Club ↗
          </button>
        </li>
      </ul>
    </nav>
  `;
}

/* ==========================================================================
   3. REACT JOIN CLUB MODAL COMPONENT
   ========================================================================== */
function JoinClubModal({ isOpen, onClose }) {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      if (window.showToast) {
        window.showToast('🚀 Application logged to Bennett Blockchain ledger!');
      }
    }, 750);
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

  return html`
    <div
      className=${`react-modal-overlay ${isOpen ? 'react-modal-overlay--open' : ''}`}
      onClick=${(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="react-modal-container" role="dialog" aria-modal="true">
        <button className="react-modal-close" onClick=${onClose} aria-label="Close dialog">
          ✕
        </button>

        ${submitted
          ? html`
              <div className="react-modal-success">
                <div className="react-modal-success-icon">🎉</div>
                <h3 className="react-modal-title">Welcome to the Chapter!</h3>
                <p className="react-modal-desc">
                  Thanks for applying, <b>${formData.fullName || 'Builder'}</b>. We've registered your interest in the{' '}
                  <span style=${{ color: 'var(--cyan)' }}>${formData.track}</span> track. Look out for an invitation to
                  our student Discord and core developer meetings.
                </p>
                <button className="react-modal-submit" onClick=${handleReset} style=${{ width: '100%' }}>
                  Done
                </button>
              </div>
            `
          : html`
              <div>
                <span className="react-modal-badge">Recruitment 2026</span>
                <h2 className="react-modal-title">Join Bennett Blockchain</h2>
                <p className="react-modal-desc">
                  Architect smart contracts, research ZK protocols, and represent Bennett University in global Web3 hackathons.
                </p>

                <form className="react-modal-form" onSubmit=${handleSubmit}>
                  <div className="react-form-group">
                    <label className="react-form-label">Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      className="react-form-input"
                      placeholder="e.g. Satoshi Nakamoto"
                      required
                      value=${formData.fullName}
                      onChange=${handleChange}
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
                      value=${formData.email}
                      onChange=${handleChange}
                    />
                  </div>

                  <div style=${{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8em' }}>
                    <div className="react-form-group">
                      <label className="react-form-label">Academic Year</label>
                      <select name="year" className="react-form-select" value=${formData.year} onChange=${handleChange}>
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Senior)</option>
                        <option value="Postgraduate">Postgraduate / PhD</option>
                      </select>
                    </div>

                    <div className="react-form-group">
                      <label className="react-form-label">Core Web3 Focus</label>
                      <select name="track" className="react-form-select" value=${formData.track} onChange=${handleChange}>
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
                      value=${formData.handle}
                      onChange=${handleChange}
                    />
                  </div>

                  <button type="submit" className="react-modal-submit" disabled=${submitting}>
                    ${submitting ? 'Registering on Ledger...' : 'Submit Membership Application →'}
                  </button>
                </form>
              </div>
            `}
      </div>
    </div>
  `;
}

/* ==========================================================================
   4. REACT HERO COPY CHIP COMPONENT
   ========================================================================== */
function CopyChip({ text, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        if (window.showToast) window.showToast(`Copied to clipboard: ${text}`);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopied(true);
        if (window.showToast) window.showToast(`Copied: ${text}`);
        setTimeout(() => setCopied(false), 2000);
      });
  };

  return html`
    <span
      className="chip chip--copy"
      onClick=${handleCopy}
      style=${{
        color: 'var(--paper)',
        borderColor: copied ? 'var(--cyan)' : 'rgba(244, 240, 230, 0.4)',
        cursor: 'pointer',
        transition: 'all 0.25s ease'
      }}
      title="Click to copy repository command"
    >
      ${copied ? `✓ Copied!` : label}
    </span>
  `;
}

/* ==========================================================================
   5. ROOT REACT APP ORCHESTRATOR
   ========================================================================== */
function ReactApp() {
  const validRoutes = ['home', 'sponsors', 'events', 'leads'];

  const getHashRoute = () => {
    const raw = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim();
    return validRoutes.includes(raw) ? raw : 'home';
  };

  const [route, setRoute] = useState(getHashRoute());
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);

  // Sync route changes with DOM views & animations
  const navigateTo = useCallback((targetRoute) => {
    window.location.hash = `#/${targetRoute}`;
  }, []);

  useEffect(() => {
    // Expose open modal globally for any static buttons (e.g. Hero or Leads page)
    window.openJoinModal = () => setIsJoinModalOpen(true);

    const onHashChange = () => {
      const newRoute = getHashRoute();
      setRoute(newRoute);

      // 1. Update DOM page view visibility
      document.querySelectorAll('.page-view').forEach((page) => {
        page.classList.remove('active');
      });
      const targetPage = document.getElementById(`page-${newRoute}`);
      if (targetPage) {
        targetPage.classList.add('active');
      }

      // 2. Scroll to top
      window.scrollTo({ top: 0, behavior: 'instant' });

      // 3. Trigger animations and WebGL updates
      if (window.BennettWeb3) {
        if (newRoute === 'home') {
          if (window.BennettWeb3.animateHeadline) window.BennettWeb3.animateHeadline();
          if (window.BennettWeb3.scrollRenderer?.resize) {
            setTimeout(() => {
              try {
                window.BennettWeb3.scrollRenderer.resize();
              } catch (e) {
                console.warn(e);
              }
            }, 60);
          }
        } else if (newRoute === 'sponsors') {
          if (window.BennettWeb3.animateSponsorsPage) window.BennettWeb3.animateSponsorsPage();
        } else if (newRoute === 'events') {
          if (window.BennettWeb3.animateEventsPage) window.BennettWeb3.animateEventsPage();
        }

        const sandAnim = window.BennettWeb3.getSandAnim ? window.BennettWeb3.getSandAnim() : null;
        if (sandAnim) {
          if (newRoute === 'events') {
            setTimeout(() => sandAnim.start(), 80);
          } else {
            sandAnim.stop();
          }
        }
      }
    };

    window.addEventListener('hashchange', onHashChange);
    // Initialize initial route view
    onHashChange();

    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return html`
    <div className="react-app-root-container">
      <${Navbar} route=${route} onNavigate=${navigateTo} onOpenJoinModal=${() => setIsJoinModalOpen(true)} />
      <${ToastContainer} />
      <${JoinClubModal} isOpen=${isJoinModalOpen} onClose=${() => setIsJoinModalOpen(false)} />
    </div>
  `;
}

/* ==========================================================================
   6. MOUNT REACT APP & COMPONENTS ON DOM READY
   ========================================================================== */
function initReactFramework() {
  if (!window.ReactDOM || !window.ReactDOM.createRoot) {
    console.warn('ReactDOM.createRoot is not available.');
    return;
  }

  // 1. Mount Main Navbar & Modals Shell
  const navContainer = document.getElementById('react-navbar-root');
  if (navContainer) {
    const root = window.ReactDOM.createRoot(navContainer);
    root.render(html`<${ReactApp} />`);
  }

  // 2. Mount Reactive Copy Chip in Hero
  const chipContainer = document.getElementById('react-hero-copy');
  if (chipContainer) {
    const chipRoot = window.ReactDOM.createRoot(chipContainer);
    chipRoot.render(
      html`<${CopyChip} text="git clone https://github.com/bennett-blockchain" label="📋 git clone bennett-blockchain" />`
    );
  }

  // Connect any static "Join Club" or "Partner With Us" buttons to open React modal
  document.querySelectorAll('a[href="#/leads"].nav__cta, .hero__actions .btn--yellow').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (btn.getAttribute('href') === '#/leads' && btn.textContent.includes('Join')) {
        e.preventDefault();
        if (window.openJoinModal) window.openJoinModal();
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initReactFramework);
} else {
  initReactFramework();
}

export { ReactApp, Navbar, JoinClubModal, ToastContainer, CopyChip };

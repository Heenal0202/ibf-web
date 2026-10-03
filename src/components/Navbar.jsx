import React, { useState } from 'react';

export default function Navbar({ currentRoute, onNavigate, onOpenJoinModal }) {
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
    { id: 'leads', label: 'Leads' },
    { id: 'admin', label: 'Admin 🛡️' }
  ];

  return (
    <nav className="nav">
      <div className="nav__brand">
        <a
          href="#/home"
          onClick={(e) => handleLinkClick(e, 'home')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4em', color: 'inherit', textDecoration: 'none' }}
        >
          <span className="nav__mark">B&#123;</span>
          <span>Bennett</span>
          <span className="nav__sep">/</span>
          <span style={{ fontWeight: 500, color: 'var(--muted)' }}>Blockchain Club</span>
        </a>
      </div>

      <button
        className={`nav__burger ${isBurgerOpen ? 'nav__burger--active' : ''}`}
        onClick={() => setIsBurgerOpen(!isBurgerOpen)}
        aria-label="Toggle navigation menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <ul className={`nav__links ${isBurgerOpen ? 'nav__links--open' : ''}`}>
        {navLinks.map((link) => (
          <li key={link.id}>
            <a
              href={`#/${link.id}`}
              onClick={(e) => handleLinkClick(e, link.id)}
              className={`nav-link ${currentRoute === link.id ? 'active' : ''}`}
            >
              {link.label}
            </a>
          </li>
        ))}
        <li>
          <button
            className="nav__cta"
            onClick={() => {
              setIsBurgerOpen(false);
              onOpenJoinModal();
            }}
            style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit', background: 'transparent' }}
          >
            Join Club ↗
          </button>
        </li>
      </ul>
    </nav>
  );
}

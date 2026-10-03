import React from 'react';

export default function Footer({ onNavigate }) {
  const handleLink = (e, route) => {
    e.preventDefault();
    if (onNavigate) onNavigate(route);
  };

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__brand">
          Bennett Blockchain<em>.</em><br />
          One campus.<br />
          <em>Every</em> chain.
        </div>
        <div>
          <h4>Explore</h4>
          <ul>
            <li><a href="#/home" onClick={(e) => handleLink(e, 'home')}>Home</a></li>
            <li><a href="#/sponsors" onClick={(e) => handleLink(e, 'sponsors')}>Sponsors</a></li>
            <li><a href="#/events" onClick={(e) => handleLink(e, 'events')}>Events &amp; Hackathons</a></li>
            <li><a href="#/leads" onClick={(e) => handleLink(e, 'leads')}>Core Leads</a></li>
            <li><a href="#/admin" onClick={(e) => handleLink(e, 'admin')} style={{ color: 'var(--yellow)' }}>Admin Portal 🛡️</a></li>
          </ul>
        </div>
        <div>
          <h4>Bennett University</h4>
          <ul>
            <li><a href="https://www.bennett.edu.in" target="_blank" rel="noopener noreferrer">bennett.edu.in</a></li>
            <li><a href="https://www.bennett.edu.in/admission/" target="_blank" rel="noopener noreferrer">School of CSE</a></li>
            <li><a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
        </div>
      </div>
      <div className="footer__bot">
        <span>© Bennett Blockchain Club, Bennett University, Greater Noida</span>
        <span>Student Chapter · Web3 &amp; Distributed Systems · Open Source</span>
      </div>
    </footer>
  );
}

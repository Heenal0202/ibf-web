import React, { useEffect } from 'react';
import gsap from 'gsap';

export default function Sponsors({ onNavigate }) {
  useEffect(() => {
    const strip = document.querySelector('.partners-pill-strip');
    const partnerItems = document.querySelectorAll('.partner-item');
    const cards = document.querySelectorAll('#page-sponsors .info-card');

    if (strip) {
      gsap.fromTo(
        strip,
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', delay: 0.1 }
      );
    }

    if (partnerItems.length) {
      gsap.fromTo(
        partnerItems,
        { opacity: 0, y: 15, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.07, ease: 'back.out(1.6)', delay: 0.22 }
      );
    }

    if (cards.length) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'power2.out', delay: 0.3 }
      );
    }
  }, []);

  return (
    <div id="page-sponsors" className="page-view active">
      <section className="subpage-hero">
        <div className="subpage-hero__inner">
          <span className="pill pill--yellow">Ecosystem Grants · Industry Backing · Partners</span>
          <h1>Backed by the pioneers of decentralized tech</h1>
          <p className="lead">
            Bennett Blockchain Club collaborates with world-leading Layer-1 networks,
            cryptographic research foundations, and developer protocols to fund student grants,
            subsidize testnet infrastructure, and power our national hackathons.
          </p>
        </div>
      </section>

      <section className="subpage-content">
        <div className="subpage-content__inner">
          {/* 01 / OFFICIAL INDUSTRY PARTNERS BANNER */}
          <div className="industry-showcase">
            <div className="industry-header">
              <span className="eyebrow" style={{ color: 'var(--paper)' }}>01 / Strategic Alliances</span>
              <h2 className="industry-title"><span className="highlight-cyan">Industry</span> Partners</h2>
              <p className="industry-subtitle">
                Learning from deep industry engagement at Bennett University hones the necessary skills required to shine in a competitive work environment.
              </p>
            </div>

            {/* White Pill Strip Container */}
            <div className="partners-pill-strip">
              {/* 1. TCS */}
              <a className="partner-item" href="https://www.tcs.com" target="_blank" rel="noopener noreferrer" title="Tata Consultancy Services">
                <div className="logo-tcs">
                  <span className="tcs-mark">tcs</span>
                  <span className="tcs-divider"></span>
                  <div className="tcs-text">
                    <span className="tcs-text-top">TATA</span>
                    <span className="tcs-text-bot">CONSULTANCY SERVICES</span>
                  </div>
                </div>
              </a>

              {/* 2. Tezos India */}
              <a className="partner-item" href="https://tezosindia.foundation" target="_blank" rel="noopener noreferrer" title="Tezos India">
                <div className="logo-tezos">
                  <div className="tezos-icon">
                    <svg width="24" height="24" viewBox="0 0 40 40" fill="none">
                      <path d="M12 9h16v4.5H20v7.5h8v4.5H20v8h-5v-8h-3v-4.5h3v-7.5h-3V9z" fill="#00D2FF" />
                      <circle cx="28" cy="11.5" r="2.8" fill="#38bdf8"/>
                    </svg>
                  </div>
                  <div className="tezos-text">
                    <span className="tezos-brand">Tezos</span>
                    <span className="tezos-sub">India Foundation</span>
                  </div>
                </div>
              </a>

              {/* 3. Internet Computer */}
              <a className="partner-item" href="https://internetcomputer.org" target="_blank" rel="noopener noreferrer" title="Internet Computer (DFINITY)">
                <div className="logo-icp">
                  <svg className="icp-icon" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" fill="#F4F4F6"/>
                    <path d="M13 23c-2.5 0-4.5-1.5-4.5-3.5S10.5 16 13 16c2.8 0 4.8 2.2 7 4 2.2-1.8 4.2-4 7-4 2.5 0 4.5 1.5 4.5 3.5s-2 3.5-4.5 3.5c-2.8 0-4.8-2.2-7-4-2.2 1.8-4.2 4-7 4z" stroke="url(#icp-grad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="icp-grad" x1="8" y1="20" x2="32" y2="20" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#29ABE2"/>
                        <stop offset="0.5" stopColor="#ED1E79"/>
                        <stop offset="1" stopColor="#F15A24"/>
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="icp-text">
                    <span className="icp-brand">INTERNET COMPUTER</span>
                    <span className="icp-sub">DFINITY Foundation</span>
                  </div>
                </div>
              </a>

              {/* 4. DSCI */}
              <a className="partner-item" href="https://www.dsci.in" target="_blank" rel="noopener noreferrer" title="Data Security Council of India">
                <div className="logo-dsci">
                  <div className="dsci-icon">
                    <span className="dsci-dot dsci-dot--navy"></span>
                    <span className="dsci-dot dsci-dot--cyan"></span>
                    <span className="dsci-dot dsci-dot--gold"></span>
                    <span className="dsci-dot dsci-dot--cyan"></span>
                    <span className="dsci-dot dsci-dot--gold"></span>
                    <span className="dsci-dot dsci-dot--navy"></span>
                  </div>
                  <div className="dsci-text">
                    <span className="dsci-brand">DSCI</span>
                    <span className="dsci-sub">A <span>NASSCOM</span> Initiative</span>
                  </div>
                </div>
              </a>
            </div>
          </div>

          <span className="eyebrow" style={{ color: 'var(--paper)' }}>02 / Partner Profiles &amp; Ecosystem Grants</span>
          <h2 style={{ color: 'var(--paper)', marginBottom: '2em' }}>Global networks &amp; organizations accelerating student innovation</h2>

          <div className="card-grid">
            {/* 1. TCS */}
            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">Enterprise Web3</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>Industry Partner</span>
                </div>
                <h3>Tata Consultancy Services</h3>
                <p>
                  Leading global IT multinational driving collaborative research in enterprise distributed ledgers,
                  supply chain provenance, zero-trust cryptographic architectures, and recruitment pipelines for Bennett engineers.
                </p>
              </div>
              <div className="info-card__footer">
                <span>TCS Innovation Labs</span>
                <span style={{ color: 'var(--yellow)' }}>Enterprise Alliance</span>
              </div>
            </article>

            {/* 2. Tezos India */}
            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">Smart Contracts</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>Developer Grants</span>
                </div>
                <h3>Tezos India</h3>
                <p>
                  Empowering Bennett students with SmartPy and Michelson developer bootcamps, hackathon bounties,
                  and micro-grants for deploying secure, energy-efficient proof-of-stake dApps on Tezos.
                </p>
              </div>
              <div className="info-card__footer">
                <span>Tezos Foundation</span>
                <span style={{ color: 'var(--yellow)' }}>Developer Partner</span>
              </div>
            </article>

            {/* 3. Internet Computer (DFINITY) */}
            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">World Computer</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>Global Alliance</span>
                </div>
                <h3>Internet Computer (DFINITY)</h3>
                <p>
                  Enabling Bennett builders to develop 100% on-chain web services, autonomous canisters in Motoko and Rust,
                  and sovereign decentralized AI applications running at native web speed with zero cloud reliance.
                </p>
              </div>
              <div className="info-card__footer">
                <span>DFINITY / ICP</span>
                <span style={{ color: 'var(--yellow)' }}>Ecosystem Partner</span>
              </div>
            </article>

            {/* 4. DSCI */}
            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">Cybersecurity</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>NASSCOM Initiative</span>
                </div>
                <h3>Data Security Council of India</h3>
                <p>
                  National industry body for data protection and cyber threat defense. Spearheading joint security auditing
                  workshops, smart contract vulnerability research, and privacy-preserving blockchain governance roundtables.
                </p>
              </div>
              <div className="info-card__footer">
                <span>NASSCOM / DSCI</span>
                <span style={{ color: 'var(--yellow)' }}>Security Partner</span>
              </div>
            </article>

            {/* 5. Ethereum Foundation */}
            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">Layer 1</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>Academic Grants</span>
                </div>
                <h3>Ethereum Foundation</h3>
                <p>
                  Supporting student research in zero-knowledge rollups, account abstraction (ERC-4337),
                  and verkle tree state commitments through academic grants and developer resources.
                </p>
              </div>
              <div className="info-card__footer">
                <span>ETH Ecosystem</span>
                <span style={{ color: 'var(--yellow)' }}>Research Grant Partner</span>
              </div>
            </article>

            {/* 6. Polygon Labs */}
            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">Scaling &amp; zkEVM</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>Hackathons</span>
                </div>
                <h3>Polygon Labs</h3>
                <p>
                  Providing high-speed EVM scaling infrastructure, sponsoring Bennett campus hackathons,
                  and awarding bounties for high-throughput consumer dApps and zkEVM integrations.
                </p>
              </div>
              <div className="info-card__footer">
                <span>Polygon zkEVM</span>
                <span style={{ color: 'var(--yellow)' }}>Campus Title Sponsor</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="subpage-content--paper">
        <div className="subpage-content__inner">
          <div className="split">
            <div className="split__copy">
              <span className="eyebrow">03 / Partner With Us</span>
              <h2>Hire, mentor, and build with Bennett's top Web3 engineers</h2>
              <p>
                By sponsoring Bennett Blockchain Club, your organization gains direct access to 500+
                ambitious computer science students actively developing smart contracts, security audits,
                and distributed systems.
              </p>
              <p>
                We offer branded hackathon bounty tracks, dedicated recruitment pipeline access, and
                custom workshop partnerships designed to accelerate protocol adoption.
              </p>
              <div style={{ marginTop: '1.8em', display: 'flex', gap: '0.8em', flexWrap: 'wrap' }}>
                <a className="btn btn--yellow" href="mailto:blockchain@bennett.edu.in">
                  Partner With Us <span className="arrow">→</span>
                </a>
                <a
                  className="btn btn--ghost"
                  href="#/events"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate('events');
                  }}
                >
                  View Past Events
                </a>
              </div>
            </div>
            <div className="split__media">
              <img
                src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=900&q=80&auto=format&fit=crop"
                alt="Engineers collaborating"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

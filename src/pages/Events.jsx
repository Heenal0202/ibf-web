import React, { useEffect } from 'react';
import gsap from 'gsap';
import SandCanvas from '../components/SandCanvas.jsx';

export default function Events() {
  useEffect(() => {
    const eventRows = document.querySelectorAll('.event-row');
    const tableCard = document.querySelector('.events-table-card');

    if (eventRows.length) {
      gsap.fromTo(
        eventRows,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', delay: 0.2 }
      );
    }

    if (tableCard) {
      gsap.fromTo(
        tableCard,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.5 }
      );
    }
  }, []);

  return (
    <div id="page-events" className="page-view active">
      <section className="subpage-hero events-sand-hero">
        <div className="subpage-hero__inner">
          <span className="pill pill--yellow">Hackathons · Developer Sprints · Masterclasses</span>

          {/* Sand Simulation Physics Canvas */}
          <SandCanvas />

          <p className="lead">
            Explore our calendar of national hackathons, intensive smart contract security bootcamps,
            and hands-on protocol workshops hosted by Bennett Blockchain Club.
          </p>
        </div>
      </section>

      {/* EVENTS SHOWCASE */}
      <section className="subpage-content events-showcase-section">
        <div className="subpage-content__inner">
          <span className="eyebrow" style={{ color: 'var(--paper)' }}>01 / Campus &amp; Global Sprints</span>
          <h2 style={{ color: 'var(--paper)', marginBottom: '2.2em' }}>Official Bennett Blockchain Club Events</h2>

          {/* Event 1: Hack-7-Day */}
          <article className="event-row">
            <div className="event-row__media">
              <img
                src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&q=80&auto=format&fit=crop"
                alt="Bennett Hackathon Arena Hack-7-Day"
                loading="lazy"
              />
              <span className="event-badge-overlay event-badge-overlay--international">External · International</span>
            </div>
            <div className="event-row__content">
              <div className="event-meta">
                <span className="event-date-chip">28 Feb – 6 Mar</span>
                <span className="event-type-chip">S.No. 01 · Global Hackathon</span>
              </div>
              <h3 className="event-title">Hack-7-Day</h3>
              <span className="event-subtitle">7-Day International Web3 Buildathon Marathon</span>
              <p className="event-desc">
                An intense 7-day international hackathon marathon challenging student developer teams worldwide to conceive, architect, and ship production-grade decentralized protocols. Bennett engineers competed against global developer cohorts, engineering cross-chain liquidity bridges, zero-knowledge privacy circuits, and automated liquid governance systems under 24/7 technical mentorship and live code review.
              </p>
              <div className="event-tags">
                <span className="event-tag-item">Cross-Chain Interoperability</span>
                <span className="event-tag-item">Zero-Knowledge Proofs</span>
                <span className="event-tag-item">DeFi Primitives</span>
                <span className="event-tag-item">24/7 Global Mentorship</span>
              </div>
            </div>
          </article>

          {/* Event 2: Kickstarting With Tezos Blockchain */}
          <article className="event-row event-row--reverse">
            <div className="event-row__media">
              <img
                src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&q=80&auto=format&fit=crop"
                alt="Kickstarting With Tezos Blockchain Bootcamp"
                loading="lazy"
              />
              <span className="event-badge-overlay event-badge-overlay--national">National · Tezos India</span>
            </div>
            <div className="event-row__content">
              <div className="event-meta">
                <span className="event-date-chip">4 – 6 Feb</span>
                <span className="event-type-chip">S.No. 02 · Developer Sprint</span>
              </div>
              <h3 className="event-title">Kickstarting With Tezos Blockchain</h3>
              <span className="event-subtitle">3-Day Immersive Smart Contract Bootcamp</span>
              <p className="event-desc">
                A 3-day nationwide immersive developer sprint organized in direct partnership with Tezos India. Bennett undergraduates explored Michelson stack-based bytecode, SmartPy contract development, token standard deployments (FA2), and hands-on testnet baking, empowering first-time builders to compile, formally verify, and deploy production smart contracts onto the Tezos blockchain.
              </p>
              <div className="event-tags">
                <span className="event-tag-item">Tezos India Partnership</span>
                <span className="event-tag-item">SmartPy &amp; Python</span>
                <span className="event-tag-item">FA2 Token Standards</span>
                <span className="event-tag-item">Testnet Baking</span>
              </div>
            </div>
          </article>

          {/* Event 3: Workshop ON Tezos Blockchain */}
          <article className="event-row">
            <div className="event-row__media">
              <img
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80&auto=format&fit=crop"
                alt="Workshop ON Tezos Blockchain"
                loading="lazy"
              />
              <span className="event-badge-overlay event-badge-overlay--national">National · Hands-on</span>
            </div>
            <div className="event-row__content">
              <div className="event-meta">
                <span className="event-date-chip">8 – 9 Dec ’21</span>
                <span className="event-type-chip">S.No. 03 · Technical Workshop</span>
              </div>
              <h3 className="event-title">Workshop ON Tezos Blockchain</h3>
              <span className="event-subtitle">Liquid Proof-of-Stake &amp; dApp Architecture</span>
              <p className="event-desc">
                High-intensity technical workshop focused on decentralized consensus, Proof-of-Stake mechanics, cryptographic liquid governance, and building high-security dApps with Tezos SDKs and Taquito. Participants dissected formal verification paradigms and built real-time decentralized oracle integration hooks with direct feedback from core ecosystem researchers.
              </p>
              <div className="event-tags">
                <span className="event-tag-item">Liquid Proof-of-Stake</span>
                <span className="event-tag-item">Taquito SDK</span>
                <span className="event-tag-item">Formal Verification</span>
                <span className="event-tag-item">On-Chain Governance</span>
              </div>
            </div>
          </article>

          {/* Event 4: Know all about blockchain */}
          <article className="event-row event-row--reverse">
            <div className="event-row__media">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&q=80&auto=format&fit=crop"
                alt="Know all about blockchain University Symposium"
                loading="lazy"
              />
              <span className="event-badge-overlay event-badge-overlay--national">National · Campus Symposium</span>
            </div>
            <div className="event-row__content">
              <div className="event-meta">
                <span className="event-date-chip">28 Nov ’21</span>
                <span className="event-type-chip">S.No. 04 · Foundational Seminar</span>
              </div>
              <h3 className="event-title">Know all about blockchain</h3>
              <span className="event-subtitle">Foundational Campus Web3 &amp; Distributed Systems Keynote</span>
              <p className="event-desc">
                Comprehensive campus symposium deconstructing decentralized ledgers from first principles. Explored SHA-256 cryptographic hashing, Merkle Patricia trees, Byzantine Fault Tolerance (BFT) consensus, and Web3 career trajectories across core protocol engineering and security auditing for 400+ Bennett University students.
              </p>
              <div className="event-tags">
                <span className="event-tag-item">Cryptographic Hashing</span>
                <span className="event-tag-item">Merkle Trees</span>
                <span className="event-tag-item">BFT Consensus</span>
                <span className="event-tag-item">Web3 Engineering Careers</span>
              </div>
            </div>
          </article>

          {/* Event 5: Why Everyone is Talking About NFT? */}
          <article className="event-row">
            <div className="event-row__media">
              <img
                src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=900&q=80&auto=format&fit=crop"
                alt="Why Everyone is Talking About NFT Masterclass"
                loading="lazy"
              />
              <span className="event-badge-overlay event-badge-overlay--national">National · Masterclass</span>
            </div>
            <div className="event-row__content">
              <div className="event-meta">
                <span className="event-date-chip">3 Dec ’21</span>
                <span className="event-type-chip">S.No. 05 · Special Masterclass</span>
              </div>
              <h3 className="event-title">Why Everyone is Talking About NFT?</h3>
              <span className="event-subtitle">Digital Ownership, Smart Contracts &amp; Metaverse Economics</span>
              <p className="event-desc">
                Interactive masterclass demystifying Non-Fungible Tokens, ERC-721 and ERC-1155 standards, metadata IPFS pinning, generative digital art contracts, and the macroeconomic shift towards verifiable digital ownership. Featured live minting demonstrations, smart contract exploit case studies, and IP rights analysis for campus creators.
              </p>
              <div className="event-tags">
                <span className="event-tag-item">ERC-721 / ERC-1155</span>
                <span className="event-tag-item">IPFS Decentralized Storage</span>
                <span className="event-tag-item">Digital Property Rights</span>
                <span className="event-tag-item">Generative Smart Contracts</span>
              </div>
            </div>
          </article>

          {/* SCHEDULE SUMMARY TABLE */}
          <div className="events-table-card">
            <span className="eyebrow" style={{ color: 'var(--yellow)' }}>02 / Official Record</span>
            <h3>Event Calendar &amp; Participation Matrix</h3>
            <table className="events-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Date</th>
                  <th>Name of Event</th>
                  <th>Internal / External</th>
                  <th>National / International</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="muted">1</td>
                  <td><strong>28 Feb – 6 Mar</strong></td>
                  <td>Hack-7-Day</td>
                  <td><span className="tag-pill">External</span></td>
                  <td><span className="pill pill--yellow">International</span></td>
                </tr>
                <tr>
                  <td className="muted">2</td>
                  <td><strong>4-6 Feb</strong></td>
                  <td>Kickstarting With Tezos Blockchain</td>
                  <td><span className="tag-pill">National</span></td>
                  <td><span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(0, 210, 255, 0.4)' }}>National</span></td>
                </tr>
                <tr>
                  <td className="muted">3</td>
                  <td><strong>8-9 Dec’21</strong></td>
                  <td>Workshop ON Tezos Blockchain</td>
                  <td><span className="tag-pill">National</span></td>
                  <td><span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(0, 210, 255, 0.4)' }}>National</span></td>
                </tr>
                <tr>
                  <td className="muted">4</td>
                  <td><strong>28 Nov’21</strong></td>
                  <td>Know all about blockchain</td>
                  <td><span className="tag-pill">National</span></td>
                  <td><span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(0, 210, 255, 0.4)' }}>National</span></td>
                </tr>
                <tr>
                  <td className="muted">5</td>
                  <td><strong>3 Dec’21</strong></td>
                  <td>Why Everyone is Talking About NFT?</td>
                  <td><span className="tag-pill">National</span></td>
                  <td><span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(0, 210, 255, 0.4)' }}>National</span></td>
                </tr>
              </tbody>
            </table>
          </div>

        </div>
      </section>
    </div>
  );
}

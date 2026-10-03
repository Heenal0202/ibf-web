import React from 'react';

export default function Leads({ onOpenJoinModal }) {
  return (
    <div id="page-leads" className="page-view active">
      <section className="subpage-hero">
        <div className="subpage-hero__inner">
          <span className="pill pill--yellow">Student Leadership · Core Developers · Faculty Mentors</span>
          <h1>The builders steering Bennett Blockchain Club</h1>
          <p className="lead">
            Meet the engineers, researchers, and community organizers driving Web3 education,
            open-source protocols, and technical excellence across Bennett University.
          </p>
        </div>
      </section>

      <section className="subpage-content">
        <div className="subpage-content__inner">
          <span className="eyebrow" style={{ color: 'var(--paper)' }}>01 / Core Team</span>
          <h2 style={{ color: 'var(--paper)', marginBottom: '2em' }}>Student Leads &amp; Working Group Heads</h2>

          <div className="card-grid">
            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">Club Lead</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>Bennett '27</span>
                </div>
                <h3>Aarav Sharma</h3>
                <p>
                  Overseeing club strategy, foundation grants, and protocol partnerships.
                  Researches EVM execution clients, DeFi liquidations, and state synchronization.
                </p>
              </div>
              <div className="info-card__footer">
                <span>@aarav_eth</span>
                <span style={{ color: 'var(--yellow)' }}>Solidity &amp; Architecture</span>
              </div>
            </article>

            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">Tech Lead</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>Bennett '27</span>
                </div>
                <h3>Rohan Patel</h3>
                <p>
                  Leading smart contract development, testnet deployments, and developer tooling.
                  Experienced in Foundry, Rust on Solana, and smart contract fuzz testing.
                </p>
              </div>
              <div className="info-card__footer">
                <span>@rohan_dev</span>
                <span style={{ color: 'var(--yellow)' }}>Smart Contracts &amp; Rust</span>
              </div>
            </article>

            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">Research Lead</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>Bennett '28</span>
                </div>
                <h3>Ananya Gupta</h3>
                <p>
                  Heads cryptographic research and zero-knowledge proof workshops.
                  Focuses on zk-SNARKs, Circom circuits, and private identity primitives.
                </p>
              </div>
              <div className="info-card__footer">
                <span>@ananya_zk</span>
                <span style={{ color: 'var(--yellow)' }}>ZK &amp; Cryptography</span>
              </div>
            </article>

            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">DeFi Lead</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>Bennett '27</span>
                </div>
                <h3>Ishaan Verma</h3>
                <p>
                  Coordinates decentralized finance study groups, economic audits, and tokenomics modeling.
                  Built automated algorithmic arbitrage bots and yield optimizer vaults.
                </p>
              </div>
              <div className="info-card__footer">
                <span>@ishaan_sol</span>
                <span style={{ color: 'var(--yellow)' }}>DeFi &amp; Tokenomics</span>
              </div>
            </article>

            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">DevRel Lead</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>Bennett '28</span>
                </div>
                <h3>Sneha Mukherjee</h3>
                <p>
                  Manages hackathon operations, developer bootcamps, community onboarding,
                  and maintains relations with international Web3 foundation grant officers.
                </p>
              </div>
              <div className="info-card__footer">
                <span>@sneha_web3</span>
                <span style={{ color: 'var(--yellow)' }}>DevRel &amp; Operations</span>
              </div>
            </article>

            <article className="info-card">
              <div>
                <div className="info-card__top">
                  <span className="pill pill--yellow">Faculty Advisor</span>
                  <span className="chip" style={{ color: 'var(--paper)', borderColor: 'rgba(244,240,230,0.2)' }}>School of CSE</span>
                </div>
                <h3>Dr. Rajesh Kumar</h3>
                <p>
                  Professor at School of Computer Science Engineering, Bennett University.
                  Provides academic oversight, research mentorship, and university lab allocations.
                </p>
              </div>
              <div className="info-card__footer">
                <span>Bennett CSE</span>
                <span style={{ color: 'var(--yellow)' }}>Distributed Systems</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="subpage-content--paper">
        <div className="subpage-content__inner">
          <div className="split">
            <div className="split__copy">
              <span className="eyebrow">02 / Recruitment</span>
              <h2>Join the Bennett Blockchain Club core team</h2>
              <p>
                We recruit new contributors and working group associates at the beginning of each semester.
                Roles include Smart Contract Engineers, Cryptography Researchers, Technical Writers,
                and Hackathon Coordinators.
              </p>
              <p>
                No prior blockchain experience is strictly required — we value curiosity, strong programming fundamentals,
                and a commitment to shipping open-source protocols.
              </p>
              <div style={{ marginTop: '1.8em', display: 'flex', gap: '0.8em', flexWrap: 'wrap' }}>
                <button
                  className="btn btn--yellow"
                  onClick={() => {
                    if (onOpenJoinModal) onOpenJoinModal();
                  }}
                  style={{ border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Apply for Core Team <span className="arrow">→</span>
                </button>
                <a className="btn btn--ghost" href="mailto:blockchain@bennett.edu.in">
                  Contact Advisors
                </a>
              </div>
            </div>
            <div className="split__media">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=900&q=80&auto=format&fit=crop"
                alt="Bennett students working together"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

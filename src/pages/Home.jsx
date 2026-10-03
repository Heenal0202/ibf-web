import React, { useEffect } from 'react';
import gsap from 'gsap';
import CopyChip from '../components/CopyChip.jsx';
import { refreshHomeScenes } from '../webgl/ScrollRendererManager.js';

export default function Home({ onNavigate }) {
  useEffect(() => {
    // 1. Initialize & sync WebGL2 scenes for the Home page
    refreshHomeScenes();

    // 2. Headline 3D Tilt Reveal Animation
    const words = document.querySelectorAll('.headline .word');
    const arrow = document.querySelector('.headline .arrow');

    if (words.length) {
      gsap.killTweensOf('.headline .word, .headline .arrow');
      gsap.fromTo(
        words,
        {
          opacity: 0,
          y: 45,
          rotateX: -55
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: 'back.out(1.4)',
          delay: 0.15
        }
      );

      if (arrow) {
        gsap.fromTo(
          arrow,
          {
            opacity: 0,
            scale: 0,
            rotation: -90
          },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.75,
            ease: 'back.out(2)',
            delay: 0.6,
            onComplete: () => {
              gsap.to(arrow, {
                y: -5,
                rotation: 4,
                duration: 2.2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
              });
            }
          }
        );
      }
    }

    // 3. Kinetic Typography & Cryptographic Matrix Cipher Scramble
    const showcaseBig = document.getElementById('showcaseBig');
    let cleanupScramble = () => {};

    if (showcaseBig) {
      const chars = showcaseBig.querySelectorAll('.char');
      const lineTop = showcaseBig.querySelector('.line--top');
      const lineBot = showcaseBig.querySelector('.line--bot');

      const onMouseMove = (e) => {
        const rect = showcaseBig.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        chars.forEach((char) => {
          const cRect = char.getBoundingClientRect();
          const charCenterX = cRect.left + cRect.width / 2 - rect.left;
          const charCenterY = cRect.top + cRect.height / 2 - rect.top;
          const dist = Math.hypot(mouseX - charCenterX, mouseY - charCenterY);
          const maxDist = 200;

          if (dist < maxDist) {
            const force = 1 - dist / maxDist;
            const angle = Math.atan2(charCenterY - mouseY, charCenterX - mouseX);
            const pushX = Math.cos(angle) * force * 18;
            const pushY = Math.sin(angle) * force * 18;
            const rotate = (mouseX - charCenterX) * -0.07 * force;

            gsap.to(char, {
              x: pushX,
              y: pushY - force * 10,
              rotation: rotate,
              scale: 1 + force * 0.14,
              duration: 0.25,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          } else {
            gsap.to(char, {
              x: 0,
              y: 0,
              rotation: 0,
              scale: 1,
              duration: 0.6,
              ease: 'elastic.out(1, 0.4)',
              overwrite: 'auto'
            });
          }
        });
      };

      const onMouseLeave = () => {
        chars.forEach((char) => {
          gsap.to(char, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.8,
            ease: 'elastic.out(1.2, 0.35)',
            overwrite: 'auto'
          });
        });
      };

      showcaseBig.addEventListener('mousemove', onMouseMove);
      showcaseBig.addEventListener('mouseleave', onMouseLeave);

      // Cipher scramble
      const cryptoGlyphs = '01X7F9A#Ξλµ§8B2C4E';
      let isScrambling = false;

      const scrambleLine = (lineEl, originalText) => {
        if (!lineEl) return;
        const charEls = lineEl.querySelectorAll('.char');
        let frame = 0;
        const totalFrames = 15;

        const interval = setInterval(() => {
          charEls.forEach((char, idx) => {
            if (idx < Math.floor((frame / totalFrames) * charEls.length)) {
              char.textContent = originalText[idx];
              char.style.color = '';
              char.style.textShadow = '';
            } else {
              char.textContent = cryptoGlyphs[Math.floor(Math.random() * cryptoGlyphs.length)];
              char.style.color = '#00d2ff';
              char.style.textShadow = '0 0 18px rgba(0, 210, 255, 0.8)';
            }
          });

          frame++;
          if (frame > totalFrames) {
            clearInterval(interval);
            charEls.forEach((char, idx) => {
              char.textContent = originalText[idx];
              char.style.color = '';
              char.style.textShadow = '';
            });
            isScrambling = false;
          }
        }, 35);
      };

      const triggerCipherScramble = () => {
        if (isScrambling) return;
        isScrambling = true;
        scrambleLine(lineTop, 'P2P-');
        setTimeout(() => scrambleLine(lineBot, 'scale.'), 110);
      };

      showcaseBig.addEventListener('click', triggerCipherScramble);
      showcaseBig.addEventListener('mouseenter', triggerCipherScramble);

      const cipherObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              triggerCipherScramble();
            }
          });
        },
        { threshold: 0.45 }
      );
      cipherObserver.observe(showcaseBig);

      cleanupScramble = () => {
        showcaseBig.removeEventListener('mousemove', onMouseMove);
        showcaseBig.removeEventListener('mouseleave', onMouseLeave);
        showcaseBig.removeEventListener('click', triggerCipherScramble);
        showcaseBig.removeEventListener('mouseenter', triggerCipherScramble);
        cipherObserver.disconnect();
      };
    }

    return () => {
      cleanupScramble();
    };
  }, []);

  const handleCopyCode = () => {
    const code = document.querySelector('.api__code pre')?.innerText || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).then(() => {
        if (window.showToast) window.showToast('Code snippet copied to clipboard!');
      });
    }
  };

  return (
    <div id="page-home" className="page-view active">
      {/* HERO SECTION */}
      <section className="hero" id="hero">
        <div className="scene--hero"></div>

        <div className="hero__top">
          <div className="hero__badges">
            <span className="pill pill--yellow">club · bennett-blockchain</span>
            <span className="hero__tag">BENNETT UNIVERSITY WEB3</span>
          </div>
          <div className="hero__meta">
            <div>v2.4.0 · <b>Mainnet</b></div>
            <div>one community · n protocols</div>
          </div>
        </div>

        <div className="hero__inner">
          <h1 className="headline" id="headline">
            <span className="word">One</span>
            <span className="word">campus,</span>
            <br />
            <span className="word"><em>every</em></span>
            <span className="word">chain</span>
            <span className="arrow">
              <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 6 38 L 18 26 L 26 32 L 38 16" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M 30 14 L 40 14 L 40 24" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </h1>
          <div className="hero__row">
            <p className="hero__lead">
              Bennett University's premier Web3 and distributed ledger community.
              From EVM smart contracts to zero-knowledge proofs and decentralized
              autonomous protocols, we build the future of trustless computing on campus.
            </p>
            <div>
              <div id="react-hero-copy">
                <CopyChip
                  text="git clone https://github.com/bennett-blockchain"
                  label="📋 git clone bennett-blockchain"
                />
              </div>
              <div className="hero__actions">
                <a
                  className="btn btn--yellow"
                  href="#/events"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate('events');
                  }}
                >
                  Explore Events <span className="arrow">→</span>
                </a>
                <a
                  className="btn btn--ghost"
                  href="#/sponsors"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onNavigate) onNavigate('sponsors');
                  }}
                >
                  Our Sponsors
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTRO SECTION */}
      <section className="intro" id="features">
        <div className="intro__inner">
          <div className="intro__grid">
            <div>
              <span className="eyebrow">01 / What we do</span>
              <h2>Beyond the hype, building real decentralized infrastructure</h2>
            </div>
            <div className="intro__copy">
              <p>
                Bennett Blockchain Club unites engineers, researchers, and creators
                across Bennett University to architect smart contracts, decentralized
                applications, and cryptographic primitives.
              </p>
              <p>
                From national hackathons and developer fellowships to open-source
                protocols and security audits, we cultivate top-tier Web3 talent
                right from campus.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="features">
        <div className="features__inner">
          <div className="features__grid">
            <article className="feature">
              <div className="feature__shader scene--voronoi">
                <span className="feature__num">01</span>
                <span className="feature__tag">EVM &amp; Solana</span>
              </div>
              <div className="feature__body">
                <h3>Protocol Engineering</h3>
                <p>
                  Designing and deploying production-grade Solidity smart contracts,
                  Rust programs on Solana, and stateful dApps with verifiable execution.
                </p>
              </div>
            </article>

            <article className="feature">
              <div className="feature__shader scene--waves">
                <span className="feature__num">02</span>
                <span className="feature__tag">ZK &amp; Consensus</span>
              </div>
              <div className="feature__body">
                <h3>Cryptographic Systems</h3>
                <p>
                  Researching zero-knowledge proofs, Layer-2 rollups, Byzantine
                  Fault Tolerant consensus mechanics, and privacy-preserving primitives.
                </p>
              </div>
            </article>

            <article className="feature">
              <div className="feature__shader scene--flow">
                <span className="feature__num">03</span>
                <span className="feature__tag">Hackathons</span>
              </div>
              <div className="feature__body">
                <h3>Bootcamps &amp; Grants</h3>
                <p>
                  Organizing campus Web3 hackathons, developer masterclasses, and
                  securing foundation grants across major global blockchain ecosystems.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden="true">
        <div className="marquee__track">
          <span>Decentralized</span><span className="dot"></span> <span>Trustless</span><span className="dot"></span> <span>Immutable</span><span className="dot"></span> <span>Consensus</span><span className="dot"></span>
          <span>Decentralized</span><span className="dot"></span> <span>Trustless</span><span className="dot"></span> <span>Immutable</span><span className="dot"></span> <span>Consensus</span><span className="dot"></span>
          <span>Decentralized</span><span className="dot"></span> <span>Trustless</span><span className="dot"></span> <span>Immutable</span><span className="dot"></span> <span>Consensus</span><span className="dot"></span>
          <span>Decentralized</span><span className="dot"></span> <span>Trustless</span><span className="dot"></span> <span>Immutable</span><span className="dot"></span> <span>Consensus</span><span className="dot"></span>
        </div>
      </div>

      {/* PROBLEM / MISSION SECTION */}
      <section className="split-section split-section--dark" id="problem">
        <div className="split on-dark">
          <div className="split__copy">
            <span className="eyebrow">02 / The mission</span>
            <h2>Centralized platforms break, decentralized networks endure</h2>
            <p>
              Traditional centralized web platforms concentrate authority into
              fragile single points of failure. Users surrender ownership of their
              identity, data, and value to closed corporate monoliths that censor
              and exploit with zero recourse.
            </p>
            <p>
              Blockchain replaces blind institutional trust with verifiable
              mathematical consensus. Cryptographic guarantees enable true digital
              sovereignty, permissionless innovation, and open financial rails for everyone.
            </p>
            <p>
              Bennett Blockchain Club exists to train builders who will lead this
              generational transition, arming students with the deep technical
              mastery required to architect the next era of computing.
            </p>
          </div>
          <div className="split__media split__media--shader">
            <span className="badge">consensus · p2p</span>
            <div className="scene--problem"></div>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="gallery" id="gallery">
        <div className="gallery__head on-dark">
          <div>
            <span className="eyebrow">03 / In production</span>
            <h2>Student protocols built on Bennett campus</h2>
          </div>
          <p>
            Discover decentralized finance mechanisms, verifiable credentials,
            and decentralized autonomous organizations designed, tested, and
            shipped by Bennett innovators.
          </p>
        </div>

        <div className="gallery__grid">
          <figure className="gallery__card gallery__card--shader">
            <img
              className="gallery__img"
              src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800&h=1000&fit=crop&auto=format&q=80"
              alt="Yellow paint texture"
              crossOrigin="anonymous"
            />
            <figcaption className="gallery__caption">
              <span className="meta">dApp · DeFi Protocol</span>
              <span className="num">04</span>
            </figcaption>
          </figure>

          <figure className="gallery__card gallery__card--shader">
            <div className="scene--flow-mini"></div>
            <figcaption className="gallery__caption">
              <span className="meta">ZK · Rollup Engine</span>
              <span className="num">05</span>
            </figcaption>
          </figure>

          <figure className="gallery__card gallery__card--shader">
            <img
              className="gallery__img"
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=1000&fit=crop&auto=format&q=80"
              alt="Purple abstract"
              crossOrigin="anonymous"
            />
            <figcaption className="gallery__caption">
              <span className="meta">DAO · Campus Governance</span>
              <span className="num">06</span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* COMPOSITED LAYERS SECTION */}
      <section className="split-section split-section--paper">
        <div className="split split--reverse">
          <div className="split__copy">
            <span className="eyebrow">04 / Web3 Architecture</span>
            <h2>From client interface to immutable ledger consensus</h2>
            <p>
              The{' '}
              <span style={{ color: 'var(--ink)', fontWeight: 600 }}>Client DApp</span>{' '}
              submits signed transactions through JSON-RPC providers to execute{' '}
              <span style={{ color: 'var(--purple)', fontWeight: 600 }}>Smart Contracts</span>,{' '}
              which settle deterministically across the{' '}
              <span style={{ color: 'var(--purple-2)', fontWeight: 600 }}>Distributed Ledger</span>{' '}
              validated by decentralized nodes.
            </p>
          </div>

          <div className="split__media">
            <img
              src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=80&auto=format&fit=crop"
              alt="Source code on a screen"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* API / SMART CONTRACTS SECTION */}
      <section className="api" id="api">
        <div className="scene--terminal"></div>
        <div className="api__inner">
          <div className="api__copy on-dark">
            <span className="eyebrow">— 05 / CONTRACTS</span>
            <h2>Three lines to interact with trustless protocols</h2>
            <p>
              Extend with <span className="tag-pill">onChainVerification</span> and{' '}
              <span className="tag-pill">multiSigSecurity</span> hooks, or deploy zero-knowledge verifiers
              independently. State updates automatically.
            </p>
          </div>

          <div className="api__code">
            <div className="api__code-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
                <div className="api__code-dots">
                  <span></span><span></span><span></span>
                </div>
                <span>Contract.sol · 12 lines</span>
              </div>
              <button
                className="api__code-copy"
                onClick={handleCopyCode}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--paper)',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Copy
              </button>
            </div>
            <pre>
              <span className="kw">const</span> club = <span className="kw">new</span> <span className="cls">BennettBlockchain</span>()
              {'\n'}<span className="kw">const</span> member = <span className="kw">new</span> <span className="cls">Contributor</span>(&#123; address, role: builder &#125;)
              {'\n'}club.<span className="prop">register</span>(member)
              {'\n\n'}<span className="cm">// Network parameters verified automatically every block:</span>
              {'\n'}<span className="cm">// block_height  uint64 - current ledger height</span>
              {'\n'}<span className="cm">// gas_limit     uint256- EVM computational budget</span>
              {'\n'}<span className="cm">// state_root    bytes32- Merkle Patricia trie root</span>
              {'\n'}<span className="cm">//                       consensus finalized in BFT</span>
            </pre>
          </div>
        </div>
      </section>

      {/* SHOWCASE SECTION */}
      <section className="showcase" id="showcase">
        <div className="scene--showcase-bg"></div>
        <div className="showcase__inner">
          <div>
            <span className="eyebrow">06 / Consensus</span>
            <div className="showcase__big" id="showcaseBig" title="Click or hover to scramble cryptographic consensus">
              <span className="line line--top">
                <span className="char">P</span><span className="char">2</span><span className="char">P</span><span className="char">-</span>
              </span>
              <br />
              <span className="line line--bot">
                <span className="char">s</span><span className="char">c</span><span className="char">a</span><span className="char">l</span><span className="char">e</span><span className="char">.</span>
              </span>
            </div>
            <p style={{ maxWidth: '28em' }}>
              Our distributed simulation node network models peer-to-peer gossip
              propagation and Byzantine Fault Tolerance under adversarial network
              partitioning with zero centralization overhead.
            </p>
            <ul>
              <li>Byzantine Fault Tolerant state replication &amp; finality</li>
              <li>Dynamic 3D block ledger with cryptographic hash links</li>
              <li>Real-time validator quorum &amp; CometBFT consensus engine</li>
              <li>400 ms instant finality with verified Merkle state roots</li>
            </ul>
          </div>

          <div className="showcase__visual showcase__visual--shader">
            <div className="scene--blockchain-3d scene--particles"></div>
            <span className="label">3d · consensus chain</span>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta">
        <div className="cta__inner">
          <span className="eyebrow">07 / Get involved</span>
          <h2>Build with us, <br /><em>shape the decentralized era</em></h2>
          <p className="lead" style={{ margin: '0 auto 0.5em' }}>
            Bennett Blockchain Club is the home for developers, researchers,
            and Web3 enthusiasts across Bennett University. Open to all students.
          </p>
          <div className="cta__actions">
            <a
              className="btn"
              href="#/leads"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('leads');
              }}
            >
              Meet the Leads <span className="arrow">→</span>
            </a>
            <a
              className="btn btn--ghost"
              href="#/events"
              onClick={(e) => {
                e.preventDefault();
                if (onNavigate) onNavigate('events');
              }}
            >
              Upcoming Events
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

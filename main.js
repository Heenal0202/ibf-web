import {
  ScrollRenderer,
  ScrollScene,
  ScrollImage,
  Drawable,
  Mesh,
  Triangle,
  Plane,
  Program,
  Uniform,
  Texture
} from 'https://esm.sh/wtc-gl@1.2.2'

import {
  defaultVert,
  heroFrag,
  problemFrag,
  voronoiFrag,
  wavesFrag,
  flowFrag,
  terminalFrag,
  showcaseBgFrag,
  blockchain3DFrag,
  galleryImgFrag
} from './shaders.js'

// Initialize WebGL2 ScrollRenderer
let scrollRenderer, gl

try {
  scrollRenderer = new ScrollRenderer({
    rendererProps: { antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' }
  })
  scrollRenderer.canvas.classList.add('scroll-renderer-canvas')
  document.body.appendChild(scrollRenderer.canvas)
  gl = scrollRenderer.gl
} catch (err) {
  console.warn('WebGL2 not supported or context lost:', err)
  document.body.classList.add('no-webgl')
}

if (gl) {
  // 1. Procedural Noise Texture
  const noiseSize = 256
  const noiseData = new Uint8Array(noiseSize * noiseSize * 4)
  for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 255
  const noiseTex = new Texture(gl, {
    image: noiseData,
    width: noiseSize,
    height: noiseSize,
    wrapS: gl.REPEAT,
    wrapT: gl.REPEAT,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR
  })
  noiseTex.needsUpdate = true

  // 2. Procedural Environment Map Texture
  const envSize = 256
  const envData = new Uint8Array(envSize * envSize * 4)
  for (let y = 0; y < envSize; y++) {
    for (let x = 0; x < envSize; x++) {
      const i = (y * envSize + x) * 4
      const u = x / envSize,
        v = y / envSize
      const ang = Math.atan2(v - 0.5, u - 0.5) / (Math.PI * 2) + 0.5
      const rad = Math.sqrt((u - 0.5) ** 2 + (v - 0.5) ** 2) * 2
      envData[i + 0] = (0.3 + 0.45 * Math.sin(ang * Math.PI * 2 + 0.0) + 0.15 * rad) * 255
      envData[i + 1] = (0.2 + 0.35 * Math.sin(ang * Math.PI * 2 + 2.1) + 0.1 * rad) * 255
      envData[i + 2] = (0.3 + 0.4 * Math.sin(ang * Math.PI * 2 + 4.2) + 0.1 * rad) * 255
      envData[i + 3] = 255
    }
  }
  const envTex = new Texture(gl, {
    image: envData,
    width: envSize,
    height: envSize,
    wrapS: gl.REPEAT,
    wrapT: gl.REPEAT,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR
  })
  envTex.needsUpdate = true

  // Helper factory for DOM-anchored fragment scenes
  const makeScene = (selector, fragShader, extraUniforms = {}) => {
    const el = document.querySelector(selector)
    if (!el) return null
    const drawable = new Drawable(gl)
    const scrollScene = new ScrollScene({ element: el, scene: drawable })
    new Mesh(gl, {
      geometry: new Triangle(gl),
      program: new Program(gl, {
        vertex: defaultVert,
        fragment: fragShader,
        uniforms: { ...scrollScene.uniforms, ...extraUniforms },
        transparent: true
      })
    }).setParent(drawable)
    return scrollScene
  }

  const scrollProgress = (rect) =>
    Math.max(
      0,
      Math.min(
        1,
        (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      )
    )

  // Scene 1: Hero Iridescent Fluid Orb
  {
    const u_mouse = new Uniform({
      name: 'u_mouse',
      value: [0, 0],
      kind: 'float_vec2'
    })
    const hero = makeScene('.scene--hero', heroFrag, {
      u_noise: new Uniform({ name: 'u_noise', value: noiseTex, kind: 'texture' }),
      u_environment: new Uniform({
        name: 'u_environment',
        value: envTex,
        kind: 'texture'
      }),
      u_mouse
    })
    if (hero) {
      window.addEventListener('mousemove', (e) => {
        const w = scrollRenderer.canvas.clientWidth
        const h = scrollRenderer.canvas.clientHeight
        const minD = Math.min(w, h)
        u_mouse.value = [
          (e.clientX - w * 0.5) / minD,
          -(e.clientY - h * 0.5) / minD
        ]
      }, { passive: true })
      scrollRenderer.addScene(hero)
    }
  }

  // Feature 01: Voronoi
  const voronoi = makeScene('.scene--voronoi', voronoiFrag)
  if (voronoi) scrollRenderer.addScene(voronoi)

  // Feature 02: Scissor Waves
  const waves = makeScene('.scene--waves', wavesFrag)
  if (waves) scrollRenderer.addScene(waves)

  // Feature 03: Flow Field
  const flow = makeScene('.scene--flow', flowFrag)
  if (flow) scrollRenderer.addScene(flow)

  // Gallery 05: Flow Mini
  const flowMini = makeScene('.scene--flow-mini', flowFrag)
  if (flowMini) scrollRenderer.addScene(flowMini)

  // Gallery 04 & 06: DOM Image Distortion with ScrollImage
  document.querySelectorAll('img.gallery__img').forEach((imgEl) => {
    const card = imgEl.closest('.gallery__card')
    if (!card) return
    const drawable = new Drawable(gl)
    const scene = new ScrollImage({
      gl,
      element: card,
      image: imgEl,
      scene: drawable
    })

    const u_mouse = new Uniform({
      name: 'u_mouse',
      value: [-1, -1],
      kind: 'float_vec2'
    })
    const u_scroll = new Uniform({
      name: 'u_scroll',
      value: 0,
      kind: 'float'
    })
    scene.uniforms.u_mouse = u_mouse
    scene.uniforms.u_scroll = u_scroll

    new Mesh(gl, {
      geometry: new Plane(gl, { width: 2, height: 2 }),
      program: new Program(gl, {
        vertex: defaultVert,
        fragment: galleryImgFrag,
        uniforms: { ...scene.uniforms },
        depthTest: false
      })
    }).setParent(drawable)

    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect()
      u_mouse.value = [
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height
      ]
    }, { passive: true })

    card.addEventListener('mouseleave', () => {
      u_mouse.value = [-1, -1]
    })

    scene.onBeforeRender = (_, rect) => {
      u_scroll.value = scrollProgress(rect) * 2 - 1
    }

    scrollRenderer.addScene(scene)
  })

  // Problem Scene: 3D Raymarched tumbling contexts driven by scroll u_cp
  {
    const u_cp = new Uniform({
      name: 'u_cp',
      value: [0, 0, 500],
      kind: 'float_vec3'
    })
    const problem = makeScene('.scene--problem', problemFrag, { u_cp })
    if (problem) {
      problem.onBeforeRender = (_, rect) => {
        const p = scrollProgress(rect)
        const a = p * Math.PI * 1.5 - Math.PI * 0.5
        u_cp.value = [Math.sin(a) * 300, 100 - p * 200, Math.cos(a) * 300]
      }
      scrollRenderer.addScene(problem)
    }
  }

  // API Background Scene
  const terminal = makeScene('.scene--terminal', terminalFrag)
  if (terminal) scrollRenderer.addScene(terminal)

  // Showcase Background Canvas Scene
  const showcaseBg = makeScene('.scene--showcase-bg', showcaseBgFrag)
  if (showcaseBg) {
    Object.defineProperty(showcaseBg, 'visible', { value: true, writable: true })
    showcaseBg.visible = true
    scrollRenderer.addScene(showcaseBg)
  }

  // Showcase: 3D Blockchain Consensus & Ledger Visualizer (Triggered on Scroll)
  {
    const u_scroll = new Uniform({
      name: 'u_scroll',
      value: 0.0,
      kind: 'float'
    })
    const u_mouse = new Uniform({
      name: 'u_mouse',
      value: [0, 0],
      kind: 'float_vec2'
    })

    const blockchainScene = makeScene('.scene--blockchain-3d', blockchain3DFrag, {
      u_scroll,
      u_mouse
    })

    if (blockchainScene) {
      Object.defineProperty(blockchainScene, 'visible', { value: true, writable: true })
      blockchainScene.visible = true

      let targetScroll = 0.0
      let currentScroll = 0.0

      blockchainScene.onBeforeRender = (_, rect) => {
        targetScroll = scrollProgress(rect)
        // Smooth inertia interpolation for natural movement on scroll trigger
        currentScroll += (targetScroll - currentScroll) * 0.14
        u_scroll.value = currentScroll

        // Kinetic opposing parallax drift on P2P- / scale.
        const lineTop = document.querySelector('.showcase__big .line--top')
        const lineBot = document.querySelector('.showcase__big .line--bot')
        if (lineTop && lineBot) {
          const drift = (currentScroll - 0.5) * 60
          lineTop.style.transform = `translateX(${-drift}px)`
          lineBot.style.transform = `translateX(${drift}px)`
        }
      }

      const visualContainer = document.querySelector('.showcase__visual')
      if (visualContainer) {
        visualContainer.addEventListener('mousemove', (e) => {
          const r = visualContainer.getBoundingClientRect()
          u_mouse.value = [
            ((e.clientX - r.left) / r.width - 0.5) * 2.0,
            -((e.clientY - r.top) / r.height - 0.5) * 2.0
          ]
        }, { passive: true })

        visualContainer.addEventListener('mouseleave', () => {
          u_mouse.value = [0, 0]
        })
      }

      scrollRenderer.addScene(blockchainScene)
    }
  }

  // Start the main render loop!
  scrollRenderer.playing = true
}

/* ==========================================================================
   Interactive UI & Micro-interactions
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Toast helper
  const showToast = (text) => {
    let toast = document.querySelector('.toast')
    if (!toast) {
      toast = document.createElement('div')
      toast.className = 'toast'
      document.body.appendChild(toast)
    }
    toast.textContent = text
    toast.classList.add('toast--visible')
    setTimeout(() => {
      toast.classList.remove('toast--visible')
    }, 2400)
  }

  // 2. Click to copy repository chip
  const npmChip = document.querySelector('.chip--copy')
  if (npmChip) {
    npmChip.addEventListener('click', () => {
      navigator.clipboard.writeText('git clone https://github.com/bennett-blockchain').then(() => {
        showToast('Copied to clipboard: git clone bennett-blockchain')
      }).catch(() => {
        showToast('Copied: git clone bennett-blockchain')
      })
    })
  }

  // 3. Click to copy API code block
  const copyCodeBtn = document.querySelector('.api__code-copy')
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      const code = document.querySelector('.api__code pre')?.innerText || ''
      navigator.clipboard.writeText(code).then(() => {
        showToast('Code snippet copied to clipboard!')
      })
    })
  }

  // 4. Mobile Menu Navigation Toggle
  const navToggle = document.querySelector('.nav__burger')
  const navMenu = document.querySelector('.nav__links')
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('nav__burger--active')
      navMenu.classList.toggle('nav__links--open')
    })
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('nav__burger--active')
        navMenu.classList.remove('nav__links--open')
      })
    })
  }

  // 5. Client-Side SPA Hash Router
  const routes = ['home', 'sponsors', 'events', 'leads']
  let sandAnim = null

  const handleRoute = () => {
    const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase().trim()
    const route = routes.includes(rawHash) ? rawHash : 'home'

    // Update active page view
    const allPages = document.querySelectorAll('.page-view')
    allPages.forEach((page) => {
      page.classList.remove('active')
    })

    const targetPage = document.getElementById(`page-${route}`)
    if (targetPage) {
      targetPage.classList.add('active')
    }

    // Update nav links active state
    const navLinks = document.querySelectorAll('.nav__links .nav-link')
    navLinks.forEach((link) => {
      const linkHref = link.getAttribute('href') || ''
      const linkRoute = linkHref.replace(/^#\/?/, '').toLowerCase().trim()
      link.classList.toggle('active', linkRoute === route)
    })

    // Reset scroll to top
    window.scrollTo({ top: 0, behavior: 'instant' })

    // If returning to Home, recalculate WebGL scene bounds after display switch and animate headline
    if (route === 'home') {
      animateHeadline()
      if (scrollRenderer && typeof scrollRenderer.resize === 'function') {
        setTimeout(() => {
          try {
            scrollRenderer.resize()
          } catch (e) {
            console.warn('ScrollRenderer resize error:', e)
          }
        }, 60)
      }
    } else if (route === 'sponsors') {
      animateSponsorsPage()
    } else if (route === 'events') {
      animateEventsPage()
    }

    if (sandAnim) {
      if (route === 'events') {
        setTimeout(() => sandAnim.start(), 80)
      } else {
        sandAnim.stop()
      }
    }
  }

  // 6a. GSAP Animation for Industry Partners & Sponsors
  const animateSponsorsPage = () => {
    if (typeof gsap === 'undefined') return
    const strip = document.querySelector('.partners-pill-strip')
    const partnerItems = document.querySelectorAll('.partner-item')
    const cards = document.querySelectorAll('#page-sponsors .info-card')

    if (strip) {
      gsap.fromTo(
        strip,
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', delay: 0.1 }
      )
    }

    if (partnerItems.length) {
      gsap.fromTo(
        partnerItems,
        { opacity: 0, y: 15, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.07, ease: 'back.out(1.6)', delay: 0.22 }
      )
    }

    if (cards.length) {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: 'power2.out', delay: 0.3 }
      )
    }
  }

  // 6b. GSAP Animation for Events Page
  const animateEventsPage = () => {
    if (typeof gsap === 'undefined') return
    const eventRows = document.querySelectorAll('.event-row')
    const tableCard = document.querySelector('.events-table-card')

    if (eventRows.length) {
      gsap.fromTo(
        eventRows,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out', delay: 0.2 }
      )
    }

    if (tableCard) {
      gsap.fromTo(
        tableCard,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 0.5 }
      )
    }
  }

  // 6. GSAP 3D Tilt Word-by-Word Headline Reveal
  const animateHeadline = () => {
    if (typeof gsap === 'undefined') return
    const words = document.querySelectorAll('.headline .word')
    const arrow = document.querySelector('.headline .arrow')
    if (!words.length) return

    gsap.killTweensOf('.headline .word, .headline .arrow')

    // Stagger words in with 3D tilt
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
    )

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
            })
          }
        }
      )
    }
  }

  // 7. Kinetic Interactive Typography & Cryptographic Cipher Scramble for Showcase
  const showcaseBig = document.getElementById('showcaseBig')
  if (showcaseBig) {
    const chars = showcaseBig.querySelectorAll('.char')
    const lineTop = showcaseBig.querySelector('.line--top')
    const lineBot = showcaseBig.querySelector('.line--bot')

    // A. Magnetic 3D Spring Ripple on Cursor Move
    showcaseBig.addEventListener('mousemove', (e) => {
      if (typeof gsap === 'undefined') return
      const rect = showcaseBig.getBoundingClientRect()
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top

      chars.forEach((char) => {
        const cRect = char.getBoundingClientRect()
        const charCenterX = cRect.left + cRect.width / 2 - rect.left
        const charCenterY = cRect.top + cRect.height / 2 - rect.top
        const dist = Math.hypot(mouseX - charCenterX, mouseY - charCenterY)
        const maxDist = 200

        if (dist < maxDist) {
          const force = 1 - dist / maxDist
          const angle = Math.atan2(charCenterY - mouseY, charCenterX - mouseX)
          const pushX = Math.cos(angle) * force * 18
          const pushY = Math.sin(angle) * force * 18
          const rotate = (mouseX - charCenterX) * -0.07 * force

          gsap.to(char, {
            x: pushX,
            y: pushY - force * 10,
            rotation: rotate,
            scale: 1 + force * 0.14,
            duration: 0.25,
            ease: 'power2.out',
            overwrite: 'auto'
          })
        } else {
          gsap.to(char, {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: 0.6,
            ease: 'elastic.out(1, 0.4)',
            overwrite: 'auto'
          })
        }
      })
    })

    showcaseBig.addEventListener('mouseleave', () => {
      if (typeof gsap === 'undefined') return
      chars.forEach((char) => {
        gsap.to(char, {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: 0.8,
          ease: 'elastic.out(1.2, 0.35)',
          overwrite: 'auto'
        })
      })
    })

    // B. Cryptographic Matrix Cipher Scramble on Hover / Scroll
    const cryptoGlyphs = '01X7F9A#Ξλµ§8B2C4E'
    let isScrambling = false

    const scrambleLine = (lineEl, originalText) => {
      if (!lineEl) return
      const charEls = lineEl.querySelectorAll('.char')
      let frame = 0
      const totalFrames = 15

      const interval = setInterval(() => {
        charEls.forEach((char, idx) => {
          if (idx < Math.floor((frame / totalFrames) * charEls.length)) {
            char.textContent = originalText[idx]
            char.style.color = ''
            char.style.textShadow = ''
          } else {
            char.textContent = cryptoGlyphs[Math.floor(Math.random() * cryptoGlyphs.length)]
            char.style.color = '#00d2ff'
            char.style.textShadow = '0 0 18px rgba(0, 210, 255, 0.8)'
          }
        })

        frame++
        if (frame > totalFrames) {
          clearInterval(interval)
          charEls.forEach((char, idx) => {
            char.textContent = originalText[idx]
            char.style.color = ''
            char.style.textShadow = ''
          })
          isScrambling = false
        }
      }, 35)
    }

    const triggerCipherScramble = () => {
      if (isScrambling) return
      isScrambling = true
      scrambleLine(lineTop, 'P2P-')
      setTimeout(() => scrambleLine(lineBot, 'scale.'), 110)
    }

    showcaseBig.addEventListener('click', triggerCipherScramble)
    showcaseBig.addEventListener('mouseenter', triggerCipherScramble)

    // Trigger on scroll entry into consensus section
    const cipherObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          triggerCipherScramble()
        }
      })
    }, { threshold: 0.45 })
    cipherObserver.observe(showcaseBig)
  }

  // 8. Sand Simulation Falling & Reforming Text Animation for Events Page
  function initSandAnimation() {
    const canvas = document.getElementById("sandCanvas");
    if (!canvas) return null;
    const container = document.getElementById("sandContainer") || canvas.parentElement;
    const ctx = canvas.getContext("2d");

    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const settings = {
      cellSize: 3,
      startText: "EVENTS",
      hiddenText: "BENNETT BLOCKCHAIN CLUB • HACKATHONS & SPRINTS",

      releaseTestsPerFrame: 1500,
      releaseChance: 0.022,

      gravity: 850,
      airDrag: 0.992,

      settleStepsPerFrame: 5,

      pileHoldSeconds: 0.8,
      hiddenFadeInSeconds: 0.45,
      reformDurationSeconds: 2,
      reformStaggerSeconds: 0.65,
      revealHoldSeconds: 3,
      revealFadeSeconds: 0.6,

      reformArrivalDistance: 1.5
    };

    let cols = 0;
    let rows = 0;

    let fixedCodepen;
    let codepenCells = [];
    let looseCells = [];

    let falling = [];
    let pile;
    let reforming = [];

    let hiddenAlpha = 0;

    let phase = "codepen";
    let phaseTime = 0;
    let lastTime = performance.now();
    let animationFrameId = null;
    let isRunning = false;

    function resize() {
      if (!container) return;
      w = Math.floor(container.clientWidth || 800);
      h = Math.floor(container.clientHeight || 420);
      if (w <= 0 || h <= 0) return;

      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(w / settings.cellSize);
      rows = Math.ceil(h / settings.cellSize);

      fixedCodepen = new Uint8Array(cols * rows);
      pile = new Uint8Array(cols * rows);

      codepenCells = [];
      looseCells = [];
      falling = [];
      reforming = [];

      hiddenAlpha = 0;
      phase = "codepen";
      phaseTime = 0;

      buildCodepenText();
    }

    function index(col, row) {
      return row * cols + col;
    }

    function colFromIndex(i) {
      return i % cols;
    }

    function rowFromIndex(i) {
      return Math.floor(i / cols);
    }

    function inBounds(col, row) {
      return col >= 0 && col < cols && row >= 0 && row < rows;
    }

    function rand(min, max) {
      return min + Math.random() * (max - min);
    }

    function randInt(min, max) {
      return Math.floor(min + Math.random() * (max - min + 1));
    }

    function clamp01(v) {
      return Math.max(0, Math.min(1, v));
    }

    function easeInOutCubic(t) {
      return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    }

    function buildCodepenText() {
      const maskCanvas = document.createElement("canvas");
      const maskCtx = maskCanvas.getContext("2d");

      maskCanvas.width = w;
      maskCanvas.height = h;

      const fontSize = Math.min(w * 0.20, h * 0.44, 150);

      maskCtx.clearRect(0, 0, w, h);
      maskCtx.fillStyle = "#fff";
      maskCtx.textAlign = "center";
      maskCtx.textBaseline = "middle";
      maskCtx.font = `900 ${fontSize}px 'Funnel Display', system-ui, sans-serif`;

      maskCtx.fillText(settings.startText, w / 2, h * 0.32);

      const image = maskCtx.getImageData(0, 0, w, h).data;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = Math.floor(col * settings.cellSize + settings.cellSize / 2);
          const y = Math.floor(row * settings.cellSize + settings.cellSize / 2);

          const pixelIndex = (y * w + x) * 4;
          const alpha = image[pixelIndex + 3];

          if (alpha > 35) {
            const i = index(col, row);

            fixedCodepen[i] = 1;
            codepenCells.push(i);
            looseCells.push(i);
          }
        }
      }

      shuffle(looseCells);
    }

    function resetCycle() {
      if (!fixedCodepen || !pile) return;
      fixedCodepen.fill(0);
      pile.fill(0);

      looseCells = codepenCells.slice();
      shuffle(looseCells);

      falling = [];
      reforming = [];

      for (const cell of codepenCells) {
        fixedCodepen[cell] = 1;
      }

      hiddenAlpha = 0;
      phase = "codepen";
      phaseTime = 0;
    }

    function releaseOneGrain(cellIndex) {
      const col = colFromIndex(cellIndex);
      const row = rowFromIndex(cellIndex);

      fixedCodepen[cellIndex] = 0;

      falling.push({
        x: col * settings.cellSize,
        y: row * settings.cellSize,

        vx: rand(-22, 22),
        vy: rand(40, 150),

        drift: rand(-55, 55),
        driftTarget: rand(-85, 85),
        driftTimer: rand(0.18, 0.9)
      });
    }

    function releaseCodepen() {
      if (looseCells.length === 0) {
        phase = "falling";
        phaseTime = 0;
        return;
      }

      for (let i = 0; i < settings.releaseTestsPerFrame; i++) {
        if (looseCells.length === 0) break;

        const listIndex = randInt(0, looseCells.length - 1);
        const cellIndex = looseCells[listIndex];

        if (fixedCodepen[cellIndex] === 0) {
          looseCells.splice(listIndex, 1);
          continue;
        }

        const col = colFromIndex(cellIndex);
        const row = rowFromIndex(cellIndex);

        const belowEmpty =
          row >= rows - 1 ||
          fixedCodepen[index(col, Math.min(row + 1, rows - 1))] === 0;

        const sideEmpty =
          col <= 0 ||
          col >= cols - 1 ||
          fixedCodepen[index(Math.max(col - 1, 0), row)] === 0 ||
          fixedCodepen[index(Math.min(col + 1, cols - 1), row)] === 0;

        const edgeMultiplier = belowEmpty || sideEmpty ? 3.3 : 1;

        if (Math.random() < settings.releaseChance * edgeMultiplier) {
          releaseOneGrain(cellIndex);
          looseCells.splice(listIndex, 1);
        }
      }
    }

    function pileSolid(col, row) {
      if (row >= rows) return true;
      if (col < 0 || col >= cols) return true;

      return pile[index(col, row)] === 1;
    }

    function setPile(col, row) {
      if (!inBounds(col, row)) return;
      pile[index(col, row)] = 1;
    }

    function settleFallingParticle(p) {
      let col = Math.floor(p.x / settings.cellSize);
      let row = Math.floor(p.y / settings.cellSize);

      col = Math.max(0, Math.min(cols - 1, col));
      row = Math.max(0, Math.min(rows - 1, row));

      if (!pileSolid(col, row)) {
        setPile(col, row);
        return;
      }

      if (!pileSolid(col - 1, row)) {
        setPile(col - 1, row);
        return;
      }

      if (!pileSolid(col + 1, row)) {
        setPile(col + 1, row);
        return;
      }

      for (let y = row - 1; y >= 0; y--) {
        if (!pileSolid(col, y)) {
          setPile(col, y);
          return;
        }
      }
    }

    function updateFalling(dt) {
      for (let i = falling.length - 1; i >= 0; i--) {
        const p = falling[i];

        p.driftTimer -= dt;

        if (p.driftTimer <= 0) {
          p.driftTarget = rand(-85, 85);
          p.driftTimer = rand(0.25, 1.2);
        }

        p.drift += (p.driftTarget - p.drift) * dt * 2;

        p.vx += p.drift * dt;
        p.vy += settings.gravity * dt;

        p.vx *= settings.airDrag;
        p.vy *= settings.airDrag;

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const col = Math.floor(p.x / settings.cellSize);
        const nextRow = Math.floor((p.y + settings.cellSize) / settings.cellSize);

        if (p.x < -60) p.x = 0;
        if (p.x > w + 60) p.x = w - settings.cellSize;

        if (nextRow >= rows || pileSolid(col, nextRow)) {
          settleFallingParticle(p);
          falling.splice(i, 1);
        }
      }

      if (phase === "falling" && falling.length === 0) {
        phase = "pile";
        phaseTime = 0;
      }
    }

    function settlePile() {
      const leftToRight = Math.random() > 0.5;

      for (let row = rows - 2; row >= 0; row--) {
        if (leftToRight) {
          for (let col = 1; col < cols - 1; col++) {
            settlePileCell(col, row);
          }
        } else {
          for (let col = cols - 2; col >= 1; col--) {
            settlePileCell(col, row);
          }
        }
      }
    }

    function settlePileCell(col, row) {
      const current = index(col, row);

      if (pile[current] !== 1) return;

      if (!pileSolid(col, row + 1)) {
        pile[index(col, row + 1)] = 1;
        pile[current] = 0;
        return;
      }

      const preferLeft = Math.random() > 0.5;

      if (preferLeft) {
        if (!pileSolid(col - 1, row + 1)) {
          pile[index(col - 1, row + 1)] = 1;
          pile[current] = 0;
          return;
        }

        if (!pileSolid(col + 1, row + 1)) {
          pile[index(col + 1, row + 1)] = 1;
          pile[current] = 0;
          return;
        }
      } else {
        if (!pileSolid(col + 1, row + 1)) {
          pile[index(col + 1, row + 1)] = 1;
          pile[current] = 0;
          return;
        }

        if (!pileSolid(col - 1, row + 1)) {
          pile[index(col - 1, row + 1)] = 1;
          pile[current] = 0;
          return;
        }
      }
    }

    function collectPileCells() {
      const cells = [];

      for (let row = rows - 1; row >= 0; row--) {
        for (let col = 0; col < cols; col++) {
          const i = index(col, row);

          if (pile[i] === 1) {
            cells.push(i);
          }
        }
      }

      return cells;
    }

    function startReform() {
      const pileCells = collectPileCells();
      const targets = codepenCells.slice();

      pile.fill(0);

      pileCells.sort((a, b) => rowFromIndex(b) - rowFromIndex(a));
      targets.sort((a, b) => rowFromIndex(b) - rowFromIndex(a));

      const count = Math.min(pileCells.length, targets.length);

      for (let i = 0; i < count; i++) {
        const source = pileCells[i];
        const target = targets[i];

        const sx = colFromIndex(source) * settings.cellSize;
        const sy = rowFromIndex(source) * settings.cellSize;
        const tx = colFromIndex(target) * settings.cellSize;
        const ty = rowFromIndex(target) * settings.cellSize;

        reforming.push({
          sx,
          sy,
          tx,
          ty,

          x: sx,
          y: sy,

          delay: rand(0, settings.reformStaggerSeconds),
          duration: rand(
            settings.reformDurationSeconds * 0.75,
            settings.reformDurationSeconds * 1.15
          ),

          wave: rand(-18, 18),
          phaseOffset: rand(0, Math.PI * 2),
          arrived: false
        });
      }

      phase = "reform";
      phaseTime = 0;
    }

    function updateReform(dt) {
      hiddenAlpha = 1;

      let allArrived = true;

      for (const p of reforming) {
        const localTime = phaseTime - p.delay;

        if (localTime <= 0) {
          p.x = p.sx;
          p.y = p.sy;
          allArrived = false;
          continue;
        }

        const t = clamp01(localTime / p.duration);
        const eased = easeInOutCubic(t);

        const arc = Math.sin(eased * Math.PI);
        const wobble = Math.sin(eased * Math.PI * 2 + p.phaseOffset) * p.wave * arc;

        p.x = p.sx + (p.tx - p.sx) * eased + wobble;
        p.y = p.sy + (p.ty - p.sy) * eased - arc * h * 0.08;

        if (t < 1) {
          allArrived = false;
        }
      }

      if (allArrived) {
        for (const cell of codepenCells) {
          fixedCodepen[cell] = 1;
        }

        reforming = [];
        phase = "hiddenHold";
        phaseTime = 0;
        hiddenAlpha = 1;
      }
    }

    function updatePhase(dt) {
      phaseTime += dt;

      if (phase === "codepen") {
        releaseCodepen();
      }

      if (phase === "pile" && phaseTime >= settings.pileHoldSeconds) {
        phase = "hiddenFadeIn";
        phaseTime = 0;
        hiddenAlpha = 0;
      }

      if (phase === "hiddenFadeIn") {
        hiddenAlpha = Math.min(1, phaseTime / settings.hiddenFadeInSeconds);

        if (hiddenAlpha >= 1) {
          hiddenAlpha = 1;
          startReform();
        }
      }

      if (phase === "reform") {
        updateReform(dt);
      }

      if (phase === "hiddenHold") {
        hiddenAlpha = 1;

        if (phaseTime >= settings.revealHoldSeconds) {
          phase = "hiddenFade";
          phaseTime = 0;
        }
      }

      if (phase === "hiddenFade") {
        hiddenAlpha = Math.max(0, 1 - phaseTime / settings.revealFadeSeconds);

        if (hiddenAlpha <= 0) {
          hiddenAlpha = 0;
          resetCycle();
        }
      }
    }

    function drawHiddenText() {
      if (hiddenAlpha <= 0) return;

      ctx.save();
      const fontSize = Math.max(12, Math.min(17, w * 0.024));
      const lineHeight = fontSize * 1.15;
      const lines = [settings.hiddenText];

      ctx.globalAlpha = hiddenAlpha;
      ctx.fillStyle = "#00d2ff";
      ctx.shadowColor = "rgba(0, 210, 255, 0.7)";
      ctx.shadowBlur = 12;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `700 ${fontSize}px 'JetBrains Mono', monospace`;

      const startY = h - 34 - ((lines.length - 1) * lineHeight) / 2;

      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], w / 2, startY + i * lineHeight);
      }

      ctx.restore();
    }

    function drawFixedCodepen() {
      ctx.fillStyle = "#00d2ff";
      const size = settings.cellSize;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (fixedCodepen[index(col, row)] !== 1) continue;
          ctx.fillRect(col * size, row * size, size, size);
        }
      }
    }

    function drawFalling() {
      ctx.fillStyle = "#38bdf8";
      const size = settings.cellSize;

      for (const p of falling) {
        ctx.fillRect(p.x, p.y, size, size);
      }
    }

    function drawPile() {
      ctx.fillStyle = "#00d2ff";
      const size = settings.cellSize;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (pile[index(col, row)] !== 1) continue;
          ctx.fillRect(col * size, row * size, size, size);
        }
      }
    }

    function drawReforming() {
      ctx.fillStyle = "#7de6ff";
      const size = settings.cellSize;

      for (const p of reforming) {
        ctx.fillRect(p.x, p.y, size, size);
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      drawHiddenText();
      drawFixedCodepen();
      drawFalling();
      drawPile();
      drawReforming();
    }

    function tick(now) {
      if (!isRunning) return;
      const dt = Math.min((now - lastTime) / 1000, 0.033);
      lastTime = now;

      updatePhase(dt);
      updateFalling(dt);

      if (phase !== "reform" && phase !== "hiddenHold" && phase !== "hiddenFade") {
        for (let i = 0; i < settings.settleStepsPerFrame; i++) {
          settlePile();
        }
      }

      draw();
      animationFrameId = requestAnimationFrame(tick);
    }

    function start() {
      if (isRunning) return;
      isRunning = true;
      lastTime = performance.now();
      resize();
      animationFrameId = requestAnimationFrame(tick);
    }

    function stop() {
      isRunning = false;
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    }

    // Click on canvas triggers quick scramble/reform reset
    canvas.addEventListener("click", () => {
      resetCycle();
    });

    window.addEventListener("resize", () => {
      if (isRunning) {
        resize();
      }
    });

    return { start, stop, resize };
  }

  sandAnim = initSandAnimation()

  // Expose WebGL and animation controllers for React framework integration
  window.BennettWeb3 = {
    scrollRenderer,
    animateHeadline,
    animateSponsorsPage,
    animateEventsPage,
    getSandAnim: () => sandAnim,
    handleRoute
  }

  window.addEventListener('hashchange', handleRoute)
  handleRoute()
})

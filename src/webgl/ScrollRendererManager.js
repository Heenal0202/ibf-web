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
} from 'wtc-gl';

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
} from './shaders.js';

let scrollRenderer = null;
let gl = null;
let noiseTex = null;
let envTex = null;
let activeScenes = [];
let eventListeners = [];

const scrollProgress = (rect) =>
  Math.max(
    0,
    Math.min(1, (window.innerHeight - rect.top) / (window.innerHeight + rect.height))
  );

export function initGlobalWebGL() {
  if (scrollRenderer) return scrollRenderer;

  try {
    scrollRenderer = new ScrollRenderer({
      rendererProps: { antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' }
    });
    scrollRenderer.canvas.classList.add('scroll-renderer-canvas');
    document.body.appendChild(scrollRenderer.canvas);
    gl = scrollRenderer.gl;
  } catch (err) {
    console.warn('WebGL2 not supported or context lost:', err);
    document.body.classList.add('no-webgl');
    return null;
  }

  if (gl) {
    // 1. Procedural Noise Texture
    const noiseSize = 256;
    const noiseData = new Uint8Array(noiseSize * noiseSize * 4);
    for (let i = 0; i < noiseData.length; i++) noiseData[i] = Math.random() * 255;
    noiseTex = new Texture(gl, {
      image: noiseData,
      width: noiseSize,
      height: noiseSize,
      wrapS: gl.REPEAT,
      wrapT: gl.REPEAT,
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR
    });
    noiseTex.needsUpdate = true;

    // 2. Procedural Environment Map Texture
    const envSize = 256;
    const envData = new Uint8Array(envSize * envSize * 4);
    for (let y = 0; y < envSize; y++) {
      for (let x = 0; x < envSize; x++) {
        const i = (y * envSize + x) * 4;
        const u = x / envSize,
          v = y / envSize;
        const ang = Math.atan2(v - 0.5, u - 0.5) / (Math.PI * 2) + 0.5;
        const rad = Math.sqrt((u - 0.5) ** 2 + (v - 0.5) ** 2) * 2;
        envData[i + 0] = (0.3 + 0.45 * Math.sin(ang * Math.PI * 2 + 0.0) + 0.15 * rad) * 255;
        envData[i + 1] = (0.2 + 0.35 * Math.sin(ang * Math.PI * 2 + 2.1) + 0.1 * rad) * 255;
        envData[i + 2] = (0.3 + 0.4 * Math.sin(ang * Math.PI * 2 + 4.2) + 0.1 * rad) * 255;
        envData[i + 3] = 255;
      }
    }
    envTex = new Texture(gl, {
      image: envData,
      width: envSize,
      height: envSize,
      wrapS: gl.REPEAT,
      wrapT: gl.REPEAT,
      generateMipmaps: false,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR
    });
    envTex.needsUpdate = true;
    scrollRenderer.playing = true;
  }

  return scrollRenderer;
}

export function refreshHomeScenes() {
  if (!scrollRenderer || !gl) {
    initGlobalWebGL();
    if (!gl) return;
  }

  // Clear existing active scenes from renderer
  activeScenes.forEach((scene) => {
    try {
      scrollRenderer.removeScene(scene);
    } catch (e) {
      // Scene might not be registered
    }
  });
  activeScenes = [];

  // Remove existing custom event listeners
  eventListeners.forEach(({ target, type, fn }) => {
    try {
      target.removeEventListener(type, fn);
    } catch (e) {}
  });
  eventListeners = [];

  const makeScene = (selector, fragShader, extraUniforms = {}) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const drawable = new Drawable(gl);
    const scrollScene = new ScrollScene({ element: el, scene: drawable });
    new Mesh(gl, {
      geometry: new Triangle(gl),
      program: new Program(gl, {
        vertex: defaultVert,
        fragment: fragShader,
        uniforms: { ...scrollScene.uniforms, ...extraUniforms },
        transparent: true
      })
    }).setParent(drawable);
    return scrollScene;
  };

  // 1. Scene: Hero Iridescent Fluid Orb
  {
    const u_mouse = new Uniform({
      name: 'u_mouse',
      value: [0, 0],
      kind: 'float_vec2'
    });
    const hero = makeScene('.scene--hero', heroFrag, {
      u_noise: new Uniform({ name: 'u_noise', value: noiseTex, kind: 'texture' }),
      u_environment: new Uniform({
        name: 'u_environment',
        value: envTex,
        kind: 'texture'
      }),
      u_mouse
    });

    if (hero) {
      const onMouseMove = (e) => {
        if (!scrollRenderer?.canvas) return;
        const w = scrollRenderer.canvas.clientWidth;
        const h = scrollRenderer.canvas.clientHeight;
        const minD = Math.min(w, h);
        u_mouse.value = [
          (e.clientX - w * 0.5) / minD,
          -(e.clientY - h * 0.5) / minD
        ];
      };
      window.addEventListener('mousemove', onMouseMove, { passive: true });
      eventListeners.push({ target: window, type: 'mousemove', fn: onMouseMove });
      scrollRenderer.addScene(hero);
      activeScenes.push(hero);
    }
  }

  // 2. Feature 01: Voronoi
  const voronoi = makeScene('.scene--voronoi', voronoiFrag);
  if (voronoi) {
    scrollRenderer.addScene(voronoi);
    activeScenes.push(voronoi);
  }

  // 3. Feature 02: Scissor Waves
  const waves = makeScene('.scene--waves', wavesFrag);
  if (waves) {
    scrollRenderer.addScene(waves);
    activeScenes.push(waves);
  }

  // 4. Feature 03: Flow Field
  const flow = makeScene('.scene--flow', flowFrag);
  if (flow) {
    scrollRenderer.addScene(flow);
    activeScenes.push(flow);
  }

  // 5. Gallery 05: Flow Mini
  const flowMini = makeScene('.scene--flow-mini', flowFrag);
  if (flowMini) {
    scrollRenderer.addScene(flowMini);
    activeScenes.push(flowMini);
  }

  // 6. Gallery 04 & 06: DOM Image Distortion with ScrollImage
  document.querySelectorAll('img.gallery__img').forEach((imgEl) => {
    const card = imgEl.closest('.gallery__card');
    if (!card) return;
    const drawable = new Drawable(gl);
    const scene = new ScrollImage({
      gl,
      element: card,
      image: imgEl,
      scene: drawable
    });

    const u_mouse = new Uniform({
      name: 'u_mouse',
      value: [-1, -1],
      kind: 'float_vec2'
    });
    const u_scroll = new Uniform({
      name: 'u_scroll',
      value: 0,
      kind: 'float'
    });
    scene.uniforms.u_mouse = u_mouse;
    scene.uniforms.u_scroll = u_scroll;

    new Mesh(gl, {
      geometry: new Plane(gl, { width: 2, height: 2 }),
      program: new Program(gl, {
        vertex: defaultVert,
        fragment: galleryImgFrag,
        uniforms: { ...scene.uniforms },
        depthTest: false
      })
    }).setParent(drawable);

    const onCardMove = (e) => {
      const r = card.getBoundingClientRect();
      u_mouse.value = [
        (e.clientX - r.left) / r.width,
        1 - (e.clientY - r.top) / r.height
      ];
    };
    const onCardLeave = () => {
      u_mouse.value = [-1, -1];
    };

    card.addEventListener('mousemove', onCardMove, { passive: true });
    card.addEventListener('mouseleave', onCardLeave);
    eventListeners.push({ target: card, type: 'mousemove', fn: onCardMove });
    eventListeners.push({ target: card, type: 'mouseleave', fn: onCardLeave });

    scene.onBeforeRender = (_, rect) => {
      u_scroll.value = scrollProgress(rect) * 2 - 1;
    };

    scrollRenderer.addScene(scene);
    activeScenes.push(scene);
  });

  // 7. Problem Scene: 3D Raymarched tumbling contexts driven by scroll u_cp
  {
    const u_cp = new Uniform({
      name: 'u_cp',
      value: [0, 0, 500],
      kind: 'float_vec3'
    });
    const problem = makeScene('.scene--problem', problemFrag, { u_cp });
    if (problem) {
      problem.onBeforeRender = (_, rect) => {
        const p = scrollProgress(rect);
        const a = p * Math.PI * 1.5 - Math.PI * 0.5;
        u_cp.value = [Math.sin(a) * 300, 100 - p * 200, Math.cos(a) * 300];
      };
      scrollRenderer.addScene(problem);
      activeScenes.push(problem);
    }
  }

  // 8. API Background Scene
  const terminal = makeScene('.scene--terminal', terminalFrag);
  if (terminal) {
    scrollRenderer.addScene(terminal);
    activeScenes.push(terminal);
  }

  // 9. Showcase Background Canvas Scene
  const showcaseBg = makeScene('.scene--showcase-bg', showcaseBgFrag);
  if (showcaseBg) {
    Object.defineProperty(showcaseBg, 'visible', { value: true, writable: true });
    showcaseBg.visible = true;
    scrollRenderer.addScene(showcaseBg);
    activeScenes.push(showcaseBg);
  }

  // 10. Showcase: 3D Blockchain Consensus & Ledger Visualizer
  {
    const u_scroll = new Uniform({
      name: 'u_scroll',
      value: 0.0,
      kind: 'float'
    });
    const u_mouse = new Uniform({
      name: 'u_mouse',
      value: [0, 0],
      kind: 'float_vec2'
    });

    const blockchainScene = makeScene('.scene--blockchain-3d', blockchain3DFrag, {
      u_scroll,
      u_mouse
    });

    if (blockchainScene) {
      Object.defineProperty(blockchainScene, 'visible', { value: true, writable: true });
      blockchainScene.visible = true;

      let targetScroll = 0.0;
      let currentScroll = 0.0;

      blockchainScene.onBeforeRender = (_, rect) => {
        targetScroll = scrollProgress(rect);
        currentScroll += (targetScroll - currentScroll) * 0.14;
        u_scroll.value = currentScroll;

        const lineTop = document.querySelector('.showcase__big .line--top');
        const lineBot = document.querySelector('.showcase__big .line--bot');
        if (lineTop && lineBot) {
          const drift = (currentScroll - 0.5) * 60;
          lineTop.style.transform = `translateX(${-drift}px)`;
          lineBot.style.transform = `translateX(${drift}px)`;
        }
      };

      const visualContainer = document.querySelector('.showcase__visual');
      if (visualContainer) {
        const onVisMove = (e) => {
          const r = visualContainer.getBoundingClientRect();
          u_mouse.value = [
            ((e.clientX - r.left) / r.width - 0.5) * 2.0,
            -((e.clientY - r.top) / r.height - 0.5) * 2.0
          ];
        };
        const onVisLeave = () => {
          u_mouse.value = [0, 0];
        };
        visualContainer.addEventListener('mousemove', onVisMove, { passive: true });
        visualContainer.addEventListener('mouseleave', onVisLeave);
        eventListeners.push({ target: visualContainer, type: 'mousemove', fn: onVisMove });
        eventListeners.push({ target: visualContainer, type: 'mouseleave', fn: onVisLeave });
      }

      scrollRenderer.addScene(blockchainScene);
      activeScenes.push(blockchainScene);
    }
  }

  // Trigger resize on next tick to sync bounding boxes
  setTimeout(() => {
    try {
      if (scrollRenderer?.resize) scrollRenderer.resize();
    } catch (e) {
      console.warn(e);
    }
  }, 60);
}

export function resizeScrollRenderer() {
  if (scrollRenderer?.resize) {
    try {
      scrollRenderer.resize();
    } catch (e) {}
  }
}

export function getScrollRenderer() {
  return scrollRenderer;
}

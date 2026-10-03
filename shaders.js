/**
 * WebGL2 Shaders for wtc-gl ScrollRenderer showcase
 * Handcrafted, optimized GLSL shaders for multi-scene scissor-tested rendering
 */

export const defaultVert = `#version 300 es
precision highp float;
in vec3 position;
in vec2 uv;
out vec2 v_uv;

void main() {
  v_uv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

export const heroFrag = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_origin;
uniform vec2 u_mouse;
uniform sampler2D u_noise;
uniform sampler2D u_environment;

out vec4 fragColor;

// 2D Hash
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453123);
}

// 3D Hash for cell normal & color variation
vec3 hash3(vec2 p) {
  vec3 q = vec3(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3)),
    dot(p, vec2(419.2, 371.9))
  );
  return fract(sin(q) * 43758.5453123);
}

struct VoronoiData {
  vec2 cellId;
  float d1;
  float edgeDist;
  vec2 edgeDir;
};

// Voronoi tessellation returning cell id, distance to center, and distance/tangent to polygon edge
VoronoiData getFacetedVoronoi(vec2 p, float time) {
  vec2 n = floor(p);
  vec2 f = fract(p);

  vec2 mg = vec2(0.0);
  vec2 mr = vec2(0.0);
  float md = 8.0;

  // Pass 1: Closest cell seed
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      o = 0.5 + 0.42 * sin(time * 0.35 + 6.283185 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }

  // Pass 2: Polygon edge distance and direction
  float edgeDist = 8.0;
  vec2 edgeDir = vec2(1.0, 0.0);

  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      o = 0.5 + 0.42 * sin(time * 0.35 + 6.283185 * o);
      vec2 r = g + o - f;
      if (dot(mr - r, mr - r) > 0.00001) {
        vec2 mid = 0.5 * (mr + r);
        vec2 norm = normalize(r - mr);
        float dist = dot(mid, norm);
        if (dist < edgeDist) {
          edgeDist = dist;
          edgeDir = vec2(-norm.y, norm.x);
        }
      }
    }
  }

  VoronoiData res;
  res.cellId = n + mg;
  res.d1 = sqrt(md);
  res.edgeDist = edgeDist;
  res.edgeDir = edgeDir;
  return res;
}

void main() {
  vec2 pixelPos = gl_FragCoord.xy - u_origin.xy;
  vec2 screenPos = (pixelPos - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
  
  // Voronoi cell scale (~7-9 cells horizontally across hero)
  float cellScale = 5.2;
  vec2 p = screenPos * cellScale;
  
  VoronoiData vor = getFacetedVoronoi(p, u_time);
  
  // Pseudo-random normal for this cell facet
  vec3 h = hash3(vor.cellId);
  float tilt = 0.55 + 0.45 * h.z; // planar tilt
  float azimuth = h.x * 6.2831853 + sin(u_time * 0.2 + h.y * 6.28) * 0.3;
  
  vec3 facetNormal = vec3(
    sin(tilt) * cos(azimuth),
    sin(tilt) * sin(azimuth),
    cos(tilt)
  );
  
  // Mouse reactive tilt
  facetNormal.xy += u_mouse * 0.55;
  facetNormal = normalize(facetNormal);
  
  // Camera view ray
  vec3 V = normalize(vec3(screenPos * 0.85, -1.8));
  vec3 R = reflect(V, facetNormal);
  
  // Environment map texture lookup
  vec2 envUv = R.xy * 0.45 + 0.5;
  
  // Fine noise dispersion / chromatic split using u_noise
  float noiseSample = texture(u_noise, v_uv * 3.5 + u_time * 0.02).r;
  float dispersion = (noiseSample - 0.5) * 0.035;
  
  vec3 envCol;
  envCol.r = texture(u_environment, envUv + dispersion * vec2(1.0, 0.4)).r;
  envCol.g = texture(u_environment, envUv).g;
  envCol.b = texture(u_environment, envUv - dispersion * vec2(1.0, 0.4)).b;
  
  // Refined Web3 Cryptographic Crystal: Ice Cyan, Slate Indigo, Deep Obsidian
  vec3 cyanTone = vec3(0.0, 0.82, 1.0);
  vec3 indigoTone = vec3(0.38, 0.45, 0.98);
  vec3 darkBase = vec3(0.03, 0.04, 0.06);
  
  // Categorize facets into glossy obsidian, luminous cyan, and slate indigo
  float cellType = h.y;
  vec3 facetColor = envCol;
  
  if (cellType < 0.40) {
    // Deep obsidian facet with subtle crystalline sheen
    facetColor = mix(darkBase, envCol * 0.35, 0.5);
  } else if (cellType < 0.75) {
    // Luminous cryptographic cyan facet
    facetColor = mix(envCol, cyanTone, 0.5) * 1.2;
  } else {
    // Subtle slate indigo facet
    facetColor = mix(envCol, indigoTone, 0.38) * 1.1;
  }
  
  // Specular reflection
  vec3 lightDir = normalize(vec3(0.4, 0.85, 1.2));
  vec3 H = normalize(lightDir - V);
  float spec = pow(max(dot(facetNormal, H), 0.0), 32.0);
  float glint = pow(max(dot(facetNormal, H), 0.0), 120.0);
  vec3 specLight = vec3(0.9, 0.95, 1.0) * spec * 0.55 + vec3(1.0) * glint * 1.2;
  
  // Fresnel glow
  float fresnel = pow(1.0 + dot(V, facetNormal), 3.0);
  vec3 col = facetColor + specLight + cyanTone * fresnel * 0.22;
  
  // Edges and Dashed Lines
  float edge = vor.edgeDist;
  float darkEdge = smoothstep(0.04, 0.008, edge);
  
  // Cyan dashed cryptographic lines along edge direction
  float edgeCoord = dot(gl_FragCoord.xy, vor.edgeDir);
  float dashed = step(0.42, fract(edgeCoord * 0.12));
  float cyanDashed = smoothstep(0.022, 0.004, edge) * dashed;
  
  // Apply dark seam and cyan dashed highlights
  col = mix(col, vec3(0.015, 0.02, 0.03), darkEdge * 0.65);
  col = mix(col, cyanTone, cyanDashed * 0.95);
  
  // Subtle vignette at corners
  vec2 normUv = gl_FragCoord.xy / u_resolution;
  float vig = normUv.x * normUv.y * (1.0 - normUv.x) * (1.0 - normUv.y);
  col *= clamp(18.0 * vig + 0.35, 0.0, 1.0);
  
  fragColor = vec4(col, 1.0);
}
`;

export const voronoiFrag = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_origin;

out vec4 fragColor;

vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

// 2D Voronoi returning F1 distance, F2 distance, and cell id
vec3 voronoi(vec2 x) {
  vec2 n = floor(x);
  vec2 f = fract(x);
  
  vec2 mg, mr;
  float md = 8.0;
  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      o = 0.5 + 0.45 * sin(u_time * 1.2 + 6.2831 * o);
      vec2 r = g + o - f;
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }
  
  // Second pass for borders
  md = 8.0;
  for (int j = -2; j <= 2; j++) {
    for (int i = -2; i <= 2; i++) {
      vec2 g = mg + vec2(float(i), float(j));
      vec2 o = hash2(n + g);
      o = 0.5 + 0.45 * sin(u_time * 1.2 + 6.2831 * o);
      vec2 r = g + o - f;
      if (dot(mr - r, mr - r) > 0.00001) {
        md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
      }
    }
  }
  return vec3(sqrt(dot(mr, mr)), md, hash2(n + mg).x);
}

void main() {
  vec2 p = (gl_FragCoord.xy - u_origin.xy) / min(u_resolution.x, u_resolution.y);
  p *= 3.8;
  
  vec3 c = voronoi(p);
  float distToCenter = c.x;
  float distToEdge = c.y;
  float cellId = c.z;
  
  // Base dark ink background
  vec3 col = vec3(0.08, 0.08, 0.09);
  
  // Glowing cell borders
  float border = 1.0 - smoothstep(0.02, 0.09, distToEdge);
  vec3 borderColor = mix(vec3(0.0, 0.82, 1.0), vec3(0.38, 0.45, 0.98), cellId);
  col = mix(col, borderColor, border * 0.9);
  
  // Center pulse
  float centerDot = 1.0 - smoothstep(0.0, 0.08, distToCenter);
  col += borderColor * centerDot * 1.2;
  
  // Subtle cellular gradient fill
  col += vec3(0.12, 0.12, 0.14) * (1.0 - distToCenter) * cellId;
  
  // Vignette
  vec2 uv = (gl_FragCoord.xy - u_origin.xy) / u_resolution;
  float vig = uv.x * uv.y * (1.0 - uv.x) * (1.0 - uv.y);
  col *= clamp(14.0 * vig, 0.0, 1.0);
  
  fragColor = vec4(col, 1.0);
}
`;

export const wavesFrag = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_origin;

out vec4 fragColor;

void main() {
  // Uses exact pixel coordinates relative to DOM card bounds
  vec2 cardPixel = gl_FragCoord.xy - u_origin.xy;
  vec2 center = u_resolution * 0.5;
  float d = length(cardPixel - center);
  
  // Wave rings propagating outwards
  float speed = 55.0;
  float freq = 0.045;
  float ring = sin(d * freq - u_time * 3.5);
  float sharpRing = smoothstep(0.7, 0.98, ring);
  
  // Secondary harmonics
  float ring2 = sin(d * 0.09 + u_time * 2.0);
  
  // Gradient colors: Refined Web3 Cyan & Indigo
  vec3 darkBase = vec3(0.04, 0.05, 0.07);
  vec3 cyanAccent = vec3(0.0, 0.82, 1.0);
  vec3 indigoAccent = vec3(0.38, 0.45, 0.98);
  
  // Coordinate crosshair / radar line
  float crosshair = max(
    smoothstep(1.5, 0.0, abs(cardPixel.x - center.x)),
    smoothstep(1.5, 0.0, abs(cardPixel.y - center.y))
  ) * 0.25;
  
  vec3 col = darkBase;
  col += mix(cyanAccent, indigoAccent, sin(d * 0.02 - u_time) * 0.5 + 0.5) * sharpRing * 0.85;
  col += cyanAccent * ring2 * 0.08;
  col += vec3(1.0) * crosshair;
  
  // Center core glow
  float core = exp(-d * 0.04);
  col += cyanAccent * core * 1.5;
  
  // Card border fade
  vec2 uv = cardPixel / u_resolution;
  float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float borderFade = smoothstep(0.0, 0.05, edgeDist);
  
  fragColor = vec4(col * borderFade, 1.0);
}
`;

export const flowFrag = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

// Simplex-style flow field
vec2 flowField(vec2 p) {
  float t = u_time * 0.6;
  float a = sin(p.x * 2.0 + t) + cos(p.y * 2.0 - t * 0.8);
  float b = cos(p.x * 1.5 - t * 0.5) + sin(p.y * 2.5 + t);
  return vec2(a, b);
}

void main() {
  vec2 uv = v_uv;
  vec2 p = (uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0) * 3.0;
  
  // Multi-pass domain warping
  vec2 q = flowField(p);
  vec2 r = flowField(p + q * 0.8 + vec2(u_time * 0.2));
  vec2 s = flowField(p + r * 0.6);
  
  float pattern = length(s);
  
  // Refined palette: Deep obsidian, electric cyan, slate indigo
  vec3 col1 = vec3(0.04, 0.05, 0.07);
  vec3 col2 = vec3(0.38, 0.45, 0.98);
  vec3 col3 = vec3(0.0, 0.82, 1.0);
  vec3 col4 = vec3(0.08, 0.12, 0.18);
  
  vec3 col = mix(col1, col4, clamp(pattern * 0.4, 0.0, 1.0));
  col = mix(col, col2, smoothstep(1.0, 1.8, pattern));
  col = mix(col, col3, smoothstep(1.8, 2.4, pattern));
  
  // Ribbons & contour highlights
  float lines = sin(pattern * 12.0 + u_time * 2.0);
  col += vec3(0.7, 0.92, 1.0) * smoothstep(0.85, 0.98, lines) * 0.3;
  
  fragColor = vec4(col, 1.0);
}
`;

export const problemFrag = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec3 u_cp; // Camera position animated by scroll progress

out vec4 fragColor;

mat3 rotateY(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

mat3 rotateX(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

// Distance estimator of competing context boxes
float mapScene(vec3 p) {
  float d = 1e5;
  // Multiple stacked & colliding WebGL context cubes
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float offset = fi * 0.5 - 1.0;
    float wobble = sin(u_time * 1.5 + fi * 1.2) * 0.15;
    vec3 boxPos = p - vec3(sin(fi * 1.5) * 0.4, offset + wobble, cos(fi * 1.5) * 0.3);
    boxPos = rotateY(u_time * 0.4 + fi) * boxPos;
    float b = sdBox(boxPos, vec3(0.35, 0.18, 0.35)) - 0.03;
    d = min(d, b);
  }
  return d;
}

vec3 getNormal(vec3 p) {
  float d = mapScene(p);
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(
    mapScene(p + e.xyy) - d,
    mapScene(p + e.yxy) - d,
    mapScene(p + e.yyx) - d
  ));
}

void main() {
  vec2 uv = (gl_FragCoord.xy - vec2(0.0)) / u_resolution;
  vec2 p = (v_uv - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
  
  // Camera orientation driven by scroll parameter u_cp
  vec3 ro = normalize(u_cp + vec3(0.001)) * 3.2;
  vec3 ta = vec3(0.0, 0.0, 0.0);
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = normalize(cross(uu, ww));
  vec3 rd = normalize(p.x * uu + p.y * vv + 1.6 * ww);
  
  // Raymarch
  float t = 0.0;
  float hit = -1.0;
  for (int i = 0; i < 60; i++) {
    vec3 pos = ro + rd * t;
    float h = mapScene(pos);
    if (h < 0.001) {
      hit = t;
      break;
    }
    t += h;
    if (t > 10.0) break;
  }
  
  vec3 col = vec3(0.05, 0.05, 0.06);
  
  // Cybernetic wireframe grid backdrop
  float grid = max(
    smoothstep(0.96, 0.99, sin(v_uv.x * 30.0)),
    smoothstep(0.96, 0.99, sin(v_uv.y * 30.0))
  );
  col += vec3(0.98, 0.35, 0.45) * grid * 0.06;
  
  if (hit > 0.0) {
    vec3 pos = ro + rd * hit;
    vec3 nor = getNormal(pos);
    
    // Wireframe edges on the boxes
    vec3 absP = abs(fract(pos * 3.0) - 0.5);
    float wire = smoothstep(0.42, 0.48, max(absP.x, max(absP.y, absP.z)));
    
    // Alert / collision colors
    vec3 alertRed = vec3(0.95, 0.2, 0.3);
    vec3 warningAmber = vec3(1.0, 0.75, 0.1);
    
    float fresnel = pow(1.0 + dot(rd, nor), 2.5);
    col = mix(vec3(0.12, 0.12, 0.14), alertRed, wire * 0.85);
    col = mix(col, warningAmber, fresnel * 0.6);
    
    // Light
    vec3 lightDir = normalize(vec3(1.0, 2.0, 1.5));
    float diff = max(dot(nor, lightDir), 0.0);
    col += vec3(0.2) * diff;
  }
  
  fragColor = vec4(col, 1.0);
}
`;

export const galleryImgFrag = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform sampler2D u_image;
uniform vec2 u_mouse;  // Normalized [0..1] when hovering, [-1, -1] otherwise
uniform float u_scroll; // -1 to +1 scroll velocity/progress
uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

void main() {
  vec2 uv = v_uv;
  
  // Parallax subtle offset from scroll
  uv.y += u_scroll * 0.04;
  
  // Interactive mouse displacement ripple
  vec2 disp = vec2(0.0);
  if (u_mouse.x >= 0.0) {
    vec2 toMouse = uv - u_mouse;
    // Aspect ratio correction
    toMouse.x *= u_resolution.x / u_resolution.y;
    float dist = length(toMouse);
    float ripple = sin(dist * 24.0 - u_time * 8.0) * exp(-dist * 4.5);
    disp = normalize(toMouse + 0.0001) * ripple * 0.045;
  }
  
  // Base ambient flow wave
  disp.x += sin(uv.y * 6.0 + u_time * 1.5) * 0.004;
  disp.y += cos(uv.x * 6.0 + u_time * 1.2) * 0.004;
  
  // Chromatic Aberration sampling
  vec2 uvR = clamp(uv + disp * 1.35, 0.0, 1.0);
  vec2 uvG = clamp(uv + disp, 0.0, 1.0);
  vec2 uvB = clamp(uv + disp * 0.65, 0.0, 1.0);
  
  float r = texture(u_image, uvR).r;
  float g = texture(u_image, uvG).g;
  float b = texture(u_image, uvB).b;
  
  fragColor = vec4(r, g, b, 1.0);
}
`;

export const terminalFrag = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

float hash(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p.x * 0.123 + p.y * 0.456) * 43758.5453123);
}

float hash1(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {
  vec2 pixel = gl_FragCoord.xy;
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  
  // Matrix terminal grid dimensions (columns and row tiers matching Image 1)
  float colW = 28.0;
  float rowH = 15.0;
  
  vec2 cell = floor(pixel / vec2(colW, rowH));
  vec2 inCell = fract(pixel / vec2(colW, rowH));
  
  // Clean vertical separation between columns
  float colBorder = step(0.08, inCell.x) * step(inCell.x, 0.92);
  
  // Random values per cell and per column
  float cellH = hash(cell);
  float colH = hash1(cell.x * 13.37);
  
  // Dynamic animated data streams moving down at varying speeds
  float streamSpeed = 1.2 + colH * 2.2;
  float stream = mod(cell.y + u_time * 5.0 * streamSpeed, 22.0);
  float streamActive = smoothstep(3.0, 0.0, abs(stream - 2.0));
  
  // Intermittent flicker / data burst logic
  float timeTick = floor(u_time * 3.0 + colH * 8.0);
  float burst = hash(cell + vec2(timeTick * 0.05, -timeTick * 0.02));
  
  // Base dark cell tile background (deep slate/greenish-charcoal with subtle tile variance)
  vec3 bgTile = mix(vec3(0.02, 0.035, 0.025), vec3(0.04, 0.07, 0.05), cellH * 0.35);
  bgTile *= colBorder;
  
  // Crisp horizontal green phosphor dash
  // Sits along the bottom third of each row tier (height ~ 3px)
  float dashY = smoothstep(0.12, 0.22, inCell.y) * smoothstep(0.44, 0.34, inCell.y);
  float dashX = smoothstep(0.06, 0.14, inCell.x) * smoothstep(0.94, 0.86, inCell.x);
  float dashShape = dashX * dashY;
  
  // Determine if this cell is illuminated
  float isLit = 0.0;
  float brightness = 0.0;
  
  if (burst > 0.58 || streamActive > 0.5) {
    isLit = 1.0;
    float level = fract(burst * 23.41);
    if (level > 0.82) {
      brightness = 1.8; // Intense white-green phosphor
    } else if (level > 0.4) {
      brightness = 1.15; // Vivid neon green
    } else {
      brightness = 0.65; // Soft forest green
    }
    brightness += streamActive * 0.7;
  }
  
  // Phosphor colors: deep emerald, neon green, lime-white
  vec3 darkGreen = vec3(0.10, 0.42, 0.18);
  vec3 neonGreen = vec3(0.35, 0.96, 0.48);
  vec3 whiteGreen = vec3(0.75, 1.0, 0.82);
  
  vec3 dashCol = mix(darkGreen, neonGreen, clamp(brightness, 0.0, 1.0));
  dashCol = mix(dashCol, whiteGreen, clamp(brightness - 1.0, 0.0, 1.0));
  
  vec3 col = bgTile + dashCol * dashShape * brightness * isLit;
  
  // Subtle phosphor glow bleed around lit dashes
  float glowBleed = exp(-distance(inCell, vec2(0.5, 0.28)) * 3.5);
  col += neonGreen * glowBleed * 0.08 * isLit;
  
  // Radial green aura behind the API card on the left side (matching Image 1)
  float cardGlow = exp(-length((uv - vec2(0.26, 0.50)) * vec2(1.2, 0.9)) * 1.9);
  col += vec3(0.07, 0.28, 0.11) * cardGlow * 0.85;
  
  // Fine CRT scanline pass
  float scanline = sin(pixel.y * 1.5) * 0.5 + 0.5;
  col *= 0.94 + 0.06 * scanline;
  
  fragColor = vec4(col, 1.0);
}
`;

export const showcaseBgFrag = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;

out vec4 fragColor;

void main() {
  vec2 uv = v_uv;
  
  // Sleek deep void Web3 background: #07090e to #0f131c
  vec3 bg1 = vec3(0.028, 0.035, 0.055);
  vec3 bg2 = vec3(0.058, 0.072, 0.105);
  vec3 col = mix(bg1, bg2, uv.y + sin(uv.x * 3.5 + u_time * 0.3) * 0.12);
  
  // Subtle luminous topographic network contours
  float topo = sin(uv.x * 14.0 + sin(uv.y * 9.0 + u_time * 0.35) * 2.2);
  float contour = smoothstep(0.96, 0.99, topo);
  vec3 cyanPulse = vec3(0.0, 0.82, 1.0);
  col = mix(col, cyanPulse, contour * 0.14);
  
  // Subtle radial glow behind the 3D blockchain visual area
  vec2 center = vec2(0.72, 0.5);
  float dist = length(uv - center);
  float aura = exp(-dist * 2.8);
  col += cyanPulse * aura * 0.09;
  
  fragColor = vec4(col, 1.0);
}
`;

export const particlesVert = `#version 300 es
precision highp float;

in vec3 a_position;
in vec3 a_velocity;
in float a_life;
in float a_seed;

uniform float u_delta;
uniform float u_time;
uniform vec4 u_origin; // .zw is element centre in NDC
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

out vec3 v_position;
out vec3 v_velocity;
out float v_life;
out float v_seed;
out float v_alpha;

// Multi-octave 3D Curl Noise for wind turbulence
vec3 curlNoise(vec3 p) {
  float t = u_time * 0.85;
  vec3 v1 = vec3(
    sin(p.y * 3.2 + t * 0.9) + cos(p.z * 2.6 - t * 0.7),
    sin(p.z * 2.8 - t * 0.8) + cos(p.x * 3.0 + t * 1.1),
    sin(p.x * 2.6 + t * 0.6) + cos(p.y * 2.9 - t * 0.8)
  );
  vec3 v2 = vec3(
    cos(p.y * 6.2 - t * 1.2) * 0.5,
    sin(p.z * 6.0 + t * 1.3) * 0.5,
    cos(p.x * 6.5 - t * 1.1) * 0.5
  );
  return (v1 + v2) * 0.009;
}

void main() {
  float life = a_life - u_delta * 0.20;
  vec3 vel = a_velocity;
  vec3 pos = a_position;
  
  if (life <= 0.0) {
    // Respawn in a volumetric cloud
    life = 1.0;
    float ang = a_seed * 6.2831853 + u_time * 0.5;
    float phi = fract(a_seed * 193.23) * 3.14159;
    float r = pow(fract(a_seed * 91.13), 0.5) * 0.65;
    
    pos = vec3(cos(ang) * sin(phi), sin(ang) * sin(phi), cos(phi)) * r;
    
    // Initial velocity blown by wind
    vec3 windEject = vec3(-0.006, 0.002, 0.0);
    vel = windEject + vec3(cos(ang), sin(ang), cos(phi)) * (0.001 + fract(a_seed * 43.1) * 0.003);
  } else {
    // Dynamic periodic wind gusts (surging in passes like windy weather)
    float gust = 1.0 + 2.2 * pow(sin(u_time * 0.75 + pos.x * 1.6) * 0.5 + 0.5, 2.0);
    vec3 windDir = vec3(-0.007 * gust, (sin(pos.x * 2.5 + u_time) * 0.0025 + 0.001), cos(pos.y * 2.0) * 0.0015);
    
    vec3 curl = curlNoise(pos);
    vel = mix(vel, windDir + curl, u_delta * 2.8);
    pos += vel * (u_delta * 65.0);
  }
  
  v_position = pos;
  v_velocity = vel;
  v_life = life;
  v_seed = a_seed;
  v_alpha = smoothstep(0.0, 0.1, life) * smoothstep(1.0, 0.6, life);
  
  // 3D Camera Projection
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  vec4 projPos = projectionMatrix * mvPosition;
  
  // Anchor particles to the showcase element on the screen using u_origin.zw
  projPos.xy += u_origin.zw * projPos.w;
  gl_Position = projPos;
  
  // Size attenuation with safe positive depth
  float pz = max(-mvPosition.z, 0.2);
  float sizeNoise = 1.2 + fract(a_seed * 53.7) * 2.2;
  gl_PointSize = clamp((6.0 / pz) * sizeNoise, 1.5, 18.0);
}
`;

export const particlesFrag = `#version 300 es
precision highp float;

in float v_alpha;
out vec4 fragColor;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;
  
  float disc = smoothstep(0.5, 0.08, dist) * v_alpha;
  
  // Pure glowing white sand particles
  vec3 whiteColor = vec3(1.0, 1.0, 1.0);
  fragColor = vec4(whiteColor, disc * 0.9);
}
`;

export const blockchain3DFrag = `#version 300 es
precision highp float;

in vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec4 u_origin;
uniform float u_scroll;
uniform vec2 u_mouse;

out vec4 fragColor;

// Rotation matrices
mat3 rotX(float a) {
  float c = cos(a), s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}

mat3 rotY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c);
}

mat3 rotZ(float a) {
  float c = cos(a), s = sin(a);
  return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0);
}

// Distance estimators (SDF)
float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdRoundBox(vec3 p, vec3 b, float r) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

float sdOctahedron(vec3 p, float s) {
  p = abs(p);
  return (p.x + p.y + p.z - s) * 0.57735027;
}

float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

// Global accumulators for cryptographic laser and core glow
float g_coreGlow = 0.0;
float g_chainGlow = 0.0;

// Scene map returning vec2(distance, materialID)
// ID 1.0 = Dark Obsidian Block Shell
// ID 2.0 = Glowing Crypto Octahedron Core
// ID 3.0 = Cryptographic Laser Chain Links
// ID 4.0 = Orbiting Validator Node Satellites
vec2 mapScene(vec3 p) {
  float s = u_scroll;
  float t = u_time;
  
  // Continuous scroll-driven dynamic orientation
  float scrollPitch = (s - 0.5) * 2.4;
  float scrollYaw   = s * 4.6 + t * 0.28;
  float scrollRoll  = sin(s * 3.14159) * 0.45;
  
  // 1. Central Validating Block (Block #1,849,204)
  vec3 cPos = vec3(0.0, sin(t * 1.6 + s * 4.0) * 0.08, 0.0);
  vec3 pCenter = p - cPos;
  mat3 rotCenter = rotY(scrollYaw) * rotX(0.42 + scrollPitch * 0.5) * rotZ(scrollRoll);
  vec3 pRotC = rotCenter * pCenter;
  
  // Outer block shell (beveled cube with carved corner recesses)
  float dCenterShell = sdRoundBox(pRotC, vec3(0.48), 0.05);
  // Cutout cross-shaped windows into the shell to expose inner glowing core
  float dCutoutX = sdBox(pRotC, vec3(0.65, 0.28, 0.28));
  float dCutoutY = sdBox(pRotC, vec3(0.28, 0.65, 0.28));
  float dCutoutZ = sdBox(pRotC, vec3(0.28, 0.28, 0.65));
  float dCutouts = min(dCutoutX, min(dCutoutY, dCutoutZ));
  dCenterShell = max(dCenterShell, -dCutouts);
  
  // Inner spinning Ethereum / Cryptographic diamond octahedron
  mat3 rotCore = rotY(-t * 1.4 - s * 5.0) * rotX(t * 0.9);
  float dCore = sdOctahedron(rotCore * pRotC, 0.30);
  
  // 2. Parent Block (Block #1,849,203: Finalized)
  // Shifts and articulates dynamically with scroll trigger
  vec3 offsetParent = vec3(-1.38 - (1.0 - s) * 0.35, 0.65 - s * 0.45, -0.65 + (1.0 - s) * 0.3);
  vec3 pParent = p - offsetParent;
  mat3 rotParent = rotY(scrollYaw * 0.7 - 0.7) * rotX(0.35 - scrollPitch * 0.3);
  vec3 pRotP = rotParent * pParent;
  float dParent = sdRoundBox(pRotP, vec3(0.35), 0.04);
  
  // 3. Child Block (Block #1,849,205: Pending / Mempool Proposal)
  vec3 offsetChild = vec3(1.38 + (1.0 - s) * 0.35, -0.65 + s * 0.48, 0.65 - (1.0 - s) * 0.3);
  vec3 pChild = p - offsetChild;
  mat3 rotChild = rotY(scrollYaw * 0.85 + 1.15) * rotZ(-0.35 + scrollPitch * 0.4);
  vec3 pRotCh = rotChild * pChild;
  float dChild = sdRoundBox(pRotCh, vec3(0.35), 0.04);
  
  // 4. Cryptographic Hash Chains (Connecting Cylinders / Laser Beams)
  float dChain1 = sdCapsule(p, offsetParent, cPos, 0.030);
  float dChain2 = sdCapsule(p, cPos, offsetChild, 0.030);
  float dChains = min(dChain1, dChain2);
  
  // 5. Orbiting Validator Nodes (CometBFT Signers)
  float ang1 = t * 2.2 + s * 4.2;
  vec3 posNode1 = cPos + vec3(cos(ang1) * 1.15, sin(ang1 * 0.8) * 0.45, sin(ang1) * 1.15);
  float dNode1 = sdRoundBox(p - posNode1, vec3(0.08), 0.02);
  
  float ang2 = t * 1.6 - s * 3.6 + 2.09;
  vec3 posNode2 = cPos + vec3(cos(ang2) * 1.25, sin(ang2) * 0.68, sin(ang2 * 0.6) * 0.5);
  float dNode2 = sdOctahedron(p - posNode2, 0.11);
  
  float ang3 = t * 2.8 + s * 5.2 + 4.18;
  vec3 posNode3 = cPos + vec3(cos(ang3 * 0.5) * 0.45, sin(ang3) * 1.05, cos(ang3) * 1.05);
  float dNode3 = sdRoundBox(p - posNode3, vec3(0.07), 0.015);
  
  float dValidators = min(dNode1, min(dNode2, dNode3));
  
  // Overall distance
  float dBlocks = min(dCenterShell, min(dParent, dChild));
  
  // Accumulate glow around laser chains and core
  g_coreGlow += 0.012 / (0.04 + dCore * dCore);
  g_chainGlow += 0.009 / (0.03 + dChains * dChains);
  
  float d = dBlocks;
  float matId = 1.0;
  
  if (dCore < d) {
    d = dCore;
    matId = 2.0;
  }
  if (dChains < d) {
    d = dChains;
    matId = 3.0;
  }
  if (dValidators < d) {
    d = dValidators;
    matId = 4.0;
  }
  
  return vec2(d, matId);
}

vec3 calcNormal(vec3 p) {
  float d = mapScene(p).x;
  vec2 e = vec2(0.002, 0.0);
  return normalize(vec3(
    mapScene(p + e.xyy).x - d,
    mapScene(p + e.yxy).x - d,
    mapScene(p + e.yyx).x - d
  ));
}

void main() {
  vec2 p = (v_uv - 0.5) * 2.0;
  float aspect = u_resolution.x / max(u_resolution.y, 1.0);
  p.x *= aspect;
  
  float s = u_scroll;
  float t = u_time;
  
  // Camera Position Orbiting on Scroll and Mouse Parallax
  float camOrbit  = (s - 0.5) * 2.6 + u_mouse.x * 0.7;
  float camHeight = 1.25 + sin((s - 0.5) * 2.2) * 0.65 - u_mouse.y * 0.5;
  float camRadius = 3.8 - sin(s * 3.14159) * 0.5;
  
  vec3 ro = vec3(sin(camOrbit) * camRadius, camHeight, cos(camOrbit) * camRadius);
  vec3 ta = vec3(0.0, -0.05 + (s - 0.5) * 0.25, 0.0);
  
  vec3 ww = normalize(ta - ro);
  vec3 uu = normalize(cross(ww, vec3(0.0, 1.0, 0.0)));
  vec3 vv = normalize(cross(uu, ww));
  
  // Perspective camera ray
  vec3 rd = normalize(p.x * uu + p.y * vv + 1.8 * ww);
  
  // Raymarch loop
  float tRay = 0.1;
  float maxDist = 9.0;
  vec2 hit = vec2(-1.0, 0.0);
  g_coreGlow = 0.0;
  g_chainGlow = 0.0;
  
  for (int i = 0; i < 75; i++) {
    vec3 pos = ro + rd * tRay;
    vec2 res = mapScene(pos);
    if (res.x < 0.002) {
      hit = vec2(tRay, res.y);
      break;
    }
    tRay += res.x * 0.85;
    if (tRay > maxDist) break;
  }
  
  // Shading & Colors
  vec3 col = vec3(0.0);
  float alpha = 1.0;
  
  vec3 cyanGlow    = vec3(0.0, 0.82, 1.0);
  vec3 indigoPulse = vec3(0.38, 0.45, 0.98);
  vec3 darkInk     = vec3(0.04, 0.05, 0.07);
  vec3 carbonGray  = vec3(0.12, 0.14, 0.18);
  
  if (hit.x > 0.0) {
    vec3 pos = ro + rd * hit.x;
    vec3 nor = calcNormal(pos);
    vec3 lightDir = normalize(vec3(0.8, 1.3, 0.9));
    vec3 viewDir = -rd;
    vec3 halfVec = normalize(lightDir + viewDir);
    
    float diff = max(dot(nor, lightDir), 0.0);
    float spec = pow(max(dot(nor, halfVec), 0.0), 32.0);
    float fres = pow(1.0 - max(dot(nor, viewDir), 0.0), 3.0);
    
    if (hit.y == 1.0) {
      // Obsidian Block Shell
      vec3 fpos = abs(pos);
      float circuit = step(0.92, sin(fpos.x * 30.0)) + step(0.92, sin(fpos.y * 30.0)) + step(0.92, sin(fpos.z * 30.0));
      circuit = clamp(circuit, 0.0, 1.0);
      
      vec3 baseColor = mix(darkInk, carbonGray, 0.5 + 0.5 * nor.y);
      col = baseColor * (0.35 + diff * 0.75);
      col += mix(cyanGlow, indigoPulse, 0.35) * circuit * 0.85;
      col += vec3(0.95, 0.98, 1.0) * spec * 1.4;
      col += cyanGlow * fres * 0.75;
      
    } else if (hit.y == 2.0) {
      // Cryptographic Diamond Octahedron Core
      float pulse = 0.5 + 0.5 * sin(t * 3.5 + s * 6.0);
      vec3 coreColor = mix(cyanGlow * 1.3, indigoPulse * 1.2, pulse);
      col = coreColor * (0.8 + fres * 1.5 + spec * 2.0);
      
    } else if (hit.y == 3.0) {
      // Cryptographic Laser Chain
      float packet = fract(t * 1.8 - pos.x * 1.5 + pos.y * 1.5);
      float pulseBeam = smoothstep(0.0, 0.25, packet) * smoothstep(0.8, 0.25, packet);
      vec3 beamColor = mix(cyanGlow, vec3(0.9, 0.95, 1.0), pulseBeam * 0.9);
      col = beamColor * (1.2 + pulseBeam * 2.5 + spec);
      
    } else if (hit.y == 4.0) {
      // Orbiting Validator Node
      col = mix(cyanGlow, vec3(1.0), 0.5) * (0.8 + spec * 2.0 + fres);
    }
  } else {
    // Sleek deep void Web3 card background when ray misses 3D geometry
    vec3 bg1 = vec3(0.024, 0.030, 0.046);
    vec3 bg2 = vec3(0.048, 0.062, 0.092);
    col = mix(bg1, bg2, v_uv.y + sin(v_uv.x * 3.5 + t * 0.3) * 0.08);
    
    // Subtle topographic grid lines
    float topo = sin(v_uv.x * 12.0 + sin(v_uv.y * 8.0 + t * 0.35) * 2.0);
    float contour = smoothstep(0.96, 0.99, topo);
    col = mix(col, cyanGlow, contour * 0.12);
    
    // Volumetric glow halo around the 3D blockchain
    float halo = clamp(g_coreGlow * 0.06 + g_chainGlow * 0.05, 0.0, 1.0);
    col += mix(cyanGlow, indigoPulse, 0.25) * halo;
    alpha = 1.0;
  }
  
  fragColor = vec4(col, 1.0);
}
`;

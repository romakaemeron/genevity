"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Domain-warped FBM fluid shader — Siri-style orb in GENEVITY palette
const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2  u_resolution;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(dot(hash2(i + vec2(0,0)), f - vec2(0,0)),
        dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
    mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
        dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) {
    v += a * noise(p);
    p  = p * 2.1 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t  = u_time * 0.22;

  // Two layers of domain warping
  vec2 q = vec2(fbm(uv + vec2(0.0,  0.0) + t * 0.3),
                fbm(uv + vec2(5.2,  1.3) + t * 0.25));

  vec2 r = vec2(fbm(uv + 3.5 * q + vec2(1.7, 9.2) + 0.15 * t),
                fbm(uv + 3.5 * q + vec2(8.3, 2.8) + 0.12 * t));

  float f = fbm(uv + 3.5 * r + t * 0.1);
  f = f * 0.5 + 0.5;

  // GENEVITY palette: taupe → rosegold → champagne + warm gold accent
  vec3 taupe     = vec3(0.545, 0.482, 0.420); // #8B7B6B
  vec3 rosegold  = vec3(0.753, 0.816, 0.835); // #C0CFD5
  vec3 champagne = vec3(0.980, 0.976, 0.965); // #FAF9F6
  vec3 gold      = vec3(0.871, 0.749, 0.518); // warm gold highlight
  vec3 deep      = vec3(0.271, 0.235, 0.196); // deep brown shadow

  vec3 col = deep;
  col = mix(col, taupe,     smoothstep(0.0,  0.4,  f));
  col = mix(col, rosegold,  smoothstep(0.35, 0.65, f));
  col = mix(col, champagne, smoothstep(0.55, 0.80, f));
  col = mix(col, gold,      smoothstep(0.70, 0.90, f) * (0.3 + 0.4 * noise(uv * 6.0 + t)));

  // Soft inner glow
  float glow = exp(-3.5 * dot(uv, uv));
  col += 0.12 * champagne * glow;

  // Circular clip with feathered edge
  float dist  = length(uv) * 2.0;
  float alpha = 1.0 - smoothstep(0.80, 1.02, dist);

  // Subtle rim darkening
  col *= 1.0 - 0.35 * smoothstep(0.55, 0.95, dist);

  gl_FragColor = vec4(col, alpha);
}
`;

function initGL(canvas: HTMLCanvasElement): (() => void) | null {
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: false });
  if (!gl) return null;

  const compile = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const loc = gl.getAttribLocation(prog, "a_position");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const uTime = gl.getUniformLocation(prog, "u_time");
  const uRes  = gl.getUniformLocation(prog, "u_resolution");

  gl.uniform2f(uRes, canvas.width, canvas.height);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  let raf: number;
  const start = performance.now();

  const tick = () => {
    gl.uniform1f(uTime, (performance.now() - start) / 1000);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(tick);
  };
  tick();

  return () => cancelAnimationFrame(raf);
}

interface Props {
  size?: number;
  className?: string;
}

export default function SiriOrb({ size = 56, className = "" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cleanup = initGL(canvas);
    return () => cleanup?.();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      style={{ display: "block", borderRadius: "18px" }}
    />
  );
}

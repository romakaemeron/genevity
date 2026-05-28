"use client";

import { useEffect, useRef } from "react";

const SPEED = 0.060, SCALE = 1.00, WARP = 0.70, BREATHE = 0.04, GRAIN = 0.05;

const VERT = `attribute vec2 a_pos; void main(){ gl_Position = vec4(a_pos,0.0,1.0); }`;
const FRAG = `
  precision mediump float;
  uniform vec2 u_res; uniform float u_time;
  uniform float u_speed,u_scale,u_warp,u_breathe,u_grain;
  float hash11(float p){ p=fract(p*0.1031); p*=p+33.33; p*=p+p; return fract(p); }
  vec2 hash22(vec2 p){ p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))); return -1.0+2.0*fract(sin(p)*43758.5453); }
  float snoise(vec2 p){
    const float K1=0.366025404,K2=0.211324865;
    vec2 i=floor(p+(p.x+p.y)*K1); vec2 a=p-i+(i.x+i.y)*K2;
    vec2 o=(a.x>a.y)?vec2(1.0,0.0):vec2(0.0,1.0);
    vec2 b=a-o+K2; vec2 c=a-1.0+2.0*K2;
    vec3 h=max(0.5-vec3(dot(a,a),dot(b,b),dot(c,c)),0.0);
    vec3 n=h*h*h*h*vec3(dot(a,hash22(i)),dot(b,hash22(i+o)),dot(c,hash22(i+1.0)));
    return dot(n,vec3(70.0));
  }
  float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<4;i++){ v+=a*snoise(p); p*=2.02; a*=0.5; } return v; }
  vec3 paletteSoft(float t){
    vec3 c1=vec3(0.980,0.976,0.965),c2=vec3(0.769,0.722,0.675),c3=vec3(0.545,0.482,0.420),c4=vec3(0.353,0.302,0.259);
    vec3 col=mix(c1,c2,smoothstep(-0.30,0.10,t));
    col=mix(col,c3,smoothstep(0.00,0.35,t));
    col=mix(col,c4,smoothstep(0.25,0.65,t));
    return col;
  }
  void main(){
    vec2 uv=(gl_FragCoord.xy-0.5*u_res)/min(u_res.x,u_res.y);
    float t=u_time*u_speed;
    float breathe=1.0+u_breathe*sin(u_time*0.6);
    vec2 q=uv*u_scale*breathe;
    vec2 w=vec2(fbm(q+vec2(t,0.0)),fbm(q+vec2(0.0,t)));
    float n=fbm(q+u_warp*w+t*0.4);
    vec3 col=paletteSoft(n);
    float r=length(uv);
    col*=1.0-0.35*smoothstep(0.30,0.50,r);
    float g=hash11(dot(gl_FragCoord.xy,vec2(12.9898,78.233))+fract(u_time));
    col+=(g-0.5)*u_grain;
    float orb=smoothstep(0.500,0.485,r);
    gl_FragColor=vec4(col*orb,orb);
  }
`;

function initGL(canvas: HTMLCanvasElement): (() => void) | null {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: true, alpha: true });
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
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

  const a = gl.getAttribLocation(prog, "a_pos");
  gl.enableVertexAttribArray(a);
  gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);

  const U = {
    res: gl.getUniformLocation(prog, "u_res"),
    time: gl.getUniformLocation(prog, "u_time"),
    speed: gl.getUniformLocation(prog, "u_speed"),
    scale: gl.getUniformLocation(prog, "u_scale"),
    warp: gl.getUniformLocation(prog, "u_warp"),
    breathe: gl.getUniformLocation(prog, "u_breathe"),
    grain: gl.getUniformLocation(prog, "u_grain"),
  };

  gl.uniform1f(U.speed, SPEED);
  gl.uniform1f(U.scale, SCALE);
  gl.uniform1f(U.warp, WARP);
  gl.uniform1f(U.breathe, BREATHE);
  gl.uniform1f(U.grain, GRAIN);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(canvas.clientWidth * dpr);
    const h = Math.round(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let raf = 0, last = performance.now(), elapsed = 0, running = true;

  const frame = (now: number) => {
    const dt = Math.min(now - last, 100);
    last = now;
    elapsed += dt;
    resize();
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, elapsed * 0.001);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    if (running) raf = requestAnimationFrame(frame);
  };

  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
  const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

  const io = new IntersectionObserver(([e]) => { e.isIntersecting && running ? start() : stop(); }, { threshold: 0.01 });
  io.observe(canvas);

  const onVisibility = () => { document.hidden ? stop() : running && start(); };
  document.addEventListener("visibilitychange", onVisibility);
  start();

  return () => {
    running = false;
    stop();
    ro.disconnect();
    io.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}

export default function SiriOrb({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    return initGL(canvas) ?? undefined;
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", borderRadius: "50%" }}
    />
  );
}

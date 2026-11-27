import { useEffect, useRef } from "react";

// 3D Ashima simplex noise (MIT), used to ripple the cloth.
const NOISE = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const VERTEX = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;
varying float vFold;
${NOISE}
float height(vec2 p){
  float t = uTime * 0.16;
  float fold = snoise(vec3(p.x * 0.22 + t, p.y * 0.42 - t * 0.6, t * 0.5)) * 1.05;
  float ripple = snoise(vec3(p.x * 0.7 - t, p.y * 0.9, t)) * 0.24;
  float touch = exp(-dot(p - uPointer, p - uPointer) * 0.22) * 0.75;
  return fold + ripple + touch;
}
void main(){
  vUv = uv;
  vec3 pos = position;
  float h = height(pos.xy);
  float e = 0.06;
  vec3 dx = vec3(e, 0.0, height(pos.xy + vec2(e, 0.0)) - h);
  vec3 dy = vec3(0.0, e, height(pos.xy + vec2(0.0, e)) - h);
  pos.z += h;
  vFold = h;
  vNormal = normalize(normalMatrix * cross(dx, dy));
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

const FRAGMENT = /* glsl */ `
uniform float uTime;
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;
varying float vFold;
void main(){
  vec3 n = normalize(vNormal);
  vec3 v = normalize(vView);
  vec3 keyDir = normalize(vec3(sin(uTime * 0.21) * 0.8, 0.7, 0.55));
  vec3 fillDir = normalize(vec3(-0.8, -0.35, 0.45));

  vec3 base = vec3(0.045, 0.016, 0.04);
  vec3 orange = vec3(1.0, 0.42, 0.21);
  vec3 ember = vec3(1.0, 0.18, 0.39);
  vec3 violet = vec3(0.30, 0.14, 0.78);

  float key = max(dot(n, keyDir), 0.0);
  float fill = max(dot(n, fillDir), 0.0);
  float sheen = pow(max(dot(n, normalize(keyDir + v)), 0.0), 38.0);
  float rim = pow(1.0 - abs(dot(n, v)), 2.4);

  vec3 silk = mix(ember, orange, smoothstep(-0.7, 0.9, vFold));
  vec3 color = base + silk * pow(key, 2.6) * 0.85 + violet * pow(fill, 2.0) * 0.55;
  color += vec3(1.0, 0.82, 0.66) * sheen * 0.75 + silk * rim * 0.65;

  float edge = smoothstep(0.0, 0.22, vUv.x) * smoothstep(1.0, 0.78, vUv.x)
             * smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
  gl_FragColor = vec4(color, edge);
}`;

/** Flowing silk rendered with three.js. Loaded on the client only. */
export function FabricScene({ className = "" }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // No WebGL: the CSS glow behind the canvas remains.
      }

      const small = window.innerWidth < 768;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, small ? 1.4 : 1.75));
      renderer.domElement.setAttribute("aria-hidden", "true");
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
      camera.position.set(0, 0, 9);

      const uniforms = { uTime: { value: 8 }, uPointer: { value: new THREE.Vector2(3, 0) } };
      const geometry = new THREE.PlaneGeometry(18, 9.5, small ? 110 : 220, small ? 70 : 140);
      const material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: VERTEX,
        fragmentShader: FRAGMENT,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const cloth = new THREE.Mesh(geometry, material);
      cloth.rotation.set(-0.5, 0.12, -0.2);
      cloth.position.set(1.2, -0.4, 0);
      scene.add(cloth);

      const count = small ? 220 : 520;
      const positions = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 18;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 6;
      }
      const dustGeometry = new THREE.BufferGeometry();
      dustGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const dustMaterial = new THREE.PointsMaterial({
        color: 0xffb08a,
        size: 0.025,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const dust = new THREE.Points(dustGeometry, dustMaterial);
      scene.add(dust);

      const pointer = new THREE.Vector2(3, 0);
      const onPointer = (event: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        pointer.set(
          ((event.clientX - rect.left) / rect.width - 0.5) * 14,
          -((event.clientY - rect.top) / rect.height - 0.5) * 8,
        );
      };
      window.addEventListener("pointermove", onPointer, { passive: true });

      let frame = 0;
      let visible = true;
      let last = performance.now();
      const render = (now: number) => {
        const delta = Math.min((now - last) / 1000, 0.05);
        last = now;
        if (!reduced) uniforms.uTime.value += delta;
        uniforms.uPointer.value.lerp(pointer, 0.04);
        dust.rotation.y = uniforms.uTime.value * 0.018;
        camera.position.x += (pointer.x * 0.035 - camera.position.x) * 0.04;
        camera.position.y += (pointer.y * 0.035 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
        renderer.render(scene, camera);
        if (visible && !reduced) frame = requestAnimationFrame(render);
      };

      const resize = () => {
        const { clientWidth: width, clientHeight: height } = host;
        renderer.setSize(width, height);
        camera.aspect = width / Math.max(height, 1);
        camera.position.z = camera.aspect < 0.8 ? 12 : 9;
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(host);

      // Stop drawing while the hero is off screen.
      const visibility = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(frame);
        if (visible) {
          last = performance.now();
          frame = requestAnimationFrame(render);
        }
      });
      visibility.observe(host);

      host.dataset.ready = "true";

      cleanup = () => {
        cancelAnimationFrame(frame);
        resizeObserver.disconnect();
        visibility.disconnect();
        window.removeEventListener("pointermove", onPointer);
        geometry.dispose();
        material.dispose();
        dustGeometry.dispose();
        dustMaterial.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={`opacity-0 transition-opacity duration-[1400ms] data-[ready=true]:opacity-100 ${className}`}
    />
  );
}

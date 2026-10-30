import { useEffect, useRef } from 'react';

type PrismShaderBackdropProps = {
  className?: string;
  intensity?: number;
};

const vertexShaderSource = `
attribute vec2 a_position;
varying vec2 v_uv;

void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_intensity;

varying vec2 v_uv;

float ribbon(vec2 uv, float offset, float width, float twist, float speed) {
  float wave = sin((uv.x * twist) + (u_time * speed) + offset);
  wave += 0.45 * sin((uv.x * twist * 1.7) - (u_time * speed * 0.7) + offset * 1.9);
  float center = 0.5 + wave * 0.18;
  float d = abs(uv.y - center);
  float core = smoothstep(width, 0.0, d);
  float glow = smoothstep(width * 4.8, 0.0, d) * 0.42;
  return core + glow;
}

vec3 palette(float t) {
  vec3 mango = vec3(1.0, 0.66, 0.08);
  vec3 rose = vec3(1.0, 0.22, 0.42);
  vec3 emerald = vec3(0.02, 0.52, 0.28);
  vec3 cream = vec3(1.0, 0.96, 0.76);
  vec3 a = mix(mango, rose, smoothstep(0.05, 0.65, t));
  vec3 b = mix(emerald, cream, smoothstep(0.35, 0.95, t));
  return mix(a, b, 0.22 + 0.18 * sin(t * 6.2831 + u_time * 0.18));
}

void main() {
  vec2 uv = v_uv;
  vec2 centered = uv - 0.5;
  centered.x *= u_resolution.x / max(u_resolution.y, 1.0);

  float vignette = smoothstep(0.98, 0.16, length(centered));
  float mask = smoothstep(0.08, 0.78, uv.x) * smoothstep(1.04, 0.58, uv.y);

  float r1 = ribbon(uv + vec2(0.00, 0.08), 0.2, 0.038, 8.0, 0.45);
  float r2 = ribbon(uv + vec2(0.10, -0.13), 2.0, 0.028, 10.5, -0.34);
  float r3 = ribbon(uv + vec2(-0.12, 0.18), 4.1, 0.022, 13.5, 0.28);

  float ribbons = r1 + r2 * 0.75 + r3 * 0.55;
  float highlight = pow(max(0.0, r1 * 0.65 + r2 * 0.45), 2.0);
  float scan = 0.72 + 0.28 * sin((uv.x + uv.y) * 16.0 + u_time * 0.8);

  vec3 color = palette(uv.x + uv.y * 0.18);
  vec3 glass = color * ribbons * (0.9 + highlight * 1.8);
  glass += vec3(1.0, 0.97, 0.86) * highlight * scan;

  float alpha = clamp(ribbons * 0.55 + highlight * 0.24, 0.0, 0.72);
  alpha *= vignette * mask * u_intensity;

  gl_FragColor = vec4(glass, alpha);
}
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext) {
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
  if (!vertexShader || !fragmentShader) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

export function PrismShaderBackdrop({ className = '', intensity = 1 }: PrismShaderBackdropProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl', {
      alpha: true,
      antialias: true,
      depth: false,
      premultipliedAlpha: false,
    });

    if (!canvas || !gl) return;

    const program = createProgram(gl);
    if (!program) return;

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
    const timeLocation = gl.getUniformLocation(program, 'u_time');
    const intensityLocation = gl.getUniformLocation(program, 'u_intensity');

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    let frame = 0;
    const startedAt = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.round(rect.width * dpr));
      const height = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const render = () => {
      resize();
      const elapsed = (performance.now() - startedAt) / 1000;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.enableVertexAttribArray(positionLocation);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, elapsed);
      gl.uniform1f(intensityLocation, intensity);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      frame = requestAnimationFrame(render);
    };

    render();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  );
}

import { useEffect, useRef } from 'react';

type EdgeFade = 'all' | 'bottom' | 'none';
type ImageFit = 'contain' | 'cover';

interface DitheredImageProps {
  src: string;
  alt: string;
  className?: string;
  frameClassName?: string;
  edgeFade?: EdgeFade;
  fit?: ImageFit;
  animate?: boolean;
}

const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_uv;
  varying vec2 v_uv;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_uv = a_uv;
  }
`;

const fragmentShaderSource = `
  precision highp float;

  uniform sampler2D u_image;
  uniform sampler2D u_pattern;
  uniform vec2 u_textureScale;
  uniform vec2 u_textureOffset;
  uniform vec3 u_ink;
  uniform float u_time;
  uniform float u_dotScale;
  uniform float u_edgeMode;

  varying vec2 v_uv;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
  }

  float softenedNoise(vec2 cell, float time) {
    float frame = floor(time);
    float phase = smoothstep(0.0, 1.0, fract(time));
    return mix(hash(cell + frame), hash(cell + frame + 1.0), phase);
  }

  void main() {
    vec2 sampleUv = u_textureOffset + v_uv * u_textureScale;
    vec4 source = texture2D(u_image, sampleUv);
    float gray = dot(source.rgb, vec3(0.299, 0.587, 0.114));

    // Compress the source into a bold, printable tonal range.
    gray = smoothstep(0.06, 0.9, gray);
    gray = clamp(gray * 1.12 - 0.06, 0.0, 1.0);

    vec2 cell = floor(gl_FragCoord.xy / u_dotScale);
    vec2 patternUv = (mod(cell, 4.0) + 0.5) / 4.0;
    float threshold = texture2D(u_pattern, patternUv).r;

    // Only the lighter tones move, keeping shadows stable and legible.
    float movement = smoothstep(0.12, 0.72, gray);
    float drift = softenedNoise(cell * 0.19, u_time * 0.42) - 0.5;
    float shimmer = sin(u_time * 1.35 + hash(cell * 0.27) * 6.28318) * 0.045;
    threshold = clamp(threshold + (drift * 0.13 + shimmer) * movement, 0.01, 0.99);

    // These illustrations are composed on dark backgrounds. Keep those
    // shadows transparent and turn only the brighter detail into ink.
    float ink = step(threshold, gray);
    float edgeAlpha = 1.0;

    if (u_edgeMode < 0.5) {
      float nearestEdge = min(min(v_uv.x, 1.0 - v_uv.x), min(v_uv.y, 1.0 - v_uv.y));
      float raggedness = (hash(cell * 0.37) - 0.5) * 0.075;
      edgeAlpha = smoothstep(0.012, 0.13 + raggedness, nearestEdge);
    } else if (u_edgeMode < 1.5) {
      float raggedness = (hash(cell * 0.31) - 0.5) * 0.09;
      edgeAlpha = smoothstep(0.0, 0.55 + raggedness, v_uv.y);
    }

    float alpha = ink * edgeAlpha * source.a;
    gl_FragColor = vec4(u_ink, alpha);
  }
`;

const thresholdPattern = new Uint8Array([
  0, 136, 34, 170,
  204, 68, 238, 102,
  51, 187, 17, 153,
  255, 119, 221, 85,
]);

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
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

function parseHexColor(value: string): [number, number, number] {
  const normalized = value.trim().replace('#', '');
  const expanded = normalized.length === 3
    ? normalized.split('').map((character) => character + character).join('')
    : normalized;

  if (!/^[0-9a-f]{6}$/i.test(expanded)) {
    return [0.902, 0.886, 0.839];
  }

  return [
    parseInt(expanded.slice(0, 2), 16) / 255,
    parseInt(expanded.slice(2, 4), 16) / 255,
    parseInt(expanded.slice(4, 6), 16) / 255,
  ];
}

function edgeModeValue(edgeFade: EdgeFade) {
  if (edgeFade === 'bottom') return 1;
  if (edgeFade === 'none') return 2;
  return 0;
}

export default function DitheredImage({
  src,
  alt,
  className = '',
  frameClassName = '',
  edgeFade = 'all',
  fit = 'contain',
  animate = true,
}: DitheredImageProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const image = imageRef.current;
    const canvas = canvasRef.current;

    if (!frame || !image || !canvas) return;

    let animationFrame = 0;
    let lastFrame = 0;
    let visible = true;
    let stopped = false;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const setup = () => {
      if (stopped || !image.naturalWidth || !image.naturalHeight) return;

      const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        premultipliedAlpha: false,
      });

      if (!gl) return;

      const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      if (!vertexShader || !fragmentShader) return;

      const program = gl.createProgram();
      if (!program) return;

      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

      gl.useProgram(program);
      gl.clearColor(0, 0, 0, 0);

      const quad = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quad);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
          -1, -1, 0, 0,
          1, -1, 1, 0,
          -1, 1, 0, 1,
          1, 1, 1, 1,
        ]),
        gl.STATIC_DRAW,
      );

      const positionLocation = gl.getAttribLocation(program, 'a_position');
      const uvLocation = gl.getAttribLocation(program, 'a_uv');
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
      gl.enableVertexAttribArray(uvLocation);
      gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 16, 8);

      const imageTexture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, imageTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.uniform1i(gl.getUniformLocation(program, 'u_image'), 0);

      const patternTexture = gl.createTexture();
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, patternTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.LUMINANCE,
        4,
        4,
        0,
        gl.LUMINANCE,
        gl.UNSIGNED_BYTE,
        thresholdPattern,
      );
      gl.uniform1i(gl.getUniformLocation(program, 'u_pattern'), 1);

      const timeLocation = gl.getUniformLocation(program, 'u_time');
      const dotScaleLocation = gl.getUniformLocation(program, 'u_dotScale');
      const textureScaleLocation = gl.getUniformLocation(program, 'u_textureScale');
      const textureOffsetLocation = gl.getUniformLocation(program, 'u_textureOffset');
      const edgeModeLocation = gl.getUniformLocation(program, 'u_edgeMode');
      const inkLocation = gl.getUniformLocation(program, 'u_ink');

      const ink = parseHexColor(
        getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
      );
      gl.uniform3f(inkLocation, ink[0], ink[1], ink[2]);
      gl.uniform1f(edgeModeLocation, edgeModeValue(edgeFade));

      const resize = () => {
        const bounds = frame.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;

        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const width = Math.max(1, Math.round(bounds.width * pixelRatio));
        const height = Math.max(1, Math.round(bounds.height * pixelRatio));

        if (canvas.width !== width || canvas.height !== height) {
          canvas.width = width;
          canvas.height = height;
          gl.viewport(0, 0, width, height);
        }

        let scaleX = 1;
        let scaleY = 1;
        let offsetX = 0;
        let offsetY = 0;

        if (fit === 'cover') {
          const frameAspect = bounds.width / bounds.height;
          const imageAspect = image.naturalWidth / image.naturalHeight;

          if (imageAspect > frameAspect) {
            scaleX = frameAspect / imageAspect;
            offsetX = (1 - scaleX) / 2;
          } else {
            scaleY = imageAspect / frameAspect;
            offsetY = (1 - scaleY) / 2;
          }
        }

        gl.uniform2f(textureScaleLocation, scaleX, scaleY);
        gl.uniform2f(textureOffsetLocation, offsetX, offsetY);
        gl.uniform1f(dotScaleLocation, Math.max(1.35, pixelRatio * 1.15));
      };

      const draw = (timestamp: number) => {
        animationFrame = 0;
        if (stopped || !visible) return;

        if (timestamp - lastFrame < 70 && animate && !reducedMotion) {
          animationFrame = requestAnimationFrame(draw);
          return;
        }

        lastFrame = timestamp;
        resize();
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(timeLocation, timestamp / 1000);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        frame.dataset.ready = 'true';

        if (animate && !reducedMotion) {
          animationFrame = requestAnimationFrame(draw);
        }
      };

      const requestDraw = () => {
        if (!animationFrame && visible) {
          animationFrame = requestAnimationFrame(draw);
        }
      };

      resizeObserver = new ResizeObserver(requestDraw);
      resizeObserver.observe(frame);

      intersectionObserver = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          requestDraw();
        } else if (animationFrame) {
          cancelAnimationFrame(animationFrame);
          animationFrame = 0;
        }
      });
      intersectionObserver.observe(frame);

      requestDraw();
    };

    if (image.complete && image.naturalWidth) {
      setup();
    } else {
      image.addEventListener('load', setup, { once: true });
    }

    return () => {
      stopped = true;
      image.removeEventListener('load', setup);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (animationFrame) cancelAnimationFrame(animationFrame);
      delete frame.dataset.ready;
    };
  }, [animate, edgeFade, fit, src]);

  return (
    <div
      ref={frameRef}
      className={`dithered-frame ${frameClassName}`.trim()}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`dithered-source ${className}`.trim()}
      />
      <canvas ref={canvasRef} className="dithered-canvas" aria-hidden="true" />
    </div>
  );
}

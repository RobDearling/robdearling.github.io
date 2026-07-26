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
  uniform vec2 u_textureScale;
  uniform vec2 u_textureOffset;
  uniform vec2 u_resolution;
  uniform vec3 u_ink;
  uniform vec3 u_background;
  uniform float u_time;
  uniform float u_edgeMode;

  varying vec2 v_uv;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float animatedNoise(vec2 p, float time) {
    float frame = floor(time);
    float phase = smoothstep(0.0, 1.0, fract(time));
    return mix(hash(p + frame), hash(p + frame + 1.0), phase);
  }

  float atkinsonThreshold(vec2 pos) {
    int x = int(mod(pos.x, 4.0));
    int y = int(mod(pos.y, 4.0));
    int index = y * 4 + x;
    float thresholds[16];
    thresholds[0] = 0.0;    thresholds[1] = 12.0;  thresholds[2] = 3.0;   thresholds[3] = 15.0;
    thresholds[4] = 8.0;    thresholds[5] = 4.0;   thresholds[6] = 11.0;  thresholds[7] = 7.0;
    thresholds[8] = 2.0;    thresholds[9] = 14.0;  thresholds[10] = 1.0;  thresholds[11] = 13.0;
    thresholds[12] = 10.0;  thresholds[13] = 6.0;  thresholds[14] = 9.0;  thresholds[15] = 5.0;
    for (int i = 0; i < 16; i++) {
      if (i == index) return thresholds[i] / 16.0;
    }
    return 0.0;
  }

  void main() {
    vec2 sampleUv = u_textureOffset + v_uv * u_textureScale;
    vec4 source = texture2D(u_image, sampleUv);
    float gray = dot(source.rgb, vec3(0.299, 0.587, 0.114));
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float fade = 1.0;

    // Match the reference's noisy proportional edge fade.
    if (u_edgeMode < 0.5) {
      float edgeNoise = hash(gl_FragCoord.xy * 0.5) * 0.15;
      float fadeLeft = smoothstep(0.0, 0.1 + edgeNoise, uv.x);
      float fadeRight = smoothstep(0.0, 0.1 + edgeNoise, 1.0 - uv.x);
      float fadeBottom = smoothstep(0.0, 0.1 + edgeNoise, uv.y);
      float fadeTop = smoothstep(0.0, 0.1 + edgeNoise, 1.0 - uv.y);
      fade = fadeLeft * fadeRight * fadeBottom * fadeTop;
    } else if (u_edgeMode < 1.5) {
      float edgeNoise = hash(gl_FragCoord.xy * 0.5) * 0.15;
      fade = smoothstep(0.0, 0.1 + edgeNoise, uv.y);
    }

    gray *= fade;
    gray = clamp(gray * 1.2 - 0.1, 0.0, 1.0);

    float threshold = atkinsonThreshold(gl_FragCoord.xy);
    vec2 noiseCoord = gl_FragCoord.xy * 0.15;
    float noise = animatedNoise(noiseCoord, u_time) - 0.5;
    float flicker = 0.08 * sin(u_time * 2.0 + hash(gl_FragCoord.xy * 0.2) * 6.28);
    float effectIntensity = smoothstep(0.05, 0.3, gray);
    float animatedThreshold = clamp(
      threshold + 0.1 + (noise * 0.15 + flicker) * effectIntensity,
      0.001,
      0.999
    );
    float inkAlpha = step(animatedThreshold, gray) * source.a;

    // Flatten onto the known frame background. Mobile WebKit can otherwise
    // composite transparent WebGL pixels against white.
    gl_FragColor = vec4(mix(u_background, u_ink, inkAlpha), 1.0);
  }
`;

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

      const timeLocation = gl.getUniformLocation(program, 'u_time');
      const textureScaleLocation = gl.getUniformLocation(program, 'u_textureScale');
      const textureOffsetLocation = gl.getUniformLocation(program, 'u_textureOffset');
      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
      const edgeModeLocation = gl.getUniformLocation(program, 'u_edgeMode');
      const inkLocation = gl.getUniformLocation(program, 'u_ink');
      const backgroundLocation = gl.getUniformLocation(program, 'u_background');

      const ink = parseHexColor(
        getComputedStyle(document.documentElement).getPropertyValue('--dither-ink'),
      );
      const background = parseHexColor(
        getComputedStyle(document.documentElement).getPropertyValue('--background-color'),
      );
      gl.uniform3f(inkLocation, ink[0], ink[1], ink[2]);
      gl.uniform3f(backgroundLocation, background[0], background[1], background[2]);
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
        gl.uniform2f(resolutionLocation, width, height);

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
      };

      const startTime = performance.now();
      const draw = (timestamp: number) => {
        animationFrame = 0;
        if (stopped || !visible) return;

        if (timestamp - lastFrame < 100 && animate && !reducedMotion) {
          animationFrame = requestAnimationFrame(draw);
          return;
        }

        lastFrame = timestamp;
        resize();
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(timeLocation, (timestamp - startTime) / 2000);
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

import { useEffect, useRef } from 'react';

interface SignalNode {
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  phase: number;
  size: number;
  kind: number;
}

interface SignalEdge {
  from: number;
  to: number;
  phase: number;
  pulse: boolean;
}

function seededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function parseColor(value: string, fallback: string) {
  const color = value.trim();
  return /^#[0-9a-f]{3,8}$/i.test(color) ? color : fallback;
}

function createField(width: number) {
  const random = seededRandom(0x574952); // "WIR"
  const count = Math.max(22, Math.min(54, Math.round(width / 48)));
  const nodes: SignalNode[] = [];

  for (let index = 0; index < count; index += 1) {
    const column = index / Math.max(1, count - 1);
    nodes.push({
      x: Math.min(0.97, Math.max(0.03, column + (random() - 0.5) * 0.055)),
      y: 0.12 + random() * 0.72,
      driftX: 2 + random() * 5,
      driftY: 2 + random() * 7,
      phase: random() * Math.PI * 2,
      size: 1.2 + random() * 2.5,
      kind: random(),
    });
  }

  const edges: SignalEdge[] = [];
  nodes.forEach((node, from) => {
    const neighbours = nodes
      .map((candidate, to) => ({
        to,
        distance: Math.hypot(
          (candidate.x - node.x) * 1.8,
          candidate.y - node.y,
        ),
      }))
      .filter(({ to, distance }) => to !== from && distance < 0.29)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, node.kind > 0.78 ? 3 : 2);

    neighbours.forEach(({ to }) => {
      const low = Math.min(from, to);
      const high = Math.max(from, to);
      if (edges.some((edge) => edge.from === low && edge.to === high)) return;

      edges.push({
        from: low,
        to: high,
        phase: random(),
        pulse: random() > 0.58,
      });
    });
  });

  return { nodes, edges };
}

export default function SignalHeader() {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!frame || !canvas || !context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let field = createField(frame.clientWidth);
    let animationFrame = 0;
    let lastFrame = 0;
    let visible = true;
    let stopped = false;
    let width = 0;
    let height = 0;
    let pixelRatio = 1;

    const resize = () => {
      const bounds = frame.getBoundingClientRect();
      const nextWidth = Math.max(1, Math.round(bounds.width));
      const nextHeight = Math.max(1, Math.round(bounds.height));
      const nextPixelRatio = Math.min(window.devicePixelRatio || 1, 2);

      if (nextWidth !== width) field = createField(nextWidth);
      width = nextWidth;
      height = nextHeight;
      pixelRatio = nextPixelRatio;

      const bitmapWidth = Math.round(width * pixelRatio);
      const bitmapHeight = Math.round(height * pixelRatio);
      if (canvas.width !== bitmapWidth || canvas.height !== bitmapHeight) {
        canvas.width = bitmapWidth;
        canvas.height = bitmapHeight;
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
    };

    const nodePosition = (node: SignalNode, time: number) => ({
      x: node.x * width + Math.sin(time * 0.00016 + node.phase) * node.driftX,
      y: node.y * height + Math.cos(time * 0.00012 + node.phase * 1.7) * node.driftY,
    });

    const draw = (timestamp: number) => {
      animationFrame = 0;
      if (stopped || !visible) return;
      if (!reducedMotion && timestamp - lastFrame < 50) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }

      lastFrame = timestamp;
      resize();
      context.clearRect(0, 0, width, height);

      const styles = getComputedStyle(document.documentElement);
      const ink = parseColor(styles.getPropertyValue('--text-color'), '#e6e2d6');
      const positions = field.nodes.map((node) => (
        nodePosition(node, reducedMotion ? 0 : timestamp)
      ));

      context.lineCap = 'square';
      field.edges.forEach((edge, index) => {
        const from = positions[edge.from];
        const to = positions[edge.to];
        const bend = Math.sin(edge.phase * Math.PI * 2) * 9;
        const midX = (from.x + to.x) / 2;
        const midY = (from.y + to.y) / 2 + bend;

        context.beginPath();
        context.moveTo(from.x, from.y);
        context.quadraticCurveTo(midX, midY, to.x, to.y);
        context.strokeStyle = ink;
        context.globalAlpha = index % 3 === 0 ? 0.42 : 0.24;
        context.lineWidth = index % 4 === 0 ? 1.2 : 0.75;
        context.setLineDash(index % 5 === 0 ? [2, 4] : []);
        context.stroke();

        if (edge.pulse) {
          const progress = (timestamp / 7200 + edge.phase) % 1;
          const inverse = 1 - progress;
          const pulseX = inverse * inverse * from.x
            + 2 * inverse * progress * midX
            + progress * progress * to.x;
          const pulseY = inverse * inverse * from.y
            + 2 * inverse * progress * midY
            + progress * progress * to.y;

          context.globalAlpha = 0.84;
          context.fillStyle = ink;
          context.fillRect(
            Math.round(pulseX) - 1.5,
            Math.round(pulseY) - 1.5,
            3,
            3,
          );
        }
      });

      context.setLineDash([]);
      field.nodes.forEach((node, index) => {
        const point = positions[index];
        const radius = node.size + Math.sin(timestamp * 0.0007 + node.phase) * 0.35;

        context.globalAlpha = node.kind > 0.82 ? 0.95 : 0.72;
        context.fillStyle = ink;

        if (node.kind > 0.82) {
          context.fillRect(
            Math.round(point.x - radius),
            Math.round(point.y - radius),
            Math.round(radius * 2),
            Math.round(radius * 2),
          );
          context.globalAlpha = 0.22;
          context.strokeStyle = ink;
          context.lineWidth = 1;
          context.strokeRect(
            Math.round(point.x - radius - 4),
            Math.round(point.y - radius - 4),
            Math.round(radius * 2 + 8),
            Math.round(radius * 2 + 8),
          );
        } else {
          context.beginPath();
          context.arc(point.x, point.y, Math.max(1, radius), 0, Math.PI * 2);
          context.fill();
        }
      });

      // A sparse pixel field makes the clean vector network feel printed.
      context.fillStyle = ink;
      for (let index = 0; index < 90; index += 1) {
        const x = (index * 83 + 19) % Math.max(width, 1);
        const y = (index * 37 + 11) % Math.max(height, 1);
        const flicker = Math.sin(timestamp * 0.0005 + index * 2.4);
        if (flicker > 0.35) {
          context.globalAlpha = 0.08 + (flicker - 0.35) * 0.08;
          context.fillRect(Math.round(x), Math.round(y), 1.25, 1.25);
        }
      }

      context.globalAlpha = 1;
      frame.dataset.ready = 'true';
      if (!reducedMotion) animationFrame = requestAnimationFrame(draw);
    };

    const requestDraw = () => {
      if (!animationFrame && visible) animationFrame = requestAnimationFrame(draw);
    };

    const resizeObserver = new ResizeObserver(requestDraw);
    resizeObserver.observe(frame);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        requestDraw();
      } else if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
    });
    intersectionObserver.observe(frame);

    const handleVisibility = () => {
      visible = !document.hidden && frame.getBoundingClientRect().bottom > 0;
      if (visible) requestDraw();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    requestDraw();

    return () => {
      stopped = true;
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      delete frame.dataset.ready;
    };
  }, []);

  return (
    <div ref={frameRef} className="site-signal-banner" aria-hidden="true">
      <canvas ref={canvasRef} className="site-signal-canvas" />
    </div>
  );
}

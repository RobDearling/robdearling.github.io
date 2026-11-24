function waveform(pagePath: string) {
  // Seed the trace from the route so it can be drawn in the static HTML.
  let seed = 2166136261;
  for (const character of pagePath) {
    seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  }

  let path = 'M 0 15';
  let previousY = 15;
  for (let x = 24; x <= 960; x += 24) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const y = 4 + Math.floor((seed / 2 ** 32) * 23);
    path += ` C ${x - 14} ${previousY}, ${x - 10} ${y}, ${x} ${y}`;
    previousY = y;
  }
  return path;
}

export default function SignalHeader({ pagePath }: { pagePath: string }) {
  return (
    <svg className="masthead-trace" viewBox="0 0 960 30" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="trace-ink">
          <stop stopColor="var(--accent)" />
          <stop offset=".38" stopColor="var(--trace)" />
          <stop offset="1" stopColor="var(--trace)" stopOpacity=".12" />
        </linearGradient>
      </defs>
      <path key={pagePath} d={waveform(pagePath)} pathLength="1" fill="none" stroke="url(#trace-ink)" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

interface LogoProps {
  className?: string;
  idPrefix: string;
}

const upStripeXs = [-128, 0, 128, 256, 384, 512, 640, 768, 896, 1024, 1152];
const downStripeXs = [-64, 64, 192, 320, 448, 576, 704, 832, 960, 1088, 1216];

function LetterClip({ id }: { id: string }) {
  return (
    <clipPath id={id}>
      <text className="wr-mark" x="42" y="398">
        WR
      </text>
    </clipPath>
  );
}

function StripeRects({ stripeXs }: { stripeXs: number[] }) {
  return (
    <g transform="rotate(45 512 256)">
      {stripeXs.map((x) => (
        <rect key={x} x={x} y="-512" width="30" height="1536" fill="currentColor" />
      ))}
    </g>
  );
}

function StripeLayer({
  className,
  clipPathId,
  stripeXs,
}: {
  className: string;
  clipPathId: string;
  stripeXs: number[];
}) {
  return (
    <svg
      x="0"
      y="0"
      width="1024"
      height="512"
      viewBox="0 0 1024 512"
      className={className}
    >
      <defs>
        <LetterClip id={clipPathId} />
      </defs>
      <g clipPath={`url(#${clipPathId})`}>
        <StripeRects stripeXs={stripeXs} />
      </g>
    </svg>
  );
}

export default function Logo({ className, idPrefix }: LogoProps) {
  const clipPathId = `${idPrefix}-letters`;
  const upLayerClipPathId = `${idPrefix}-up-layer-letters`;
  const downLayerClipPathId = `${idPrefix}-down-layer-letters`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1024 512"
      aria-hidden="true"
      focusable="false"
      className={`wr-logo ${className ?? ''}`}
    >
      <defs>
        <LetterClip id={clipPathId} />
      </defs>
      <rect width="1024" height="512" fill="var(--background-color)" clipPath={`url(#${clipPathId})`} />
      <StripeLayer
        className="wr-logo-stripes wr-logo-stripes-up"
        clipPathId={upLayerClipPathId}
        stripeXs={upStripeXs}
      />
      <StripeLayer
        className="wr-logo-stripes wr-logo-stripes-down"
        clipPathId={downLayerClipPathId}
        stripeXs={downStripeXs}
      />
    </svg>
  );
}

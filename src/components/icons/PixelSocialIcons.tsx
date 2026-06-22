// Hand-drawn bitmaps rendered as crisp square <rect> pixels (no anti-aliasing),
// matching the site's dot-matrix / sharp-corner aesthetic.
const X_BITS = [
  "01000010",
  "01000010",
  "00100100",
  "00011000",
  "00011000",
  "00100100",
  "01000010",
  "01000010",
];

const TELEGRAM_BITS = [
  "00000010",
  "00000111",
  "00001111",
  "00111111",
  "01111110",
  "00101100",
  "00001000",
  "00000000",
];

function PixelGrid({ bits, size = 2 }: { bits: string[]; size?: number }) {
  const cols = bits[0].length;
  const rows = bits.length;
  return (
    <svg
      width={cols * size}
      height={rows * size}
      viewBox={`0 0 ${cols * size} ${rows * size}`}
      shapeRendering="crispEdges"
      fill="currentColor"
      aria-hidden="true"
    >
      {bits.map((row, y) =>
        [...row].map((bit, x) =>
          bit === "1" ? (
            <rect key={`${x}-${y}`} x={x * size} y={y * size} width={size} height={size} />
          ) : null
        )
      )}
    </svg>
  );
}

export function IconX(props: { size?: number }) {
  return <PixelGrid bits={X_BITS} size={props.size} />;
}

export function IconTelegram(props: { size?: number }) {
  return <PixelGrid bits={TELEGRAM_BITS} size={props.size} />;
}

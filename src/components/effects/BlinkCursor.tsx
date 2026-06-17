export default function BlinkCursor({ className = "" }: { className?: string }) {
  return (
    <span className={`blink ${className}`} aria-hidden>
      ▌
    </span>
  );
}

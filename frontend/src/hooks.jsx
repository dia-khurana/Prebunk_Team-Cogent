import { useCallback, useRef, useState } from "react";

// Track the mouse relative to the whole window (for the background glow).
export function useMousePos() {
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const onMove = useCallback((e) => {
    setPos({
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    });
  }, []);
  return [pos, onMove];
}

// A spring-lagged mouse position for smooth, slow parallax / glow movement.
export function useLerpedMouse(maxLag = 0.12) {
  const target = useRef({ x: 0.5, y: 0.5 });
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const raf = useRef();

  const onMove = useCallback((e) => {
    target.current = {
      x: e.clientX / window.innerWidth,
      y: e.clientY / window.innerHeight,
    };
  }, []);

  // start the rAF loop once
  if (!raf.current && typeof window !== "undefined") {
    const tick = () => {
      const t = target.current;
      setPos((prev) => {
        const nx = prev.x + (t.x - prev.x) * maxLag;
        const ny = prev.y + (t.y - prev.y) * maxLag;
        return { x: nx, y: ny };
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  return [pos, onMove];
}

// 3D tilt on hover. Returns handlers to spread onto a DOM element.
export function useTilt(maxDeg = 9, maxShift = 12) {
  const ref = useRef(null);
  const frame = useRef();
  const onMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.transform =
        `perspective(900px) rotateX(${(-py * maxDeg).toFixed(2)}deg) ` +
        `rotateY(${(px * maxDeg).toFixed(2)}deg) translate(${(px * maxShift).toFixed(1)}px, ${(py * maxShift).toFixed(1)}px)`;
    });
  }, [maxDeg, maxShift]);

  const onLeave = useCallback(() => {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (el) el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translate(0,0)";
  }, []);

  return { ref, onMouseMove: onMove, onMouseLeave: onLeave };
}

// A Tilt component that renders children with the handlers attached.
export function Tilt({ children, className, maxDeg = 8, maxShift = 10, style }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt(maxDeg, maxShift);
  return (
    <div
      ref={ref}
      className={className}
      style={{ transformStyle: "preserve-3d", willChange: "transform", transition: "transform .25s ease-out", ...style }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}

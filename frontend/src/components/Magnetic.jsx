import { useRef, useState } from "react";

// A button that is magnetically attracted to the cursor while hovered,
// and springs back when the pointer leaves. Makes CTAs feel tactile.
export default function Magnetic({ children, strength = 0.35, className = "", style, ...rest }) {
  const ref = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    setOffset({ x: x * strength, y: y * strength });
  };
  const onLeave = () => setOffset({ x: 0, y: 0 });

  return (
    <button
      ref={ref}
      className={className}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px)`,
        transition: offset.x === 0 && offset.y === 0 ? "transform .35s cubic-bezier(.2,.9,.3,1.4)" : "transform .08s linear",
        willChange: "transform",
        ...style,
      }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </button>
  );
}

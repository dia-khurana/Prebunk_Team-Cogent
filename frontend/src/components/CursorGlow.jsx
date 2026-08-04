import { motion } from "framer-motion";

// A soft radial glow that follows the (smoothed) cursor around the page,
// plus a tiny dot that tracks it almost 1:1. Gives the whole UI a sense of
// depth by making the light source follow you.
export default function CursorGlow({ pos, dot }) {
  const x = pos.x * 100;
  const y = pos.y * 100;
  return (
    <>
      <motion.div
        className="glow"
        style={{
          left: `${x}%`,
          top: `${y}%`,
        }}
        animate={{ x: "-50%", y: "-50%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      />
      {dot && (
        <motion.div
          className="cursor-dot"
          style={{ left: `${dot.x * 100}%`, top: `${dot.y * 100}%` }}
          animate={{ x: "-50%", y: "-50%" }}
          transition={{ type: "tween", duration: 0.08 }}
        />
      )}
    </>
  );
}

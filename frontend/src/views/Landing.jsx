import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Tilt, useMousePos } from "../hooks.jsx";
import Magnetic from "../components/Magnetic";
import { health } from "../api";
import { CAT_STYLE, CAT_META, titleize } from "../data";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Landing({ apiBase, setApiBase, onStart }) {
  const [roundLen, setRoundLen] = useState(10);
  const [status, setStatus] = useState({ dot: "loading", text: "Checking backend…" });
  const [error, setError] = useState(false);
  const [mouse] = useMousePos();

  useEffect(() => {
    let live = true;
    (async () => {
      try {
        const j = await health();
        if (live) {
          setStatus({ dot: "online", text: `Backend online · ${j.posts_loaded} posts` });
          setError(false);
        }
      } catch (_) {
        if (live) {
          setStatus({ dot: "offline", text: "Backend not reachable" });
          setError(true);
        }
      }
    })();
    return () => { live = false; };
  }, [apiBase]);

  const handleBase = (v) => {
    setApiBase(v);
    setStatus({ dot: "loading", text: "Checking backend…" });
  };

  return (
    <motion.div className="landing" variants={container} initial="hidden" animate="show">
      <motion.div className="hero" variants={item}>
        <div className="eyebrow">UNESCO Youth Hackathon · Team Cogent</div>
        <h1>
          Don't believe everything you read.
          <br />
          Learn to <em>spot it</em> instead.
        </h1>
        <p>
          You'll get a realistic, AI-generated social post. Guess which of the six
          manipulation techniques it's hiding — and read why. The game adapts to the
          ones you get wrong.
        </p>
      </motion.div>

      <motion.div className="rule" variants={item}>
        <span>Move your cursor around — the cards follow</span>
      </motion.div>

      <motion.div className="techniques" variants={item}>
        {Object.entries(CAT_STYLE).map(([id, st], i) => (
          <Tilt key={id} className="tcard" maxDeg={7} maxShift={8} style={{ zIndex: Math.floor(i / 2) }}>
            <div className="tcard-inner">
              <span className="tnum">{String(i + 1).padStart(2, "0")}</span>
              <span className="tglyph">{st.glyph}</span>
              <div className="ttext">
                <div className="tnm">{titleize(id)}</div>
                <div className="tds">{CAT_META[id]}</div>
                <div className="tblurb">{st.blurb}</div>
              </div>
            </div>
          </Tilt>
        ))}
      </motion.div>

      <motion.div className="rule" variants={item}>
        <span>Set up your round</span>
      </motion.div>

      <motion.div className="settings" variants={item}>
        <label className="field">
          <span className="k">Posts per round</span>
          <select value={roundLen} onChange={(e) => setRoundLen(+e.target.value)}>
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span className="k">Backend URL</span>
          <input
            value={apiBase}
            onChange={(e) => handleBase(e.target.value)}
            placeholder="http://127.0.0.1:8000"
          />
        </label>
      </motion.div>

      <motion.div variants={item}>
        <Magnetic className="btn block solid" disabled={status.dot !== "online"} onClick={() => onStart(roundLen)}>
          Start game <span aria-hidden>→</span>
        </Magnetic>
      </motion.div>

      <motion.div className={`status-row`} variants={item}>
        <span className={`dot ${status.dot}`} />
        <span>{status.text}</span>
      </motion.div>

      {error && (
        <motion.div className="error" variants={item}>
          <b>Can't reach the backend.</b> Make sure your friend's server is running
          (<code>uvicorn app.main:app --reload</code>) and the URL above points to it.
        </motion.div>
      )}

      {/* faint pointer hint that drifts with the mouse */}
      <motion.div
        className="pointer-hint"
        animate={{ x: (mouse.x - 0.5) * -14, y: (mouse.y - 0.5) * -14 }}
        transition={{ type: "spring", stiffness: 60, damping: 20 }}
        aria-hidden
      >
        ✦
      </motion.div>
    </motion.div>
  );
}

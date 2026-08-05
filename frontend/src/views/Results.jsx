import { motion } from "framer-motion";
import { fmtPct } from "../data";

export default function Results({ score, onAgain, onHome }) {
  const pct = score?.overall_accuracy ?? 0;
  const pctInt = Math.round(pct * 100);
  const isGreat = pct >= 0.8;

  return (
    <motion.div className="results" initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}>
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="result-title">
        That's a wrap{isGreat ? ", well done 🎉" : "."}
      </motion.div>
      <motion.div variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }} className="result-sub">
        {isGreat
          ? "Sharp eyes — you're spotting the tells like a pro."
          : "Keep at it — every technique you learn makes you harder to fool."}
      </motion.div>

      <motion.div
        className="score-head"
        variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 140, damping: 15 } } }}
      >
        <motion.div className="big" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {pctInt}
          <small>%</small>
        </motion.div>
        <div className="lbl">overall accuracy</div>
      </motion.div>

      <motion.div className="score-stats" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <div>
          <b>{score?.total_correct ?? 0}</b>
          <span>correct</span>
        </div>
        <div>
          <b>{score?.total_answered ?? 0}</b>
          <span>answered</span>
        </div>
      </motion.div>

      <div className="rule"><span>By technique</span></div>
      <div className="cats">
        {(score?.by_category || []).map((c, i) => {
          const acc = c.accuracy == null ? 0 : c.accuracy;
          const cls = c.accuracy != null && c.accuracy >= 0.75 ? "ok" : i % 3 === 0 ? "accent" : "";
          // FIX: was showing correct/wrong (e.g. "1/0"), which reads as "1 out of 0".
          // Now shows correct/total_attempted (e.g. "1/1"), which is what the label implies.
          const totalAttempted = c.correct + c.wrong;
          return (
            <motion.div
              key={c.category_id}
              className="row"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0, transition: { delay: 0.15 + i * 0.05 } }}
            >
              <div className="top">
                <span className="nm">{c.category_name}</span>
                <span className="acc">
                  {totalAttempted === 0
                    ? "not yet"
                    : `${c.correct}/${totalAttempted} · ${fmtPct(c.accuracy)}`}
                </span>
              </div>
              <div className={`bar ${cls}`}>
                <motion.i
                  initial={{ width: 0 }}
                  animate={{ width: `${acc * 100}%` }}
                  transition={{ duration: 0.7, delay: 0.2 + i * 0.05, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div className="result-actions" variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
        <button className="btn solid" onClick={onAgain}>Play again</button>
        <button className="btn ghost" onClick={onHome}>Home</button>
      </motion.div>
    </motion.div>
  );
}
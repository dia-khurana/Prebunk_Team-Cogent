import { motion, AnimatePresence } from "framer-motion";
import { Tilt } from "../hooks.jsx";
import { CAT_STYLE, fmtPct, userInfo, sharesFor } from "../data";

const optAnim = (i) => ({
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.35, ease: "easeOut" } },
});

export default function Play({
  post, questionNum, roundLen, liveCorrect, answered,
  onAnswer, onNext, onFinish, loading, errMsg,
}) {
  const info = post ? userInfo(post.post_id, post.language) : { name: "…", time: "now" };

  return (
    <div className="play">
      <div className="game-head">
        <motion.span
          key={questionNum}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="count"
        >
          Post <b>{questionNum}</b> of {roundLen}
        </motion.span>
        <span className="acc">
          Accuracy <b>{questionNum ? fmtPct(liveCorrect / questionNum) : "—"}</b>
        </span>
      </div>

      <Tilt className="post" maxDeg={5} maxShift={7}>
        {!post && loading && (
          <div className="loading-cnt">
            <div className="spin" />
            <span>Fetching next post</span>
          </div>
        )}
        {!post && !loading && errMsg && <div className="error">{errMsg}</div>}
        {post && (
          <>
            <div className="post-top">
              {/* FIX: was showing post.text's first letter — now shows the user's own initial */}
              <div className="mono">{(info.name || "?").trim().charAt(0).toUpperCase()}</div>
              <div className="unbox">
                <div className="un">{info.name}</div>
                <div className="h">{info.time} · Public</div>
              </div>
              <div className="more">···</div>
            </div>
            <div className="post-meta">
              <span className={`tag diff-${post.difficulty || "easy"}`}>{post.difficulty || "easy"}</span>
              <span className="tag">{post.type || "text"}</span>
              <span className="tag">{(post.language || "en").toUpperCase()}</span>
            </div>
            <div className="post-body">{post.text}</div>
            <div className="post-actions">
              <span>💬 0</span>
              <span>↻ <b>{sharesFor(post.post_id)}</b></span>
              <span>♥ 0</span>
            </div>
          </>
        )}
      </Tilt>

      <div className="question">
        Which technique is hiding <em>here?</em>
      </div>

      <motion.div className="opts" initial="hidden" animate="show">
        {(post?.category_options || []).map((opt, i) => {
          const st = CAT_STYLE[opt.id] || { glyph: "?" };
          let cls = "opt";
          if (answered) {
            if (opt.id === post._answer?.correct_category) cls += " right";
            else if (opt.id === post._pick) cls += " wrong";
            else cls += " dim";
          }
          return (
            <motion.button
              key={opt.id}
              className={cls}
              variants={optAnim(i)}
              disabled={answered}
              whileHover={answered ? {} : { y: -2, scale: 1.015 }}
              whileTap={answered ? {} : { scale: 0.97 }}
              onClick={() => onAnswer(opt.id)}
            >
              <span className="glyph">{st.glyph}</span>
              <span className="name">{opt.name}</span>
              {answered && opt.id === post._answer?.correct_category && <span className="tick">✓</span>}
              {answered && opt.id === post._pick && opt.id !== post._answer?.correct_category && (
                <span className="cross">✕</span>
              )}
            </motion.button>
          );
        })}
      </motion.div>

      <AnimatePresence>
        {answered && post?._answer && (
          <motion.div
            className="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="head">
              <div className={`stamp ${post._answer.correct ? "ok" : "bad"}`}>
                {post._answer.correct ? "Spotted ✓" : "Missed it"}
                <em> — {post._answer.correct_category_name}</em>
              </div>
            </div>
            <div className="expl">{post._answer.explanation}</div>

            {/* NEW: practical action tip, shown right below the explanation */}
            {post._answer.action_tip && (
              <div className="tip">
                <strong>Try this:</strong> {post._answer.action_tip}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!answered && (
        <div className="end-row">
          <button className="btn ghost small" onClick={onFinish}>End round &amp; see results</button>
        </div>
      )}

      {answered && (
        <div className="next-wrap">
          {questionNum >= roundLen ? (
            <motion.button
              className="btn block solid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onFinish}
            >
              See results →
            </motion.button>
          ) : (
            <motion.button
              className="btn block solid"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={onNext}
            >
              Next post →
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
}
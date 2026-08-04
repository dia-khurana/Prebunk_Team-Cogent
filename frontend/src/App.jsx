import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Landing from "./views/Landing";
import Play from "./views/Play";
import Results from "./views/Results";
import CursorGlow from "./components/CursorGlow";
import { apiBase, setApiBase, createSession, getPost, submitAnswer, getScore } from "./api";
import { useMousePos } from "./hooks.jsx";
import { titleize } from "./data";

const viewVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export default function App() {
  const [view, setView] = useState("landing");
  const [apiURL, setApiURL] = useState(apiBase());
  const [roundLen, setRoundLen] = useState(10);

  const [sessionId, setSessionId] = useState(null);
  const [post, setPost] = useState(null);
  const [questionNum, setQuestionNum] = useState(0);
  const [liveCorrect, setLiveCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(null);

  const [glow, onGlowMove] = useMousePos();
  const [dot, onDotMove] = useMousePos();

  useEffect(() => {
    window.addEventListener("mousemove", onGlowMove);
    window.addEventListener("mousemove", onDotMove);
    return () => {
      window.removeEventListener("mousemove", onGlowMove);
      window.removeEventListener("mousemove", onDotMove);
    };
  }, [onGlowMove, onDotMove]);

  const progress = roundLen ? Math.min(100, (questionNum / roundLen) * 100) : 0;

  const handleStart = async (len) => {
    setRoundLen(len);
    setView("play");
    setQuestionNum(0);
    setLiveCorrect(0);
    setScore(null);
    await loadNext(null, len);
  };

  const loadNext = async (session = sessionId, len = roundLen) => {
    setLoading(true);
    setAnswered(false);
    setPost(null);
    try {
      let sid = session;
      if (!sid) {
        const s = await createSession();
        sid = s.session_id;
        setSessionId(sid);
      }
      const p = await getPost(sid);
      setPost(p);
      setQuestionNum((q) => (len && q + 1 > len ? q : q + 1));
      setLoading(false);
    } catch (e) {
      setLoading(false);
      setPost(null);
      setPost({ __err: e.message });
    }
  };

  const handleAnswer = async (catId) => {
    if (answered || !post?.post_id) return;
    setAnswered(true);
    const pick = catId;
    setPost((prev) => ({ ...prev, _pick: pick }));
    try {
      const res = await submitAnswer({
        session_id: sessionId,
        post_id: post.post_id,
        selected_category: catId,
      });
      if (res.correct) setLiveCorrect((c) => c + 1);
      const correctName =
        (post.category_options || []).find((o) => o.id === res.correct_category)?.name ||
        res.correct_category;
      setPost((prev) => ({
        ...prev,
        _answer: { ...res, correct_category_name: correctName },
      }));
    } catch (e) {
      setPost((prev) => ({
        ...prev,
        _answer: {
          correct: false,
          correct_category: "",
          correct_category_name: "…",
          explanation: "Couldn't submit your answer: " + e.message,
        },
      }));
    }
  };

  const handleFinish = async () => {
    try {
      setScore(await getScore(sessionId));
      setView("results");
    } catch (e) {
      setPost((prev) => ({ ...prev, __err: "Couldn't load your score: " + e.message }));
    }
  };

  const handleAgain = async () => {
    setSessionId(null);
    setQuestionNum(0);
    setLiveCorrect(0);
    setScore(null);
    await loadNext(null, roundLen);
  };

  const handleHome = () => {
    setSessionId(null);
    setView("landing");
  };

  const baseChange = (url) => {
    setApiURL(url);
    setApiBase(url);
  };

  return (
    <div className="app">
      <CursorGlow pos={glow} dot={dot} />
      <div className="topbar-line" style={{ width: `${progress}%` }} />
      <div className="wrap">
        <header className="masthead">
          <div className="wordmark">
            prebunk<span className="dot">.</span>
            <small>The manipulation game</small>
          </div>
          {view !== "landing" && (
            <motion.div className="session-chip" layout>
              {questionNum}/{roundLen}
            </motion.div>
          )}
        </header>

        <AnimatePresence mode="wait">
          {view === "landing" && (
            <motion.main key="landing" variants={viewVariants} initial="initial" animate="animate" exit="exit">
              <Landing apiBase={apiURL} setApiBase={baseChange} onStart={handleStart} />
            </motion.main>
          )}
          {view === "play" && (
            <motion.main key="play" variants={viewVariants} initial="initial" animate="animate" exit="exit">
              <Play
                post={post}
                questionNum={questionNum}
                roundLen={roundLen}
                liveCorrect={liveCorrect}
                answered={answered}
                loading={loading}
                errMsg={post?.__err}
                onAnswer={handleAnswer}
                onNext={() => loadNext()}
                onFinish={handleFinish}
              />
            </motion.main>
          )}
          {view === "results" && (
            <motion.main key="results" variants={viewVariants} initial="initial" animate="animate" exit="exit">
              <Results score={score} onAgain={handleAgain} onHome={handleHome} />
            </motion.main>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

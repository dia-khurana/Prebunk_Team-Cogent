// Static display info for the six techniques, plus little helpers.

export const CAT_STYLE = {
  false_urgency:    { glyph: "⏰", blurb: "Act now!" },
  fake_authority:   { glyph: "◈", blurb: "Trust me, I'm an expert" },
  emotional_bait:   { glyph: "✲", blurb: "This will make you feel" },
  fake_consensus:   { glyph: "✦", blurb: "Everyone already knows" },
  misleading_stats: { glyph: "∿", blurb: "Numbers without context" },
  ai_content_cues:  { glyph: "✕", blurb: "Something looks off" },
};

export const CAT_META = {
  false_urgency:    "Pressure to act or share instantly, before you can think.",
  fake_authority:   "Borrowed credibility — vague experts, fake titles, unnamed insiders.",
  emotional_bait:   "Content engineered to trigger a strong reaction first.",
  fake_consensus:   "“Everyone already believes this” — pressure to conform.",
  misleading_stats: "Real-sounding numbers without context, baseline, or source.",
  ai_content_cues:  "Tells that an image, voice, or video may be AI-made.",
};

export function titleize(id) {
  return id.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}

export function fmtPct(x) {
  return x == null ? "—" : Math.round(x * 100) + "%";
}

export function userInfo(postId, lang) {
  const names = lang && lang.startsWith("hi")
    ? ["Rakesh", "Sunita", "Mohit", "Pooja", "Amit", "Kiran", "Neha", "Rajesh", "Divya", "Alok"]
    : ["Nisha", "Priya", "Rohan", "Arjun", "Sneha", "Kavya", "Vikram", "Anjali", "Sanjay", "Meera"];
  let h = 0;
  for (const c of postId || "") h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const times = ["now", "2m", "18m", "1h", "3h", "7h"];
  return { name: names[h % names.length], time: times[h % times.length] };
}

export function sharesFor(postId) {
  return (String(postId).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 900) + 12;
}

import express from "express";

const router = express.Router();

/**
 * POST /api/translate
 * Body: { texts: string[], target: "hi" | "gu" }
 * Returns: { translations: string[] }
 *
 * Uses Google Translate's free endpoint (no API key needed).
 * Batches up to 20 texts per request. Caches results in-memory.
 */
const cache = new Map();

async function translateSingle(text, target) {
  if (!text || !text.trim()) return text;
  const key = `${target}::${text}`;
  if (cache.has(key)) return cache.get(key);

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
    const resp = await fetch(url);
    const json = await resp.json();
    // Response format: [[["translated","original",...],...],...] — concatenate all segments
    const translated = json[0].map((seg) => seg[0]).join("");
    cache.set(key, translated);
    return translated;
  } catch {
    return text; // fallback to original on error
  }
}

router.post("/", async (req, res) => {
  try {
    const { texts, target } = req.body;
    if (!target || !Array.isArray(texts)) {
      return res.status(400).json({ message: "texts (array) and target (lang code) required" });
    }
    if (target === "en") {
      return res.json({ translations: texts }); // already English
    }

    const translations = await Promise.all(
      texts.slice(0, 50).map((t) => translateSingle(t, target))
    );
    res.json({ translations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from "express";

const router = express.Router();
const cache = new Map();

async function translateChunk(text, target) {
  if (!text || !text.trim()) return text;
  const key = `${target}::${text}`;
  if (cache.has(key)) return cache.get(key);

  // Try Google Translate dict-chrome-ex
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
    const resp = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    if (resp.ok) {
      const json = await resp.json();
      if (json && Array.isArray(json[0])) {
        const translated = json[0].map((seg) => seg[0]).filter(Boolean).join("");
        if (translated) {
          cache.set(key, translated);
          return translated;
        }
      }
    }
  } catch {
    // fallback below
  }

  // Fallback to MyMemory
  try {
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=en|${target}`;
    const mmResp = await fetch(mmUrl);
    if (mmResp.ok) {
      const mmJson = await mmResp.json();
      if (mmJson?.responseData?.translatedText) {
        const translated = mmJson.responseData.translatedText;
        cache.set(key, translated);
        return translated;
      }
    }
  } catch {
    // fallback
  }

  return text;
}

async function translateSingle(text, target) {
  if (!text || !text.trim()) return text;
  if (target === "en") return text;

  // If text is long (> 1000 characters), split into chunks to avoid URL limits
  if (text.length > 1000) {
    const delimiter = text.includes("</p>")
      ? /(?<=<\/p>|<\/div>|<\/h[1-6]>|<br\s*\/?>)/gi
      : /(?<=\. |\n\n)/g;
    const parts = text.split(delimiter);
    if (parts.length > 1) {
      const translatedParts = await Promise.all(
        parts.map((p) => translateChunk(p, target))
      );
      return translatedParts.join("");
    }
  }

  return translateChunk(text, target);
}

router.post("/", async (req, res) => {
  try {
    const { texts, target } = req.body;
    if (!target || !Array.isArray(texts)) {
      return res.status(400).json({ message: "texts (array) and target (lang code) required" });
    }
    if (target === "en") {
      return res.json({ translations: texts });
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

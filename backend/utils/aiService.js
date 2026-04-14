const { GoogleGenAI } = require("@google/genai");
const OpenAI = require("openai");
const Groq = require("groq-sdk");

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function isTransientError(error) {
  if (!error) return false;
  const strAttr = [error.message, error.name, error.code, String(error.status), String(error.statusCode)]
    .join(" ")
    .toLowerCase();
    
  if (
    strAttr.includes("503") ||
    strAttr.includes("429") ||
    strAttr.includes("timeout") ||
    strAttr.includes("rate limit") ||
    strAttr.includes("econn") ||
    strAttr.includes("fetch failed") ||
    strAttr.includes("aborterror") ||
    strAttr.includes("overloaded")
  ) {
    return true;
  }
  return false;
}

async function generateWithGemini(modelName, prompt, options = {}) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    console.log(`Trying: ${modelName}`);
    const result = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      generationConfig: {
        temperature: options.temperature !== undefined ? options.temperature : 0.7,
      }
    });
    clearTimeout(timeoutId);

    // FIX 1: Safe text extraction - handles both property and method forms
    let text;
    if (typeof result.text === "function") {
      text = result.text();
    } else if (typeof result.text === "string") {
      text = result.text;
    } else {
      // Universal fallback accessor
      text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    }
    
    console.log(`Success from: ${modelName}`);
    return text;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') throw new Error("TIMEOUT");
    throw err;
  }
}

async function generateWithOpenAI(modelName, prompt, options = {}) {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }
  const openai = new OpenAI({ apiKey, timeout: 15000 });
  
  try {
    console.log(`Trying: ${modelName}`);
    const completion = await openai.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
    });
    const text = completion.choices[0].message.content;
    console.log(`Success from: ${modelName}`);
    return text;
  } catch (err) {
    console.log(`[OpenAI ERROR - ${modelName}]:`, err.response?.data || err.message);
    throw err;
  }
}

async function generateWithGroq(modelName, prompt, options = {}) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY_MISSING");
  }
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 15000 });
  try {
    console.log(`Trying: ${modelName} (Groq)`);
    const completion = await groq.chat.completions.create({
      model: modelName,
      messages: [{ role: "user", content: prompt }],
      temperature: options.temperature !== undefined ? options.temperature : 0.7,
    });
    const text = completion.choices[0].message.content;
    console.log(`Success from: ${modelName} (Groq)`);
    return text;
  } catch (err) {
    console.log(`[Groq ERROR - ${modelName}]:`, err.message);
    throw err;
  }
}

async function retryWithDelay(provider, modelName, prompt, options = {}, retries = 2) {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`Retrying ${modelName}... (Attempt ${attempt} of ${retries + 1})`);
      }
      
      if (provider === "gemini") {
        return await generateWithGemini(modelName, prompt, options);
      } else if (provider === "openai") {
        return await generateWithOpenAI(modelName, prompt, options);
      } else if (provider === "groq") {
        return await generateWithGroq(modelName, prompt, options);
      }
    } catch (error) {
      if (error.message === "GEMINI_API_KEY_MISSING" || error.message === "OPENAI_API_KEY_MISSING" || error.message === "GROQ_API_KEY_MISSING") {
        throw error;
      }

      // Log exact error for debugging
      const errMsg = error.response?.data ? JSON.stringify(error.response.data) : (error.message || String(error));
      console.log(`[AI ERROR - ${modelName}]: ${errMsg}`);

      // If daily quota is fully exhausted (limit: 0), don't retry — move on immediately
      if (errMsg.includes("limit: 0")) {
        console.log(`[AI] Daily quota exhausted on ${modelName}, skipping retries...`);
        throw new Error(`NON_TRANSIENT_ERROR: ${errMsg}`);
      }
      
      if (!isTransientError(error)) {
        console.log(`[AI] Non-retryable error on ${modelName}, escalating...`);
        throw new Error(`NON_TRANSIENT_ERROR: ${errMsg}`);
      }

      if (attempt <= retries) {
        await delay(2000); // Strict 2 second delay
      } else {
        throw error; // Max retries reached
      }
    }
  }
}

async function generateAIResponse(prompt, options = {}) {
  // Models verified available — Groq is free with generous limits
  const models = [
    { provider: "gemini", name: "gemini-2.0-flash" },
    { provider: "gemini", name: "gemini-2.0-flash-lite" },
    { provider: "groq",   name: "llama-3.1-8b-instant" },
    { provider: "groq",   name: "mixtral-8x7b-32768" },
    { provider: "openai", name: "gpt-4o-mini" },
    { provider: "openai", name: "gpt-3.5-turbo" }
  ];

  for (let i = 0; i < models.length; i++) {
    const { provider, name } = models[i];
    try {
      const text = await retryWithDelay(provider, name, prompt, options);
      // FIX 2: null-safe check — empty string is still a valid response
      if (text !== undefined && text !== null) {
        return { success: true, text, modelUsed: name, providerUsed: provider };
      }
      console.log(`[WARN] ${name} returned empty text, trying next model...`);
    } catch (error) {
      const errMsg = error.response?.data ? JSON.stringify(error.response.data) : (error.message || String(error));
      console.log(`[AI ERROR - ${name}]: ${errMsg}`);

      // FIX 6: Smart provider skip — if Gemini key is missing, jump past all Gemini models
      if (error.message === "GEMINI_API_KEY_MISSING") {
        console.log(`Gemini API key missing. Skipping all Gemini models...`);
        while (i < models.length - 1 && models[i + 1].provider === "gemini") { i++; }
      } else if (error.message === "GROQ_API_KEY_MISSING") {
        console.log(`Groq API key missing. Skipping all Groq models...`);
        while (i < models.length - 1 && models[i + 1].provider === "groq") { i++; }
      } else if (error.message === "OPENAI_API_KEY_MISSING") {
        console.log(`OpenAI API key missing. Skipping all OpenAI models...`);
        while (i < models.length - 1 && models[i + 1].provider === "openai") { i++; }
      } else if (error.message.includes("NON_TRANSIENT_ERROR") && provider === "gemini") {
        console.log(`Non-transient Gemini error. Switching to Groq...`);
        while (i < models.length - 1 && models[i + 1].provider === "gemini") { i++; }
      }

      if (i < models.length - 1) {
        const nextTarget = models[i + 1];
        if (provider !== nextTarget.provider) {
          console.log(`Switching provider to ${nextTarget.provider.toUpperCase()}...`);
        } else {
          console.log(`Switching model to ${nextTarget.name}...`);
        }
      }
    }
  }

  // LAYER 4: FINAL FALLBACK (GUARANTEE OUTPUT)
  console.log("Using rule-based fallback");
  return {
    success: false,
    isFallback: true,
    data: {
      atsScore: 60,
      jobFitScore: 60,
      message: "Basic analysis (AI temporarily unavailable)",
      matchedSkills: [],
      missingSkills: [],
      strengths: [],
      weaknesses: [],
      recommendedCompany: null,
      dsaRecommendation: { focus: "medium", difficulty: "medium", company: null },
      suggestions: [
        "Practice DSA problems",
        "Improve core subjects",
        "Work on backend projects"
      ]
    }
  };
}

module.exports = { generateAIResponse };

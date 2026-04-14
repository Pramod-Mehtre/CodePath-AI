require('dotenv').config();
const { GoogleGenAI } = require("@google/genai");

async function test() {
  console.log("Testing Gemini API...");
  if (!process.env.GEMINI_API_KEY) {
    return console.error("❌ No GEMINI_API_KEY found in .env");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  
  try {
    console.log("Sending request to gemini-2.0-flash...");
    const res = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: "Hello, please reply with valid JSON containing a status field as 'ok'."
    });
    console.log("✅ Success! Response:");
    console.log(res.text);
  } catch (err) {
    console.error("❌ Gemini Error Details:");
    console.error(err.response?.data || err.message || err);
  }
}

test();

require('dotenv').config();
const Groq = require("groq-sdk");

async function test() {
  console.log("Testing Groq API...");
  if (!process.env.GROQ_API_KEY) {
    return console.error("❌ No GROQ_API_KEY found in .env");
  }

  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  try {
    console.log("Sending request to llama-3.1-8b-instant...");
    const res = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: "Reply with valid JSON: { \"status\": \"ok\" }" }],
    });
    console.log("✅ Success! Response:");
    console.log(res.choices[0].message.content);
  } catch (err) {
    console.error("❌ Groq Error:", err.message);
  }
}

test();

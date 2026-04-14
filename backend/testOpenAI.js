require('dotenv').config();
const OpenAI = require("openai");

async function test() {
  console.log("Testing OpenAI API...");
  // Handle typo in env where user might have used OPEN_API_KEY
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPEN_API_KEY;
  if (!apiKey) {
    return console.error("❌ No OPENAI_API_KEY found in .env");
  }
  
  const openai = new OpenAI({ apiKey: apiKey });
  
  try {
    console.log("Sending request to gpt-4o-mini...");
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: "Hello, please reply with valid JSON containing a status field as 'ok'." }],
    });
    console.log("✅ Success! Response:");
    console.log(res.choices[0].message.content);
  } catch (err) {
    console.error("❌ OpenAI Error Details:");
    console.error(err.response?.data || err.message || err);
  }
}

test();

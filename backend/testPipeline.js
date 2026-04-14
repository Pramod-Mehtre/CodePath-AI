require('dotenv').config();
const { generateAIResponse } = require('./utils/aiService');

async function test() {
  console.log("=== Testing full AI failover pipeline ===\n");
  
  const prompt = `
    Extract the following from this job description and respond STRICTLY with valid JSON:
    - required_skills (array of strings)
    - technologies (array of strings)
    - difficulty_level (easy/medium/hard)
    
    Job Description:
    We are looking for a backend developer with Node.js, MongoDB, REST APIs, and strong DSA skills.
    Experience with React is a plus. Medium difficulty problems expected.
  `;

  const result = await generateAIResponse(prompt);
  
  console.log("\n=== Result ===");
  console.log("isFallback:", result.isFallback || false);
  console.log("modelUsed:", result.modelUsed || "rule-based");
  console.log("providerUsed:", result.providerUsed || "none");
  console.log("\nResponse text:");
  console.log(result.text || JSON.stringify(result.data));
}

test().catch(console.error);

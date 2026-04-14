const pdfParse = require("pdf-parse");
const User = require("../models/user.model");
const Problem = require("../models/problem.model");
const CompanyProblem = require("../models/companyProblem.model");
const Skill = require("../models/skill.model");
const PendingSkill = require("../models/pendingSkill.model");
const AppError = require("../utils/AppError");
const { generateAIResponse } = require("../utils/aiService");

// ────────────────────────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────────────────────────
function normalizeText(text) {
  if (!text) return "";
  return text.toLowerCase()
    .replace(/[^a-z0-9+#\.]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * FORMAT SKILL DISPLAY - Capitalize and fix common tech names
 */
function formatSkillName(name) {
  if (!name) return "";
  const displayMap = {
    "cpp": "C++",
    "c++": "C++",
    "dsa": "DSA",
    "os": "OS",
    "dbms": "DBMS",
    "sql": "SQL",
    "js": "JavaScript",
    "javascript": "JavaScript",
    "mongodb": "MongoDB",
    "mongo": "MongoDB",
    "aws": "AWS",
    "api": "API",
    "rest": "REST",
    "css": "CSS",
    "html": "HTML",
    "hld": "HLD",
    "lld": "LLD",
    "os": "OS",
    "cn": "CN"
  };
  
  const lower = name.toLowerCase().trim();
  if (displayMap[lower]) return displayMap[lower];
  
  // Title Case for others
  return name.split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}


/**
 * DETERMINISTIC SKILL EXTRACTION - DATABASE DRIVEN
 */
async function extractSkillsFromDB(text) {
  const normalized = normalizeText(text);
  const foundSkills = new Set();
  
  // Fetch all skills from DB (Scalable hybrid approach)
  const allSkills = await Skill.find({});

  for (const skill of allSkills) {
    const synonyms = [skill.name, ...skill.aliases];
    for (const syn of synonyms) {
      const escaped = syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[\\s,;|/])(${escaped})(?:$|[\\s,;|/])`, 'gi');
      
      if (regex.test(normalized)) {
        foundSkills.add(skill.name);
        break; 
      }
    }
  }
  return Array.from(foundSkills);
}

/**
 * LOG UNKNOWN SKILLS - Detect potential technical keywords not in our DB
 */
async function logUnknownSkills(jdText, knownSkills) {
  try {
    const words = jdText.match(/[A-Z][a-zA-Z+#\.]+/g) || [];
    const uniquePotential = new Set(words.map(w => w.toLowerCase()));
    
    // Remove common non-skill words and already known skills
    const stopWords = new Set(["the", "and", "this", "that", "with", "from", "company", "hiring", "role", "team", "candidates", "work"]);
    const knownLower = new Set(knownSkills.map(s => s.toLowerCase()));
    
    for (const word of uniquePotential) {
      if (word.length < 2 || stopWords.has(word) || knownLower.has(word)) continue;
      
      // If not in Skill DB (checking both name and aliases)
      const exists = await Skill.findOne({
        $or: [{ name: { $regex: new RegExp(`^${word}$`, 'i') } }, { aliases: word }]
      });
      
      if (!exists) {
        await PendingSkill.findOneAndUpdate(
          { name: word },
          { $inc: { count: 1 } },
          { upsert: true, returnDocument: 'after' }
        );
      }
    }
  } catch (err) {
    console.error("Unknown skill logging failed:", err.message);
  }
}

// ────────────────────────────────────────────────────────────
// MAIN CONTROLLER
// ────────────────────────────────────────────────────────────
exports.analyzeJD = async (req, res, next) => {
  try {
    const { jobDescription } = req.body;
    const resumeFile = req.file;

    if (!jobDescription || !resumeFile) {
      return next(new AppError("Job description and Resume are required", 400));
    }

    // ── 1. Parse Resume Text ──
    const pdfData = await pdfParse(resumeFile.buffer);
    const resumeText = pdfData.text;

    // ── 2. Hybrid Deterministic Skill Extraction (NO AI for matching) ──
    const jdSkills = await extractSkillsFromDB(jobDescription);
    const resumeSkills = await extractSkillsFromDB(resumeText);

    // ── 3. Log Unknown Skills from JD for future expansion ──
    await logUnknownSkills(jobDescription, jdSkills);

    // ── 4. Deterministic MATCHING LOGIC & Formatting ──
    const matchedSkillsRaw = jdSkills.filter(s => resumeSkills.includes(s));
    const missingSkillsRaw = jdSkills.filter(s => !resumeSkills.includes(s));

    // Deduplicate and format for professional display
    const matchedSkills = Array.from(new Set(matchedSkillsRaw.map(s => formatSkillName(s)))).sort();
    const missingSkills = Array.from(new Set(missingSkillsRaw.map(s => formatSkillName(s)))).sort();


    // ── 5. Deterministic WEAKNESS DETECTION (Structural) ──
    const weaknesses = [];
    const hasInternship = /intern|trainee|apprenticeship/i.test(resumeText);
    const hasSystemDesign = /system design|architecture|scalability|distributed/i.test(resumeText);
    const hasComplexity = /optimized|performance|improved|latenc|users|throughput|deployment/i.test(resumeText);
    
    if (!hasInternship) weaknesses.push("No internship or real-world industrial experience");
    if (!hasSystemDesign) weaknesses.push("No proven system design or architectural knowledge");
    if (!hasComplexity) weaknesses.push("Projects lack measurable impact or technical complexity");

    // ── 6. Deterministic SCORING (Fixed Formula) ──
    const totalJd = jdSkills.length || 1;
    let atsBase = (matchedSkills.length / totalJd) * 100;
    const atsScore = Math.max(0, Math.min(100, Math.round(atsBase - (missingSkills.length * 5))));
    
    let jobFit = Math.round(atsBase + 10);
    if (!hasInternship) jobFit -= 10;
    if (!hasSystemDesign) jobFit -= 8;
    if (!hasComplexity) jobFit -= 5;
    const finalJobFit = Math.max(0, Math.min(100, jobFit));

    // ── 7. Dynamic Company Lookup ──
    let recommendedCompany = null;
    const allCompanies = await CompanyProblem.distinct("company");
    for (const c of allCompanies) {
      if (jobDescription.toLowerCase().includes(c.toLowerCase())) {
        recommendedCompany = c;
        break;
      }
    }
    if (!recommendedCompany) recommendedCompany = jdSkills.includes("DSA") ? "Amazon" : "TCS";

    // ── 8. Logic-Driven Suggestions ──
    const suggestions = [];
    if (missingSkills.length > 0) {
      suggestions.push(`Priority: Learn ${missingSkills.slice(0, 2).join(", ")}`);
    }
    if (!hasSystemDesign) suggestions.push("Learn System Design basics (HLD/LLD)");
    if (!hasComplexity) suggestions.push("Add measurable metrics to your projects");
    if (!hasInternship) suggestions.push("Apply for startups to gain real-world exposure");

    // ── 9. AI USAGE (LIMITED - EXPLANATION ONLY) ──
    const explainPrompt = `You are an assistant. You will ONLY explain given analysis.
    ATS Score: ${atsScore}% | Job Fit: ${finalJobFit}%
    Matched: ${matchedSkills.join(", ")}
    Weaknesses: ${weaknesses.join(", ")}
    Suggestions: ${suggestions.join(", ")}

    RETURN VALID JSON ONLY:
    {
        "strengths": ["Identify 2-3 genuine strengths from context"],
        "weaknesses": ["Format pre-calculated weaknesses correctly"],
        "suggestions": ["Format pre-calculated suggestions step-wise"]
    }`;

    let strengths = ["Strong foundational skills", "Good technical match"];
    const aiRes = await generateAIResponse(explainPrompt, { temperature: 0 });
    
    if (aiRes.success) {
      try {
        const clean = aiRes.text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
        const firstBrace = clean.indexOf("{");
        const lastBrace = clean.lastIndexOf("}");
        const parsed = JSON.parse(clean.substring(firstBrace, lastBrace + 1));
        strengths = parsed.strengths || strengths;
      } catch(e) {}
    }

    res.json({
        success: true,
        data: {
            atsScore,
            jobFitScore: finalJobFit,
            matchedSkills,
            missingSkills,
            strengths: strengths.slice(0, 3),
            weaknesses: weaknesses.slice(0, 4),
            suggestions: suggestions.slice(0, 4),
            recommendedCompany
        }
    });

  } catch (err) {
    next(err);
  }
};

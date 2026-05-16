const AppError = require("../utils/AppError");
const Activity = require("../models/activity.model");
const { generateAIResponse } = require("../utils/aiService");

exports.improveResume = async (req, res, next) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText) {
      return next(new AppError("Resume text is required", 400));
    }

    const prompt = `You are an expert ATS optimizer and technical recruiter.
Review the provided resume text and suggest specific improvements for a ${targetRole || 'Software Engineer'} role.

Resume Text:
${resumeText.substring(0, 3000)} // Limiting length for prompt safety

Provide actionable feedback to improve the resume. Focus on:
1. Weak bullet points that need more impact (STAR method).
2. Missing ATS keywords commonly expected for this role.
3. Overall structural or content enhancements.

Format your response strictly as a JSON object:
{
  "improvements": [
    {
      "category": "Bullet Point Rewrite",
      "original": "...",
      "suggestion": "...",
      "reason": "..."
    }
  ],
  "missingKeywords": ["keyword1", "keyword2"],
  "overallFeedback": "..."
}`;

    const aiResult = await generateAIResponse(prompt, { temperature: 0.7 });

    if (!aiResult.success) {
      return next(new AppError("Failed to generate resume feedback. Please try again later.", 500));
    }

    let parsedData;
    try {
      const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
      const cleanedText = jsonMatch ? jsonMatch[0] : aiResult.text;
      parsedData = JSON.parse(cleanedText);
    } catch (e) {
      console.log("JSON Parse Error for Resume Engine:", aiResult.text);
      return next(new AppError("Invalid response format from AI.", 500));
    }

    // Log activity
    await Activity.create({ type: "resume_analysis", userId: req.user?.id });

    res.status(200).json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error("Resume Engine Error:", error);
    next(new AppError("Failed to generate resume improvements", 500));
  }
};

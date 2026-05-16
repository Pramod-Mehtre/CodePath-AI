const AppError = require("../utils/AppError");
const Activity = require("../models/activity.model");
const { generateAIResponse } = require("../utils/aiService");

exports.generateRoadmap = async (req, res, next) => {
  try {
    const { skills, missingSkills, targetCompany, jobRole } = req.body;

    const prompt = `You are an expert career coach and tech placement advisor.
Create a personalized 4-week preparation roadmap for a candidate aiming for a ${jobRole || 'Software Engineer'} role at ${targetCompany || 'a top tech company'}.

Candidate's Current Skills: ${skills ? skills.join(", ") : "Basic CS knowledge"}
Missing Skills to Focus on: ${missingSkills ? missingSkills.join(", ") : "DSA, System Design, Core CS"}

Provide the roadmap in a clear, week-by-week format. For each week, include:
- Week number and focus area
- Specific topics to study
- Practical tasks or DSA topics to practice

Keep the output concise, structured, and strictly formatted as a valid JSON object matching this structure:
{
  "roadmap": [
    {
      "week": "Week 1",
      "focus": "String",
      "topics": ["topic1", "topic2"]
    }
  ]
}`;

    const aiResult = await generateAIResponse(prompt, { temperature: 0.7 });

    if (!aiResult.success) {
      return next(new AppError("Failed to generate roadmap. Please try again later.", 500));
    }

    let parsedData;
    try {
      const jsonMatch = aiResult.text.match(/\{[\s\S]*\}/);
      const cleanedText = jsonMatch ? jsonMatch[0] : aiResult.text;
      parsedData = JSON.parse(cleanedText);
    } catch (e) {
      console.log("JSON Parse Error for Roadmap Generator:", aiResult.text);
      return next(new AppError("Invalid response format from AI.", 500));
    }

    // Log activity
    await Activity.create({ type: "roadmap", userId: req.user?.id });

    res.status(200).json({
      success: true,
      roadmap: parsedData.roadmap || []
    });

  } catch (error) {
    console.error("Roadmap Generator Error:", error);
    next(new AppError("Failed to generate roadmap", 500));
  }
};

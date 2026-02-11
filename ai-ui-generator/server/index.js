const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/generate", async (req, res) => {
  const { prompt, existingCode } = req.body;

  try {
    // 🧠 1️⃣ PLANNER STEP
    const planResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You are a UI planner.

Allowed components:
- Card
- Input
- Button

Return ONLY valid JSON:
{
  "layout": "...",
  "components": ["Card", "Input", "Button"],
  "description": "..."
}
Do not use markdown.
`,
        },
        {
          role: "user",
          content: `
User request: ${prompt}
Existing UI:
${existingCode || "None"}
`,
        },
      ],
    });

    const planText = planResponse.choices[0].message.content;

    const cleanedPlan = planText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const plan = JSON.parse(cleanedPlan);

    // ⚙️ 2️⃣ GENERATOR STEP (Smart Modify)
    const uiResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
You generate React JSX using ONLY:
Card, Input, Button.

If existing UI is provided:
Modify it without rewriting everything.

Return ONLY JSX.
Do not use markdown.
Do not return function wrapper.
`,
        },
        {
          role: "user",
          content: `
Existing UI:
${existingCode || "None"}

Plan:
${JSON.stringify(plan, null, 2)}
`,
        },
      ],
    });

    const generatedCode = uiResponse.choices[0].message.content;

    // 🗣 3️⃣ EXPLAINER STEP
    const explanationResponse = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `
Explain what changed compared to previous UI.
If no previous UI, explain initial generation.
`,
        },
        {
          role: "user",
          content: `
User request: ${prompt}
Previous UI: ${existingCode || "None"}
New UI: ${generatedCode}
`,
        },
      ],
    });

    const explanation = explanationResponse.choices[0].message.content;

    res.json({
      plan,
      code: generatedCode,
      explanation,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generating UI" });
  }
});


app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

import { useState } from "react";
import JSXParser from "react-jsx-parser";

import Button from "./components/Button";
import Input from "./components/Input";
import Card from "./components/Card";

function App() {
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [plan, setPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔒 Component validation (Whitelist enforcement)
  const validateComponents = (code) => {
    const allowed = ["Card", "Input", "Button"];
    const componentRegex = /<([A-Z][A-Za-z0-9]*)/g;
    let match;

    while ((match = componentRegex.exec(code)) !== null) {
      const componentName = match[1];
      if (!allowed.includes(componentName)) {
        return false;
      }
    }

    return true;
  };

  const generateUI = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("https://ai-ui-generator-936u.onrender.com/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  prompt,
  existingCode: generatedCode,
}),

      });

    
      const data = await response.json();

      let cleanCode = data.code || "";

      // Remove markdown if AI returns it
      cleanCode = cleanCode
        .replace(/```jsx/g, "")
        .replace(/```/g, "")
        .trim();

      // 🔒 Validate components before rendering
      if (!validateComponents(cleanCode)) {
        setGeneratedCode("");
        setExplanation(
          "⚠ Invalid component detected. Only Card, Input, and Button are allowed."
        );
        setLoading(false);
        return;
      }

      // Save previous version
      if (generatedCode) {
        setHistory((prev) => [
          ...prev,
          {
            code: generatedCode,
            explanation,
            plan,
          },
        ]);
      }

      setPlan(data.plan);
      setGeneratedCode(cleanCode);
      setExplanation(data.explanation || "");

    } catch (error) {
      console.error("Error:", error);
      setExplanation("⚠ Error generating UI");
    }

    setLoading(false);
  };

  const undoLast = () => {
    if (history.length === 0) return;

    const last = history[history.length - 1];

    setGeneratedCode(last.code);
    setExplanation(last.explanation);
    setPlan(last.plan);

    setHistory(history.slice(0, history.length - 1));
  };

  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* LEFT PANEL */}
      <div className="w-1/2 p-6 border-r bg-white flex flex-col overflow-auto">
        <h2 className="text-2xl font-bold mb-4">AI Chat</h2>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe your UI here..."
          className="w-full h-32 p-3 border rounded-lg mb-4"
        />

        <Button
          label={loading ? "Generating..." : "Generate UI"}
          onClick={generateUI}
        />

        <div className="mt-3">
          <Button label="Undo Last Version" onClick={undoLast} />
        </div>

        {/* Planner Output */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Planner Output</h3>
          <pre className="bg-gray-300 p-4 rounded-lg text-sm overflow-auto max-h-40">
            {plan ? JSON.stringify(plan, null, 2) : "Plan will appear here"}
          </pre>
        </div>

        {/* Generated Code */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Generated Code</h3>
          <pre className="bg-black text-green-400 p-4 rounded-lg text-sm overflow-auto max-h-60">
            {generatedCode}
          </pre>
        </div>

        {/* Explanation */}
        <div className="mt-6">
          <h3 className="font-semibold mb-2">AI Explanation</h3>
          <div className="bg-gray-200 p-4 rounded-lg text-sm">
            {explanation || "Explanation will appear here"}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-1/2 p-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Live Preview
          </h2>

          <div className="bg-white p-6 rounded-2xl shadow-md">
            {generatedCode ? (
              <JSXParser
                jsx={generatedCode}
                components={{
                  Button,
                  Input,
                  Card,
                }}
              />
            ) : (
              <p className="text-gray-400 text-center">
                Your generated UI will appear here
              </p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;

import { useState } from "react";
import JSXParser from "react-jsx-parser";

import Button from "./components/Button";
import Input from "./components/Input";
import Card from "./components/Card";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Table from "./components/Table";
import Modal from "./components/Modal";
import Chart from "./components/Chart";

function App() {
  const [prompt, setPrompt] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [plan, setPlan] = useState(null);
  const [history, setHistory] = useState([]);
  const [diff, setDiff] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔒 Allowed components
  const allowed = [
    "Card",
    "Input",
    "Button",
    "Navbar",
    "Sidebar",
    "Table",
    "Modal",
    "Chart",
  ];

  const validateComponents = (code) => {
    const componentRegex = /<([A-Z][A-Za-z0-9]*)/g;
    let match;

    while ((match = componentRegex.exec(code)) !== null) {
      if (!allowed.includes(match[1])) {
        return false;
      }
    }
    return true;
  };

  const generateDiff = (oldCode, newCode) => {
    if (!oldCode) return null;

    const oldLines = oldCode.split("\n");
    const newLines = newCode.split("\n");

    const result = [];

    newLines.forEach((line) => {
      if (!oldLines.includes(line)) {
        result.push({ type: "added", content: line });
      } else {
        result.push({ type: "same", content: line });
      }
    });

    oldLines.forEach((line) => {
      if (!newLines.includes(line)) {
        result.push({ type: "removed", content: line });
      }
    });

    return result;
  };

  const generateUI = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    try {
      const response = await fetch(
        "https://https://ai-ui-generator-936u.onrender.com/generate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            existingCode: generatedCode,
          }),
        }
      );

      const data = await response.json();

      let cleanCode = data.code || "";

      cleanCode = cleanCode
        .replace(/```jsx/g, "")
        .replace(/```/g, "")
        .trim();

      if (!validateComponents(cleanCode)) {
        setExplanation(
          "⚠ Invalid component detected. Only predefined components are allowed."
        );
        setLoading(false);
        return;
      }

      const newDiff = generateDiff(generatedCode, cleanCode);
      setDiff(newDiff);

      if (generatedCode) {
        setHistory((prev) => [
          ...prev,
          { code: generatedCode, explanation, plan },
        ]);
      }

      setGeneratedCode(cleanCode);
      setExplanation(data.explanation || "");
      setPlan(data.plan || null);
    } catch (err) {
      console.error(err);
      setExplanation("⚠ Error generating UI");
    }

    setLoading(false);
  };

  const undoLast = () => {
    if (!history.length) return;

    const last = history[history.length - 1];

    setGeneratedCode(last.code);
    setExplanation(last.explanation);
    setPlan(last.plan);
    setHistory(history.slice(0, -1));
  };

  return (
    <div className="min-h-screen bg-gray-100">

      {/* 🔵 HEADER */}
      <Navbar title="AI UI Generator – Deterministic Mode" />

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* 🧠 PROMPT SECTION */}
        <Card>
          <h2 className="text-xl font-bold mb-4">Describe Your UI</h2>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-28 p-3 border rounded-lg mb-4"
            placeholder="Example: Create a dashboard with sidebar and analytics chart"
          />

          <div className="flex gap-3">
            <Button
              label={loading ? "Generating..." : "Generate / Modify"}
              onClick={generateUI}
            />
            <Button label="Undo Last Version" onClick={undoLast} />
          </div>
        </Card>

        {/* 📋 PLANNER OUTPUT */}
        <Card>
          <h3 className="font-semibold mb-3">Planner Output</h3>
          <pre className="bg-gray-200 p-4 rounded-lg text-sm overflow-auto">
            {plan
              ? JSON.stringify(plan, null, 2)
              : "Planner output will appear here"}
          </pre>
        </Card>

        {/* ✏️ EDITABLE CODE */}
        <Card>
          <h3 className="font-semibold mb-3">Editable JSX Code</h3>
          <textarea
            value={generatedCode}
            onChange={(e) => {
              const newCode = e.target.value;
              if (validateComponents(newCode)) {
                setGeneratedCode(newCode);
              }
            }}
            className="w-full h-64 bg-black text-green-400 p-4 rounded-lg font-mono text-sm"
          />
        </Card>

        {/* 🔄 DIFF VIEW */}
        <Card>
          <h3 className="font-semibold mb-3">Diff View</h3>
          <div className="text-sm max-h-60 overflow-auto">
            {diff ? (
              diff.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.type === "added"
                      ? "text-green-600"
                      : line.type === "removed"
                      ? "text-red-600"
                      : "text-gray-700"
                  }
                >
                  {line.type === "added" && "+ "}
                  {line.type === "removed" && "- "}
                  {line.content}
                </div>
              ))
            ) : (
              <p>No changes yet</p>
            )}
          </div>
        </Card>

        {/* 💬 EXPLANATION */}
        <Card>
          <h3 className="font-semibold mb-3">AI Explanation</h3>
          <div className="bg-gray-200 p-4 rounded-lg text-sm">
            {explanation || "Explanation will appear here"}
          </div>
        </Card>

        {/* 👀 LIVE PREVIEW */}
        <Card>
          <h2 className="text-xl font-bold mb-4 text-center">
            Live Preview
          </h2>

          <div className="bg-white p-6 rounded-xl shadow">
            {generatedCode ? (
              <JSXParser
                jsx={generatedCode}
                components={{
                  Button,
                  Input,
                  Card,
                  Navbar,
                  Sidebar,
                  Table,
                  Modal,
                  Chart,
                }}
              />
            ) : (
              <p className="text-gray-400 text-center">
                Generated UI will render here
              </p>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}

export default App;

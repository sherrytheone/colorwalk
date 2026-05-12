import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Editor from "@/pages/Editor";
import ChromaKeyTest from "@/pages/ChromaKeyTest";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/editor" element={<Editor />} />
        <Route path="/chroma-key-test" element={<ChromaKeyTest />} />
      </Routes>
    </Router>
  );
}

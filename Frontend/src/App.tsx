import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import IntegrationEditor from "./pages/IntegrationEditor";
import RequestEditor from "./pages/RequestEditor";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/integration/:id" element={<IntegrationEditor />} />
        <Route path="/integration/:id/request/:requestId" element={<RequestEditor />} />
      </Routes>
    </Router>
  );
}

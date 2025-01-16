import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Game from "./components/Game";
import SupabaseTest from "./components/SupabaseTest";
import "./App.css";
import "./components/Game.css";

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <Link to="/">Game</Link> | <Link to="/test">Supabase Test</Link>
        </nav>

        <Routes>
          <Route path="/test" element={<SupabaseTest />} />
          <Route path="/" element={<Game />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

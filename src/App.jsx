
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import TodoPage from "./pages/TodoPage";
import SchedulePage from "./pages/SchedulePage";
import HistoryPage from "./pages/HistoryPage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import NavBar from "./components/NavBar";

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/signup" element={<SignUpPage />} />
        < Route path="/login" element={<LoginPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  
  );
}

export default App;
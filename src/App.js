import UI from "./UI";
import "./App.css";
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Login/Register";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route exact path="/" element={localStorage.getItem("bathroom_login") === "true" ? <UI />:<Navigate replace to="/login" /> } />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/register" element={<Register />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;

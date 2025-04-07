import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Progetti from "./pages/Progetti";
import Personale from "./pages/Personale";
import Footer from "./components/Footer";
import Assegnazioni from "./pages/Assegnazioni"

function App() {
    return (
      <div className="App">
        <Router>
          <Navbar />
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/progetti" element={<Progetti />} />
              <Route path="/personale" element={<Personale />} />
              <Route path="/allocazioni" element={<Assegnazioni />} />
            </Routes>
          </div>
          <Footer />
        </Router>
      </div>
    );
  }

export default App;

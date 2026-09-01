import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  return (
    <div className="landingfont">
      <h2> Welcome to Project Video-Games</h2>
      <Link to="/home">
        <button className="buttonLanding">Start</button>
      </Link>
    </div>
  );
}

export default LandingPage;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Agreement() {
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  const handleContinue = () => {
    if (!checked) return;
    localStorage.setItem("accepted_terms", "true");
    navigate("/"); // go to main menu
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>Before You Continue</h1>

        <p style={styles.text}>
          Please read and accept our{" "}
          <a href="/terms.html" target="_blank" rel="noopener noreferrer">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy.html" target="_blank" rel="noopener noreferrer">
            Privacy Policy
          </a>.
        </p>

        <div style={styles.checkboxContainer}>
          <input
            type="checkbox"
            id="agree"
            checked={checked}
            onChange={() => setChecked(!checked)}
          />
          <label htmlFor="agree">
            I agree to the Terms of Service and Privacy Policy
          </label>
        </div>

        <button
          onClick={handleContinue}
          disabled={!checked}
          style={{
            ...styles.button,
            opacity: checked ? 1 : 0.5,
            cursor: checked ? "pointer" : "not-allowed"
          }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    height: "100vh",
    background: "linear-gradient(135deg, #111827, #1f2937)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Inter, sans-serif"
  },
  card: {
    background: "#ffffff",
    padding: "40px",
    borderRadius: "20px",
    width: "420px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    textAlign: "center"
  },
  title: {
    marginBottom: "20px",
    fontWeight: "700"
  },
  text: {
    fontSize: "14px",
    color: "#555",
    marginBottom: "25px"
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    marginBottom: "25px",
    fontSize: "14px"
  },
  button: {
    background: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "12px 30px",
    borderRadius: "50px",
    fontWeight: "600",
    fontSize: "16px",
    transition: "0.2s ease"
  }
};
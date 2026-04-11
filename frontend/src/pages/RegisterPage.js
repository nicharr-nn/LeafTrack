import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage({ onSwitch }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = () => {
    console.log("Register:", form);
    alert("Registered!");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Register</h1>
        <p style={styles.subtitle}>Create your account</p>

        <input
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
        />

        <button style={styles.button} onClick={handleRegister}>
          Create Account
        </button>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <span style={styles.link} onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f8f9fa",
    fontFamily: "'Segoe UI', sans-serif",
  },

  card: {
    background: "#fff",
    padding: 32,
    borderRadius: 16,
    width: 360,
    boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },

  title: {
    margin: 0,
    fontSize: 26,
    fontWeight: 700,
  },

  subtitle: {
    margin: 0,
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 10,
  },

  row: {
    display: "flex",
    gap: 10,
  },

  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  button: {
    marginTop: 10,
    padding: "10px",
    borderRadius: 8,
    border: "none",
    background: "#89d0a4",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },

  switchText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 10,
  },

  link: {
    color: "#89d0a4",
    cursor: "pointer",
    fontWeight: 600,
  },
};
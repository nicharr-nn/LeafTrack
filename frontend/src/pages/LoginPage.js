import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = () => {
    console.log("Login:", form);
    alert("Logged in!");

    navigate("/dashboard");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Login</h1>
        <p style={styles.subtitle}>Welcome to LeafTrack!</p>

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          style={styles.input}
        />

        <div style={styles.inputContainer}>
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            style={styles.input}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <button style={styles.button} onClick={handleLogin}>
          Login
        </button>

        <p style={styles.switchText}>
          Don’t have an account?{" "}
          <span style={styles.link} onClick={() => navigate("/register")}>
            Register
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

  inputContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  input: {
    padding: "10px 40px 10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  eyeButton: {
    position: "absolute",
    right: 10,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

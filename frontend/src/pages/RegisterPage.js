import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async () => {
    if (!form.name.trim() || !form.username.trim() || !form.password.trim()) {
      setErrorMessage("Name, username, and password are required.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:4000"}/api/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: form.name.trim(),
            username: form.username.trim(),
            password: form.password.trim(),
          }),
        }
      );

      let payload = {};
      try {
        payload = await response.json();
      } catch (_error) {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(payload.message || "Registration failed.");
      }

      alert("Registered successfully!");
      navigate("/login");
    } catch (error) {
      setErrorMessage(error.message || "Registration failed.");
    } finally {
      setIsSubmitting(false);
    }
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

        {errorMessage ? <p style={styles.error}>{errorMessage}</p> : null}

        <button
          style={{
            ...styles.button,
            ...(isSubmitting ? styles.buttonDisabled : {}),
          }}
          onClick={handleRegister}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Account"}
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

  buttonDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  error: {
    margin: 0,
    color: "#d92323",
    fontSize: 13,
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
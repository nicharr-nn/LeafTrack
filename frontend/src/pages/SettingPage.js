import { useState } from "react";
import Sidebar from "../components/Sidebar";

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log("Saved:", form);
    alert("Settings saved!");
  };

  return (
    <div style={styles.root}>
      <Sidebar activePage="Settings" />

      <main style={styles.main}>
        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Settings</h1>
          </div>

          <div style={styles.card}>
            <div style={styles.grid}>
              <div style={styles.inputGroupFull}>
                <label style={styles.label}>Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter name"
                />
              </div>

              <div style={styles.inputGroupFull}>
                <label style={styles.label}>Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter username"
                />
              </div>

              <div style={styles.inputGroupFull}>
                <label style={styles.label}>Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div style={styles.actions}>
              <button style={styles.saveBtn} onClick={handleSave}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  root: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8f9fa",
    fontFamily: "'Segoe UI', sans-serif",
  },

  main: { flex: 1 },
  content: { padding: 32 },

  pageHeader: { marginBottom: 24 },
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },

  card: {
    background: "#fff",
    padding: 24,
    borderRadius: 16,
    border: "1px solid #e5e7eb",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },

  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  inputGroupFull: {
    gridColumn: "span 2",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  label: {
    fontSize: 14,
    fontWeight: 500,
  },

  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
  },

  actions: {
    marginTop: 24,
    display: "flex",
    justifyContent: "flex-end",
  },

  saveBtn: {
    background: "#89d0a4",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },
};

import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getApiBase, getCurrentUser } from "../config/api";

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const user = getCurrentUser();
      if (!user?.user_id) {
        setError("Please log in to view settings.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${getApiBase()}/api/users/${user.user_id}`);
        if (!res.ok) {
          throw new Error("Failed to load user data.");
        }
        const userData = await res.json();
        setForm({
          name: userData.name || "",
          username: userData.username || "",
          password: "",
        });
      } catch (e) {
        setError(e.message || "Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const user = getCurrentUser();
    if (!user?.user_id) {
      alert("Please log in to save settings.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const updateData = {};
      if (form.name.trim()) updateData.name = form.name.trim();
      if (form.username.trim()) updateData.username = form.username.trim();
      if (form.password.trim()) updateData.password = form.password.trim();

      if (Object.keys(updateData).length === 0) {
        alert("No changes to save.");
        setSaving(false);
        return;
      }

      const res = await fetch(`${getApiBase()}/api/users/${user.user_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        let msg = "Failed to save settings.";
        try {
          const body = await res.json();
          msg = body.message || msg;
        } catch {
          /* ignore */
        }
        throw new Error(msg);
      }

      const { user: updatedUser } = await res.json();
      
      sessionStorage.setItem("leaftrack_user", JSON.stringify(updatedUser));
      
      alert("Settings saved successfully!");
      
      setForm({ ...form, password: "" });
    } catch (e) {
      setError(e.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={styles.root}>
      <Sidebar activePage="Settings" />

      <main style={styles.main}>
        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Settings</h1>
          </div>

          {loading ? (
            <div style={styles.card}>
              <p>Loading settings...</p>
            </div>
          ) : error ? (
            <div style={styles.card}>
              <p style={styles.error}>{error}</p>
            </div>
          ) : (
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
                    placeholder="Enter new password (leave empty to keep current)"
                  />
                </div>
              </div>

              <div style={styles.actions}>
                <button 
                  style={{...styles.saveBtn, opacity: saving ? 0.6 : 1}} 
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
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

  error: {
    color: "#dc2626",
    fontSize: 14,
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

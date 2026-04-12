import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getApiBase, getCurrentUser } from "../config/api";

function mapBudgetsFromApi(list) {
  const mapped = list.map((b) => ({
    category_id: b.category_id,
    category_name: b.category_name,
    budgetInput:
      b.default_amount != null && Number(b.default_amount) > 0
        ? String(b.default_amount)
        : "",
  }));

  return mapped.sort((a, b) => {
    if (a.category_name === "Other") return 1;
    if (b.category_name === "Other") return -1;
    return a.category_name.localeCompare(b.category_name);
  });
}

export default function SettingsPage() {
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [budgets, setBudgets] = useState([]);
  const [budgetError, setBudgetError] = useState("");
  const [budgetSaving, setBudgetSaving] = useState(false);

  useEffect(() => {
    const loadBudgetRows = async (userId) => {
      const base = getApiBase();
      try {
        const budgetRes = await fetch(
          `${base}/api/users/${userId}/default-category-budgets`,
        );
        if (budgetRes.ok) {
          const data = await budgetRes.json();
          const list = Array.isArray(data.budgets) ? data.budgets : [];
          setBudgets(mapBudgetsFromApi(list));
          setBudgetError("");
          return;
        }
      } catch {
        /* try category fallback */
      }

      try {
        const catRes = await fetch(`${base}/api/categories/expense`);
        if (catRes.ok) {
          const catData = await catRes.json();
          const cats = Array.isArray(catData.categories)
            ? catData.categories
            : [];
          const list = cats.map((c) => ({
            category_id: c.category_id,
            category_name: c.category_name,
            default_amount: null,
          }));
          setBudgets(mapBudgetsFromApi(list));
          setBudgetError("");
          return;
        }
      } catch {
        /* ignore */
      }

      setBudgets([]);
      setBudgetError("Could not load expense categories.");
    };

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

        await loadBudgetRows(user.user_id);
      } catch (e) {
        setError(e.message || "Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const handleBudgetChange = (category_id, value) => {
    setBudgets((prev) =>
      prev.map((b) =>
        b.category_id === category_id ? { ...b, budgetInput: value } : b,
      ),
    );
  };

  const handleSaveBudgets = async () => {
    const user = getCurrentUser();
    if (!user?.user_id) {
      alert("Please log in to save budgets.");
      return;
    }

    const payloadBudgets = [];
    for (const b of budgets) {
      const raw = String(b.budgetInput).trim().replace(/,/g, "");
      if (raw === "") {
        payloadBudgets.push({
          category_id: b.category_id,
          default_amount: null,
        });
        continue;
      }
      const n = Number.parseFloat(raw);
      if (!Number.isFinite(n) || n <= 0) {
        alert(`Please enter a valid positive amount or leave empty.`);
        return;
      }
      payloadBudgets.push({
        category_id: b.category_id,
        default_amount: n,
      });
    }

    setBudgetSaving(true);
    setBudgetError("");
    try {
      const res = await fetch(
        `${getApiBase()}/api/users/${user.user_id}/default-category-budgets`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ budgets: payloadBudgets }),
        },
      );
      if (!res.ok) {
        let msg = "Failed to save budgets.";
        try {
          const body = await res.json();
          msg = body.message || msg;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }
      const data = await res.json();
      const list = Array.isArray(data.budgets) ? data.budgets : [];
      setBudgets(mapBudgetsFromApi(list));
      alert("Expense budgets saved.");
    } catch (e) {
      setBudgetError(e.message || "Failed to save budgets.");
    } finally {
      setBudgetSaving(false);
    }
  };

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
          // ignore
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
            <>
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
                    style={{ ...styles.saveBtn, opacity: saving ? 0.6 : 1 }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

              <div style={styles.card}>
                <h2 style={styles.sectionTitle}>Expense budgets</h2>
                {budgetError ? (
                  <p style={styles.error}>{budgetError}</p>
                ) : (
                  <>
                    <div style={styles.budgetList}>
                      {budgets.map((b) => (
                        <div key={b.category_id} style={styles.budgetRow}>
                          <span style={styles.categoryName}>
                            {b.category_name}
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={b.budgetInput}
                            onChange={(e) =>
                              handleBudgetChange(b.category_id, e.target.value)
                            }
                            style={styles.budgetInput}
                            placeholder="None"
                            aria-label={`Monthly default budget for ${b.category_name}`}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={styles.actions}>
                      <button
                        type="button"
                        style={{
                          ...styles.saveBtn,
                          opacity: budgetSaving ? 0.6 : 1,
                        }}
                        onClick={handleSaveBudgets}
                        disabled={budgetSaving || budgets.length === 0}
                      >
                        {budgetSaving ? "Saving..." : "Save budgets"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
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
  content: {
    padding: 32,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

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

  sectionTitle: {
    fontSize: 20,
    fontWeight: 600,
    margin: "0 0 8px 0",
  },

  sectionHint: {
    fontSize: 14,
    color: "#6b7280",
    margin: "0 0 16px 0",
    lineHeight: 1.45,
  },

  budgetList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  budgetRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },

  categoryName: {
    fontSize: 14,
    fontWeight: 500,
    flex: "0 1 40%",
  },

  budgetInput: {
    flex: "0 1 200px",
    maxWidth: 200,
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
    textAlign: "right",
    fontSize: 14,
  },
};

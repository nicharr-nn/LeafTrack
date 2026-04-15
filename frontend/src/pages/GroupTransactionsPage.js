import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import AddTransaction from "../components/AddTransaction";
import { getApiBase, getCurrentUser } from "../config/api";
import { useParams } from "react-router-dom";
import { LuTrash2, LuSearch, LuArrowUp, LuArrowDown } from "react-icons/lu";

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB");
}

function mapTransaction(row) {
  const amt = Number(row.amount);
  return {
    id: row.transaction_id,
    rawDate: row.date,
    date: formatDisplayDate(row.date),
    description: row.description || "",
    category: row.category || "Other",
    type: row.type,
    amount: amt,
    name: row.name || "Unknown",
    user_id: row.user_id,
    workspace_id: row.workspace_id != null ? Number(row.workspace_id) : null,
  };
}

const CATEGORIES = [
  "All Categories",
  "Salary",
  "Bonus",
  "Investment",
  "Gift",
  "Rent",
  "Food",
  "Utilities",
  "Entertainment",
  "Health",
  "Other",
];

const TYPES = ["All Types", "income", "expense"];

export default function GroupTransactions() {
  const { groupId } = useParams();
  const [transactions, setTransactions] = useState([]);
  const [listError, setListError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showModal, setShowModal] = useState(false);

  const user = getCurrentUser();

  const loadTransactions = useCallback(async () => {
    if (!user?.user_id) {
      setListError("Log in first.");
      setTransactions([]);
      return;
    }
    setListError("");

    try {
      const query = new URLSearchParams({
        user_id: String(user.user_id),
        workspace_type: "group",
        workspace_id: String(groupId),
      });
      const res = await fetch(
        `${getApiBase()}/api/transactions?${query.toString()}`,
      );
      let data = [];
      try {
        data = await res.json();
      } catch {
        data = [];
      }
      if (!res.ok)
        throw new Error(data.message || "Failed to load transactions.");
      const rows = Array.isArray(data) ? data : [];
      setTransactions(rows.map(mapTransaction));
      setListError("");
    } catch (err) {
      setTransactions([]);
      setListError(err.message || "Failed to load transactions.");
    }
  }, [groupId, user]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Filters
  const filtered = transactions
    .filter((t) => {
      const matchSearch = t.description
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchType = typeFilter === "All Types" || t.type === typeFilter;

      const matchCat =
        categoryFilter === "All Categories" || t.category === categoryFilter;

      return matchSearch && matchType && matchCat;
    })
    .sort((a, b) => {
      return sortOrder === "desc"
        ? new Date(b.rawDate) - new Date(a.rawDate)
        : new Date(a.rawDate) - new Date(b.rawDate);
    });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0),
  );

  const handleDelete = async (tx) => {
    if (!user?.user_id) {
      alert("Log in to delete transactions.");
      return;
    }

    try {
      const res = await fetch(
        `${getApiBase()}/api/transactions/${tx.id}?user_id=${user.user_id}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        let body = {};
        try {
          body = await res.json();
        } catch {
          body = {};
        }
        throw new Error(body.message || "Delete failed.");
      }

      setTransactions((prev) => prev.filter((t) => t.id !== tx.id));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={styles.root}>
      <Sidebar activePage="Groups" />

      <main style={styles.main}>
        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Group Transactions</h1>

            <button style={styles.addBtn} onClick={() => setShowModal(true)}>
              Add Transaction
            </button>
          </div>
          {listError ? <p style={styles.bannerError}>{listError}</p> : null}

          {/* Stats */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <span style={styles.statLabel}>Total Transactions</span>
              <span style={styles.statValueDefault}>{transactions.length}</span>
            </div>

            <div
              style={{
                ...styles.statCard,
                background: "#eef9ff",
                border: "1px solid #A9DEF9",
              }}
            >
              <span style={styles.statLabel}>Total Income</span>
              <span style={{ ...styles.statValue, color: "#66bde8" }}>
                {totalIncome.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                ...styles.statCard,
                background: "#ffeaf4",
                border: "1px solid #f8accf",
              }}
            >
              <span style={styles.statLabel}>Total Expense</span>
              <span style={{ ...styles.statValue, color: "#ee8ebb" }}>
                {totalExpenses.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Filters */}
          <div style={styles.filterBar}>
            <div style={styles.searchWrap}>
              <span style={styles.searchIcon}>
                <LuSearch size={14} />
              </span>

              <input
                style={styles.searchInput}
                placeholder="Search transactions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button
                style={styles.sortBtn}
                onClick={() =>
                  setSortOrder(sortOrder === "desc" ? "asc" : "desc")
                }
              >
                {sortOrder === "desc" ? (
                  <LuArrowDown size={16} />
                ) : (
                  <LuArrowUp size={16} />
                )}
              </button>

              <select
                style={styles.select}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>

              <select
                style={styles.select}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {[
                    "Date",
                    "User",
                    "Description",
                    "Category",
                    "Type",
                    "Amount",
                    "Actions",
                  ].map((h) => (
                    <th key={h} style={styles.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={styles.emptyRow}>
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} style={styles.tr}>
                      <td style={styles.td}>{t.date}</td>

                      <td style={styles.td}>
                        <span style={styles.userBadge}>{t.name}</span>
                      </td>

                      <td style={styles.td}>{t.description}</td>
                      <td style={styles.td}>
                        <span style={styles.categoryBadge}>{t.category}</span>
                      </td>
                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.typeBadge,
                            color: t.type === "income" ? "#66bde8" : "#ee8ebb",
                            background:
                              t.type === "income" ? "#eff6ff" : "#fef2f2",
                          }}
                        >
                          {t.type}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: t.type === "income" ? "#66bde8" : "#ee8ebb",
                          }}
                        >
                          {t.type === "income" ? "+" : "-"}
                          {Math.abs(t.amount).toLocaleString()}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(t)}
                        >
                          <LuTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {showModal && (
            <AddTransaction
              workspaceType="group"
              onClose={() => setShowModal(false)}
              onSave={async (newTx) => {
                if (!user?.user_id) {
                  throw new Error("Log in to add transactions.");
                }

                const { workspace_type: _wt, ...rest } = newTx;
                const response = await fetch(
                  `${getApiBase()}/api/transactions`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      user_id: user.user_id,
                      category: rest.category,
                      type: rest.type,
                      amount: rest.amount,
                      description: rest.description,
                      date: rest.date,
                      workspace_type: "group",
                      workspace_id: Number(groupId),
                    }),
                  },
                );

                let payload = {};
                try {
                  payload = await response.json();
                } catch {
                  payload = {};
                }

                if (!response.ok) {
                  throw new Error(
                    payload.message || "Could not save transaction.",
                  );
                }

                setTransactions((prev) => [mapTransaction(payload), ...prev]);
              }}
            />
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
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f8f9fa",
    color: "#111",
  },
  main: { flex: 1, display: "flex", flexDirection: "column", marginLeft: 220 },
  content: { padding: "32px", flex: 1 },

  pageHeader: {
    marginBottom: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageTitle: { fontSize: 28, fontWeight: 700, margin: 0 },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "#e4feee",
    borderRadius: 12,
    border: "1px solid #9ce3b7",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  statLabel: { fontSize: 16, color: "#6b7280" },
  statValue: { fontSize: 26, fontWeight: 700 },
  statValueDefault: { fontSize: 26, fontWeight: 700, color: "#62b181" },

  filterBar: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  searchWrap: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f3f4f6",
    borderRadius: 8,
    padding: "8px 12px",
  },
  searchIcon: { color: "#9ca3af" },
  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
  },

  sortBtn: {
    height: 36,
    width: 36,
    padding: 0,
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    cursor: "pointer",
    background: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#6b7280",
  },

  select: {
    height: 36,
    padding: "0 12px",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    cursor: "pointer",
    background: "#f3f4f6",
    boxSizing: "border-box",
    appearance: "none",
  },

  addBtn: {
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    background: "#89d0a4",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },

  tableWrap: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    marginTop: 8,
    overflow: "hidden",
  },

  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed" },

  th: {
    textAlign: "center",
    fontSize: 12,
    fontWeight: 600,
    color: "#9ca3af",
    padding: "14px 20px",
    borderBottom: "1px solid #f3f4f6",
    textTransform: "uppercase",
  },

  tr: { borderBottom: "1px solid #f9fafb" },
  td: { padding: "14px 20px", fontSize: 14, textAlign: "center" },

  categoryBadge: {
    background: "#f3f4f6",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
  },

  typeBadge: {
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
  },

  bannerError: {
    color: "#b45309",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
  },

  deleteBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#ef4444",
  },

  emptyRow: {
    textAlign: "center",
    color: "#9ca3af",
    padding: "32px",
  },

  userBadge: {
    background: "#f0fdf4",
    color: "#15803d",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
  },
};

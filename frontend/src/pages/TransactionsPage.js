import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AddTransaction from "../components/AddTransaction";

import { LuSearch, LuTrash2, LuChevronDown } from "react-icons/lu";

const initialTransactions = [
  {
    id: 1,
    date: "01/04/2026",
    description: "Monthly Salary",
    category: "Salary",
    type: "income",
    amount: 5000,
  },
  {
    id: 2,
    date: "02/04/2026",
    description: "April Rent",
    category: "Rent",
    type: "expense",
    amount: -1200,
  },
  {
    id: 3,
    date: "03/04/2026",
    description: "Grocery Shopping",
    category: "Food",
    type: "expense",
    amount: -250,
  },
  {
    id: 4,
    date: "04/04/2026",
    description: "Freelance Payment",
    category: "Salary",
    type: "income",
    amount: 500,
  },
  {
    id: 5,
    date: "05/04/2026",
    description: "Electric Bill",
    category: "Utilities",
    type: "expense",
    amount: -120,
  },
  {
    id: 6,
    date: "06/04/2026",
    description: "Netflix Subscription",
    category: "Entertainment",
    type: "expense",
    amount: -15,
  },
  {
    id: 7,
    date: "07/04/2026",
    description: "Gym Membership",
    category: "Health",
    type: "expense",
    amount: -80,
  },
  {
    id: 8,
    date: "08/04/2026",
    description: "Bonus",
    category: "Salary",
    type: "income",
    amount: 130,
  },
];

const CATEGORIES = [
  "All Categories",
  "Salary",
  "Rent",
  "Food",
  "Utilities",
  "Entertainment",
  "Health",
  "Other",
];

const TYPES = ["All Types", "income", "expense"];

export default function Transactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState(initialTransactions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [showModal, setShowModal] = useState(false);

  const filtered = transactions.filter((t) => {
    const matchSearch = t.description
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchType = typeFilter === "All Types" || t.type === typeFilter;
    const matchCat =
      categoryFilter === "All Categories" || t.category === categoryFilter;

    return matchSearch && matchType && matchCat;
  });

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = Math.abs(
    transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0),
  );

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div style={styles.root}>
      <Sidebar activePage="Transactions" />

      <main style={styles.main}>
        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Transactions</h1>
            <button style={styles.addBtn} onClick={() => setShowModal(true)}>
              Add Transaction
            </button>
          </div>

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
              <span
                style={{
                  ...styles.statValue,
                  color: "#66bde8",
                }}
              >
                ${totalIncome.toLocaleString()}
              </span>
            </div>

            <div
              style={{
                ...styles.statCard,
                background: "#ffeaf4",
                border: "1px solid #f8accf",
              }}
            >
              <span style={styles.statLabel}>Total Expenses</span>
              <span
                style={{
                  ...styles.statValue,
                  color: "#ee8ebb",
                }}
              >
                ${totalExpenses.toLocaleString()}
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

            <div style={styles.filterRight}>
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
                    <td colSpan={6} style={styles.emptyRow}>
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((t) => (
                    <tr key={t.id} style={styles.tr}>
                      <td style={styles.td}>{t.date}</td>

                      <td style={styles.td}>
                        <div style={styles.descCell}>{t.description}</div>
                      </td>

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
                          {t.type === "income" ? "+" : ""}$
                          {Math.abs(t.amount).toLocaleString()}
                        </span>
                      </td>

                      <td style={styles.td}>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(t.id)}
                          title="Delete"
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
        </div>
        {showModal && (
          <AddTransaction
            onClose={() => setShowModal(false)}
            onSave={(newTx) => {
              setTransactions((prev) => [
                { ...newTx, id: Date.now() },
                ...prev,
              ]);
              setShowModal(false);
            }}
          />
        )}
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
  main: { flex: 1, display: "flex", flexDirection: "column" },
  content: { padding: "32px", flex: 1 },

  pageHeader: {
    marginBottom: 24,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pageTitle: { fontSize: 28, fontWeight: 700, margin: 0 },
  pageSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    background: "#fff",
    borderRadius: 12,
    border: "1px solid #e5e7eb",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  statLabel: { fontSize: 13, color: "#6b7280" },
  statValue: { fontSize: 26, fontWeight: 700 },
  statValueDefault: { fontSize: 26, fontWeight: 700 },

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

  filterRight: { display: "flex", alignItems: "center", gap: 10 },
  filterIcon: { color: "#6b7280" },

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

  descCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

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
};

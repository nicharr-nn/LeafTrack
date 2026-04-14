import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { LuArrowUp, LuArrowDown, LuWallet } from "react-icons/lu";
import { getApiBase, getCurrentUser } from "../config/api";

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB");
}

function mapTransaction(row) {
  const amt = Number(row.amount);
  return {
    id: row.transaction_id,
    title: row.description || "Transaction",
    category: row.category || "Other",
    date: formatDisplayDate(row.date),
    amount: amt,
    workspace_type: row.workspace_type || "personal",
  };
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const personalTransactions = transactions.filter(
    (t) => t.workspace_type === "personal"
  );

  useEffect(() => {
    const loadData = async () => {
      const user = getCurrentUser();
      if (!user?.user_id) {
        setError("Please log in to view dashboard.");
        setLoading(false);
        return;
      }

      try {
        // Load transactions
        const txRes = await fetch(
          `${getApiBase()}/api/transactions?user_id=${user.user_id}`,
        );
        let txPayload = [];
        try {
          txPayload = await txRes.json();
        } catch {
          txPayload = [];
        }

        if (!txRes.ok) {
          throw new Error("Failed to load transactions.");
        }

        const txRows = Array.isArray(txPayload) ? txPayload : [];
        setTransactions(txRows.map(mapTransaction));

        // Load budgets
        const budgetRes = await fetch(
          `${getApiBase()}/api/budgets?user_id=${user.user_id}`,
        );
        let budgetPayload = [];
        try {
          budgetPayload = await budgetRes.json();
        } catch {
          budgetPayload = [];
        }

        if (!budgetRes.ok) {
          throw new Error("Failed to load budgets.");
        }

        const budgetRows = Array.isArray(budgetPayload) ? budgetPayload : [];
        const activeBudgets = budgetRows.filter(
          (b) => b.default_amount != null,
        );
        setBudgets(activeBudgets);
      } catch (e) {
        setError(e.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalIncome = personalTransactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = Math.abs(
    personalTransactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const balance = totalIncome - totalExpense;

  const recent = [...personalTransactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const budgetsWithSpent = budgets.map((budget) => {
    const spent = personalTransactions
      .filter((t) => t.category === budget.category_name && t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      category: budget.category_name,
      spent: spent,
      limit: budget.default_amount,
    };
  });

  const sortedBudgets = [...budgetsWithSpent].sort(
    (a, b) => b.spent / b.limit - a.spent / a.limit,
  );

  return (
    <div style={styles.root}>
      <Sidebar activePage="Dashboard" />

      <main style={styles.main}>
        <div style={styles.content}>
          <div style={styles.pageHeader}>
            <h1 style={styles.pageTitle}>Dashboard</h1>
          </div>

          {loading ? (
            <div style={styles.card}>
              <p>Loading dashboard...</p>
            </div>
          ) : error ? (
            <div style={styles.card}>
              <p style={styles.error}>{error}</p>
            </div>
          ) : (
            <>
              <div style={styles.statsRow}>
                <div style={styles.balanceCard}>
                  <div style={styles.cardHeader}>
                    <span>Total Balance</span>
                    <LuWallet />
                  </div>
                  <span style={{ ...styles.statValue, color: "#62b181" }}>
                    {balance.toLocaleString()}
                  </span>
                </div>

                <div
                  style={{
                    ...styles.statCard,
                    background: "#eef9ff",
                    border: "1px solid #A9DEF9",
                  }}
                >
                  <div style={styles.cardHeader}>
                    <span>Total Income</span>
                    <LuArrowUp />
                  </div>
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
                  <div style={styles.cardHeader}>
                    <span>Total Expenses</span>
                    <LuArrowDown />
                  </div>
                  <span style={{ ...styles.statValue, color: "#ee8ebb" }}>
                    {totalExpense.toLocaleString()}
                  </span>
                </div>
              </div>

              <div style={styles.bottomGrid}>
                <div style={styles.panel}>
                  <h3>Recent Transactions</h3>

                  {recent.length === 0 ? (
                    <p>No transactions found.</p>
                  ) : (
                    recent.map((t) => (
                      <div key={t.id} style={styles.transactionRow}>
                        <div style={styles.txLeft}>
                          <div style={styles.txIcon}>
                            {t.amount > 0 ? <LuArrowUp /> : <LuArrowDown />}
                          </div>
                          <div>
                            <div>{t.title}</div>
                            <div style={styles.txMeta}>
                              {t.category} - {t.date}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            color: t.amount > 0 ? "#66bde8" : "#ee8ebb",
                            fontWeight: 600,
                          }}
                        >
                          {t.amount > 0 ? "+" : "-"}
                          {Math.abs(t.amount).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div style={styles.panel}>
                  <h3>Budget Overview</h3>

                  {sortedBudgets.length === 0 ? (
                    <p>No budgets set.</p>
                  ) : (
                    sortedBudgets.map((b) => {
                      const percent = (b.spent / b.limit) * 100;

                      return (
                        <div key={b.category} style={styles.budgetRow}>
                          <div style={styles.budgetHeader}>
                            <span>{b.category}</span>
                            <span>
                              {b.spent} / {b.limit}
                            </span>
                          </div>

                          <div style={styles.progressBar}>
                            <div
                              style={{
                                ...styles.progressFill,
                                width: `${percent}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
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
    background: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
  },
  main: { flex: 1, marginLeft: 220 },
  content: { padding: 32 },

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

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
    color: "#6b7280",
  },

  pageHeader: { marginBottom: 24 },
  pageTitle: {
    fontSize: 28,
    fontWeight: 700,
    margin: 0,
  },

  balanceCard: {
    background: "#e4feee",
    borderRadius: 12,
    border: "1px solid #9ce3b7",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },

  panel: {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
  },

  transactionRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #eee",
  },

  txLeft: { display: "flex", gap: 10 },
  txIcon: {
    background: "#f3f4f6",
    padding: 8,
    borderRadius: 20,
  },

  txMeta: { fontSize: 12, color: "#6b7280" },

  budgetRow: { marginBottom: 16 },

  budgetHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  progressBar: {
    height: 8,
    background: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    background: "#9ce3b7",
    borderRadius: 10,
  },

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

  statValue: {
    fontSize: 26,
    fontWeight: 700,
  },
};

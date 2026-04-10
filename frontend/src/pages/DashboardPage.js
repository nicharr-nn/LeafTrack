import Sidebar from "../components/Sidebar";
import { LuArrowUp, LuArrowDown, LuWallet } from "react-icons/lu";

const transactions = [
  {
    id: 1,
    title: "Monthly Salary",
    category: "Salary",
    date: "01/04/2026",
    amount: 5000,
  },
  {
    id: 2,
    title: "April Rent",
    category: "Rent",
    date: "02/04/2026",
    amount: -1200,
  },
  {
    id: 3,
    title: "Lunch with friends",
    category: "Food",
    date: "05/04/2026",
    amount: -150,
  },
  {
    id: 4,
    title: "Freelance",
    category: "Salary",
    date: "06/04/2026",
    amount: 500,
  },
  {
    id: 5,
    title: "Transport",
    category: "Transport",
    date: "07/04/2026",
    amount: -200,
  },
  {
    id: 6,
    title: "Netflix",
    category: "Entertainment",
    date: "08/04/2026",
    amount: -15,
  },
];

const budgets = [
  { category: "Groceries", spent: 150, limit: 600 },
  { category: "Transportation", spent: 280, limit: 300 },
  { category: "Entertainment", spent: 120, limit: 200 },
  { category: "Rent", spent: 1200, limit: 1200 },
];

export default function DashboardPage() {
  const totalIncome = transactions
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = Math.abs(
    transactions
      .filter((t) => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0),
  );

  const balance = totalIncome - totalExpense;

  const recent = transactions.slice(0, 5);

  const sortedBudgets = [...budgets].sort(
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

          <div style={styles.cardRow}>
            <div style={styles.balanceCard}>
              <div style={styles.cardHeader}>
                <span>Total Balance</span>
                <LuWallet />
              </div>
              <h2>{balance.toLocaleString()}</h2>
            </div>

            <div style={styles.incomeCard}>
              <div style={styles.cardHeader}>
                <span>Total Income</span>
                <LuArrowUp />
              </div>
              <h2>{totalIncome.toLocaleString()}</h2>
            </div>

            <div style={styles.expenseCard}>
              <div style={styles.cardHeader}>
                <span>Total Expenses</span>
                <LuArrowDown />
              </div>
              <h2>{totalExpense.toLocaleString()}</h2>
            </div>
          </div>

          <div style={styles.bottomGrid}>
            <div style={styles.panel}>
              <h3>Recent Transactions</h3>

              {recent.map((t) => (
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
              ))}
            </div>

            <div style={styles.panel}>
              <h3>Budget Overview</h3>

              {sortedBudgets.map((b) => {
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
              })}
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
    background: "#f8f9fa",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', sans-serif",
  },
  main: { flex: 1 },
  content: { padding: 32 },

  cardRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginBottom: 24,
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

  pageSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
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

  incomeCard: {
    background: "#eef9ff",
    borderRadius: 12,
    border: "1px solid #A9DEF9",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  expenseCard: {
    background: "#ffeaf4",
    borderRadius: 12,
    border: "1px solid #f8accf",
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
  },

  progressFill: {
    height: "100%",
    background: "#9ce3b7",
    borderRadius: 10,
  },
};

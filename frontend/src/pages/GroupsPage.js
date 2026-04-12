import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { LuUsers, LuUserPlus, LuSearch } from "react-icons/lu";
import AddMemberModal from "../components/AddMember";
import AddTransactionModal from "../components/AddTransaction";

const initialGroups = [
  {
    id: 1,
    name: "Vacation Fund",
    description: "Saving for summer vacation",
    members: 2,
    income: 3000,
    expenses: 1200,
  },
];

export default function GroupsPage() {
  const [groups, setGroups] = useState(initialGroups);
  const [newGroup, setNewGroup] = useState("");

  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [search, setSearch] = useState("");

  const handleCreateGroup = () => {
    if (!newGroup.trim()) return;

    const newItem = {
      id: Date.now(),
      name: newGroup,
      description: "New group",
      members: 1,
      income: 0,
      expenses: 0,
    };

    setGroups((prev) => [newItem, ...prev]);
    setNewGroup("");
  };

  const handleAddMember = (member) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroupId ? { ...g, members: g.members + 1 } : g,
      ),
    );
  };

  const handleAddTransaction = (transaction) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === selectedGroupId
          ? {
              ...g,
              income:
                transaction.amount > 0
                  ? g.income + transaction.amount
                  : g.income,
              expenses:
                transaction.amount < 0
                  ? g.expenses + Math.abs(transaction.amount)
                  : g.expenses,
            }
          : g,
      ),
    );
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={styles.root}>
      <Sidebar activePage="Groups" />

      <main style={styles.main}>
        <div style={styles.content}>
          <div style={styles.pageHeaderRow}>
            <h1 style={styles.pageTitle}>Groups</h1>

            <button style={styles.headerBtn} onClick={handleCreateGroup}>
              Create Group
            </button>
          </div>

          <div style={styles.searchContainer}>
            <LuSearch size={16} style={styles.searchIconInline} />

            <input
              style={styles.searchInputPlain}
              placeholder="Search groups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Group Cards */}
          <div style={styles.grid}>
            {filteredGroups.map((g) => {
              const balance = g.income - g.expenses;

              return (
                <div key={g.id} style={styles.card}>
                  {/* Header */}
                  <div style={styles.cardHeader}>
                    <div style={styles.iconBox}>
                      <LuUsers size={22} />
                    </div>

                    <div>
                      <h3 style={styles.groupName}>{g.name}</h3>
                      <p style={styles.groupDesc}>{g.description}</p>
                    </div>
                  </div>

                  <hr style={styles.divider} />

                  {/* Members */}
                  <div style={styles.row}>
                    <div style={styles.memberInfo}>
                      <LuUsers size={16} />
                      <span>{g.members} members</span>
                    </div>

                    <div
                      style={styles.addMember}
                      onClick={() => {
                        setSelectedGroupId(g.id);
                        setShowAddMember(true);
                      }}
                    >
                      <LuUserPlus size={16} />
                      <span>Add Member</span>
                    </div>
                  </div>

                  {/* Balance */}
                  <div style={styles.balanceRow}>
                    <span>Group Balance</span>
                    <span style={styles.balance}>
                      {balance.toLocaleString()}
                    </span>
                  </div>

                  {/* Income / Expense */}
                  <div style={styles.stats}>
                    <div style={styles.incomeCard}>
                      <span>Income</span>
                      <strong>{g.income.toLocaleString()}</strong>
                    </div>

                    <div style={styles.expenseCard}>
                      <span>Expenses</span>
                      <strong>{g.expenses.toLocaleString()}</strong>
                    </div>
                  </div>

                  {/* Button */}
                  <button
                    style={styles.addBtn}
                    onClick={() => {
                      setSelectedGroupId(g.id);
                      setShowAddTransaction(true);
                    }}
                  >
                    Add Transaction
                  </button>
                </div>
              );
            })}
          </div>
          {showAddMember && (
            <AddMemberModal
              onClose={() => setShowAddMember(false)}
              onSave={handleAddMember}
            />
          )}
          {showAddTransaction && (
            <AddTransactionModal
              onClose={() => setShowAddTransaction(false)}
              onSave={handleAddTransaction}
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
    background: "#f8f9fa",
    fontFamily: "'Segoe UI', sans-serif",
  },

  main: { flex: 1 },
  content: { padding: 32 },

  title: {
    fontSize: 28,
    fontWeight: 700,
    marginBottom: 20,
  },

  input: {
    flex: 1,
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
  },

  createBtn: {
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    background: "#89d0a4",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: 20,
  },

  card: {
    background: "#fff",
    borderRadius: 16,
    padding: 20,
    border: "1px solid #e5e7eb",
  },

  cardHeader: {
    display: "flex",
    gap: 14,
    alignItems: "center",
  },

  iconBox: {
    background: "#f0fdf4",
    padding: 12,
    borderRadius: 12,
    color: "#62b181",
  },

  groupName: { margin: 0, fontSize: 20 },
  groupDesc: { margin: 0, color: "#6b7280", fontSize: 14 },

  divider: {
    margin: "16px 0",
    border: "none",
    borderTop: "1px solid #eee",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  memberInfo: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "#6b7280",
  },

  addMember: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    cursor: "pointer",
  },

  balanceRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 16,
    fontWeight: 500,
  },

  balance: {
    color: "#000000",
    fontWeight: 700,
  },

  stats: {
    display: "flex",
    gap: 12,
    marginBottom: 16,
  },

  incomeCard: {
    flex: 1,
    background: "#eff6ff",
    padding: 14,
    borderRadius: 12,
    color: "#66bde8",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  expenseCard: {
    flex: 1,
    background: "#fef2f2",
    padding: 14,
    borderRadius: 12,
    color: "#ee8ebb",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },

  addBtn: {
    width: "100%",
    background: "#89d0a4",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },

  pageHeaderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },

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

  headerBtn: {
    background: "#89d0a4",
    color: "#fff",
    border: "none",
    padding: "10px 16px",
    borderRadius: 8,
    cursor: "pointer",
    fontWeight: 600,
  },

  searchContainer: {
    position: "relative",
    width: "100%",
    maxWidth: 1200,
    display: "flex",
    gap: 10,
    marginBottom: 24,
  },

  searchIconInline: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  },

  searchInputPlain: {
    width: "100%",
    padding: "10px 14px 10px 36px",
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
    background: "#fff",
  },
};

import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { LuUsers, LuUserPlus, LuSearch, LuTrash2 } from "react-icons/lu";
import AddMemberModal from "../components/AddMember";
import AddTransactionModal from "../components/AddTransaction";
import CreateGroup from "../components/CreateGroup";
import { getApiBase, getCurrentUser } from "../config/api";
import { useNavigate } from "react-router-dom";

export default function GroupsPage() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [listError, setListError] = useState("");
  const [hasLoadedGroups, setHasLoadedGroups] = useState(false);

  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [search, setSearch] = useState("");

  const [showCreateGroup, setShowCreateGroup] = useState(false);

  const loadGroups = useCallback(async () => {
    const user = getCurrentUser();
    if (!user?.user_id) {
      setListError("Log in to view groups.");
      setGroups([]);
      return;
    }

    setListError("");
    setHasLoadedGroups(false);

    try {
      const response = await fetch(
        `${getApiBase()}/api/workspaces/groups?user_id=${user.user_id}`,
      );
      let body = [];
      try {
        body = await response.json();
      } catch {
        body = [];
      }

      if (!response.ok) {
        throw new Error(body.message || "Could not load groups.");
      }

      const rows = Array.isArray(body) ? body : [];
      setGroups(
        rows.map((row) => ({
          id: row.workspace_id,
          name: row.name,
          description: row.description || "",
          ownerId: row.owner_id,
          members: Number(row.members) || 0,
          income: Number(row.income) || 0,
          expenses: Number(row.expenses) || 0,
          status: row.status === "pending" ? "invited" : "active",
        })),
      );
      setListError("");
      setHasLoadedGroups(true);
    } catch (error) {
      setGroups([]);
      setListError(error.message || "Could not load groups.");
      setHasLoadedGroups(true);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleAddMember = async (member) => {
    const user = getCurrentUser();
    if (!user?.user_id) {
      throw new Error("Log in to invite members.");
    }
    if (!selectedGroupId) {
      throw new Error("Please select a group first.");
    }

    const response = await fetch(
      `${getApiBase()}/api/workspaces/groups/${selectedGroupId}/invitations`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          username: member.username,
        }),
      },
    );

    let body = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    if (!response.ok) {
      throw new Error(body.message || "Could not send invitation.");
    }

    await loadGroups();
  };

  const handleAcceptInvite = async (groupId) => {
    const user = getCurrentUser();
    if (!user?.user_id) {
      alert("Log in to accept invitations.");
      return;
    }

    const response = await fetch(
      `${getApiBase()}/api/workspaces/groups/${groupId}/invitations/respond`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, action: "accept" }),
      },
    );

    if (!response.ok) {
      let body = {};
      try {
        body = await response.json();
      } catch {
        body = {};
      }
      alert(body.message || "Could not accept invitation.");
      return;
    }

    await loadGroups();
  };

  const handleDeclineInvite = async (groupId) => {
    const user = getCurrentUser();
    if (!user?.user_id) {
      alert("Log in to decline invitations.");
      return;
    }

    const response = await fetch(
      `${getApiBase()}/api/workspaces/groups/${groupId}/invitations/respond`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id, action: "decline" }),
      },
    );

    if (!response.ok) {
      let body = {};
      try {
        body = await response.json();
      } catch {
        body = {};
      }
      alert(body.message || "Could not decline invitation.");
      return;
    }

    await loadGroups();
  };

  const handleAddTransaction = (transaction, fallbackAmount, workspaceId) => {
    const amount = Number(transaction?.amount ?? fallbackAmount);
    if (!Number.isFinite(amount)) return;

    const targetWorkspaceId =
      transaction?.workspace_id != null
        ? Number(transaction.workspace_id)
        : workspaceId;
    if (!Number.isFinite(targetWorkspaceId)) return;

    setGroups((prev) =>
      prev.map((g) =>
        g.id === targetWorkspaceId
          ? {
              ...g,
              income: amount > 0 ? g.income + amount : g.income,
              expenses: amount < 0 ? g.expenses + Math.abs(amount) : g.expenses,
            }
          : g,
      ),
    );
  };

  const handleDeleteGroup = async (groupId) => {
    const user = getCurrentUser();
    if (!user?.user_id) {
      alert("Log in to delete groups.");
      return;
    }

    const confirmed = window.confirm(
      "Delete this group? This action cannot be undone.",
    );
    if (!confirmed) return;

    const response = await fetch(
      `${getApiBase()}/api/workspaces/groups/${groupId}`,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.user_id }),
      },
    );

    if (!response.ok) {
      let body = {};
      try {
        body = await response.json();
      } catch {
        body = {};
      }
      alert(body.message || "Could not delete group.");
      return;
    }

    await loadGroups();
  };

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase()),
  );

  const showGroupError =
    listError &&
    listError !== "Could not load groups." &&
    listError !== "Group not found";
  const showEmptyState = !filteredGroups.length && hasLoadedGroups;

  return (
    <div style={styles.root}>
      <Sidebar activePage="Groups" />

      <main style={styles.main}>
        <div style={styles.content}>
          <div style={styles.pageHeaderRow}>
            <h1 style={styles.pageTitle}>Groups</h1>

            <button
              style={styles.headerBtn}
              onClick={() => setShowCreateGroup(true)}
            >
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
          {showGroupError ? (
            <p style={styles.bannerError}>{listError}</p>
          ) : null}

          {showEmptyState ? (
            <div style={styles.emptyStateContainer}>
              <div style={styles.emptyState}>
                <div style={styles.emptyStateText}>
                  Click Create Group to get started.
                </div>
              </div>
            </div>
          ) : null}

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

                    {g.status !== "invited" && (
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
                    )}
                  </div>

                  {g.status !== "invited" && (
                    <>
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
                    </>
                  )}

                  {/* Button */}
                  <div style={styles.cardFooter}>
                    {g.status === "invited" ? (
                      <>
                        <button
                          style={styles.acceptBtn}
                          onClick={() => handleAcceptInvite(g.id)}
                        >
                          Accept
                        </button>

                        <button
                          style={styles.declineBtn}
                          onClick={() => handleDeclineInvite(g.id)}
                        >
                          Decline
                        </button>
                      </>
                    ) : (
                      <>
                        <div style={styles.actionRow}>
                          <button
                            style={styles.viewBtn}
                            onClick={() =>
                              navigate(`/groups/${g.id}/transactions`)
                            }
                          >
                            View Details
                          </button>

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
                        {g.ownerId === currentUser?.user_id ? (
                          <button
                            style={styles.deleteBtn}
                            onClick={() => handleDeleteGroup(g.id)}
                            title="Delete group"
                          >
                            <LuTrash2 size={16} />
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
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
              workspaceType="group"
              onClose={() => setShowAddTransaction(false)}
              onSave={async (payload) => {
                const user = getCurrentUser();
                if (!user?.user_id) {
                  throw new Error("Log in to add transactions.");
                }

                const { workspace_type: _wt, ...rest } = payload;
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
                      workspace_id: selectedGroupId,
                    }),
                  },
                );

                let body = {};
                try {
                  body = await response.json();
                } catch {
                  body = {};
                }

                if (!response.ok) {
                  throw new Error(
                    body.message || "Could not save transaction.",
                  );
                }

                handleAddTransaction(body, rest.amount, selectedGroupId);
              }}
            />
          )}
          {showCreateGroup && (
            <CreateGroup
              onClose={() => setShowCreateGroup(false)}
              onSave={async (payload) => {
                const user = getCurrentUser();
                if (!user?.user_id) {
                  throw new Error("Log in to create groups.");
                }

                const response = await fetch(
                  `${getApiBase()}/api/workspaces/groups`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      user_id: user.user_id,
                      name: payload.workspace_name,
                      description: payload.description,
                      members: payload.members,
                    }),
                  },
                );

                let body = {};
                try {
                  body = await response.json();
                } catch {
                  body = {};
                }

                if (!response.ok) {
                  throw new Error(body.message || "Could not create group.");
                }

                await loadGroups();
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
    background: "#f8f9fa",
    fontFamily: "'Segoe UI', sans-serif",
  },

  main: { flex: 1, marginLeft: 220 },
  content: { padding: 32 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: 20,
  },

  card: {
    display: "flex",
    flexDirection: "column",
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

  cardFooter: {
    marginTop: "auto",
    display: "flex",
    gap: 10,
    width: "100%",
  },

  addBtn: {
    flex: 1,
    background: "#89d0a4",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
  deleteBtn: {
    width: 44,
    border: "none",
    borderRadius: 10,
    background: "#c4c9d2",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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

  acceptBtn: {
    flex: 1,
    background: "#89d0a4",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },

  declineBtn: {
    flex: 1,
    background: "#c5ccc8",
    color: "#fff",
    border: "none",
    padding: "12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
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
  emptyStateContainer: {
    width: "100%",
    maxWidth: 1200,
    margin: "0 auto",
    marginBottom: 24,
  },
  emptyState: {
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    border: "1px solid #e5e7eb",
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
  },

  emptyStateText: {
    marginTop: 8,
    color: "#4b5563",
    fontSize: 14,
  },

  actionRow: {
    display: "flex",
    gap: 10,
    flex: 1,
  },

  viewBtn: {
    flex: 1,
    background: "#89d0a4",
    color: "#ffffff",
    border: "none",
    padding: "12px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },
};

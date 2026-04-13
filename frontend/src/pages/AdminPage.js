import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuSearch, LuTrash2 } from "react-icons/lu";
import { FiFeather, FiLogOut } from "react-icons/fi";
import { getApiBase } from "../config/api";

function formatDisplayDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB");
}

export default function AdminPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setListError("");
    try {
      const response = await fetch(`${getApiBase()}/api/users`);
      let body = [];
      try {
        body = await response.json();
      } catch {
        body = [];
      }

      if (!response.ok) {
        throw new Error(body.message || "Could not load users.");
      }

      setUsers(Array.isArray(body) ? body : []);
    } catch (error) {
      setUsers([]);
      setListError(error.message || "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleLogout = () => {
    sessionStorage.removeItem("leaftrack_user");
    navigate("/login");
  };

  const filtered = users.filter((u) =>
    `${u.name} ${u.username}`.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = (id) => {
    if (!window.confirm("Delete this user?")) return;
    setUsers((prev) => prev.filter((u) => u.user_id !== id));
  };

  return (
    <div style={styles.root}>
      <header style={styles.navbar}>
        <div style={styles.navLeft}>
          <div style={styles.logoIcon}>
            <FiFeather size={16} color="white" />
          </div>
          <span style={styles.logoText}>LeafTrack</span>
          <span style={styles.pageName}>Admin Panel</span>
        </div>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          <FiLogOut size={16} />
          Logout
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.content}>
          <div style={styles.filterBar}>
            <div style={styles.searchWrap}>
              <LuSearch size={14} />
              <input
                style={styles.searchInput}
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["NAME", "USERNAME", "ROLE", "CREATED DATE", "ACTION"].map(
                    (h) => (
                      <th key={h} style={styles.th}>
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyRow}>
                      Loading users...
                    </td>
                  </tr>
                ) : listError ? (
                  <tr>
                    <td colSpan={5} style={styles.errorRow}>
                      {listError}
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={styles.emptyRow}>
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.user_id} style={styles.tr}>
                      <td style={styles.td}>{u.name}</td>
                      <td style={styles.td}>{u.username}</td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.roleBadge,
                            ...(u.role === "admin"
                              ? styles.roleAdmin
                              : styles.roleUser),
                          }}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {formatDisplayDate(u.created_date)}
                      </td>

                      <td style={styles.td}>
                        <button
                          style={styles.deleteBtn}
                          onClick={() => handleDelete(u.user_id)}
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
      </main>
    </div>
  );
}

const styles = {
  root: {
    fontFamily: "'Segoe UI', sans-serif",
    background: "#f8f9fa",
    minHeight: "100vh",
  },

  navbar: {
    height: 64,
    background: "#fff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#89d0a4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontWeight: 700,
    fontSize: 16,
  },

  pageName: {
    marginLeft: 12,
    fontSize: 14,
    color: "#6b7280",
  },

  logoutBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    border: "none",
    background: "#f3f4f6",
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
  },

  main: { padding: "24px" },
  content: { maxWidth: 1200, margin: "0 auto" },

  filterBar: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: "14px 18px",
    marginBottom: 16,
  },

  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#f3f4f6",
    borderRadius: 8,
    padding: "8px 12px",
  },

  searchInput: {
    border: "none",
    background: "transparent",
    outline: "none",
    width: "100%",
  },

  tableWrap: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },

  table: { width: "100%", borderCollapse: "collapse", tableLayout: "fixed"  },

  th: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    padding: "14px",
    borderBottom: "1px solid #f3f4f6",
  },

  tr: { borderBottom: "1px solid #f9fafb" },

  td: {
    fontSize: 14,
    padding: "14px",
    textAlign: "center",
  },

  roleBadge: {
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
  },

  roleAdmin: {
    background: "#eef9ff",
    color: "#66bde8",
  },

  roleUser: {
    background: "#e4feee",
    color: "#62b181",
  },

  deleteBtn: {
    border: "none",
    background: "none",
    cursor: "pointer",
    color: "#ef4444",
  },

  emptyRow: {
    textAlign: "center",
    padding: "24px",
    color: "#9ca3af",
  },
  errorRow: {
    textAlign: "center",
    padding: "24px",
    color: "#b91c1c",
  },
};
import {
  FiHome,
  FiCreditCard,
  FiUsers,
  FiSettings,
  FiFeather,
  FiLogOut,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", icon: FiHome, path: "/dashboard" },
  { label: "Transactions", icon: FiCreditCard, path: "/transactions" },
  { label: "Groups", icon: FiUsers, path: "/groups" },
  { label: "Settings", icon: FiSettings, path: "/settings" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    sessionStorage.removeItem("leaftrack_user");
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <FiFeather size={18} color="white" />
        </div>
        <span style={styles.logoText}>LeafTrack</span>
      </div>

      <nav style={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <div
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
            >
              <span style={styles.navIcon}>
                <Icon size={16} />
              </span>

              <span style={isActive ? styles.navLabelActive : styles.navLabel}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      <div style={styles.logout} onClick={handleLogout}>
        <span style={styles.navIcon}>
          <FiLogOut size={18} />
        </span>
        <span style={styles.logoutLabel}>Logout</span>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 220,
    height: "100vh",
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    paddingBottom: 24,
    position: "fixed",
    top: 0,
    left: 0,
    overflowY: "auto",
  },

  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "20px",
    borderBottom: "1px solid #f3f4f6",
  },

  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "#89d0a4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    fontWeight: 700,
    fontSize: 18,
    color: "#111",
  },

  nav: {
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    gap: 4,
    padding: "0 12px",
  },

  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },

  navItemActive: {
    background: "#f0fdf4",
  },

  navIcon: {
    display: "flex",
    alignItems: "center",
  },

  navLabel: {
    fontSize: 14,
    color: "#6b7280",
  },

  navLabelActive: {
    fontSize: 14,
    fontWeight: 600,
    color: "#62b181",
  },

  logout: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "auto",
    marginLeft: 12,
    marginRight: 12,
    color: "#000000",
  },

  logoutLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
};

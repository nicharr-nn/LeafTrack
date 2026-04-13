import { useState } from "react";

export default function AddMemberModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    username: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.username.trim()) {
      setErrorMessage("Username is required.");
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);
    try {
      await onSave({ username: form.username.trim() });
      onClose();
    } catch (error) {
      setErrorMessage(error.message || "Could not send invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.content}>
          <h2 style={styles.title}>Add Member</h2>

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            style={styles.input}
          />
          {errorMessage ? <p style={styles.errorText}>{errorMessage}</p> : null}

          <div style={styles.actions}>
            <button
              style={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              style={styles.saveBtn}
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },

  modal: {
    width: 420,
    background: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  content: {
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 700,
  },

  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    height: 42,
  },

  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 10,
  },

  cancelBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer",
  },

  saveBtn: {
    padding: "8px 14px",
    borderRadius: 8,
    border: "none",
    background: "#89d0a4",
    color: "#fff",
    cursor: "pointer",
    fontWeight: 600,
  },
  errorText: {
    margin: 0,
    color: "#d92323",
    fontSize: 13,
  },
};

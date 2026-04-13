import { useState } from "react";

export default function CreateGroupModal({ onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    members: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.name) {
      setErrorMessage("Group name is required.");
      return;
    }

    const payload = {
      workspace_name: form.name,
      description: form.description,
      type: "group",
      members: form.members ? form.members.split(",").map((m) => m.trim()) : [],
    };

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Could not create group.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.content}>
          <h2 style={styles.title}>Create Group</h2>

          {/* Group Name */}
          <input
            type="text"
            name="name"
            placeholder="Group Name"
            value={form.name}
            onChange={handleChange}
            style={styles.input}
          />

          {/* Description */}
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
            style={styles.input}
          />

          {/* Members */}
          <input
            type="text"
            name="members"
            placeholder="Add members by username (comma separated)"
            value={form.members}
            onChange={handleChange}
            style={styles.input}
          />

          {errorMessage ? <p style={styles.errorText}>{errorMessage}</p> : null}

          {/* Actions */}
          <div style={styles.actions}>
            <button
              style={styles.cancelBtn}
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
            >
              Cancel
            </button>

            <button
              style={{
                ...styles.saveBtn,
                ...(isSubmitting ? styles.saveBtnDisabled : {}),
              }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              type="button"
            >
              {isSubmitting ? "Creating…" : "Create"}
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

  saveBtnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },

  errorText: {
    margin: 0,
    color: "#d92323",
    fontSize: 13,
  },
};

import { useState } from "react";

const CATEGORY_OPTIONS = {
  income: ["Salary", "Bonus", "Investment", "Gift", "Other"],
  expense: ["Rent", "Food", "Utilities", "Entertainment", "Health"],
};

export default function AddTransactionModal({
  onClose,
  onSave,
  workspaceType = "personal",
}) {
  const [form, setForm] = useState({
    amount: "",
    category: "",
    description: "",
    date: new Date().toLocaleDateString('en-CA'),
    type: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTypeChange = (type) => {
    setForm({
      ...form,
      type,
      category: "",
    });
  };

  const categoryOptions = form.type ? CATEGORY_OPTIONS[form.type] : [];

  const handleSubmit = async () => {
    if (!form.type) {
      setErrorMessage("Select income or expense.");
      return;
    }
    if (!form.amount || !form.category) {
      setErrorMessage("Amount and category are required.");
      return;
    }

    const payload = {
      ...form,
      workspace_type: workspaceType,
      amount:
        form.type === "expense"
          ? -Math.abs(Number(form.amount))
          : Math.abs(Number(form.amount)),
    };

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await onSave(payload);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || "Could not save transaction.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.content}>
          <h2 style={styles.title}>Add Transaction</h2>

          {/* Type Toggle */}
          <div style={styles.toggleWrap}>
            <button
              style={{
                ...styles.toggleBtn,
                ...(form.type === "income" && styles.activeIncome),
              }}
              onClick={() => handleTypeChange("income")}
            >
              Income
            </button>

            <button
              style={{
                ...styles.toggleBtn,
                ...(form.type === "expense" && styles.activeExpense),
              }}
              onClick={() => handleTypeChange("expense")}
            >
              Expense
            </button>
          </div>

          {/* Category */}
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            style={styles.input}
            disabled={!form.type}
          >
            <option value="" disabled>
              {form.type ? "Select Category" : "Select type first"}
            </option>

            {categoryOptions.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          {/* Amount */}
          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={form.amount}
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

          {/* Date */}
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            style={styles.input}
          />

          {errorMessage ? (
            <p style={styles.errorText}>{errorMessage}</p>
          ) : null}

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
              {isSubmitting ? "Saving…" : "Save"}
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

  imageHeader: {
    height: 180,
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
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

  toggleWrap: {
    display: "flex",
    gap: 10,
    marginTop: 10,
  },

  toggleBtn: {
    flex: 1,
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#f3f4f6",
    cursor: "pointer",
    fontWeight: 500,
  },

  activeIncome: {
    background: "#eef9ff",
    border: "1px solid #A9DEF9",
    color: "#66bde8",
  },

  activeExpense: {
    background: "#ffeaf4",
    border: "1px solid #f8accf",
    color: "#ee8ebb",
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

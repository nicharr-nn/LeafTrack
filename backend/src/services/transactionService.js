const transactionRepository = require("../repositories/transactionRepository");
const workspaceRepository = require("../repositories/workspaceRepository");

const WORKSPACE_TYPES = new Set(["personal", "group"]);

async function listTransactions(query) {
  const user_id = query.user_id != null ? Number(query.user_id) : null;
  const workspace_type = query.workspace_type;
  const workspace_id =
    query.workspace_id != null ? Number(query.workspace_id) : null;

  if (user_id == null || Number.isNaN(user_id)) {
    const error = new Error("user_id is required");
    error.statusCode = 400;
    throw error;
  }

  if (workspace_type && !WORKSPACE_TYPES.has(workspace_type)) {
    const error = new Error("workspace_type must be personal or group");
    error.statusCode = 400;
    throw error;
  }
  if (query.workspace_id != null && Number.isNaN(workspace_id)) {
    const error = new Error("workspace_id must be a number");
    error.statusCode = 400;
    throw error;
  }

  const filters = { user_id };
  if (workspace_type) filters.workspace_type = workspace_type;
  if (workspace_id != null) filters.workspace_id = workspace_id;

  return transactionRepository.listTransactions(filters);
}

async function createTransaction(payload) {
  const {
    user_id,
    category,
    type,
    amount,
    description,
    date,
    workspace_type,
    workspace_id,
  } = payload;

  if (user_id == null || Number.isNaN(Number(user_id))) {
    const error = new Error("user_id is required");
    error.statusCode = 400;
    throw error;
  }

  if (!type || !["income", "expense"].includes(type)) {
    const error = new Error("type must be income or expense");
    error.statusCode = 400;
    throw error;
  }

  if (amount === undefined || amount === null || Number.isNaN(Number(amount))) {
    const error = new Error("amount is required");
    error.statusCode = 400;
    throw error;
  }

  if (!date || String(date).trim() === "") {
    const error = new Error("date is required");
    error.statusCode = 400;
    throw error;
  }

  const ws = workspace_type || "personal";
  if (!WORKSPACE_TYPES.has(ws)) {
    const error = new Error("workspace_type must be personal or group");
    error.statusCode = 400;
    throw error;
  }

  const category_id = await transactionRepository.findCategoryId(
    category ? String(category).trim() : "",
    type,
  );

  let workspaceId = null;
  if (ws === "group") {
    if (workspace_id == null || Number.isNaN(Number(workspace_id))) {
      const error = new Error(
        "workspace_id is required for group transactions",
      );
      error.statusCode = 400;
      throw error;
    }

    workspaceId = Number(workspace_id);
    const workspace = await workspaceRepository.findWorkspaceById(workspaceId);
    if (!workspace || workspace.type !== "group") {
      const error = new Error("Group workspace not found");
      error.statusCode = 404;
      throw error;
    }
  }

  const numericAmount = Number(amount);
  const row = await transactionRepository.createTransaction({
    user_id: Number(user_id),
    category_id,
    type,
    amount: numericAmount,
    description: description != null ? String(description).trim() : "",
    date: String(date).trim(),
    workspace_type: ws,
    workspace_id: workspaceId,
  });

  return {
    ...row,
    category: category ? String(category).trim() : "Other",
  };
}

async function deleteTransaction(transactionId, userId) {
  if (userId == null || Number.isNaN(Number(userId))) {
    const error = new Error("user_id is required");
    error.statusCode = 400;
    throw error;
  }

  const deleted = await transactionRepository.deleteTransaction(
    Number(transactionId),
    Number(userId),
  );

  if (!deleted) {
    const error = new Error("Transaction not found");
    error.statusCode = 404;
    throw error;
  }
}

module.exports = {
  listTransactions,
  createTransaction,
  deleteTransaction,
};

const workspaceRepository = require("../repositories/workspaceRepository");
const userRepository = require("../repositories/userRepository");

async function listGroups(query) {
  const userId = Number(query.user_id);
  if (!Number.isFinite(userId)) {
    const error = new Error("user_id query is required");
    error.statusCode = 400;
    throw error;
  }

  const groups = await workspaceRepository.listGroupsForUser(userId);
  if (!groups.length) {
    const error = new Error("Group not found");
    error.statusCode = 404;
    throw error;
  }
  return groups.map((row) => ({
    workspace_id: row.workspace_id,
    name: row.name,
    description: row.description || "",
    owner_id: row.owner_id,
    owner_username: row.owner_username,
    status: row.status,
    members: Number(row.members) || 0,
    income: Number(row.income) || 0,
    expenses: Number(row.expenses) || 0,
  }));
}

async function createGroup(payload) {
  const ownerId = Number(payload.user_id);
  const name = String(payload.name || "").trim();
  const description = String(payload.description || "").trim();
  const memberUsernames = Array.isArray(payload.members)
    ? payload.members.map((m) => String(m || "").trim()).filter(Boolean)
    : [];

  if (!Number.isFinite(ownerId) || !name) {
    const error = new Error("user_id and name are required");
    error.statusCode = 400;
    throw error;
  }

  const owner = await userRepository.findUserById(ownerId);
  if (!owner) {
    const error = new Error("Owner user not found");
    error.statusCode = 404;
    throw error;
  }

  const group = await workspaceRepository.createGroup({
    ownerId,
    name,
    description,
  });
  await workspaceRepository.upsertWorkspaceMembership({
    workspaceId: group.workspace_id,
    userId: ownerId,
    status: "accepted",
    invitedBy: ownerId,
  });

  for (const rawUsername of memberUsernames) {
    const username = String(rawUsername || "").trim();
    if (!username) continue;
    const user = await userRepository.findUserByUsername(username);
    if (!user || user.user_id === ownerId) continue;

    await workspaceRepository.upsertWorkspaceMembership({
      workspaceId: group.workspace_id,
      userId: user.user_id,
      status: "pending",
      invitedBy: ownerId,
    });
  }

  return {
    workspace_id: group.workspace_id,
    name: group.name,
    description: group.description || "",
    owner_id: ownerId,
    owner_username: owner.username,
    status: "accepted",
    members: 1,
    income: 0,
    expenses: 0,
  };
}

async function inviteMember(workspaceIdParam, payload) {
  const workspaceId = Number(workspaceIdParam);
  const inviterId = Number(payload.user_id);
  const username = String(payload.username || "").trim();

  if (
    !Number.isFinite(workspaceId) ||
    !Number.isFinite(inviterId) ||
    !username
  ) {
    const error = new Error("workspace id, user_id, and username are required");
    error.statusCode = 400;
    throw error;
  }

  const workspace = await workspaceRepository.findWorkspaceById(workspaceId);
  if (!workspace || workspace.type !== "group") {
    const error = new Error("Group not found");
    error.statusCode = 404;
    throw error;
  }

  if (workspace.owner_id !== inviterId) {
    const inviterMembership = await workspaceRepository.findWorkspaceMembership(
      workspaceId,
      inviterId,
    );
    if (!inviterMembership || inviterMembership.status !== "accepted") {
      const error = new Error("Only accepted members can invite users");
      error.statusCode = 403;
      throw error;
    }
  }

  const user = await userRepository.findUserByUsername(username);
  if (!user) {
    const error = new Error("Username not found");
    error.statusCode = 404;
    throw error;
  }

  const existing = await workspaceRepository.findWorkspaceMembership(
    workspaceId,
    user.user_id,
  );
  if (existing?.status === "accepted") {
    const error = new Error("User is already a member");
    error.statusCode = 409;
    throw error;
  }

  await workspaceRepository.upsertWorkspaceMembership({
    workspaceId,
    userId: user.user_id,
    status: "pending",
    invitedBy: inviterId,
  });

  return { message: `Invitation sent to @${user.username}` };
}

async function respondToInvite(workspaceIdParam, payload) {
  const workspaceId = Number(workspaceIdParam);
  const userId = Number(payload.user_id);
  const action = String(payload.action || "")
    .trim()
    .toLowerCase();
  const status =
    action === "accept" ? "accepted" : action === "decline" ? "declined" : null;

  if (!Number.isFinite(workspaceId) || !Number.isFinite(userId) || !status) {
    const error = new Error(
      "workspace id, user_id, and action (accept/decline) are required",
    );
    error.statusCode = 400;
    throw error;
  }

  const membership = await workspaceRepository.findWorkspaceMembership(
    workspaceId,
    userId,
  );
  if (!membership || membership.status !== "pending") {
    const error = new Error("No pending invitation found");
    error.statusCode = 404;
    throw error;
  }

  const updated = await workspaceRepository.upsertWorkspaceMembership({
    workspaceId,
    userId,
    status,
    invitedBy: membership.invited_by,
  });
  return updated;
}

async function deleteGroup(workspaceIdParam, payload) {
  const workspaceId = Number(workspaceIdParam);
  const userId = Number(payload.user_id);

  if (!Number.isFinite(workspaceId) || !Number.isFinite(userId)) {
    const error = new Error("workspace id and user_id are required");
    error.statusCode = 400;
    throw error;
  }

  const workspace = await workspaceRepository.findWorkspaceById(workspaceId);
  if (!workspace || workspace.type !== "group") {
    const error = new Error("Group not found");
    error.statusCode = 404;
    throw error;
  }

  if (workspace.owner_id !== userId) {
    const error = new Error("Only group owner can delete this group");
    error.statusCode = 403;
    throw error;
  }

  await workspaceRepository.deleteWorkspaceById(workspaceId);
}

module.exports = {
  listGroups,
  createGroup,
  inviteMember,
  respondToInvite,
  deleteGroup,
};

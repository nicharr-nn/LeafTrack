const express = require("express");
const workspaceController = require("../controllers/workspaceController");

const router = express.Router();

router.get("/groups", workspaceController.getGroups);
router.post("/groups", workspaceController.postGroup);
router.post("/groups/:id/invitations", workspaceController.postInvite);
router.post(
  "/groups/:id/invitations/respond",
  workspaceController.postInviteResponse,
);
router.delete("/groups/:id", workspaceController.removeGroup);

module.exports = router;

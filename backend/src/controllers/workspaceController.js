const workspaceService = require("../services/workspaceService");

async function getGroups(req, res, next) {
  try {
    const groups = await workspaceService.listGroups(req.query);
    res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
}

async function postGroup(req, res, next) {
  try {
    const group = await workspaceService.createGroup(req.body);
    res.status(201).json(group);
  } catch (error) {
    next(error);
  }
}

async function postInvite(req, res, next) {
  try {
    const response = await workspaceService.inviteMember(
      req.params.id,
      req.body,
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

async function postInviteResponse(req, res, next) {
  try {
    const response = await workspaceService.respondToInvite(
      req.params.id,
      req.body,
    );
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

async function removeGroup(req, res, next) {
  try {
    await workspaceService.deleteGroup(req.params.id, req.body);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getGroups,
  postGroup,
  postInvite,
  postInviteResponse,
  removeGroup,
};

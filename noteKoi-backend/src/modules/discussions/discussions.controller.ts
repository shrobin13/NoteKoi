import { Request, Response, NextFunction } from "express";
import * as discussionsService from "./discussions.service.js";
import { success, getParam } from "../../types/index.js";
import type { JwtPayload } from "../../middlewares/authenticate.js";

export async function getGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const classroomUnitId = getParam(req, "classroomUnitId");
    const groups = await discussionsService.getGroups(classroomUnitId, caller);
    res.status(200).json(success(groups));
  } catch (err) {
    next(err);
  }
}

export async function createGroup(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const group = await discussionsService.createGroup(req.body, caller);
    res.status(201).json(success(group, "Discussion group created"));
  } catch (err) {
    next(err);
  }
}

export async function addMember(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const groupId = getParam(req, "groupId");
    const membership = await discussionsService.addMember(groupId, req.body, caller);
    res.status(201).json(success(membership, "Member added"));
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const groupId = getParam(req, "groupId");
    const userId = getParam(req, "userId");
    await discussionsService.removeMember(groupId, userId, caller);
    res.status(200).json(success(null, "Member removed"));
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const groupId = getParam(req, "groupId");
    const result = await discussionsService.getMessages(groupId, req.query as never, caller);
    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const groupId = getParam(req, "groupId");
    const message = await discussionsService.sendMessage(groupId, req.body, caller);
    res.status(201).json(success(message, "Message sent"));
  } catch (err) {
    next(err);
  }
}

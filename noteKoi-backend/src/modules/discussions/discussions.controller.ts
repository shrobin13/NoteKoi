import { Request, Response, NextFunction } from "express";
import * as discussionsService from "./discussions.service.js";
import { success } from "../../types/index.js";
import type { JwtPayload } from "../../middlewares/authenticate.js";

export async function getGroups(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const { classroomUnitId } = req.params;
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
    const membership = await discussionsService.addMember(req.params.groupId, req.body, caller);
    res.status(201).json(success(membership, "Member added"));
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    await discussionsService.removeMember(req.params.groupId, req.params.userId, caller);
    res.status(200).json(success(null, "Member removed"));
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const result = await discussionsService.getMessages(req.params.groupId, req.query as never, caller);
    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const message = await discussionsService.sendMessage(req.params.groupId, req.body, caller);
    res.status(201).json(success(message, "Message sent"));
  } catch (err) {
    next(err);
  }
}

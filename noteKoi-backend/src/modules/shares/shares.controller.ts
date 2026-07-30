import { Request, Response, NextFunction } from "express";
import * as sharesService from "./shares.service.js";
import { success } from "../../types/index.js";
import type { JwtPayload } from "../../middlewares/authenticate.js";

export async function getMyShares(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const result = await sharesService.getMyShares(req.query as never, caller);
    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function createShare(req: Request, res: Response, next: NextFunction) {
  try {
    const caller = req.user as JwtPayload;
    const share = await sharesService.createShare(req.body, caller);
    res.status(201).json(success(share, "Personal share sent"));
  } catch (err) {
    next(err);
  }
}

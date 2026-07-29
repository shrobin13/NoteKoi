import * as usersService from "./users.service.js";
import { success, ApiError, getParam } from "../../types/index.js";
export async function getMyProfile(req, res, next) {
    try {
        const user = await usersService.getProfile(req.user.id);
        res.json(success(user));
    }
    catch (err) {
        next(err);
    }
}
export async function updateMyProfile(req, res, next) {
    try {
        const user = await usersService.updateProfile(req.user.id, req.body);
        res.json(success(user, "Profile updated"));
    }
    catch (err) {
        next(err);
    }
}
// GET /users/:userId — any authenticated user can view any profile (read-only)
export async function getProfile(req, res, next) {
    try {
        const userId = getParam(req, "userId");
        if (!userId)
            return next(ApiError.badRequest("userId is required"));
        const user = await usersService.getProfile(userId);
        res.json(success(user));
    }
    catch (err) {
        next(err);
    }
}

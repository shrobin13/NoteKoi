import * as authService from "./auth.service.js";
import { success } from "../../types/index.js";
export async function register(req, res, next) {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(success(result, "Registration successful. Awaiting verification."));
    }
    catch (err) {
        next(err);
    }
}
export async function login(req, res, next) {
    try {
        const result = await authService.login(req.body);
        res.status(200).json(success(result, "Login successful"));
    }
    catch (err) {
        next(err);
    }
}
export async function refresh(req, res, next) {
    try {
        const { refreshToken } = req.body;
        const tokens = await authService.refreshWithUser(refreshToken);
        res.status(200).json(success(tokens, "Token refreshed"));
    }
    catch (err) {
        next(err);
    }
}
// Stateless logout — client discards tokens.
// If a token blocklist is added in future, invalidate here.
export function logout(_req, res) {
    res.status(200).json(success(null, "Logged out successfully"));
}

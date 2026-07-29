import prisma from "../../lib/prisma.js";
import { ApiError } from "../../types/index.js";
const USER_SELECT = {
    id: true,
    name: true,
    email: true,
    role: true,
    verificationStatus: true,
    collegeId: true,
    classroomUnitId: true,
    createdAt: true,
    college: { select: { id: true, name: true } },
    classroomUnit: {
        select: {
            id: true,
            department: { select: { id: true, name: true } },
            session: {
                select: {
                    id: true,
                    name: true,
                    course: {
                        select: {
                            id: true,
                            name: true,
                            semester: { select: { id: true, name: true } },
                        },
                    },
                },
            },
        },
    },
    crAssignments: {
        where: { isActive: true },
        select: { seat: true, classroomUnitId: true },
    },
};
export async function getProfile(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: USER_SELECT,
    });
    if (!user)
        throw ApiError.notFound("User not found");
    return user;
}
// R-050: A user may only edit their own profile fields via this endpoint.
// Verification-status changes go through a SEPARATE endpoint.
export async function updateProfile(userId, dto) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
        throw ApiError.notFound("User not found");
    return prisma.user.update({
        where: { id: userId },
        data: { ...dto },
        select: USER_SELECT,
    });
}

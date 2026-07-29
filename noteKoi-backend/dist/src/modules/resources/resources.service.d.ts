import type { CreateResourceDto, UpdateResourceDto, PublicResourceQueryDto, PrivateResourceQueryDto } from "./resources.schema.js";
/**
 * R-032, R-033, R-039: Public academic resources list query.
 * Must filter `visibility = PUBLIC` at database query level.
 */
export declare function getPublicResources(query: PublicResourceQueryDto): Promise<{
    data: ({
        classroomUnit: {
            department: {
                id: string;
                name: string;
            };
            id: string;
            session: {
                id: string;
                name: string;
            };
        };
        course: {
            id: string;
            name: string;
        } | null;
        uploader: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        title: string;
        category: string;
        visibility: import("../../../generated/prisma/index.js").$Enums.Visibility;
        fileId: string;
        fileUrl: string;
        previewUrl: string | null;
        courseId: string | null;
        classroomUnitId: string;
        uploaderId: string;
        createdAt: Date;
        updatedAt: Date;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
/**
 * Single resource fetch by ID.
 * Supports public access if visibility is PUBLIC; caller handles auth for PRIVATE.
 */
export declare function getResourceById(id: string): Promise<{
    classroomUnit: {
        department: {
            collegeId: string;
            id: string;
            name: string;
        };
        id: string;
        session: {
            id: string;
            name: string;
        };
    };
    course: {
        id: string;
        name: string;
    } | null;
    uploader: {
        id: string;
        name: string;
        role: import("../../../generated/prisma/index.js").$Enums.Role;
    };
} & {
    id: string;
    title: string;
    category: string;
    visibility: import("../../../generated/prisma/index.js").$Enums.Visibility;
    fileId: string;
    fileUrl: string;
    previewUrl: string | null;
    courseId: string | null;
    classroomUnitId: string;
    uploaderId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * List resources within a ClassroomUnit (both PUBLIC and PRIVATE).
 * Must be verified member of unit or Sub/Owner Admin.
 */
export declare function getUnitResources(classroomUnitId: string, query: PrivateResourceQueryDto): Promise<{
    data: ({
        course: {
            id: string;
            name: string;
        } | null;
        uploader: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        title: string;
        category: string;
        visibility: import("../../../generated/prisma/index.js").$Enums.Visibility;
        fileId: string;
        fileUrl: string;
        previewUrl: string | null;
        courseId: string | null;
        classroomUnitId: string;
        uploaderId: string;
        createdAt: Date;
        updatedAt: Date;
    })[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}>;
/**
 * R-036: CR creates a resource within their ClassroomUnit.
 */
export declare function createResource(dto: CreateResourceDto, uploaderId: string): Promise<{
    course: {
        id: string;
        name: string;
    } | null;
    uploader: {
        id: string;
        name: string;
    };
} & {
    id: string;
    title: string;
    category: string;
    visibility: import("../../../generated/prisma/index.js").$Enums.Visibility;
    fileId: string;
    fileUrl: string;
    previewUrl: string | null;
    courseId: string | null;
    classroomUnitId: string;
    uploaderId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * R-036: CR updates a resource within their ClassroomUnit.
 */
export declare function updateResource(id: string, dto: UpdateResourceDto, classroomUnitId: string): Promise<{
    course: {
        id: string;
        name: string;
    } | null;
    uploader: {
        id: string;
        name: string;
    };
} & {
    id: string;
    title: string;
    category: string;
    visibility: import("../../../generated/prisma/index.js").$Enums.Visibility;
    fileId: string;
    fileUrl: string;
    previewUrl: string | null;
    courseId: string | null;
    classroomUnitId: string;
    uploaderId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
/**
 * R-036: CR deletes a resource within their ClassroomUnit.
 */
export declare function deleteResource(id: string, classroomUnitId: string): Promise<{
    id: string;
    title: string;
    category: string;
    visibility: import("../../../generated/prisma/index.js").$Enums.Visibility;
    fileId: string;
    fileUrl: string;
    previewUrl: string | null;
    courseId: string | null;
    classroomUnitId: string;
    uploaderId: string;
    createdAt: Date;
    updatedAt: Date;
}>;
//# sourceMappingURL=resources.service.d.ts.map
export declare class ApiError extends Error {
    readonly statusCode: number;
    readonly code?: string | undefined;
    constructor(statusCode: number, message: string, code?: string | undefined);
    static badRequest(message: string, code?: string): ApiError;
    static unauthorized(message?: string): ApiError;
    static forbidden(message?: string): ApiError;
    static notFound(message?: string): ApiError;
    static conflict(message: string, code?: string): ApiError;
    static internal(message?: string): ApiError;
}
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}
export interface PaginatedResult<T> {
    data: T[];
    meta: PaginationMeta;
}
export declare function paginate(page: number, limit: number): {
    skip: number;
    take: number;
};
export declare function success<T>(data: T, message?: string): {
    success: true;
    message?: string;
    data: T;
};
export declare function getParam(req: {
    params: Record<string, any>;
}, key: string): string;
//# sourceMappingURL=index.d.ts.map
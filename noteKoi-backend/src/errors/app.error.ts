export type ErrorField = {
  field: string;
  message: string;
  code?: string;
};

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly fields?: ErrorField[];

  constructor(message: string, statusCode: number, code: string, fields?: ErrorField[]) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

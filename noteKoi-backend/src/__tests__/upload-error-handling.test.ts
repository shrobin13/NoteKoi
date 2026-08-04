import assert from "node:assert/strict";
import test from "node:test";
import { mapMulterError } from "../storage/multerConfig.js";
import { MulterError } from "multer";

test("maps file size limit errors to a descriptive AppError", () => {
  const err = mapMulterError(new MulterError("LIMIT_FILE_SIZE", "File too large"));
  assert.equal(err.code, "FILE_TOO_LARGE");
  assert.equal(err.statusCode, 413);
});

test("maps invalid file type to a descriptive AppError", () => {
  const err = mapMulterError(new Error("Invalid file type"));
  assert.equal(err.code, "INVALID_FILE_TYPE");
  assert.equal(err.statusCode, 415);
});

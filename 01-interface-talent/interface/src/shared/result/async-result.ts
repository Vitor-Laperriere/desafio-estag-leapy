import { err, ok, type Result } from "./result";
import { ensureError } from "@shared/errors";

export async function toResult<T>(fn: () => Promise<T>): Promise<Result<T, Error>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (error) {
    return err(ensureError(error));
  }
}

import { BaseError } from "./base-error";

export class ApplicationError extends BaseError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

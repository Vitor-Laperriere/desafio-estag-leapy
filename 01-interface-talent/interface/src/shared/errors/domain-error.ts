import { BaseError } from "./base-error";

export class DomainError extends BaseError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}

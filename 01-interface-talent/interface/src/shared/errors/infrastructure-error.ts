import { BaseError } from "./base-error";

export class InfrastructureError extends BaseError {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
  }
}
